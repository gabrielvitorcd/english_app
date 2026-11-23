"""/api/subtitles/list com o adaptador falso (sem internet): mesmo caminho, respostas e erros de antes."""

from typing import Any

from tests.conftest import FakeSubtitleSource

ID = "dQw4w9WgXcQ"


async def test_lista_legendas(client: Any, source: FakeSubtitleSource) -> None:
    source.info = {
        "title": "Never Gonna Give You Up",
        "subtitles": {
            "en": [{"url": "u", "name": "English"}],
            "live_chat": [{"url": "c"}],
        },
        "automatic_captions": {"en": [{"url": "a"}], "pt": [{"url": "p"}]},
    }
    r = await client.get("/api/subtitles/list", params={"video_url": f"https://youtu.be/{ID}?t=1"})
    assert r.status_code == 200
    assert r.json() == {
        "video_id": ID,
        "video_title": "Never Gonna Give You Up",
        "subtitles": [
            {"language_code": "en", "language_name": "English", "is_auto_generated": False},
            {"language_code": "pt", "language_name": "pt (auto-generated)", "is_auto_generated": True},
        ],
    }
    assert source.calls == [("list_info", ID)]


async def test_lista_vazia_sem_titulo(client: Any, source: FakeSubtitleSource) -> None:
    r = await client.get("/api/subtitles/list", params={"video_url": f"https://www.youtube.com/embed/{ID}"})
    assert r.status_code == 200
    assert r.json() == {"video_id": ID, "video_title": "Unknown", "subtitles": []}


async def test_url_invalida_400(client: Any, source: FakeSubtitleSource) -> None:
    r = await client.get("/api/subtitles/list", params={"video_url": "https://vimeo.com/123"})
    assert r.status_code == 400
    assert r.headers["content-type"] == "application/json"
    assert r.json() == {"detail": "URL inválida do YouTube: https://vimeo.com/123"}
    assert source.calls == []


async def test_sem_video_url_422(client: Any) -> None:
    r = await client.get("/api/subtitles/list")
    assert r.status_code == 422
    assert r.json() == {
        "detail": [{"type": "missing", "loc": ["query", "video_url"], "msg": "Field required", "input": None}]
    }


async def test_erro_do_yt_dlp_500(client: Any, source: FakeSubtitleSource) -> None:
    source.error = RuntimeError("Video unavailable")
    r = await client.get("/api/subtitles/list", params={"video_url": f"https://youtu.be/{ID}"})
    assert r.status_code == 500
    assert r.json() == {"detail": "Erro ao buscar legendas: Video unavailable"}


async def test_value_error_do_yt_dlp_400(client: Any, source: FakeSubtitleSource) -> None:
    source.error = ValueError("algo inválido")
    r = await client.get("/api/subtitles/list", params={"video_url": f"https://youtu.be/{ID}"})
    assert r.status_code == 400
    assert r.json() == {"detail": "algo inválido"}


async def test_titulo_nulo_vira_400(client: Any, source: FakeSubtitleSource) -> None:
    # O ValidationError do Pydantic é um ValueError, então cai no 400 (como no código antigo).
    source.info = {"title": None}
    r = await client.get("/api/subtitles/list", params={"video_url": f"https://youtu.be/{ID}"})
    assert r.status_code == 400
    assert "video_title" in r.json()["detail"]


async def test_download_continua_desligado(client: Any) -> None:
    r = await client.post("/api/subtitles/download", json={"video_url": f"https://youtu.be/{ID}"})
    assert r.status_code == 404
