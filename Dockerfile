FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md /app/
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir hatchling

COPY src/ /app/src/
RUN pip install --no-cache-dir .

FROM python:3.11-slim

WORKDIR /app

RUN useradd -m -u 1000 appuser

COPY --from=builder /usr/local /usr/local
COPY --from=builder /app /app
COPY config/ /app/config/
COPY workflows/ /app/workflows/
COPY schemas/ /app/schemas/
COPY openapi/ /app/openapi/

USER appuser

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

ENTRYPOINT ["opsflow"]
CMD ["api", "--host", "0.0.0.0", "--port", "8000"]
