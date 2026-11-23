"""Adaptador do YouTube: yt-dlp para os dados do vídeo e httpx para o conteúdo da legenda.

As opções e a URL são as mesmas de app/application/subtitles/service.py (código antigo).
"""

from typing import Any

import httpx
import yt_dlp

from app.modules.subtitles.domain.models import VideoInfo


def _watch_url(video_id: str) -> str:
    return f"https://www.youtube.com/watch?v={video_id}"


class YtDlpSubtitleSource:
    def list_info(self, video_id: str) -> VideoInfo:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "extract_flat": False,
        }
        return self._extract(ydl_opts, video_id)

    def download_info(self, video_id: str, language_code: str) -> VideoInfo:
        ydl_opts = {
            "quiet": True,
            "no_warnings": True,
            "skip_download": True,
            "writesubtitles": True,
            "writeautomaticsub": True,
            "subtitleslangs": [language_code],
            "subtitlesformat": "srt",
        }
        return self._extract(ydl_opts, video_id)

    def fetch_text(self, url: str) -> str:
        response = httpx.get(url)
        response.raise_for_status()
        return response.text

    @staticmethod
    def _extract(ydl_opts: dict[str, Any], video_id: str) -> VideoInfo:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info: VideoInfo = ydl.extract_info(_watch_url(video_id), download=False)
            return info
