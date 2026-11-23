"""request_id, log de acesso e tempo de resposta (ASGI puro, sem bufferizar o corpo)."""

import time
import uuid

from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.logging import get_logger, request_id_var

log = get_logger("access")


class RequestContextMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return
        headers = dict(scope.get("headers") or [])
        incoming = headers.get(b"x-request-id", b"").decode()[:64]
        rid = incoming or uuid.uuid4().hex
        token = request_id_var.set(rid)
        start = time.perf_counter()
        status = 500

        async def _send(message: Message) -> None:
            nonlocal status
            if message["type"] == "http.response.start":
                status = message["status"]
                elapsed = f"{(time.perf_counter() - start) * 1000:.1f}"
                extra = [(b"x-request-id", rid.encode()), (b"x-response-time-ms", elapsed.encode())]
                message["headers"] = [*message.get("headers", []), *extra]
            await send(message)

        try:
            await self.app(scope, receive, _send)
        finally:
            path = scope.get("path", "")
            if path not in ("/health", "/ready"):
                log.info(
                    "request",
                    method=scope.get("method"),
                    path=path,
                    status=status,
                    ms=round((time.perf_counter() - start) * 1000, 1),
                )
            request_id_var.reset(token)
