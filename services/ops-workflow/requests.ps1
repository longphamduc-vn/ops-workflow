<#
.SYNOPSIS
    Opsflow Workflow Engine - PowerShell Command Utility for Windows
.DESCRIPTION
    A native Windows PowerShell alternative to requests.http and requests.sh.
    Uses Invoke-RestMethod with formatted JSON output.
.EXAMPLE
    .\requests.ps1 health
    .\requests.ps1 list-workflows
    .\requests.ps1 run-audit
    .\requests.ps1 query-dataset 5
#>

param(
    [Parameter(Position=0)]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$Arg1 = "",

    [Parameter(Position=2)]
    [string]$Arg2 = ""
)

$BaseUrl = if ($env:BASE_URL) { $env:BASE_URL } else { "http://localhost:8000" }
$EmsUrl = if ($env:EMS_URL) { $env:EMS_URL } else { "http://localhost:9000" }
$ApiKey = if ($env:API_KEY) { $env:API_KEY } else { "admin_key" }
$OrgId = if ($env:ORG_ID) { $env:ORG_ID } else { "28753" }
$AlertChannel = if ($env:ALERT_CHANNEL) { $env:ALERT_CHANNEL } else { "#ops-alerts" }

$Headers = @{
    "X-API-Key" = $ApiKey
    "Content-Type" = "application/json"
}

function Write-Cmd($text) {
    Write-Host "==> $text" -ForegroundColor Cyan
}

switch ($Command.ToLower()) {
    "health" {
        Write-Cmd "Checking API Liveness Probe..."
        Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get | ConvertTo-Json
    }
    "ready" {
        Write-Cmd "Checking API Readiness Probe..."
        Invoke-RestMethod -Uri "$BaseUrl/ready" -Method Get | ConvertTo-Json
    }
    "metrics" {
        Write-Cmd "Retrieving Prometheus Metrics..."
        Invoke-RestMethod -Uri "$BaseUrl/metrics" -Method Get
    }
    { $_ -in "list-workflows", "workflows" } {
        Write-Cmd "Listing Registered Workflows..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows" -Method Get -Headers $Headers | ConvertTo-Json -Depth 5
    }
    "inspect-audit" {
        Write-Cmd "Inspecting 'spare-parts-inventory-audit' Schema..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/spare-parts-inventory-audit" -Method Get -Headers $Headers | ConvertTo-Json -Depth 5
    }
    "inspect-sync" {
        Write-Cmd "Inspecting 'spare-parts-inventory-sync' Schema..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/spare-parts-inventory-sync" -Method Get -Headers $Headers | ConvertTo-Json -Depth 5
    }
    "run-audit" {
        Write-Cmd "Triggering 'spare-parts-inventory-audit' (Synchronous wait 5s)..."
        $body = @{
            inputs = @{
                organization_id = $OrgId
                alert_channel = $AlertChannel
            }
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/spare-parts-inventory-audit/runs?wait=5" -Method Post -Headers $Headers -Body $body | ConvertTo-Json -Depth 5
    }
    "run-audit-dev" {
        Write-Cmd "Triggering 'spare-parts-inventory-audit' with DEV LOGGING enabled (_dev: true)..."
        $body = @{
            inputs = @{
                organization_id = $OrgId
                alert_channel = $AlertChannel
                _dev = $true
            }
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/spare-parts-inventory-audit/runs?wait=5" -Method Post -Headers $Headers -Body $body | ConvertTo-Json -Depth 5
    }
    "run-sync" {
        Write-Cmd "Triggering 'spare-parts-inventory-sync' (Synchronous wait 5s)..."
        $body = @{
            inputs = @{
                organization_id = $OrgId
            }
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/spare-parts-inventory-sync/runs?wait=5" -Method Post -Headers $Headers -Body $body | ConvertTo-Json -Depth 5
    }
    "run-equipment" {
        Write-Cmd "Triggering 'equipment-status-lookup' (Synchronous wait 5s)..."
        $body = @{
            inputs = @{
                organization_id = $OrgId
                work_order_number = "WO-2026-001"
                wip_entity_id = "337389615"
            }
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/equipment-status-lookup/runs?wait=5" -Method Post -Headers $Headers -Body $body | ConvertTo-Json -Depth 5
    }
    "run-po" {
        Write-Cmd "Triggering 'purchase-order-tracking' (Synchronous wait 5s)..."
        $body = @{
            inputs = @{
                organization_id = $OrgId
                search_keyword = "MOTOR"
            }
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/purchase-order-tracking/runs?wait=5" -Method Post -Headers $Headers -Body $body | ConvertTo-Json -Depth 5
    }
    "run-target-stock" {
        Write-Cmd "Triggering 'target-stock-optimization' (Synchronous wait 5s)..."
        $body = @{
            inputs = @{
                organization_id = $OrgId
                item_description = "Motor"
            }
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/target-stock-optimization/runs?wait=5" -Method Post -Headers $Headers -Body $body | ConvertTo-Json -Depth 5
    }
    "run-async" {
        $idemKey = "ps-run-" + [Guid]::NewGuid().ToString("N").Substring(0, 8)
        Write-Cmd "Triggering Asynchronous Run with Idempotency-Key: $idemKey..."
        $headersWithIdem = @{
            "X-API-Key" = $ApiKey
            "Content-Type" = "application/json"
            "Idempotency-Key" = $idemKey
        }
        $body = @{
            inputs = @{
                organization_id = $OrgId
            }
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/workflows/spare-parts-inventory-audit/runs" -Method Post -Headers $headersWithIdem -Body $body | ConvertTo-Json -Depth 5
    }
    "get-run" {
        if (-not $Arg1) {
            Write-Error "Usage: .\requests.ps1 get-run <run_id>"
            return
        }
        Write-Cmd "Inspecting Run: $Arg1..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/runs/$Arg1" -Method Get -Headers $Headers | ConvertTo-Json -Depth 5
    }
    "get-steps" {
        if (-not $Arg1) {
            Write-Error "Usage: .\requests.ps1 get-steps <run_id>"
            return
        }
        Write-Cmd "Inspecting Step Details for Run: $Arg1..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/runs/$Arg1/steps" -Method Get -Headers $Headers | ConvertTo-Json -Depth 5
    }
    "get-logs" {
        if (-not $Arg1) {
            Write-Error "Usage: .\requests.ps1 get-logs <run_id>"
            return
        }
        Write-Cmd "Retrieving Execution Logs for Run: $Arg1..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/runs/$Arg1/logs" -Method Get -Headers $Headers
    }
    { $_ -in "query-dataset", "dataset" } {
        $limit = if ($Arg1) { $Arg1 } else { "5" }
        Write-Cmd "Querying 'spare_parts_audit_dataset' (limit=$limit)..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/datasets/spare_parts_audit_dataset?limit=$limit" -Method Get -Headers $Headers | ConvertTo-Json -Depth 5
    }
    "dataset-schema" {
        Write-Cmd "Querying Dataset Inferred Schema..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/datasets/spare_parts_audit_dataset/schema" -Method Get -Headers $Headers | ConvertTo-Json -Depth 5
    }
    "list-webhooks" {
        Write-Cmd "Listing Webhook Subscriptions..."
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/webhooks/subscriptions" -Method Get -Headers $Headers | ConvertTo-Json -Depth 5
    }
    "register-webhook" {
        $target = if ($Arg1) { $Arg1 } else { "https://webhook.site/test-receiver" }
        Write-Cmd "Registering Webhook to: $target..."
        $body = @{
            target_url = $target
            event_types = @("spare_parts.audit.completed")
        } | ConvertTo-Json -Compress
        Invoke-RestMethod -Uri "$BaseUrl/api/v1/webhooks/subscriptions" -Method Post -Headers $Headers -Body $body | ConvertTo-Json -Depth 5
    }
    "ems-health" {
        Write-Cmd "Checking EMS Simulation Health..."
        Invoke-RestMethod -Uri "$EmsUrl/health" -Method Get | ConvertTo-Json
    }
    "ems-logs" {
        $limit = if ($Arg1) { $Arg1 } else { "10" }
        Write-Cmd "Retrieving Audit Logs from EMS Simulation (limit=$limit)..."
        Invoke-RestMethod -Uri "$EmsUrl/admin/logs?limit=$limit" -Method Get | ConvertTo-Json -Depth 5
    }
    default {
        Write-Host @"
==============================================================================
Opsflow PowerShell Utility (requests.ps1) for Windows
==============================================================================

Commands:
  .\requests.ps1 health              Check API server health
  .\requests.ps1 ready               Check API server readiness
  .\requests.ps1 metrics             View Prometheus metrics
  .\requests.ps1 list-workflows      List registered workflows
  .\requests.ps1 inspect-audit       Inspect 'spare-parts-inventory-audit'
  .\requests.ps1 run-audit           Execute audit workflow (?wait=5)
  .\requests.ps1 run-audit-dev       Execute audit workflow with DEV LOGGING enabled (_dev: true)
  .\requests.ps1 run-sync            Execute stock sync workflow (?wait=5)
  .\requests.ps1 run-equipment       Execute work order & equipment lookup (?wait=5)
  .\requests.ps1 run-po              Execute purchase order tracking (?wait=5)
  .\requests.ps1 run-target-stock    Execute target stock optimization (?wait=5)
  .\requests.ps1 run-async           Trigger async run with Idempotency-Key
  .\requests.ps1 get-run <run_id>    View execution outputs of a specific run
  .\requests.ps1 get-steps <run_id>  View per-step latency and diagnostics
  .\requests.ps1 get-logs <run_id>   View detailed execution log file of a specific run
  .\requests.ps1 query-dataset [n]   Query published dataset records (default: 5)
  .\requests.ps1 dataset-schema      View dataset column schema
  .\requests.ps1 list-webhooks       List webhook subscriptions
  .\requests.ps1 register-webhook    Register new webhook subscriber
  .\requests.ps1 ems-health          Check EMS simulator status
  .\requests.ps1 ems-logs [n]        View EMS simulator audit logs (default: 10)

Examples:
  .\requests.ps1 run-audit
  .\requests.ps1 query-dataset 3
==============================================================================
"@
    }
}

