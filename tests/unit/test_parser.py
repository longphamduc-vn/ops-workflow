"""Unit tests for workflow YAML parser and model loading."""

import pytest

from opsflow.core.errors import ValidationError
from opsflow.core.parser import load_workflow_from_string, parse_workflow_yaml


def test_parse_valid_yaml() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
trigger: { type: manual }
steps:
  - id: step1
    type: call
    with: { connector: test }
"""
    wf = load_workflow_from_string(yaml_text)
    assert wf.version == "1.0"
    assert wf.name == "test-wf"
    assert len(wf.steps) == 1
    assert wf.steps[0].id == "step1"


def test_parse_invalid_yaml_syntax() -> None:
    bad_yaml = "version: 1.0\nname: [unclosed list"
    with pytest.raises(ValidationError) as exc_info:
        parse_workflow_yaml(bad_yaml)
    assert "YAML parsing error" in str(exc_info.value)
    assert exc_info.value.suggestion is not None


def test_parse_missing_required_fields() -> None:
    incomplete_yaml = """
version: "1.0"
name: test-wf
# missing trigger and steps
"""
    with pytest.raises(ValidationError) as exc_info:
        load_workflow_from_string(incomplete_yaml)
    assert exc_info.value.field_path != ""
