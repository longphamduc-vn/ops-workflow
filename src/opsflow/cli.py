"""Command line interface for opsflow engine."""

import sys
from pathlib import Path
from typing import Annotated

import typer

from opsflow.core.errors import ValidationError
from opsflow.core.parser import load_workflow_from_file
from opsflow.core.validator import validate_workflow

app = typer.Typer(
    name="opsflow",
    help="Opsflow CLI: validate, run, and manage workflows.",
    no_args_is_help=True,
)


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
    typer.echo(f"Validating workflow: {workflow_path}")
    try:
        wf = load_workflow_from_file(workflow_path)
        errors = validate_workflow(wf)
    except ValidationError as exc:
        typer.secho(f"[FAIL] Schema/Parsing error: {exc}", fg=typer.colors.RED, err=True)
        sys.exit(1)

    if errors:
        typer.secho(
            f"[FAIL] Validation failed with {len(errors)} error(s):",
            fg=typer.colors.RED,
            bold=True,
            err=True,
        )
        for err in errors:
            rule_info = f" (Rule {err.rule_number})" if err.rule_number else ""
            typer.secho(
                f"  • [{err.field_path}]{rule_info}: {err.message}", fg=typer.colors.RED, err=True
            )
            if err.suggestion:
                typer.secho(
                    f"    Suggested fix: {err.suggestion}", fg=typer.colors.YELLOW, err=True
                )
        sys.exit(1)

    typer.secho(f"[OK] Workflow '{wf.name}' is valid.", fg=typer.colors.GREEN, bold=True)


@app.command()
def run(
    workflow_path: Annotated[Path, typer.Argument(help="Path to workflow YAML file")],
) -> None:
    """Execute a workflow run."""
    typer.echo(f"Running workflow: {workflow_path}")


@app.command()
def list_workflows() -> None:
    """List available workflows."""
    typer.echo("Listing workflows...")


@app.command()
def replay(
    run_id: Annotated[str, typer.Argument(help="Run ID to replay")],
) -> None:
    """Replay a workflow run."""
    typer.echo(f"Replaying run: {run_id}")


def main() -> None:
    """CLI entrypoint."""
    app()


if __name__ == "__main__":
    main()
