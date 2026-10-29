"""Unit tests for Opsflow Typer CLI."""

from pathlib import Path

from typer.testing import CliRunner

from opsflow.cli import app

runner = CliRunner()


def test_cli_validate_success(tmp_path: Path) -> None:
    valid_yaml = tmp_path / "valid.yml"
    valid_yaml.write_text(
        """
version: "1.0"
name: "cli-test-wf"
trigger:
  type: "manual"
steps:
  - id: "step_01"
    type: "transform"
    with:
      engine: "jmespath"
      input: {"a": 10}
      expression: "a"
""",
        encoding="utf-8",
    )

    res = runner.invoke(app, ["validate", str(valid_yaml)])
    assert res.exit_code == 0
    assert "[OK] Workflow 'cli-test-wf' is valid." in res.stdout


def test_cli_validate_invalid(tmp_path: Path) -> None:
    invalid_yaml = tmp_path / "invalid.yml"
    invalid_yaml.write_text(
        """
version: "1.0"
name: "invalid-wf"
trigger:
  type: "manual"
steps:
  - id: "s1"
    type: "call"
    needs: ["s2"]
  - id: "s2"
    type: "call"
    needs: ["s1"]
""",
        encoding="utf-8",
    )

    res = runner.invoke(app, ["validate", str(invalid_yaml)])
    assert res.exit_code == 1
    assert "Dependency cycle detected" in res.stderr or "Dependency cycle detected" in res.stdout


def test_cli_list_workflows(tmp_path: Path) -> None:
    wf_file = tmp_path / "sample.yml"
    wf_file.write_text(
        """
version: "1.0"
name: "sample-list"
trigger:
  type: "manual"
steps:
  - id: "s1"
    type: "transform"
""",
        encoding="utf-8",
    )

    res = runner.invoke(app, ["list", "--dir", str(tmp_path)])
    assert res.exit_code == 0
    assert "sample-list" in res.stdout


def test_cli_run_workflow(tmp_path: Path) -> None:
    db_file = tmp_path / "test.db"
    wf_file = tmp_path / "run_wf.yml"
    wf_file.write_text(
        """
version: "1.0"
name: "cli-run-test"
trigger:
  type: "manual"
steps:
  - id: "calc"
    type: "transform"
    with:
      engine: "jmespath"
      input: {"val": 42}
      expression: "val"
""",
        encoding="utf-8",
    )

    res = runner.invoke(
        app,
        ["run", str(wf_file), "--db", f"sqlite+aiosqlite:///{db_file}"],
    )
    assert res.exit_code == 0
    assert "SUCCESS" in res.stdout
    assert "calc" in res.stdout
