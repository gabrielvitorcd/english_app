from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from app.modules.subtitles.api.schemas import SubtitleInfo, SubtitleListResponse
from app.modules.subtitles.application.ports import SubtitleSource
from app.modules.subtitles.application.services import list_available_subtitles
from app.modules.subtitles.domain.models import SubtitleList
from app.modules.subtitles.infrastructure.ytdlp import YtDlpSubtitleSource

router = APIRouter(prefix="/api/subtitles", tags=["subtitles"])


def subtitle_source() -> SubtitleSource:
    """Adaptador usado pelas rotas (os testes trocam por um falso em app.dependency_overrides)."""
    return YtDlpSubtitleSource()


Source = Annotated[SubtitleSource, Depends(subtitle_source)]


def _response(result: SubtitleList) -> SubtitleListResponse:
    # Monta os schemas na mesma ordem do código antigo (cada SubtitleInfo, depois a resposta), para que um
    # erro de validação saia igual.
    subtitles = [
        SubtitleInfo(
            language_code=s.language_code,
            language_name=s.language_name,
            is_auto_generated=s.is_auto_generated,
        )
        for s in result.subtitles
    ]
    return SubtitleListResponse(video_id=result.video_id, video_title=result.video_title, subtitles=subtitles)


# `def` (não `async def`): o yt-dlp é bloqueante, então o FastAPI roda a rota numa thread, fora do event loop.
@router.get("/list", response_model=SubtitleListResponse)
def list_subtitles(video_url: str, source: Source) -> SubtitleListResponse:
    """Lista todas as legendas disponíveis para um vídeo do YouTube."""
    try:
        return _response(list_available_subtitles(video_url, source))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar legendas: {e!s}") from e


# @router.post("/download", response_model=SubtitleDownloadResponse)
# def download_subtitles(request: SubtitleDownloadRequest, source: Source):
#     """Baixa a legenda de um vídeo do YouTube em formato SRT."""
#     try:
#         video_id, content = download_subtitle(str(request.video_url), request.language_code, source)
#         return SubtitleDownloadResponse(
#             video_id=video_id,
#             language_code=request.language_code,
#             content=content,
#         )
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erro ao baixar legenda: {str(e)}")
