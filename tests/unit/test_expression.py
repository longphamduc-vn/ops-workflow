"""Unit tests for safe expression evaluation and namespace interpolation."""

import os

from opsflow.core.context import Context
from opsflow.core.expression import ExpressionEvaluator
from opsflow.secrets.provider import EnvSecretProvider, set_secret_provider


def test_expression_namespaces() -> None:
    os.environ["OPS_TEST_SECRET"] = "my_super_secret"
    set_secret_provider(EnvSecretProvider(prefix="OPS_"))

    evaluator = ExpressionEvaluator(
        inputs={"site_code": "SITE_01", "count": 42},
        env={"REGION": "APAC"},
        step_outputs={"step1": {"outputs": {"items": [1, 2, 3]}}},
        item={"EQP_ID": "EQP_99"},
        run_id="run_123",
    )

    # 1. Inputs
    assert evaluator.interpolate("${inputs.site_code}") == "SITE_01"
    assert evaluator.interpolate("${inputs.count}") == 42
    assert evaluator.interpolate("Site is ${inputs.site_code}") == "Site is SITE_01"

    # 2. Env
    assert evaluator.interpolate("${env.REGION}") == "APAC"

    # 3. Secrets
    assert evaluator.interpolate("${secrets.TEST_SECRET}") == "my_super_secret"

    # 4. Steps outputs (type preserved)
    assert evaluator.interpolate("${steps.step1.outputs.items}") == [1, 2, 3]

    # 5. Item
    assert evaluator.interpolate("${item.EQP_ID}") == "EQP_99"

    # 6. Run
    assert evaluator.interpolate("${run.id}") == "run_123"


def test_condition_evaluation() -> None:
    ctx = Context(
        run_id="run_abc",
        inputs={"threshold": 10},
        step_outputs={
            "normalize": {
                "outputs": [
                    {"equipment_id": "E1", "status": "running"},
                    {"equipment_id": "E2", "status": "fault"},
                ]
            }
        },
    )

    # Simple comparison
    assert ctx.evaluate_condition("inputs['threshold'] > 5") is True
    assert ctx.evaluate_condition("inputs['threshold'] < 5") is False

    # any predicate
    assert ctx.evaluate_condition("any(steps.normalize.outputs, status == 'fault')") is True
    assert ctx.evaluate_condition("any(steps.normalize.outputs, status == 'offline')") is False
