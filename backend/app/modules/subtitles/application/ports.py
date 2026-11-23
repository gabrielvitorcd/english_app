from typing import Protocol

from app.modules.subtitles.domain.models import VideoInfo


class SubtitleSource(Protocol):
    """Onde as legendas são buscadas (o YouTube, pelo yt-dlp, em infrastructure/ytdlp.py).

    Os métodos são bloqueantes: a rota roda fora do event loop.
    """

    def list_info(self, video_id: str) -> VideoInfo: ...  # dados do vídeo, sem baixar nada

    def download_info(self, video_id: str, language_code: str) -> VideoInfo: ...  # idem, pedindo a legenda

    def fetch_text(self, url: str) -> str: ...  # conteúdo da URL da legenda
