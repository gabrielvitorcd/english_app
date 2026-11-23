"""Legendas: extração do id, montagem da lista, download e VTT→SRT (sem internet e sem banco).

Estes testes foram escritos contra o código antigo (app/application/subtitles/service.py) antes da
mudança de estrutura e continuam iguais depois dela: só os imports do topo mudam (`listar` e `baixar`
montam o caso de uso com o adaptador do yt-dlp e os schemas da resposta, como a rota faz). O yt-dlp e o
httpx são trocados por versões falsas, então nada sai para a internet.
"""

from typing import Any, ClassVar

import httpx
import pytest
import yt_dlp

from app.modules.subtitles.api.routes import _response
from app.modules.subtitles.api.schemas import SubtitleListResponse
from app.modules.subtitles.application.services import download_subtitle, list_available_subtitles
from app.modules.subtitles.domain.models import convert_vtt_to_srt as converter_vtt
from app.modules.subtitles.domain.models import extract_video_id
from app.modules.subtitles.infrastructure.ytdlp import YtDlpSubtitleSource


def listar(video_url: str) -> SubtitleListResponse:
    return _response(list_available_subtitles(video_url, YtDlpSubtitleSource()))


def baixar(video_url: str, language_code: str) -> tuple[str, str]:
    return download_subtitle(video_url, language_code, YtDlpSubtitleSource())


ID = "dQw4w9WgXcQ"
URL = f"https://www.youtube.com/watch?v={ID}"


# ---------------------------------------------------------------- yt-dlp e httpx falsos


class FakeYoutubeDL:
    """Faz o papel do yt_dlp.YoutubeDL: devolve `info` e guarda as opções e a URL pedidas."""

    info: ClassVar[dict[str, Any]] = {}
    calls: ClassVar[list[tuple[dict[str, Any], str, bool]]] = []

    def __init__(self, opts: dict[str, Any]) -> None:
        self.opts = opts

    def __enter__(self) -> "FakeYoutubeDL":
        return self

    def __exit__(self, *exc: object) -> None:
        return None

    def extract_info(self, url: str, download: bool = True) -> dict[str, Any]:
        FakeYoutubeDL.calls.append((self.opts, url, download))
        return FakeYoutubeDL.info


class FakeResponse:
    def __init__(self, text: str) -> None:
        self.text = text

    def raise_for_status(self) -> None:
        return None


@pytest.fixture
def ydl(monkeypatch: pytest.MonkeyPatch) -> type[FakeYoutubeDL]:
    FakeYoutubeDL.info = {}
    FakeYoutubeDL.calls = []
    monkeypatch.setattr(yt_dlp, "YoutubeDL", FakeYoutubeDL)
    return FakeYoutubeDL


@pytest.fixture
def http(monkeypatch: pytest.MonkeyPatch) -> dict[str, Any]:
    """httpx.get falso: responde `state["text"]` e guarda as URLs pedidas em `state["urls"]`."""
    state: dict[str, Any] = {"text": "", "urls": []}

    def fake_get(url: str) -> FakeResponse:
        state["urls"].append(url)
        return FakeResponse(state["text"])

    monkeypatch.setattr(httpx, "get", fake_get)
    return state


def resumo(r: Any) -> tuple[str, str, list[tuple[str, str, bool]]]:
    return (
        r.video_id,
        r.video_title,
        [(s.language_code, s.language_name, s.is_auto_generated) for s in r.subtitles],
    )


# ---------------------------------------------------------------- extração do video id


@pytest.mark.parametrize(
    ("url", "esperado"),
    [
        (f"https://www.youtube.com/watch?v={ID}", ID),
        (f"http://youtube.com/watch?v={ID}", ID),
        (f"youtube.com/watch?v={ID}", ID),
        (f"https://m.youtube.com/watch?v={ID}", ID),
        (f"https://music.youtube.com/watch?v={ID}", ID),
        (f"https://www.youtube.com/watch?v={ID}&t=42s", ID),
        (f"https://www.youtube.com/watch?v={ID}&list=PL123&index=2", ID),
        (f"https://youtu.be/{ID}", ID),
        (f"https://youtu.be/{ID}?t=10", ID),
        (f"https://youtu.be/{ID}?si=abc", ID),
        (f"https://www.youtube.com/embed/{ID}", ID),
        (f"https://www.youtube.com/embed/{ID}?start=5", ID),
        (f"https://www.youtube.com/v/{ID}", ID),
        ("https://youtu.be/a-b_C1d2E3f", "a-b_C1d2E3f"),
        # Mais de 11 caracteres: pega os 11 primeiros (o padrão não exige fim do id).
        (f"https://youtu.be/{ID}XYZ", ID),
        # Qualquer texto com o trecho "youtube.com/watch?v=" passa, mesmo fora do domínio do YouTube.
        (f"https://exemplo.com/youtube.com/watch?v={ID}", ID),
    ],
)
def test_extrai_video_id(url: str, esperado: str) -> None:
    assert extract_video_id(url) == esperado


@pytest.mark.parametrize(
    "url",
    [
        "",
        "foo",
        "https://www.youtube.com/",
        "https://www.youtube.com/watch?v=curto",
        f"https://www.youtube.com/watch?feature=share&v={ID}",  # v= fora do começo não é reconhecido
        f"https://www.youtube.com/shorts/{ID}",
        f"https://www.youtube.com/live/{ID}",
        f"https://www.youtube-nocookie.com/embed/{ID}",
        f"https://vimeo.com/{ID}",
        ID,
    ],
)
def test_url_sem_video_id(url: str) -> None:
    assert extract_video_id(url) is None


# ---------------------------------------------------------------- lista de legendas


def test_lista_manual_antes_da_automatica(ydl: type[FakeYoutubeDL]) -> None:
    ydl.info = {
        "title": "Never Gonna Give You Up",
        "subtitles": {
            "en": [{"ext": "vtt", "url": "u1", "name": "English"}],
            "pt-BR": [{"ext": "vtt", "url": "u2", "name": "Portuguese (Brazil)"}],
        },
        "automatic_captions": {
            "en": [{"ext": "vtt", "url": "a1", "name": "English"}],
            "fr": [{"ext": "vtt", "url": "a2", "name": "French"}],
            "de": [],
        },
    }
    assert resumo(listar(URL)) == (
        ID,
        "Never Gonna Give You Up",
        [
            ("en", "English", False),
            ("pt-BR", "Portuguese (Brazil)", False),
            ("fr", "fr (auto-generated)", True),
            ("de", "de (auto-generated)", True),
        ],
    )


def test_lista_chama_o_yt_dlp_sem_baixar(ydl: type[FakeYoutubeDL]) -> None:
    ydl.info = {"title": "T"}
    listar(f"https://youtu.be/{ID}?t=3")
    assert ydl.calls == [
        (
            {"quiet": True, "no_warnings": True, "extract_flat": False},
            f"https://www.youtube.com/watch?v={ID}",
            False,
        )
    ]


def test_lista_ignora_live_chat_e_rechat_nas_manuais(ydl: type[FakeYoutubeDL]) -> None:
    ydl.info = {
        "title": "Live",
        "subtitles": {
            "live_chat": [{"ext": "json", "url": "c"}],
            "rechat": [{"ext": "json", "url": "r"}],
            "es": [{"ext": "vtt", "url": "s", "name": "Spanish"}],
        },
    }
    assert resumo(listar(URL))[2] == [("es", "Spanish", False)]


def test_lista_nao_filtra_live_chat_nas_automaticas(ydl: type[FakeYoutubeDL]) -> None:
    # Comportamento atual: o filtro só vale para as legendas manuais.
    ydl.info = {"title": "Live", "automatic_captions": {"live_chat": [{"url": "c"}]}}
    assert resumo(listar(URL))[2] == [("live_chat", "live_chat (auto-generated)", True)]


def test_lista_manual_sem_nome_ou_vazia_usa_o_codigo(ydl: type[FakeYoutubeDL]) -> None:
    ydl.info = {
        "title": "T",
        "subtitles": {"it": [{"ext": "vtt", "url": "x"}], "ja": []},
    }
    assert resumo(listar(URL))[2] == [("it", "it", False), ("ja", "ja", False)]


def test_lista_sem_titulo_e_sem_legendas(ydl: type[FakeYoutubeDL]) -> None:
    ydl.info = {"subtitles": None, "automatic_captions": {}}
    assert resumo(listar(URL)) == (ID, "Unknown", [])


def test_lista_url_invalida(ydl: type[FakeYoutubeDL]) -> None:
    with pytest.raises(ValueError, match=r"^URL inválida do YouTube: foo$"):
        listar("foo")
    assert ydl.calls == []


def test_lista_titulo_nulo_falha(ydl: type[FakeYoutubeDL]) -> None:
    # "title": None existe no dicionário, então o "Unknown" não entra e a validação do Pydantic falha.
    # O ValidationError é um ValueError: na API vira 400 com a mensagem da validação.
    ydl.info = {"title": None}
    with pytest.raises(Exception, match="video_title"):
        listar(URL)


# ---------------------------------------------------------------- download (rota comentada, lógica mantida)


def test_baixa_vtt_e_converte(ydl: type[FakeYoutubeDL], http: dict[str, Any]) -> None:
    ydl.info = {"automatic_captions": {"en": [{"url": "https://cap/en"}, {"url": "https://cap/en2"}]}}
    http["text"] = "WEBVTT\n\n00:00:01.000 --> 00:00:02.000\nHi\n"
    assert baixar(URL, "en") == (ID, "00:00:01,000 --> 00:00:02,000\nHi")
    assert http["urls"] == ["https://cap/en"]
    assert ydl.calls == [
        (
            {
                "quiet": True,
                "no_warnings": True,
                "skip_download": True,
                "writesubtitles": True,
                "writeautomaticsub": True,
                "subtitleslangs": ["en"],
                "subtitlesformat": "srt",
            },
            f"https://www.youtube.com/watch?v={ID}",
            False,
        )
    ]


def test_baixa_texto_que_nao_e_vtt_sem_converter(ydl: type[FakeYoutubeDL], http: dict[str, Any]) -> None:
    ydl.info = {"subtitles": {"pt": [{"url": "https://cap/pt"}]}, "automatic_captions": {}}
    http["text"] = "1\n00:00:01,000 --> 00:00:02,000\nOi\n"
    assert baixar(URL, "pt") == (ID, "1\n00:00:01,000 --> 00:00:02,000\nOi\n")


def test_baixa_automatica_sobrepoe_manual_do_mesmo_idioma(
    ydl: type[FakeYoutubeDL], http: dict[str, Any]
) -> None:
    ydl.info = {
        "subtitles": {"en": [{"url": "https://manual"}]},
        "automatic_captions": {"en": [{"url": "https://auto"}]},
    }
    http["text"] = "x"
    baixar(URL, "en")
    assert http["urls"] == ["https://auto"]


def test_baixa_idioma_indisponivel(ydl: type[FakeYoutubeDL], http: dict[str, Any]) -> None:
    ydl.info = {"subtitles": {"en": [{"url": "u"}]}, "automatic_captions": {}}
    with pytest.raises(ValueError, match=r"^Legenda em 'fr' não disponível para este vídeo$"):
        baixar(URL, "fr")
    assert http["urls"] == []


def test_baixa_sem_url_da_legenda(ydl: type[FakeYoutubeDL], http: dict[str, Any]) -> None:
    ydl.info = {"subtitles": {"en": [{"ext": "vtt"}]}, "automatic_captions": {}}
    with pytest.raises(ValueError, match=r"^Não foi possível baixar a legenda em 'en'$"):
        baixar(URL, "en")


def test_baixa_url_invalida(ydl: type[FakeYoutubeDL]) -> None:
    with pytest.raises(ValueError, match=r"^URL inválida do YouTube: foo$"):
        baixar("foo", "en")
    assert ydl.calls == []


def test_baixa_com_requested_subtitles_quebra(ydl: type[FakeYoutubeDL], http: dict[str, Any]) -> None:
    # Comportamento atual: percorre as chaves do dicionário e chama .get numa string.
    ydl.info = {
        "requested_subtitles": {"en": {"url": "https://cap/en", "ext": "srt"}},
        "subtitles": {"en": [{"url": "https://cap/en"}]},
    }
    with pytest.raises(AttributeError):
        baixar(URL, "en")


# ---------------------------------------------------------------- VTT → SRT

VTT_AUTOMATICA = (
    "WEBVTT\n"
    "Kind: captions\n"
    "Language: en\n"
    "\n"
    "00:00:00.160 --> 00:00:02.869 align:start position:0%\n"
    " \n"
    "hello<00:00:00.480><c> world</c>\n"
    "\n"
    "00:00:02.869 --> 00:00:02.879 align:start position:0%\n"
    "hello world\n"
    " \n"
)

VTT_MANUAL = (
    "WEBVTT\n"
    "\n"
    "1\n"
    "00:00:01.000 --> 00:00:04.500\n"
    "Hello, Mr. Smith.\n"
    "\n"
    "2\n"
    "00:00:05.000 --> 00:01:02.250\n"
    "It's 3.5 meters.\n"
    "\n"
    "3\n"
    "00:01:03.000 --> 00:01:05.000\n"
    "42\n"
)


def test_vtt_automatica_do_youtube() -> None:
    assert converter_vtt(VTT_AUTOMATICA) == (
        "00:00:00,160 --> 00:00:02,869\n"
        "hello<00:00:00.480><c> world</c>\n"
        "00:00:02,869 --> 00:00:02,879\n"
        "hello world"
    )


def test_vtt_manual_com_numeros() -> None:
    # Os números das falas são refeitos; uma fala que é só um número também vira contador.
    assert converter_vtt(VTT_MANUAL) == (
        "1\n00:00:01,000 --> 00:00:04,500\nHello, Mr. Smith.\n"
        "2\n00:00:05,000 --> 00:01:02,250\nIt's 3.5 meters.\n"
        "3\n00:01:03,000 --> 00:01:05,000\n4"
    )


@pytest.mark.parametrize(
    ("vtt", "srt"),
    [
        (
            "WEBVTT\n\n00:00:01.000 --> 00:00:02.000 size:50% line:0\nOi\n",
            "00:00:01,000 --> 00:00:02,000\nOi",
        ),
        # Só align/position/size são removidos; outros ajustes ficam na linha.
        ("WEBVTT\n\n00:00:01.000 --> 00:00:02.000 line:0\nOi\n", "00:00:01,000 --> 00:00:02,000 line:0\nOi"),
        ("WEBVTT\r\n\r\n00:00:01.000 --> 00:00:02.000\r\nOi\r\n", "00:00:01,000 --> 00:00:02,000\r\nOi"),
        # Sem cabeçalho, tudo até a primeira linha em branco é tratado como cabeçalho.
        (
            "00:00:01.000 --> 00:00:02.000\nOi\n\n00:00:03.000 --> 00:00:04.000\nTchau\n",
            "00:00:03,000 --> 00:00:04,000\nTchau",
        ),
        ("WEBVTT\n", ""),
        ("", ""),
    ],
)
def test_vtt_casos(vtt: str, srt: str) -> None:
    assert converter_vtt(vtt) == srt
