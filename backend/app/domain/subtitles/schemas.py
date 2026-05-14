from pydantic import BaseModel, HttpUrl
from typing import Optional


class SubtitleInfo(BaseModel):
    """Informações sobre uma legenda disponível."""
    language_code: str
    language_name: str
    is_auto_generated: bool


class SubtitleListResponse(BaseModel):
    """Resposta com lista de legendas disponíveis."""
    video_id: str
    video_title: str
    subtitles: list[SubtitleInfo]


class SubtitleDownloadRequest(BaseModel):
    """Request para download de legenda."""
    video_url: HttpUrl
    language_code: str


class SubtitleDownloadResponse(BaseModel):
    """Resposta com conteúdo da legenda em formato SRT."""
    video_id: str
    language_code: str
    content: str
