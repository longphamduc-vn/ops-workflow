#!/usr/bin/env bash
# ==============================================================================
# Ops Platform Unified Service Starter
# Launches:
#   1. EMS Simulation Server   (Port 9000)
#   2. Opsflow Core Engine API (Port 8000)
#   3. Opsflow Console Portal  (Port 5174)
# ==============================================================================

set -eo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for terminal styling
BLUE='\033[0;34m'
CYAN='\033[0;36m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Check for Docker Mode
if [[ "$1" == "--docker" || "$1" == "docker" ]]; then
  echo -e "${CYAN}${BOLD}==> Starting all services via Docker Compose...${NC}"
  exec docker compose up --build
fi

echo -e "${CYAN}${BOLD}"
echo "  ___             _____ _                 "
echo " / _ \ _ __  ___ |  ___| | _____      __ "
echo "| | | | '_ \/ __|| |_  | |/ _ \ \ /\ / / "
echo "| |_| | |_) \__ \|  _| | | (_) \ V  V /  "
echo " \___/| .__/|___/|_|   |_|\___/ \_/\_/   "
echo "      |_|                                "
echo -e "${NC}"
echo -e "${BOLD}Launching Ops-Workflow Platform Services...${NC}"
echo "--------------------------------------------------------"

# 1. Load Root .env safely if exists
if [[ -f .env ]]; then
  echo -e "${BLUE}[INFO]${NC} Loading environment configuration from .env..."
  while IFS='=' read -r key val || [[ -n "$key" ]]; do
    [[ "$key" =~ ^[[:space:]]*#.*$ || -z "$key" ]] && continue
    key="$(echo "$key" | xargs)"
    if [[ -n "$key" && "$key" =~ ^[A-Za-z_][A-Za-z0-9_]*$ ]]; then
      export "$key"="$val"
    fi
  done < .env 2>/dev/null || true
fi

mkdir -p logs

EMS_PORT="${EMS_SIM_PORT:-9000}"
ENGINE_PORT="${OPSFLOW_PORT:-8000}"
PORTAL_PORT="${OPS_PORTAL_PORT:-5174}"

EMS_VENV="$SCRIPT_DIR/services/ems-simulation/.venv"
ENGINE_VENV="$SCRIPT_DIR/services/ops-workflow/.venv"
PORTAL_DIR="$SCRIPT_DIR/services/ops-portal"

# 2. Check Prerequisites
echo -e "${BLUE}[INFO]${NC} Checking runtime environments..."
if [[ ! -d "$EMS_VENV" ]]; then
  echo -e "${RED}[ERROR] Virtual environment for ems-simulation not found at $EMS_VENV${NC}"
  echo "Please set up: cd services/ems-simulation && python3 -m venv .venv && pip install -e ."
  exit 1
fi

if [[ ! -d "$ENGINE_VENV" ]]; then
  echo -e "${RED}[ERROR] Virtual environment for ops-workflow not found at $ENGINE_VENV${NC}"
  echo "Please set up: cd services/ops-workflow && python3 -m venv .venv && pip install -e ."
  exit 1
fi

if [[ ! -d "$PORTAL_DIR/node_modules" ]]; then
  echo -e "${YELLOW}[WARN] node_modules not found in ops-portal. Running npm install...${NC}"
  (cd "$PORTAL_DIR" && npm install)
fi

# Track child PIDs
EMS_PID=""
ENGINE_PID=""
PORTAL_PID=""

cleanup() {
  echo ""
  echo -e "${YELLOW}${BOLD}Shutting down all services gracefully...${NC}"
  
  if [[ -n "$PORTAL_PID" ]] && kill -0 "$PORTAL_PID" 2>/dev/null; then
    kill "$PORTAL_PID" 2>/dev/null || true
  fi
  if [[ -n "$ENGINE_PID" ]] && kill -0 "$ENGINE_PID" 2>/dev/null; then
    kill "$ENGINE_PID" 2>/dev/null || true
  fi
  if [[ -n "$EMS_PID" ]] && kill -0 "$EMS_PID" 2>/dev/null; then
    kill "$EMS_PID" 2>/dev/null || true
  fi

  # Kill remaining processes on ports if any
  fuser -k "${EMS_PORT}/tcp" 2>/dev/null || true
  fuser -k "${ENGINE_PORT}/tcp" 2>/dev/null || true
  fuser -k "${PORTAL_PORT}/tcp" 2>/dev/null || true

  echo -e "${GREEN}All services stopped cleanly.${NC}"
  exit 0
}

trap cleanup INT TERM EXIT

# Kill lingering processes on those ports before starting
fuser -k "${EMS_PORT}/tcp" 2>/dev/null || true
fuser -k "${ENGINE_PORT}/tcp" 2>/dev/null || true
fuser -k "${PORTAL_PORT}/tcp" 2>/dev/null || true

# 3. Start EMS Simulation
echo -e "${CYAN}[1/3] Starting EMS Simulation Server (Port $EMS_PORT)...${NC}"
(
  cd "$SCRIPT_DIR/services/ems-simulation"
  export EMS_SIM_DATABASE_URL="sqlite+aiosqlite:///$SCRIPT_DIR/ems_simulation.db"
  exec "$EMS_VENV/bin/python" -m ems_sim.cli start --host 0.0.0.0 --port "$EMS_PORT" --reload
) > logs/ems-simulation.log 2>&1 &
EMS_PID=$!

# 4. Start Opsflow Core Engine
echo -e "${CYAN}[2/3] Starting Opsflow Core Engine API (Port $ENGINE_PORT)...${NC}"
(
  cd "$SCRIPT_DIR/services/ops-workflow"
  export DATABASE_URL="sqlite+aiosqlite:///$SCRIPT_DIR/opsflow.db"
  export WORKFLOWS_DIR="$SCRIPT_DIR/services/ops-workflow/workflows"
  exec "$ENGINE_VENV/bin/opsflow" api --host 0.0.0.0 --port "$ENGINE_PORT" --reload --dev
) > logs/opsflow.log 2>&1 &
ENGINE_PID=$!

# 5. Start Opsflow Web Console
echo -e "${CYAN}[3/3] Starting Opsflow Console UI (Port $PORTAL_PORT)...${NC}"
(
  cd "$PORTAL_DIR"
  exec npm run dev -- --host 0.0.0.0 --port "$PORTAL_PORT"
) > logs/ops-portal.log 2>&1 &
PORTAL_PID=$!

echo -e "\n${BLUE}[INFO]${NC} Waiting for services to become healthy..."

# Health check helper
wait_for_url() {
  local url="$1"
  local name="$2"
  local max_attempts=30
  local attempt=1
  while [[ $attempt -le $max_attempts ]]; do
    if curl -s -f -o /dev/null "$url" 2>/dev/null; then
      echo -e "  [${GREEN}OK${NC}] $name is healthy!"
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done
  echo -e "  [${RED}FAIL${NC}] $name failed to respond at $url after 30s. Check logs."
  return 1
}

wait_for_url "http://localhost:${EMS_PORT}/health" "EMS Simulation"
wait_for_url "http://localhost:${ENGINE_PORT}/health" "Opsflow Core API"
wait_for_url "http://localhost:${PORTAL_PORT}" "Opsflow Console Portal"

echo "--------------------------------------------------------"
echo -e "${GREEN}${BOLD} All Services Are Up and Running!${NC}"
echo "--------------------------------------------------------"
echo -e "  ${BOLD}Web Console (UI):${NC}    ${CYAN}http://localhost:${PORTAL_PORT}${NC}"
echo -e "  ${BOLD}Opsflow Core API:${NC}    ${CYAN}http://localhost:${ENGINE_PORT}${NC}  (Docs: ${CYAN}http://localhost:${ENGINE_PORT}/api/v1/docs${NC})"
echo -e "  ${BOLD}EMS Simulation:${NC}      ${CYAN}http://localhost:${EMS_PORT}${NC}  (Health: ${CYAN}http://localhost:${EMS_PORT}/health${NC})"
echo "--------------------------------------------------------"
echo -e "${YELLOW}Logs are streamed to:${NC}"
echo "  - logs/ems-simulation.log"
echo "  - logs/opsflow.log"
echo "  - logs/ops-portal.log"
echo ""
echo -e "${BOLD}Press [Ctrl+C] to stop all services simultaneously.${NC}"
echo "--------------------------------------------------------"

# Keep the script running and tail logs or wait for interrupt
wait
