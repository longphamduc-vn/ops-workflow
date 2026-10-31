# Dockerfile for Nexacro EMS Simulation Platform
FROM python:3.11-slim

WORKDIR /app

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy project specification
COPY pyproject.toml README.md ./

# Install dependencies
RUN uv venv /opt/venv && uv pip install --python /opt/venv/bin/python .

# Copy application source and catalog
COPY src/ ./src/
COPY catalog/ ./catalog/
COPY config/ ./config/

ENV PATH="/opt/venv/bin:$PATH"
ENV EMS_SIM_HOST=0.0.0.0
ENV EMS_SIM_PORT=9000

EXPOSE 9000

CMD ["uvicorn", "ems_sim.server.app:app", "--host", "0.0.0.0", "--port", "9000"]

