"""Comprehensive test suite for workflow validator rules 1 to 10."""

from pathlib import Path

from opsflow.core.parser import load_workflow_from_file, load_workflow_from_string
from opsflow.core.validator import validate_workflow


def test_golden_example_is_valid() -> None:
    golden_path = Path("workflows/equipment-status-lookup.yml")
    assert golden_path.exists()
    wf = load_workflow_from_file(golden_path)
    errors = validate_workflow(wf)
    assert errors == [], f"Golden workflow should be valid, but got errors: {errors}"


def test_rule_1_duplicate_step_ids() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
trigger: { type: manual }
steps:
  - id: step_one
    type: call
  - id: step_one
    type: transform
"""
    wf = load_workflow_from_string(yaml_text)
    errors = validate_workflow(wf)
    rule_1_errs = [e for e in errors if e.rule_number == 1]
    assert len(rule_1_errs) == 1
    assert rule_1_errs[0].field_path == "steps[1].id"
    assert "Duplicate step id" in rule_1_errs[0].message
    assert rule_1_errs[0].suggestion is not None


def test_rule_2_needs_entry_must_exist() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
trigger: { type: manual }
steps:
  - id: step_a
    type: call
    needs: [step_non_existent]
"""
    wf = load_workflow_from_string(yaml_text)
    errors = validate_workflow(wf)
    rule_2_errs = [e for e in errors if e.rule_number == 2]
    assert len(rule_2_errs) == 1
    assert rule_2_errs[0].field_path == "steps[0].needs[0]"
    assert "non-existent step" in rule_2_errs[0].message
    assert rule_2_errs[0].suggestion is not None


def test_rule_3_no_dependency_cycles() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
trigger: { type: manual }
steps:
  - id: step_a
    type: call
    needs: [step_b]
  - id: step_b
    type: call
    needs: [step_a]
"""
    wf = load_workflow_from_string(yaml_text)
    errors = validate_workflow(wf)
    rule_3_errs = [e for e in errors if e.rule_number == 3]
    assert len(rule_3_errs) == 1
    assert rule_3_errs[0].field_path == "steps"
    assert "cycle detected" in rule_3_errs[0].message.lower()
    assert rule_3_errs[0].suggestion is not None


def test_rule_4_connectors_declared() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
trigger: { type: manual }
steps:
  - id: step_a
    type: call
    with:
      connector: undeclared_conn
"""
    wf = load_workflow_from_string(yaml_text)
    errors = validate_workflow(wf)
    rule_4_errs = [e for e in errors if e.rule_number == 4]
    assert len(rule_4_errs) == 1
    assert rule_4_errs[0].field_path == "steps[0].with.connector"
    assert "undeclared_conn" in rule_4_errs[0].message
    assert rule_4_errs[0].suggestion is not None


def test_rule_5_step_output_needs_chain() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
trigger: { type: manual }
steps:
  - id: step_a
    type: call
  - id: step_b
    type: transform
    # Missing needs: [step_a]
    with:
      input: "${steps.step_a.outputs.data}"
"""
    wf = load_workflow_from_string(yaml_text)
    errors = validate_workflow(wf)
    rule_5_errs = [e for e in errors if e.rule_number == 5]
    assert len(rule_5_errs) == 1
    assert rule_5_errs[0].field_path == "steps[1].with"
    assert "dependency chain" in rule_5_errs[0].message
    assert "Add 'step_a' to step 'step_b.needs'" in (rule_5_errs[0].suggestion or "")


def test_rule_6_no_hardcoded_secrets() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
connectors:
  legacy:
    type: http
    auth:
      password: plain_text_secret
trigger: { type: manual }
steps:
  - id: step_a
    type: call
"""
    wf = load_workflow_from_string(yaml_text)
    errors = validate_workflow(wf)
    rule_6_errs = [e for e in errors if e.rule_number == 6]
    assert len(rule_6_errs) == 1
    assert rule_6_errs[0].field_path == "connectors.legacy.auth.password"
    assert "Hard-coded secret detected" in rule_6_errs[0].message
    assert "${secrets." in (rule_6_errs[0].suggestion or "")


def test_rule_7_nexacro_allowed_services() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
connectors:
  ems:
    type: nexacro
    allowed_services: [/eqp/selectList.do]
trigger: { type: manual }
steps:
  - id: step_a
    type: call
    with:
      connector: ems
      operation: /eqp/deleteEqp.do # Forbidden!
"""
    wf = load_workflow_from_string(yaml_text)
    errors = validate_workflow(wf)
    rule_7_errs = [e for e in errors if e.rule_number == 7]
    assert len(rule_7_errs) == 1
    assert rule_7_errs[0].field_path == "steps[0].with.operation"
    assert "deleteEqp.do" in rule_7_errs[0].message
    assert rule_7_errs[0].suggestion is not None


def test_rule_8_foreach_concurrency() -> None:
    yaml_text = """
version: "1.0"
name: test-wf
connectors:
  ems:
    type: nexacro
    limits: { max_concurrent: 2 }
    allowed_services: [/eqp/selectDetail.do]
trigger: { type: manual }
steps:
  - id: loop_step
    type: foreach
    with:
      concurrency: 5 # Exceeds connector max_concurrent of 2
      step:
        type: call
        with:
          connector: ems
          operation: /eqp/selectDetail.do
"""
    wf = load_workflow_from_string(yaml_text)
    errors = validate_workflow(wf)
    rule_8_errs = [e for e in errors if e.rule_number == 8]
    assert len(rule_8_errs) == 1
    assert rule_8_errs[0].field_path == "steps[0].with.concurrency"
    assert "exceeds connector 'ems' max_concurrent (2)" in rule_8_errs[0].message
    assert rule_8_errs[0].suggestion is not None


def test_rule_9_publish_dataset_validation() -> None:
    # Test invalid dataset identifier
    bad_dataset_yaml = """
version: "1.0"
name: test-wf
trigger: { type: manual }
steps:
  - id: step_a
    type: call
publish:
  dataset: "123-Invalid Dataset!"
  source: "${steps.step_a.outputs}"
"""
    wf = load_workflow_from_string(bad_dataset_yaml)
    errors = validate_workflow(wf)
    rule_9_errs = [e for e in errors if e.rule_number == 9]
    assert len(rule_9_errs) == 1
    assert rule_9_errs[0].field_path == "publish.dataset"
    assert "valid identifier" in rule_9_errs[0].message

    # Test cross-workflow dataset collision
    good_dataset_yaml = """
version: "1.0"
name: new-workflow
trigger: { type: manual }
steps:
  - id: step_a
    type: call
publish:
  dataset: equipment_status
  source: "${steps.step_a.outputs}"
"""
    wf2 = load_workflow_from_string(good_dataset_yaml)
    known = {"equipment_status": "other-workflow"}
    errors2 = validate_workflow(wf2, known_datasets=known)
    rule_9_collision = [e for e in errors2 if e.rule_number == 9]
    assert len(rule_9_collision) == 1
    assert "already published by workflow 'other-workflow'" in rule_9_collision[0].message


def test_rule_10_all_errors_contain_field_path_and_suggestion() -> None:
    bad_yaml = """
version: "1.0"
name: test-wf
connectors:
  ems:
    type: nexacro
    auth: { password: plain }
    allowed_services: [/read.do]
trigger: { type: manual }
steps:
  - id: s1
    type: call
    with:
      connector: ems
      operation: /forbidden.do
  - id: s2
    type: call
    needs: [unknown_step]
"""
    wf = load_workflow_from_string(bad_yaml)
    errors = validate_workflow(wf)
    assert len(errors) >= 3
    for err in errors:
        assert err.field_path != "", f"Error {err} is missing field_path"
        assert err.suggestion is not None and len(err.suggestion) > 0, (
            f"Error {err} is missing suggestion"
        )
