@echo off
rem ==============================================================================
rem Opsflow Workflow Engine - Command Prompt Utility (requests.bat) for Windows
rem ==============================================================================

setlocal enabledelayedexpansion

set "BASE_URL=http://localhost:8000"
set "EMS_URL=http://localhost:9000"
set "API_KEY=admin_key"
set "ORG_ID=28753"
set "ALERT_CHANNEL=#ops-alerts"

if "%1"=="health" goto :health
if "%1"=="ready" goto :ready
if "%1"=="metrics" goto :metrics
if "%1"=="list-workflows" goto :workflows
if "%1"=="workflows" goto :workflows
if "%1"=="inspect-audit" goto :inspect_audit
if "%1"=="inspect-sync" goto :inspect_sync
if "%1"=="run-audit" goto :run_audit
if "%1"=="run-audit-dev" goto :run_audit_dev
if "%1"=="run-sync" goto :run_sync
if "%1"=="run-equipment" goto :run_equipment
if "%1"=="run-po" goto :run_po
if "%1"=="run-target-stock" goto :run_target_stock
if "%1"=="run-async" goto :run_async
if "%1"=="get-run" goto :get_run
if "%1"=="get-steps" goto :get_steps
if "%1"=="get-logs" goto :get_logs
if "%1"=="query-dataset" goto :query_dataset
if "%1"=="dataset" goto :query_dataset
if "%1"=="dataset-schema" goto :dataset_schema
if "%1"=="list-webhooks" goto :list_webhooks
if "%1"=="register-webhook" goto :register_webhook
if "%1"=="ems-health" goto :ems_health
if "%1"=="ems-logs" goto :ems_logs

goto :help

:health
echo [INFO] Checking API Health...
curl.exe -s -i "%BASE_URL%/health"
echo.
goto :eof

:ready
echo [INFO] Checking API Readiness...
curl.exe -s -i "%BASE_URL%/ready"
echo.
goto :eof

:metrics
echo [INFO] Retrieving Prometheus Metrics...
curl.exe -s "%BASE_URL%/metrics"
echo.
goto :eof

:workflows
echo [INFO] Listing Workflows...
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/workflows"
echo.
goto :eof

:inspect_audit
echo [INFO] Inspecting 'spare-parts-inventory-audit'...
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/workflows/spare-parts-inventory-audit"
echo.
goto :eof

:inspect_sync
echo [INFO] Inspecting 'spare-parts-inventory-sync'...
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/workflows/spare-parts-inventory-sync"
echo.
goto :eof

:run_audit
echo [INFO] Triggering 'spare-parts-inventory-audit' (?wait=5)...
curl.exe -s -X POST "%BASE_URL%/api/v1/workflows/spare-parts-inventory-audit/runs?wait=5" ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"inputs\": {\"organization_id\": \"%ORG_ID%\", \"alert_channel\": \"%ALERT_CHANNEL%\"}}"
echo.
goto :eof

:run_audit_dev
echo [INFO] Triggering 'spare-parts-inventory-audit' with DEV LOGGING enabled (_dev: true)...
curl.exe -s -X POST "%BASE_URL%/api/v1/workflows/spare-parts-inventory-audit/runs?wait=5" ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"inputs\": {\"organization_id\": \"%ORG_ID%\", \"alert_channel\": \"%ALERT_CHANNEL%\", \"_dev\": true}}"
echo.
goto :eof

:run_sync
echo [INFO] Triggering 'spare-parts-inventory-sync' (?wait=5)...
curl.exe -s -X POST "%BASE_URL%/api/v1/workflows/spare-parts-inventory-sync/runs?wait=5" ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"inputs\": {\"organization_id\": \"%ORG_ID%\"}}"
echo.
goto :eof

:run_equipment
echo [INFO] Triggering 'equipment-status-lookup' (?wait=5)...
curl.exe -s -X POST "%BASE_URL%/api/v1/workflows/equipment-status-lookup/runs?wait=5" ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"inputs\": {\"organization_id\": \"%ORG_ID%\", \"work_order_number\": \"WO-2026-001\", \"wip_entity_id\": \"337389615\"}}"
echo.
goto :eof

:run_po
echo [INFO] Triggering 'purchase-order-tracking' (?wait=5)...
curl.exe -s -X POST "%BASE_URL%/api/v1/workflows/purchase-order-tracking/runs?wait=5" ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"inputs\": {\"organization_id\": \"%ORG_ID%\", \"search_keyword\": \"MOTOR\"}}"
echo.
goto :eof

:run_target_stock
echo [INFO] Triggering 'target-stock-optimization' (?wait=5)...
curl.exe -s -X POST "%BASE_URL%/api/v1/workflows/target-stock-optimization/runs?wait=5" ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"inputs\": {\"organization_id\": \"%ORG_ID%\", \"item_description\": \"Motor\"}}"
echo.
goto :eof

:run_async
echo [INFO] Triggering Asynchronous Run...
curl.exe -s -X POST "%BASE_URL%/api/v1/workflows/spare-parts-inventory-audit/runs" ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Idempotency-Key: win-cmd-%RANDOM%" ^
  -H "Content-Type: application/json" ^
  -d "{\"inputs\": {\"organization_id\": \"%ORG_ID%\"}}"
echo.
goto :eof

:get_run
if "%2"=="" (
    echo Usage: requests.bat get-run ^<run_id^>
    goto :eof
)
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/runs/%2"
echo.
goto :eof

:get_steps
if "%2"=="" (
    echo Usage: requests.bat get-steps ^<run_id^>
    goto :eof
)
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/runs/%2/steps"
echo.
goto :eof

:get_logs
if "%2"=="" (
    echo Usage: requests.bat get-logs ^<run_id^>
    goto :eof
)
echo [INFO] Retrieving Execution Logs for Run: %2...
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/runs/%2/logs"
echo.
goto :eof

:query_dataset
set "LIMIT=%2"
if "%LIMIT%"=="" set "LIMIT=5"
echo [INFO] Querying dataset (limit=%LIMIT%)...
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/datasets/spare_parts_audit_dataset?limit=%LIMIT%"
echo.
goto :eof

:dataset_schema
echo [INFO] Querying dataset schema...
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/datasets/spare_parts_audit_dataset/schema"
echo.
goto :eof

:list_webhooks
echo [INFO] Listing webhooks...
curl.exe -s -H "X-API-Key: %API_KEY%" "%BASE_URL%/api/v1/webhooks/subscriptions"
echo.
goto :eof

:register_webhook
set "TARGET=%2"
if "%TARGET%"=="" set "TARGET=https://webhook.site/test-receiver"
echo [INFO] Registering webhook to %TARGET%...
curl.exe -s -X POST "%BASE_URL%/api/v1/webhooks/subscriptions" ^
  -H "X-API-Key: %API_KEY%" ^
  -H "Content-Type: application/json" ^
  -d "{\"target_url\": \"%TARGET%\", \"event_types\": [\"spare_parts.audit.completed\"]}"
echo.
goto :eof

:ems_health
curl.exe -s "%EMS_URL%/health"
echo.
goto :eof

:ems_logs
set "LIMIT=%2"
if "%LIMIT%"=="" set "LIMIT=10"
curl.exe -s "%EMS_URL%/admin/logs?limit=%LIMIT%"
echo.
goto :eof

:help
echo ==============================================================================
echo Opsflow Command Line Utility (requests.bat) for Windows CMD
echo ==============================================================================
echo Commands:
echo   requests.bat health              Check API health
echo   requests.bat ready               Check API readiness
echo   requests.bat metrics             View Prometheus metrics
echo   requests.bat list-workflows      List registered workflows
echo   requests.bat run-audit           Execute audit workflow (?wait=5)
echo   requests.bat run-audit-dev       Execute audit workflow with DEV LOGGING enabled (_dev: true)
echo   requests.bat run-sync            Execute stock sync workflow (?wait=5)
echo   requests.bat run-equipment       Execute work order & equipment lookup (?wait=5)
echo   requests.bat run-po              Execute purchase order tracking (?wait=5)
echo   requests.bat run-target-stock    Execute target stock optimization (?wait=5)
echo   requests.bat run-async           Trigger async run with Idempotency-Key
echo   requests.bat get-run ^<id^>        View run outputs
echo   requests.bat get-steps ^<id^>      View per-step diagnostics
echo   requests.bat get-logs ^<id^>       View detailed execution log file
echo   requests.bat query-dataset [n]   Query published dataset records (default: 5)
echo   requests.bat dataset-schema      View dataset schema
echo   requests.bat list-webhooks       List webhook subscriptions
echo   requests.bat ems-health          Check EMS simulator health
echo   requests.bat ems-logs [n]        View EMS simulator audit logs
echo ==============================================================================
goto :eof

