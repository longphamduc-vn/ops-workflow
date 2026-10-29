"""Prometheus-style metrics collector for Opsflow."""

import threading
from collections import defaultdict
from typing import Any, ClassVar


class MetricsCollector:
    """Thread-safe collector for runtime metrics with Prometheus exposition format."""

    _instance: ClassVar["MetricsCollector | None"] = None

    def __init__(self) -> None:
        self._lock = threading.Lock()
        # Counters: (metric_name, tuple(sorted_labels)) -> float
        self._counters: dict[tuple[str, tuple[tuple[str, str], ...]], float] = defaultdict(float)
        # Summaries / Histograms: (metric_name, tuple(sorted_labels)) -> list[float]
        self._durations: dict[tuple[str, tuple[tuple[str, str], ...]], list[float]] = defaultdict(
            list
        )

    @classmethod
    def get_instance(cls) -> "MetricsCollector":
        """Singleton accessor."""
        if cls._instance is None:
            cls._instance = MetricsCollector()
        return cls._instance

    def inc_counter(self, name: str, value: float = 1.0, **labels: str) -> None:
        """Increment a counter metric."""
        label_key = tuple(sorted(labels.items()))
        with self._lock:
            self._counters[(name, label_key)] += value

    def observe_duration(self, name: str, duration_seconds: float, **labels: str) -> None:
        """Record an observed latency or duration."""
        label_key = tuple(sorted(labels.items()))
        with self._lock:
            self._durations[(name, label_key)].append(duration_seconds)

    def record_run(self, workflow: str, status: str, duration_sec: float) -> None:
        """Track complete workflow run."""
        self.inc_counter("opsflow_runs_total", workflow=workflow, status=status)
        self.observe_duration("opsflow_run_duration_seconds", duration_sec, workflow=workflow)
        if status == "failed":
            self.inc_counter("opsflow_failures_total", kind="run_failed", workflow=workflow)

    def record_step(
        self,
        workflow: str,
        step_id: str,
        status: str,
        duration_sec: float,
        error_kind: str | None = None,
    ) -> None:
        """Track step execution."""
        self.inc_counter(
            "opsflow_step_executions_total",
            workflow=workflow,
            step_id=step_id,
            status=status,
        )
        self.observe_duration(
            "opsflow_step_duration_seconds",
            duration_sec,
            workflow=workflow,
            step_id=step_id,
        )
        if status == "failed" and error_kind:
            self.inc_counter(
                "opsflow_failures_total",
                kind=error_kind,
                workflow=workflow,
                step_id=step_id,
            )

    def record_connector_call(self, connector: str, status: str, latency_sec: float) -> None:
        """Track outbound connector request and latency."""
        self.inc_counter("opsflow_connector_requests_total", connector=connector, status=status)
        self.observe_duration("opsflow_connector_latency_seconds", latency_sec, connector=connector)

    def record_session_relogin(self, connector: str) -> None:
        """Track session expiry and automatic re-logins."""
        self.inc_counter("opsflow_session_relogins_total", connector=connector)

    def render_prometheus_text(self) -> str:
        """Generate Prometheus text format exposition."""
        lines: list[str] = []

        with self._lock:
            counters_snapshot = dict(self._counters)
            durations_snapshot = dict(self._durations)

        # Descriptions & types
        metric_meta = {
            "opsflow_runs_total": ("Total workflow runs started/finished", "counter"),
            "opsflow_run_duration_seconds": ("Workflow run duration in seconds", "summary"),
            "opsflow_step_executions_total": ("Total step executions", "counter"),
            "opsflow_step_duration_seconds": ("Step execution duration in seconds", "summary"),
            "opsflow_failures_total": ("Total recorded failures by kind", "counter"),
            "opsflow_connector_requests_total": ("Total connector requests made", "counter"),
            "opsflow_connector_latency_seconds": (
                "Connector request latency in seconds",
                "summary",
            ),
            "opsflow_session_relogins_total": ("Total session auto re-logins", "counter"),
        }

        # Render counters
        counter_groups: dict[str, list[Any]] = defaultdict(list)
        for (name, labels), val in counters_snapshot.items():
            counter_groups[name].append((labels, val))

        for name, items in counter_groups.items():
            help_text, m_type = metric_meta.get(name, (f"{name} metric", "counter"))
            lines.append(f"# HELP {name} {help_text}")
            lines.append(f"# TYPE {name} {m_type}")
            for labels, val in items:
                lbl_str = ",".join(f'{k}="{v}"' for k, v in labels)
                formatted_lbl = f"{{{lbl_str}}}" if lbl_str else ""
                lines.append(f"{name}{formatted_lbl} {val}")

        # Render durations
        duration_groups: dict[str, list[Any]] = defaultdict(list)
        for (name, labels), vals in durations_snapshot.items():
            duration_groups[name].append((labels, vals))

        for name, items in duration_groups.items():
            help_text, m_type = metric_meta.get(name, (f"{name} duration", "summary"))
            lines.append(f"# HELP {name} {help_text}")
            lines.append(f"# TYPE {name} {m_type}")
            for labels, vals in items:
                lbl_str = ",".join(f'{k}="{v}"' for k, v in labels)
                total_sum = sum(vals)
                count = len(vals)
                lines.append(f"{name}_sum{{{lbl_str}}} {total_sum:.4f}")
                lines.append(f"{name}_count{{{lbl_str}}} {count}")

        lines.append("")
        return "\n".join(lines)


GLOBAL_METRICS = MetricsCollector.get_instance()
