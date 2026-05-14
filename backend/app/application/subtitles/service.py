import re
import yt_dlp
from typing import Optional
from app.domain.subtitles.schemas import SubtitleInfo, SubtitleListResponse


IGNORE_LANGS = {"live_chat", "rechat"}


def extract_video_id(url: str) -> Optional[str]:
    """Extrai o video_id de uma URL do YouTube."""
    patterns = [
        r"(?:youtube\.com/watch\?v=|youtu\.be/)([a-zA-Z0-9_-]{11})",
        r"youtube\.com/embed/([a-zA-Z0-9_-]{11})",
        r"youtube\.com/v/([a-zA-Z0-9_-]{11})",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def list_available_subtitles(video_url: str) -> SubtitleListResponse:
    """Lista todas as legendas disponíveis para um vídeo do YouTube."""
    video_id = extract_video_id(video_url)
    if not video_id:
        raise ValueError(f"URL inválida do YouTube: {video_url}")

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "extract_flat": False,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)

        subtitles = []
        seen_languages = set()

        # Legendas manuais (prioridade)
        if info.get("subtitles"):
            for lang_code, subs in info["subtitles"].items():
                if lang_code in IGNORE_LANGS:
                    continue    
                if lang_code not in seen_languages:
                    lang_name = subs[0].get("name", lang_code) if subs else lang_code
                    subtitles.append(SubtitleInfo(
                        language_code=lang_code,
                        language_name=lang_name,
                        is_auto_generated=False,
                    ))
                    seen_languages.add(lang_code)

        # Legendas auto-geradas
        if info.get("automatic_captions"):
            for lang_code, subs in info["automatic_captions"].items():
                if lang_code not in seen_languages:
                    subtitles.append(SubtitleInfo(
                        language_code=lang_code,
                        language_name=f"{lang_code} (auto-generated)",
                        is_auto_generated=True,
                    ))
                    seen_languages.add(lang_code)

        return SubtitleListResponse(
            video_id=video_id,
            video_title=info.get("title", "Unknown"),
            subtitles=subtitles,
        )


def download_subtitle(video_url: str, language_code: str) -> tuple[str, str]:
    """
    Baixa legenda de um vídeo do YouTube em formato SRT.
    Retorna (video_id, content_srt).
    """
    video_id = extract_video_id(video_url)
    if not video_id:
        raise ValueError(f"URL inválida do YouTube: {video_url}")

    ydl_opts = {
        "quiet": True,
        "no_warnings": True,
        "skip_download": True,
        "writesubtitles": True,
        "writeautomaticsub": True,
        "subtitleslangs": [language_code],
        "subtitlesformat": "srt",
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(f"https://www.youtube.com/watch?v={video_id}", download=False)

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

        if language_code in all_captions and all_captions[language_code]:
            # Pega a primeira URL de legenda disponível
            caption_url = all_captions[language_code][0].get("url")
            if caption_url:
                import httpx
                response = httpx.get(caption_url)
                response.raise_for_status()
                # yt-dlp retorna em formato vtt, converte para srt se necessário
                content = response.text
                if content.startswith("WEBVTT"):
                    content = _convert_vtt_to_srt(content)
                return (video_id, content)

    raise ValueError(f"Não foi possível baixar a legenda em '{language_code}'")


def _convert_vtt_to_srt(vtt_content: str) -> str:
    """Converte conteúdo VTT para formato SRT."""
    lines = vtt_content.strip().split("\n")
    srt_lines = []
    counter = 1
    skip_header = True

    for line in lines:
        if skip_header:
            if line.startswith("WEBVTT") or line.startswith("Kind:") or line.startswith("Language:"):
                continue
            if line.strip() == "":
                skip_header = False
            continue

        # Converte timestamps de VTT (00:00:00.000) para SRT (00:00:00,000)
        if "-->" in line:
            line = line.replace(".", ",")
            # Remove posicionamento extra do VTT
            if " align:" in line or " position:" in line or " size:" in line:
                line = line.split("-->")[0].strip() + " --> " + line.split("-->")[1].split()[0].replace(".", ",")

        if line.strip().isdigit():
            srt_lines.append(str(counter))
            counter += 1
        elif line.strip():
            srt_lines.append(line)

    return "\n".join(srt_lines)
