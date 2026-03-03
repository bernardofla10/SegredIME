# Base stage with common dependencies
FROM python:3.12 as base

RUN apt-get update && apt-get install -y \
    curl \
    postgresql-client \
    wget \
    gnupg \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app

# Production stage
FROM base as production

COPY . .

ENV TZ=America/Sao_Paulo
ENV PORT=8000
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=core.settings
ENV SECRET_KEY=build-time-secret-key

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "core.asgi:application", "--host", "0.0.0.0", "--port", "8000", "--lifespan", "off"]

FROM base as development

RUN uv venv && uv pip install django uvicorn

COPY . .

ENV TZ=America/Sao_Paulo
ENV PORT=8000
ENV PYTHONPATH=/app
ENV DJANGO_SETTINGS_MODULE=core.settings

EXPOSE 8000

#mockup do uvicorn pro backend
CMD ["sh", "-c", "uv run uvicorn core.asgi:application --host 0.0.0.0 --port 8000 --reload || echo \"No project found yet, keeping container alive.\" && tail -f /dev/null"]
