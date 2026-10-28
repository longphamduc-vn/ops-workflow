"""Directed Acyclic Graph (DAG) construction, cycle detection, and topological sorting."""

from collections import defaultdict, deque
from collections.abc import Sequence

from opsflow.core.errors import CycleError
from opsflow.core.models import StepConfig


class DAG:
    """Manages workflow step dependency graph, validation, and execution order."""

    def __init__(self, steps: Sequence[StepConfig]) -> None:
        self.steps = list(steps)
        self.step_map: dict[str, StepConfig] = {s.id: s for s in steps}
        self.adj_list: dict[str, list[str]] = defaultdict(list)
        self.in_degree: dict[str, int] = {s.id: 0 for s in steps}
        self._ancestors_cache: dict[str, set[str]] = {}

        self._build_graph()

    def _build_graph(self) -> None:
        for s in self.steps:
            for dep in s.needs:
                if dep in self.step_map:
                    self.adj_list[dep].append(s.id)
                    self.in_degree[s.id] += 1

    def detect_cycles(self) -> list[str] | None:
        """Detect any cycle in the graph. Returns the cycle path if found, else None."""
        visited: dict[str, int] = {}  # 0: unvisited, 1: visiting, 2: visited
        parent: dict[str, str | None] = {}

        for step in self.steps:
            visited[step.id] = 0
            parent[step.id] = None

        def dfs(node: str, path: list[str]) -> list[str] | None:
            visited[node] = 1
            path.append(node)

            step = self.step_map.get(node)
            if step:
                for dep in step.needs:
                    if dep not in self.step_map:
                        continue
                    if visited[dep] == 1:
                        # Found cycle
                        cycle_start_idx = path.index(dep)
                        return path[cycle_start_idx:] + [dep]
                    if visited[dep] == 0:
                        parent[dep] = node
                        res = dfs(dep, path)
                        if res is not None:
                            return res

            visited[node] = 2
            path.pop()
            return None

        for step in self.steps:
            if visited[step.id] == 0:
                cycle = dfs(step.id, [])
                if cycle:
                    return cycle
        return None

    def topological_sort(self) -> list[str]:
        """Return steps in topological order. Raises CycleError if a cycle exists."""
        cycle = self.detect_cycles()
        if cycle:
            raise CycleError(
                f"Dependency cycle detected in workflow steps: {' -> '.join(cycle)}",
                cycle_path=cycle,
            )

        in_deg = dict(self.in_degree)
        queue = deque([sid for sid, deg in in_deg.items() if deg == 0])
        ordered: list[str] = []

        while queue:
            node = queue.popleft()
            ordered.append(node)
            for neighbor in self.adj_list.get(node, []):
                in_deg[neighbor] -= 1
                if in_deg[neighbor] == 0:
                    queue.append(neighbor)

        if len(ordered) != len(self.steps):
            cycle_path = self.detect_cycles() or []
            raise CycleError("Cycle detected during topological sorting", cycle_path=cycle_path)

        return ordered

    def get_ancestors(self, step_id: str, visited: set[str] | None = None) -> set[str]:
        """Return the set of all direct and transitive dependencies for a given step safely."""
        if visited is None and step_id in self._ancestors_cache:
            return self._ancestors_cache[step_id]

        if visited is None:
            visited = set()

        if step_id in visited:
            return set()
        visited.add(step_id)

        ancestors: set[str] = set()
        step = self.step_map.get(step_id)
        if not step:
            return ancestors

        for dep in step.needs:
            ancestors.add(dep)
            ancestors.update(self.get_ancestors(dep, visited.copy()))

        if len(visited) == 1:
            self._ancestors_cache[step_id] = ancestors

        return ancestors
