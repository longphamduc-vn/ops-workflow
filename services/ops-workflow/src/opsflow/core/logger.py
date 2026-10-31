"""Development and debugging logger for opsflow workflows.

Provides real-time, rich contextual logging during workflow execution:
- Step lifecycle (start, finish, skip, duration)
- Connector calls (operation, target endpoint, parameters, in_datasets)
- Wire responses (status, datasets returned, row counts, latency)
- Data transformations (JMESPath expressions, input/output structures)
- Joins, loops, database upserts, and notifications
- Automatic secret masking across all logs
"""

import json
import logging
import os
from typing import Any

from rich.console import Console

from opsflow.secrets.provider import get_secret_provider, mask_secrets

# Standard logger for file/streaming log integration
logger = logging.getLogger("opsflow.dev")

# Rich console for interactive terminal development
console = Console(stderr=False)

# Global dev mode flag
_DEV_MODE = os.getenv("OPSFLOW_DEV", "").strip().lower() in ("1", "true", "yes", "on") or os.getenv("LOG_LEVEL", "").upper() == "DEBUG"


def is_dev_mode() -> bool:
    """Return whether development logging is currently active."""
    return _DEV_MODE


def set_dev_mode(enabled: bool = True) -> None:
    """Enable or disable workflow development logging."""
    global _DEV_MODE
    _DEV_MODE = enabled
    if enabled:
        logging.getLogger("opsflow").setLevel(logging.DEBUG)
        logger.setLevel(logging.DEBUG)


def _safe_str(obj: Any, max_len: int = 500) -> str:
    """Convert object to masked string, truncating if too long."""
    try:
        if isinstance(obj, (dict, list)):
            text = json.dumps(obj, default=str, ensure_ascii=False)
        else:
            text = str(obj)
    except Exception:
        text = str(obj)

    # Mask known secrets
    secret_vals = get_secret_provider().get_known_secret_values()
    masked = mask_secrets(text, list(secret_vals))

    if len(masked) > max_len:
        return masked[:max_len] + f"... (+{len(masked) - max_len} chars)"
    return masked


def dev_log_workflow_start(name: str, run_id: str, inputs: dict[str, Any]) -> None:
    """Log the beginning of a workflow run."""
    if not _DEV_MODE:
        return
    console.print("\n[bold blue]━━━ [DEV WORKFLOW: START] ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold blue]")
    console.print(f"  [bold]Workflow:[/bold] [cyan]{name}[/cyan]  |  [bold]Run ID:[/bold] [dim]{run_id}[/dim]")
    if inputs:
        console.print(f"  [bold]Inputs:[/bold] {_safe_str(inputs, max_len=300)}")
    logger.debug(f"[DEV WORKFLOW START] name={name} run_id={run_id} inputs={_safe_str(inputs)}")


def dev_log_workflow_finish(name: str, run_id: str, status: str, duration_ms: int) -> None:
    """Log completion of a workflow run."""
    if not _DEV_MODE:
        return
    color = "green" if status == "success" else "red"
    console.print(f"[bold {color}]━━━ [DEV WORKFLOW: {status.upper()}] ({duration_ms}ms) ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/bold {color}]\n")
    logger.debug(f"[DEV WORKFLOW FINISH] name={name} run_id={run_id} status={status} duration={duration_ms}ms")


def dev_log_step_start(step_id: str, step_type: str, with_params: dict[str, Any]) -> None:
    """Log execution start of an individual step."""
    if not _DEV_MODE:
        return
    console.print(f"  [bold cyan]▶ STEP '{step_id}'[/bold cyan] [dim]({step_type})[/dim]")
    logger.debug(f"[STEP START] id={step_id} type={step_type}")


def dev_log_step_finish(
    step_id: str,
    step_type: str,
    status: str,
    latency_ms: int,
    outputs: Any = None,
    error: Any = None,
) -> None:
    """Log completion of an individual step."""
    if not _DEV_MODE:
        return
    if status == "success":
        summary = ""
        if isinstance(outputs, list):
            summary = f"[dim]({len(outputs)} items produced)[/dim]"
        elif isinstance(outputs, dict):
            summary = f"[dim](keys: {list(outputs.keys())})[/dim]"
        console.print(f"    [bold green]✔ Done[/bold green] [dim]{latency_ms}ms[/dim] {summary}")
    elif status == "skipped":
        console.print(f"    [bold yellow]↷ Skipped[/bold yellow] [dim]{latency_ms}ms[/dim]")
    else:
        err_msg = _safe_str(error) if error else "Failed"
        console.print(f"    [bold red]✖ FAILED[/bold red] [dim]{latency_ms}ms[/dim] - [red]{err_msg}[/red]")
    logger.debug(f"[STEP FINISH] id={step_id} status={status} latency={latency_ms}ms")


def dev_log_call(
    connector: str,
    operation: str,
    params: dict[str, Any] | None = None,
    in_datasets: dict[str, Any] | None = None,
) -> None:
    """Log outgoing connector call invocation."""
    if not _DEV_MODE:
        return
    console.print(f"    [bold yellow]⮞ CALL[/bold yellow] connector=[cyan]{connector}[/cyan] op=[yellow]{operation}[/yellow]")
    if params:
        filtered_params = {k: v for k, v in params.items() if k not in ("params", "in_datasets", "out_datasets")}
        if filtered_params:
            console.print(f"      [dim]Params:[/dim] {_safe_str(filtered_params, max_len=250)}")
    if in_datasets:
        ds_summary = {k: f"{len(v)} row(s)" if isinstance(v, list) else str(v) for k, v in in_datasets.items()}
        console.print(f"      [dim]In Datasets:[/dim] {ds_summary}")
    logger.debug(f"[CALL] connector={connector} op={operation} params={_safe_str(params)} in_ds={_safe_str(in_datasets)}")


def dev_log_call_response(
    connector: str,
    operation: str,
    ok: bool,
    data: Any = None,
    error: Any = None,
    meta: dict[str, Any] | None = None,
) -> None:
    """Log incoming response from external connector."""
    if not _DEV_MODE:
        return
    latency = meta.get("latency_ms", 0) if meta else 0
    if ok:
        ds_info = ""
        if isinstance(data, dict):
            ds_desc = [f"{k} ({len(v)} rows)" if isinstance(v, list) else k for k, v in data.items()]
            ds_info = f"datasets=[{', '.join(ds_desc)}]"
        elif isinstance(data, list):
            ds_info = f"rows={len(data)}"
        console.print(f"    [bold green]⮜ RESP[/bold green] [dim]{latency}ms[/dim] status=[green]OK[/green] {ds_info}")
    else:
        err_str = _safe_str(error, max_len=200)
        console.print(f"    [bold red]⮜ RESP[/bold red] [dim]{latency}ms[/dim] status=[red]ERROR[/red] error={err_str}")
    logger.debug(f"[RESP] connector={connector} op={operation} ok={ok} meta={meta}")


def dev_log_transform(
    engine: str,
    expression: str,
    input_data: Any,
    output_data: Any,
) -> None:
    """Log data transformation execution."""
    if not _DEV_MODE:
        return
    in_len = len(input_data) if isinstance(input_data, list) else 1
    out_len = len(output_data) if isinstance(output_data, list) else (1 if output_data is not None else 0)
    expr_preview = expression.strip().replace("\n", " ")
    if len(expr_preview) > 80:
        expr_preview = expr_preview[:77] + "..."
    console.print(f"    [bold magenta]⚡ TRANSFORM[/bold magenta] [dim]({engine})[/dim] in={in_len} items -> out={out_len} items")
    console.print(f"      [dim]Expr:[/dim] [magenta]{expr_preview}[/magenta]")
    logger.debug(f"[TRANSFORM] engine={engine} expr={expression} in_len={in_len} out_len={out_len}")


def dev_log_foreach(items_count: int, concurrency: int, on_error: str) -> None:
    """Log foreach loop execution setup."""
    if not _DEV_MODE:
        return
    console.print(f"    [bold blue]↺ FOREACH[/bold blue] iterating over [bold]{items_count}[/bold] items [dim](concurrency={concurrency}, on_error={on_error})[/dim]")
    logger.debug(f"[FOREACH] items_count={items_count} concurrency={concurrency}")


def dev_log_join(left_count: int, right_count: int, on_key: Any, how: str, result_count: int) -> None:
    """Log relational join step execution."""
    if not _DEV_MODE:
        return
    console.print(f"    [bold blue]⨝ JOIN[/bold blue] [dim]({how})[/dim] left={left_count} + right={right_count} on='{on_key}' -> {result_count} joined records")
    logger.debug(f"[JOIN] how={how} on={on_key} left={left_count} right={right_count} result={result_count}")


def dev_log_db_upsert(table: str, keys: list[str], row_count: int) -> None:
    """Log database upsert step execution."""
    if not _DEV_MODE:
        return
    console.print(f"    [bold blue]💾 DB_UPSERT[/bold blue] table=[cyan]{table}[/cyan] keys={keys} rows={row_count}")
    logger.debug(f"[DB_UPSERT] table={table} keys={keys} rows={row_count}")


def dev_log_notify(channel: str, message: str) -> None:
    """Log notification dispatch."""
    if not _DEV_MODE:
        return
    msg_preview = message.replace("\n", " ")
    if len(msg_preview) > 60:
        msg_preview = msg_preview[:57] + "..."
    console.print(f"    [bold green]🔔 NOTIFY[/bold green] channel=[cyan]{channel}[/cyan] msg=\"{msg_preview}\"")
    logger.debug(f"[NOTIFY] channel={channel} msg={message}")
