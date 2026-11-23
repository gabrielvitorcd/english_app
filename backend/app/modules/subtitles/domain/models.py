"""Regras puras das legendas: id do vídeo, montagem da lista e conversão VTT→SRT.

A lógica veio de app/application/subtitles/service.py sem mudanças (movida, não reescrita). O dicionário
`info` é o que o yt-dlp devolve em `extract_info`; aqui ele é só lido.
"""

import re
from collections.abc import Mapping
from dataclasses import dataclass
from typing import Any

IGNORE_LANGS = {"live_chat", "rechat"}

# Dicionário devolvido pelo yt-dlp (`extract_info(..., download=False)`).
VideoInfo = Mapping[str, Any]


@dataclass(slots=True)
class Subtitle:
    """Informações sobre uma legenda disponível."""

    language_code: str
    language_name: str
    is_auto_generated: bool


@dataclass(slots=True)
class SubtitleList:
    """Lista de legendas disponíveis de um vídeo."""

    video_id: str
    video_title: str
    subtitles: list[Subtitle]


def extract_video_id(url: str) -> str | None:
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


def build_subtitle_list(video_id: str, info: VideoInfo) -> SubtitleList:
    """Monta a lista de legendas: manuais primeiro (sem live_chat/rechat), depois as automáticas."""
    subtitles = []
    seen_languages = set()

    # Legendas manuais (prioridade)
    if info.get("subtitles"):
        for lang_code, subs in info["subtitles"].items():
            if lang_code in IGNORE_LANGS:
                continue
            if lang_code not in seen_languages:
                lang_name = subs[0].get("name", lang_code) if subs else lang_code
                subtitles.append(
                    Subtitle(
                        language_code=lang_code,
                        language_name=lang_name,
                        is_auto_generated=False,
                    )
                )
                seen_languages.add(lang_code)

    # Legendas auto-geradas
    if info.get("automatic_captions"):
        for lang_code, _subs in info["automatic_captions"].items():
            if lang_code not in seen_languages:
                subtitles.append(
                    Subtitle(
                        language_code=lang_code,
                        language_name=f"{lang_code} (auto-generated)",
                        is_auto_generated=True,
                    )
                )
                seen_languages.add(lang_code)

    return SubtitleList(
        video_id=video_id,
        video_title=info.get("title", "Unknown"),
        subtitles=subtitles,
    )


def convert_vtt_to_srt(vtt_content: str) -> str:
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
                line = (
                    line.split("-->")[0].strip() + " --> " + line.split("-->")[1].split()[0].replace(".", ",")
                )

        if line.strip().isdigit():
            srt_lines.append(str(counter))
            counter += 1
        elif line.strip():
            srt_lines.append(line)

    return "\n".join(srt_lines)
