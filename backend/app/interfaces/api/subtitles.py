from fastapi import APIRouter, HTTPException
from app.domain.subtitles.schemas import SubtitleListResponse, SubtitleDownloadRequest, SubtitleDownloadResponse
from app.application.subtitles.service import list_available_subtitles, download_subtitle

router = APIRouter(prefix="/api/subtitles", tags=["subtitles"])


@router.get("/list", response_model=SubtitleListResponse)
async def list_subtitles(video_url: str):
    """Lista todas as legendas disponíveis para um vídeo do YouTube."""
    try:
        return list_available_subtitles(video_url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar legendas: {str(e)}")


# @router.post("/download", response_model=SubtitleDownloadResponse)
# async def download_subtitles(request: SubtitleDownloadRequest):
#     """Baixa a legenda de um vídeo do YouTube em formato SRT."""
#     try:
#         video_id, content = download_subtitle(str(request.video_url), request.language_code)
#         return SubtitleDownloadResponse(
#             video_id=video_id,
#             language_code=request.language_code,
#             content=content,
#         )
#     except ValueError as e:
#         raise HTTPException(status_code=400, detail=str(e))
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"Erro ao baixar legenda: {str(e)}")
