# syntax=docker/dockerfile:1.7
# ---------- build: dependências com uv ----------
FROM python:3.13-slim AS build
COPY --from=ghcr.io/astral-sh/uv:0.13.1 /uv /usr/local/bin/uv
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy UV_PYTHON_DOWNLOADS=never
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN --mount=type=cache,target=/root/.cache/uv uv sync --frozen --no-dev --no-install-project
COPY app ./app
COPY migrations ./migrations
COPY alembic.ini ./

# ---------- final: só o necessário para rodar ----------
FROM python:3.13-slim
# curl: HEALTHCHECK. Sem ffmpeg: o yt-dlp só lê os dados do vídeo (extract_info sem download) e a legenda
# é baixada pelo httpx, então nada passa pelo ffmpeg.
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --create-home --uid 10001 learn
WORKDIR /app
COPY --from=build --chown=learn:learn /app /app
COPY --chown=learn:learn deploy/entrypoint.sh /usr/local/bin/entrypoint.sh
ENV PATH="/app/.venv/bin:$PATH" PYTHONUNBUFFERED=1
USER learn
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s CMD curl -fsS http://127.0.0.1:8000/health || exit 1
ENTRYPOINT ["entrypoint.sh"]
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "2", "--proxy-headers", "--forwarded-allow-ips", "*"]
