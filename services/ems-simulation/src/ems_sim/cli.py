"""Command Line Interface for the EMS Simulation Platform."""

import asyncio
import json

import typer
import uvicorn
from rich.console import Console
from rich.table import Table

from ems_sim.config import settings
from ems_sim.database.connection import close_db, get_session_factory, init_db
from ems_sim.database.repository import SimulationRepository
from ems_sim.registry.api_registry import ApiRegistry
from ems_sim.registry.dataset_registry import DatasetRegistry

cli_app = typer.Typer(
    name="ems-sim",
    help="Configuration-Driven API Simulation Platform for Nexacro EMS APIs",
    no_args_is_help=True,
)
console = Console()


@cli_app.command()
def start(
    host: str = typer.Option(settings.host, "--host", "-h", help="Bind host"),
    port: int = typer.Option(settings.port, "--port", "-p", help="Bind port"),
    reload: bool = typer.Option(False, "--reload", "-r", help="Auto reload on code change"),
):
    """Start the API simulation HTTP server."""
    console.print(
        f"[bold green]Starting EMS Simulation Server on http://{host}:{port}[/bold green]"
    )
    uvicorn.run("ems_sim.server.app:app", host=host, port=port, reload=reload)


@cli_app.command("endpoints")
def list_endpoints():
    """List all registered API endpoints."""
    registry = ApiRegistry()
    registry.load_from_directory(settings.catalog_dir / "apis")
    apis = registry.list_all()

    table = Table(
        title="Registered Nexacro EMS API Endpoints", show_header=True, header_style="bold cyan"
    )
    table.add_column("API ID", style="dim")
    table.add_column("Domain")
    table.add_column("Method", justify="center")
    table.add_column("Path", style="green")
    table.add_column("Strategy")
    table.add_column("Handler", style="yellow")

    for a in sorted(apis, key=lambda x: (x.domain, x.endpoint.path)):
        table.add_row(
            a.id,
            a.domain,
            a.endpoint.method,
            a.endpoint.path,
            a.execution.type,
            a.execution.handler or "-",
        )

    console.print(table)
    console.print(f"[bold cyan]Total Registered APIs: {len(apis)}[/bold cyan]")


@cli_app.command("datasets")
def list_datasets():
    """List all reusable dataset schemas."""
    registry = DatasetRegistry()
    registry.load_from_directory(settings.catalog_dir / "datasets")
    datasets = registry.list_all()

    table = Table(title="Dataset Schema Catalog", show_header=True, header_style="bold magenta")
    table.add_column("Dataset ID", style="dim")
    table.add_column("Name")
    table.add_column("Columns Count", justify="right")
    table.add_column("Columns Sample", style="cyan")

    for d in sorted(datasets, key=lambda x: x.id):
        sample_cols = ", ".join(d.column_names[:5]) + ("..." if len(d.column_names) > 5 else "")
        table.add_row(d.id, d.name, str(len(d.columns)), sample_cols)

    console.print(table)
    console.print(f"[bold magenta]Total Dataset Schemas: {len(datasets)}[/bold magenta]")


@cli_app.command("seed")
def seed_database():
    """Seed SQLite simulation database from catalog/seed_data.json."""

    async def _run_seed():
        await init_db()
        seed_path = settings.catalog_dir / "seed_data.json"
        if not seed_path.exists():
            console.print(f"[red]Seed data file not found at {seed_path}[/red]")
            return
        with open(seed_path, encoding="utf-8") as f:
            data = json.load(f)

        session_factory = get_session_factory()
        async with session_factory() as session:
            repo = SimulationRepository(session)
            await repo.seed_data(data)
        await close_db()
        console.print("[bold green]Database seeded successfully![/bold green]")

    asyncio.run(_run_seed())


def main():
    cli_app()


if __name__ == "__main__":
    main()
