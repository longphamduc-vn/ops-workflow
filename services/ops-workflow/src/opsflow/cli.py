"""Command line interface for opsflow engine."""

import asyncio
import json
import sys
from pathlib import Path
from typing import Annotated, Any

import typer
from rich.console import Console
from rich.table import Table

from opsflow.core.errors import ValidationError
from opsflow.core.parser import load_workflow_from_file
from opsflow.core.scheduler import WorkflowScheduler
from opsflow.core.validator import validate_workflow
from opsflow.store.repository import RunRepository

app = typer.Typer(
    name="opsflow",
    help="Opsflow CLI: validate, run, and manage workflows.",
    no_args_is_help=True,
)
console = Console()


@app.command()
def validate(
    workflow_path: Annotated[
        Path,
        typer.Argument(
            exists=True,
            file_okay=True,
            dir_okay=False,
            readable=True,
            help="Path to workflow YAML file",
        ),
    ],
) -> None:
    """Validate a workflow YAML file against schema and semantic rules."""
    console.print(f"[bold blue]Validating workflow:[/bold blue] {workflow_path}")
    try:
        wf = load_workflow_from_file(workflow_path)
        if wf.env.get("OPSFLOW_DEV", "").lower() in ("1", "true", "yes"):
            from opsflow.core.logger import set_dev_mode
            set_dev_mode(True)
        errors = validate_workflow(wf)
    except ValidationError as exc:
        console.print(f"[bold red][FAIL] Schema/Parsing error:[/bold red] {exc}", highlight=False)
        sys.exit(1)

    if errors:
        console.print(
            f"[bold red][FAIL] Validation failed with {len(errors)} error(s):[/bold red]",
            highlight=False,
        )
        for err in errors:
            rule_info = f" (Rule {err.rule_number})" if err.rule_number else ""
            console.print(
                f"  • [red][{err.field_path}]{rule_info}:[/red] {err.message}",
                highlight=False,
            )
            if err.suggestion:
                console.print(
                    f"    [yellow]Suggested fix:[/yellow] {err.suggestion}",
                    highlight=False,
                )
        sys.exit(1)

    console.print(f"[bold green][OK] Workflow '{wf.name}' is valid.[/bold green]")


@app.command()
def api(
    host: Annotated[str, typer.Option(help="Host to bind API server")] = "0.0.0.0",
    port: Annotated[int, typer.Option(help="Port to listen on")] = 8000,
    reload: Annotated[bool, typer.Option(help="Enable auto-reload for development")] = False,
    dev: Annotated[
        bool,
        typer.Option("--dev", "-d", help="Enable dev logging for all workflow runs triggered via API"),
    ] = False,
) -> None:
    """Start the public REST API server."""
    import os

    import uvicorn

    if dev:
        os.environ["OPSFLOW_DEV"] = "1"
        from opsflow.core.logger import set_dev_mode
        set_dev_mode(True)
        console.print("[bold yellow][DEV MODE ENABLED][/bold yellow] Detailed execution telemetry active for all API runs.")

    console.print(f"[bold green]Starting Opsflow API server on {host}:{port}...[/bold green]")
    uvicorn.run("opsflow.api.main:app", host=host, port=port, reload=reload)


@app.command()
def run(
    workflow_path: Annotated[
        Path,
        typer.Argument(
            exists=True,
            file_okay=True,
            dir_okay=False,
            readable=True,
            help="Path to workflow YAML file",
        ),
    ],
    inputs: Annotated[
        str | None,
        typer.Option("--inputs", "-i", help="JSON string or file path (@params.json) with inputs"),
    ] = None,
    dev: Annotated[
        bool,
        typer.Option("--dev", "-d", help="Enable detailed dev logging for calls, transforms, and responses"),
    ] = False,
    db: Annotated[
        str,
        typer.Option("--db", help="Database connection URL"),
    ] = "sqlite+aiosqlite:///opsflow.db",
) -> None:
    """Execute a workflow run and output progress and final results."""
    if dev:
        from opsflow.core.logger import set_dev_mode
        set_dev_mode(True)

    console.print(f"[bold cyan]Loading workflow:[/bold cyan] {workflow_path}")

    try:
        wf = load_workflow_from_file(workflow_path)
        if wf.env.get("OPSFLOW_DEV", "").lower() in ("1", "true", "yes"):
            from opsflow.core.logger import set_dev_mode
            set_dev_mode(True)
        errors = validate_workflow(wf)
        if errors:
            console.print(
                f"[bold red]Workflow validation failed with {len(errors)} errors.[/bold red]"
            )
            sys.exit(1)
    except Exception as exc:
        console.print(f"[bold red]Error parsing workflow:[/bold red] {exc}")
        sys.exit(1)

    # Parse inputs
    parsed_inputs: dict[str, Any] = {}
    if inputs:
        try:
            if inputs.startswith("@"):
                parsed_inputs = json.loads(Path(inputs[1:]).read_text(encoding="utf-8"))
            else:
                parsed_inputs = json.loads(inputs)
        except Exception as exc:
            console.print(f"[bold red]Error parsing --inputs:[/bold red] {exc}")
            sys.exit(1)

    async def _execute() -> tuple[str, str, dict[str, Any]]:
        repo = RunRepository(db)
        await repo.init_db()
        scheduler = WorkflowScheduler(wf, repository=repo)
        run_id, status, ctx = await scheduler.run(inputs=parsed_inputs)
        await repo.engine.dispose()
        return run_id, status, ctx.step_outputs

    run_id, status, outputs = asyncio.run(_execute())

    status_color = "green" if status == "success" else "red"
    console.print(f"\n[bold]Run ID:[/bold] {run_id}")
    console.print(f"[bold]Final Status:[/bold] [{status_color}]{status.upper()}[/{status_color}]")

    if outputs:
        console.print("\n[bold]Outputs:[/bold]")
        console.print_json(data=outputs)

    if status != "success":
        sys.exit(1)


@app.command()
def replay(
    run_id: Annotated[str, typer.Argument(help="Run ID to resume/replay")],
    db: Annotated[
        str, typer.Option("--db", help="Database connection URL")
    ] = "sqlite+aiosqlite:///opsflow.db",
    workflows_dir: Annotated[Path, typer.Option("--dir", help="Workflows directory")] = Path(
        "workflows"
    ),
) -> None:
    """Replay/resume a previously failed or interrupted workflow run."""
    console.print(f"[bold cyan]Replaying run:[/bold cyan] {run_id}")

    async def _replay() -> tuple[str, str, dict[str, Any]]:
        repo = RunRepository(db)
        await repo.init_db()
        run_rec = await repo.get_run(run_id)
        if not run_rec:
            console.print(f"[bold red]Run '{run_id}' not found in database.[/bold red]")
            sys.exit(1)

        wf_name = run_rec.workflow_name
        # Find workflow file
        wf_path = workflows_dir / f"{wf_name}.yml"
        if not wf_path.exists():
            wf_path = Path(f"{wf_name}.yml")
        if not wf_path.exists():
            console.print(f"[bold red]Workflow YAML file for '{wf_name}' not found.[/bold red]")
            sys.exit(1)

        wf = load_workflow_from_file(wf_path)
        scheduler = WorkflowScheduler(wf, repository=repo)
        active_id, status, ctx = await scheduler.run(
            run_id=run_id,
            inputs=run_rec.inputs,
            resume_from_existing=True,
        )
        await repo.engine.dispose()
        return active_id, status, ctx.step_outputs

    active_id, status, outputs = asyncio.run(_replay())
    status_color = "green" if status == "success" else "red"
    console.print(f"\n[bold]Run ID:[/bold] {active_id}")
    console.print(f"[bold]Replay Status:[/bold] [{status_color}]{status.upper()}[/{status_color}]")
    if outputs:
        console.print_json(data=outputs)

    if status != "success":
        sys.exit(1)


@app.command(name="list")
def list_workflows(
    workflows_dir: Annotated[
        Path,
        typer.Option("--dir", "-d", help="Directory containing workflow YAML files"),
    ] = Path("workflows"),
) -> None:
    """List all available workflow definitions in a directory."""
    if not workflows_dir.exists():
        console.print(f"[yellow]Directory '{workflows_dir}' does not exist.[/yellow]")
        return

    yml_files = list(workflows_dir.glob("*.yml")) + list(workflows_dir.glob("*.yaml"))
    if not yml_files:
        console.print(f"[yellow]No workflow files found in '{workflows_dir}'.[/yellow]")
        return

    table = Table(title=f"Workflows in {workflows_dir}")
    table.add_column("Name", style="cyan", no_wrap=True)
    table.add_column("Version", style="magenta")
    table.add_column("Trigger", style="green")
    table.add_column("Steps", justify="right", style="blue")
    table.add_column("Publish Dataset", style="yellow")
    table.add_column("File", style="dim")

    for f in sorted(yml_files):
        try:
            wf = load_workflow_from_file(f)
            pub = wf.publish.dataset if wf.publish else "-"
            table.add_row(
                wf.name,
                wf.version,
                wf.trigger.type,
                str(len(wf.steps)),
                pub,
                f.name,
            )
        except Exception as exc:
            table.add_row(f.stem, "ERROR", "invalid", "0", "-", f"{f.name} ({exc})")

    console.print(table)


def main() -> None:
    """CLI entrypoint."""
    app()


if __name__ == "__main__":
    main()
