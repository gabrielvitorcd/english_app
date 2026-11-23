"""Casos de uso das legendas. A lógica veio de app/application/subtitles/service.py sem mudanças."""

from app.modules.subtitles.application.ports import SubtitleSource
from app.modules.subtitles.domain.models import (
    SubtitleList,
    build_subtitle_list,
    convert_vtt_to_srt,
    extract_video_id,
)


def list_available_subtitles(video_url: str, source: SubtitleSource) -> SubtitleList:
    """Lista todas as legendas disponíveis para um vídeo do YouTube."""
    video_id = extract_video_id(video_url)
    if not video_id:
        raise ValueError(f"URL inválida do YouTube: {video_url}")

    info = source.list_info(video_id)
    return build_subtitle_list(video_id, info)


def download_subtitle(video_url: str, language_code: str, source: SubtitleSource) -> tuple[str, str]:
    """
    Baixa legenda de um vídeo do YouTube em formato SRT.
    Retorna (video_id, content_srt).
    """
    video_id = extract_video_id(video_url)
    if not video_id:
        raise ValueError(f"URL inválida do YouTube: {video_url}")

    info = source.download_info(video_id, language_code)

    # Tenta encontrar a legenda baixada
    for requested_lang in [language_code, f"{language_code}.orig"]:
        if info.get("requested_subtitles") and requested_lang in str(info.get("requested_subtitles")):
            for sub in info["requested_subtitles"]:
                if sub.get("language") == requested_lang or requested_lang in sub.get("url", ""):
                    # yt-dlp retorna metadata, mas o conteúdo precisa ser lido do arquivo
                    # Para simplificar, retornamos que a legenda está disponível
                    pass

    # Se não encontrou, verifica se existe legenda disponível
    available_langs = set()
    if info.get("subtitles"):
        available_langs.update(info["subtitles"].keys())
    if info.get("automatic_captions"):
        available_langs.update(info["automatic_captions"].keys())

    if language_code not in available_langs:
        raise ValueError(f"Legenda em '{language_code}' não disponível para este vídeo")

    # Para obter o conteúdo SRT, precisamos baixar efetivamente
    # Vamos usar uma abordagem diferente: pegar a URL direta da legenda
    all_captions = {**info.get("subtitles", {}), **info.get("automatic_captions", {})}

    if language_code in all_captions and all_captions[language_code]:  # noqa: RUF019 (como no código antigo)
        # Pega a primeira URL de legenda disponível
        caption_url = all_captions[language_code][0].get("url")
        if caption_url:
            # yt-dlp retorna em formato vtt, converte para srt se necessário
            content = source.fetch_text(caption_url)
            if content.startswith("WEBVTT"):
                content = convert_vtt_to_srt(content)
            return (video_id, content)

    raise ValueError(f"Não foi possível baixar a legenda em '{language_code}'")
