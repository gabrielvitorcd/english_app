"""Casos de uso das legendas com o adaptador falso da porta SubtitleSource (sem yt-dlp nem httpx)."""

import pytest

from app.modules.subtitles.application.services import download_subtitle, list_available_subtitles
from app.modules.subtitles.domain.models import Subtitle, SubtitleList, VideoInfo, build_subtitle_list
from tests.conftest import FakeSubtitleSource

ID = "dQw4w9WgXcQ"


def test_lista_pela_porta() -> None:
    fake = FakeSubtitleSource()
    fake.info = {
        "title": "Vídeo",
        "subtitles": {"rechat": [{"url": "r"}], "en": [{"url": "u", "name": "English"}]},
        "automatic_captions": {"en": [{"url": "a"}], "es": []},
    }
    assert list_available_subtitles(f"https://youtube.com/watch?v={ID}", fake) == SubtitleList(
        video_id=ID,
        video_title="Vídeo",
        subtitles=[
            Subtitle("en", "English", is_auto_generated=False),
            Subtitle("es", "es (auto-generated)", is_auto_generated=True),
        ],
    )
    assert fake.calls == [("list_info", ID)]


def test_lista_url_invalida_nao_chama_a_porta() -> None:
    fake = FakeSubtitleSource()
    with pytest.raises(ValueError, match="URL inválida do YouTube: x"):
        list_available_subtitles("x", fake)
    assert fake.calls == []


def test_montagem_da_lista_no_dominio() -> None:
    info: VideoInfo = {
        "subtitles": {"live_chat": [], "fr": []},
        "automatic_captions": {"fr": [], "live_chat": []},
    }
    assert build_subtitle_list(ID, info) == SubtitleList(
        video_id=ID,
        video_title="Unknown",
        subtitles=[
            Subtitle("fr", "fr", is_auto_generated=False),
            Subtitle("live_chat", "live_chat (auto-generated)", is_auto_generated=True),
        ],
    )


def test_download_pela_porta() -> None:
    fake = FakeSubtitleSource()
    fake.info = {"automatic_captions": {"en": [{"url": "https://cap"}]}}
    fake.texts = {"https://cap": "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHi\n"}
    assert download_subtitle(f"https://youtu.be/{ID}", "en", fake) == (
        ID,
        "00:00:01,000 --> 00:00:02,000\nHi",
    )
    assert fake.calls == [("download_info", ID, "en"), ("fetch_text", "https://cap")]
