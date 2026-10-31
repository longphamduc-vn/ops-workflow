"""Unit tests for DAG construction, cycle detection, and topological sorting."""

import pytest

from opsflow.core.dag import DAG
from opsflow.core.errors import CycleError
from opsflow.core.models import StepConfig


def test_dag_topological_sort_linear() -> None:
    s1 = StepConfig(id="s1", type="call")
    s2 = StepConfig(id="s2", type="call", needs=["s1"])
    s3 = StepConfig(id="s3", type="call", needs=["s2"])

    dag = DAG([s3, s1, s2])
    order = dag.topological_sort()
    assert order == ["s1", "s2", "s3"]


def test_dag_parallel_branches() -> None:
    # a -> b, a -> c, (b, c) -> d
    s_a = StepConfig(id="a", type="call")
    s_b = StepConfig(id="b", type="call", needs=["a"])
    s_c = StepConfig(id="c", type="call", needs=["a"])
    s_d = StepConfig(id="d", type="call", needs=["b", "c"])

    dag = DAG([s_d, s_c, s_b, s_a])
    order = dag.topological_sort()
    assert order.index("a") < order.index("b")
    assert order.index("a") < order.index("c")
    assert order.index("b") < order.index("d")
    assert order.index("c") < order.index("d")


def test_dag_cycle_detection() -> None:
    # a -> b -> c -> a
    s_a = StepConfig(id="a", type="call", needs=["c"])
    s_b = StepConfig(id="b", type="call", needs=["a"])
    s_c = StepConfig(id="c", type="call", needs=["b"])

    dag = DAG([s_a, s_b, s_c])
    cycle = dag.detect_cycles()
    assert cycle is not None
    assert set(cycle) == {"a", "b", "c"}

    with pytest.raises(CycleError) as exc_info:
        dag.topological_sort()
    assert "cycle" in str(exc_info.value).lower()
    assert len(exc_info.value.cycle_path) >= 3


def test_dag_get_ancestors() -> None:
    s_a = StepConfig(id="a", type="call")
    s_b = StepConfig(id="b", type="call", needs=["a"])
    s_c = StepConfig(id="c", type="call", needs=["b"])
    s_d = StepConfig(id="d", type="call", needs=["c"])

    dag = DAG([s_a, s_b, s_c, s_d])
    assert dag.get_ancestors("a") == set()
    assert dag.get_ancestors("b") == {"a"}
    assert dag.get_ancestors("c") == {"a", "b"}
    assert dag.get_ancestors("d") == {"a", "b", "c"}
