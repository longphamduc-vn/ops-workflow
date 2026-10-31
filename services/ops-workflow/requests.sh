#!/usr/bin/env bash
# ==============================================================================
# Opsflow Workflow Engine - cURL Command Collection
# 
# A drop-in terminal alternative to requests.http for environments without
# an HTTP client or browser extensions.
#
# Usage:
#   chmod +x requests.sh
#   ./requests.sh [command]
#
# Examples:
#   ./requests.sh health
#   ./requests.sh list-workflows
#   ./requests.sh run-audit
#   ./requests.sh query-dataset
# ==============================================================================

set -e

BASE_URL="${BASE_URL:-http://localhost:8000}"
EMS_URL="${EMS_URL:-http://localhost:9000}"
API_KEY="${API_KEY:-admin_key}"
ORG_ID="${ORG_ID:-28753}"
ALERT_CHANNEL="${ALERT_CHANNEL:-#ops-alerts}"

echo_cmd() {
    echo -e "\033[1;34m==>\033[0m \033[1;32m$*\033[0m"
}

case "$1" in
    # --------------------------------------------------------------------------
    # 1. Health & Observability
    # --------------------------------------------------------------------------
    health)
        echo_cmd "Checking API Liveness Probe..."
        curl -s -i "${BASE_URL}/health"
        echo ""
        ;;

    ready)
        echo_cmd "Checking API Readiness Probe..."
        curl -s -i "${BASE_URL}/ready"
        echo ""
        ;;

    metrics)
        echo_cmd "Retrieving Prometheus Metrics..."
        curl -s "${BASE_URL}/metrics"
        ;;

    # --------------------------------------------------------------------------
    # 2. Workflow Discovery & Inspection
    # --------------------------------------------------------------------------
    list-workflows|workflows)
        echo_cmd "Listing Registered Workflows..."
        curl -s -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/v1/workflows" | python3 -m json.tool
        ;;

    inspect-audit)
        echo_cmd "Inspecting 'spare-parts-inventory-audit' Schema..."
        curl -s -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/v1/workflows/spare-parts-inventory-audit" | python3 -m json.tool
        ;;

    inspect-sync)
        echo_cmd "Inspecting 'spare-parts-inventory-sync' Schema..."
        curl -s -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/v1/workflows/spare-parts-inventory-sync" | python3 -m json.tool
        ;;

    # --------------------------------------------------------------------------
    # 3. Trigger Workflow Runs
    # --------------------------------------------------------------------------
    run-audit)
        echo_cmd "Triggering 'spare-parts-inventory-audit' (Synchronous wait 5s)..."
        curl -s -X POST "${BASE_URL}/api/v1/workflows/spare-parts-inventory-audit/runs?wait=5" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"inputs\": {\"organization_id\": \"${ORG_ID}\", \"alert_channel\": \"${ALERT_CHANNEL}\"}}" | python3 -m json.tool
        ;;

    run-audit-dev)
        echo_cmd "Triggering 'spare-parts-inventory-audit' with DEV LOGGING enabled (_dev: true)..."
        curl -s -X POST "${BASE_URL}/api/v1/workflows/spare-parts-inventory-audit/runs?wait=5" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"inputs\": {\"organization_id\": \"${ORG_ID}\", \"alert_channel\": \"${ALERT_CHANNEL}\", \"_dev\": true}}" | python3 -m json.tool
        ;;

    run-sync)
        echo_cmd "Triggering 'spare-parts-inventory-sync' (Synchronous wait 5s)..."
        curl -s -X POST "${BASE_URL}/api/v1/workflows/spare-parts-inventory-sync/runs?wait=5" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"inputs\": {\"organization_id\": \"${ORG_ID}\"}}" | python3 -m json.tool
        ;;

    run-async)
        IDEM_KEY="cli-run-$(date +%s)"
        echo_cmd "Triggering Asynchronous Run with Idempotency-Key: ${IDEM_KEY}..."
        curl -s -X POST "${BASE_URL}/api/v1/workflows/spare-parts-inventory-audit/runs" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Idempotency-Key: ${IDEM_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"inputs\": {\"organization_id\": \"${ORG_ID}\"}}" | python3 -m json.tool
        ;;

    # --------------------------------------------------------------------------
    # 4. Run Status & Step Diagnostics
    # --------------------------------------------------------------------------
    get-run)
        RUN_ID="$2"
        if [ -z "${RUN_ID}" ]; then
            echo "Usage: ./requests.sh get-run <run_id>"
            exit 1
        fi
        echo_cmd "Inspecting Run: ${RUN_ID}..."
        curl -s -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/v1/runs/${RUN_ID}" | python3 -m json.tool
        ;;

    get-steps)
        RUN_ID="$2"
        if [ -z "${RUN_ID}" ]; then
            echo "Usage: ./requests.sh get-steps <run_id>"
            exit 1
        fi
        echo_cmd "Inspecting Step Details for Run: ${RUN_ID}..."
        curl -s -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/v1/runs/${RUN_ID}/steps" | python3 -m json.tool
        ;;

    # --------------------------------------------------------------------------
    # 5. Query Read-Model Datasets
    # --------------------------------------------------------------------------
    query-dataset|dataset)
        LIMIT="${2:-5}"
        echo_cmd "Querying 'spare_parts_audit_dataset' (limit=${LIMIT})..."
        curl -s -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/v1/datasets/spare_parts_audit_dataset?limit=${LIMIT}" | python3 -m json.tool
        ;;

    dataset-schema)
        echo_cmd "Querying Dataset Inferred Schema..."
        curl -s -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/v1/datasets/spare_parts_audit_dataset/schema" | python3 -m json.tool
        ;;

    # --------------------------------------------------------------------------
    # 6. Webhooks
    # --------------------------------------------------------------------------
    list-webhooks)
        echo_cmd "Listing Webhook Subscriptions..."
        curl -s -H "X-API-Key: ${API_KEY}" "${BASE_URL}/api/v1/webhooks/subscriptions" | python3 -m json.tool
        ;;

    register-webhook)
        TARGET_URL="${2:-https://webhook.site/test-receiver}"
        echo_cmd "Registering Webhook to: ${TARGET_URL}..."
        curl -s -X POST "${BASE_URL}/api/v1/webhooks/subscriptions" \
            -H "X-API-Key: ${API_KEY}" \
            -H "Content-Type: application/json" \
            -d "{\"target_url\": \"${TARGET_URL}\", \"event_types\": [\"spare_parts.audit.completed\"]}" | python3 -m json.tool
        ;;

    # --------------------------------------------------------------------------
    # 7. EMS Simulation Cross-Check (:9000)
    # --------------------------------------------------------------------------
    ems-health)
        echo_cmd "Checking EMS Simulation Health..."
        curl -s "${EMS_URL}/health" | python3 -m json.tool
        ;;

    ems-logs)
        LIMIT="${2:-10}"
        echo_cmd "Retrieving Audit Logs from EMS Simulation (limit=${LIMIT})..."
        curl -s "${EMS_URL}/admin/logs?limit=${LIMIT}" | python3 -m json.tool
        ;;

    # --------------------------------------------------------------------------
    # Default: Help Menu & cURL Cheat Sheet
    # --------------------------------------------------------------------------
    *)
        cat << 'EOF'
==============================================================================
Opsflow cURL Command Utility (requests.sh)
==============================================================================

Commands:
  ./requests.sh health              Check API server health
  ./requests.sh ready               Check API server readiness
  ./requests.sh metrics             View Prometheus metrics
  ./requests.sh list-workflows      List registered workflows
  ./requests.sh inspect-audit       Inspect 'spare-parts-inventory-audit'
  ./requests.sh run-audit           Execute audit workflow (?wait=5)
  ./requests.sh run-audit-dev       Execute audit workflow with DEV LOGGING enabled (_dev: true)
  ./requests.sh run-sync            Execute stock sync workflow (?wait=5)
  ./requests.sh run-async           Trigger async run with Idempotency-Key
  ./requests.sh get-run <run_id>    View execution outputs of a specific run
  ./requests.sh get-steps <run_id>  View per-step latency and diagnostics
  ./requests.sh query-dataset [n]   Query published dataset records (default: 5)
  ./requests.sh dataset-schema      View dataset column schema
  ./requests.sh list-webhooks       List webhook subscriptions
  ./requests.sh register-webhook    Register new webhook subscriber
  ./requests.sh ems-health          Check EMS simulator status
  ./requests.sh ems-logs [n]        View EMS simulator audit logs (default: 10)

Raw cURL Example to trigger workflow:
  curl -X POST "http://localhost:8000/api/v1/workflows/spare-parts-inventory-audit/runs?wait=5" \
    -H "X-API-Key: admin_key" \
    -H "Content-Type: application/json" \
    -d '{"inputs": {"organization_id": "28753"}}'

Raw cURL Example to query dataset:
  curl -H "X-API-Key: admin_key" \
    "http://localhost:8000/api/v1/datasets/spare_parts_audit_dataset?limit=5"
==============================================================================
EOF
        ;;
esac

