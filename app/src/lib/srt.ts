// Passo 5 — parser SRT canonico usado pela sessao de estudo.
//
// Diferenca vs. o parser antigo em components/useSrt/useSrt.ts:
//   - Emite `index` (posicao na sessao) — usado como chave de cache e
//     coordenada de progresso no player.
//   - Aceita SRT via texto puro (nao acopla ao fetch de uma URL — a sessao
//     recebe o arquivo do usuario via File).
//   - Expoe `filterDialogueCues` — regra do produto: cues so com efeito
//     sonoro/anotacao ([CAR HORNS], (music playing)) nao entram na sessao
//     de estudo porque nao tem valor didatico.

export type SrtCue = {
  /** Posicao 0-based apos o filtro de dialogo — usada como chave de cache. */
  index: number;
  /** Segundos do inicio da cue (do timestamp original do arquivo). */
  start: number;
  /** Segundos do fim da cue. */
  end: number;
  /** Texto ja com tags HTML removidas e linhas juntadas por espaco. */
  text: string;
};

const TIMESTAMP_RE =
  /(\d{2}):(\d{2}):(\d{2})[,.](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[,.](\d{3})/;

/**
 * Parseia um SRT bruto. Ignora blocos malformados (sem timestamp valido).
 * Aceita separador `,` ou `.` nos milissegundos — o ffmpeg emite com virgula,
 * mas fansubs as vezes usam ponto.
 *
 * NAO aplica `filterDialogueCues` aqui — retorna todas as cues em ordem, com
 * `index` sequencial. Quem chama decide se filtra.
 */
export function parseSrt(raw: string): SrtCue[] {
  const blocks = raw.trim().split(/\n\s*\n/);
  const cues: SrtCue[] = [];
  let index = 0;

  for (const block of blocks) {
    const lines = block.trim().split("\n");
    if (lines.length < 3) continue;

    // A primeira linha e o numero da cue (ignoramos — usamos nosso proprio index).
    // A segunda tem o timestamp. A partir da terceira, o texto.
    const m = lines[1].match(TIMESTAMP_RE);
    if (!m) continue;

    const toSec = (h: string, mi: string, s: string, ms: string) =>
      +h * 3600 + +mi * 60 + +s + +ms / 1000;

    cues.push({
      index: index++,
      start: toSec(m[1], m[2], m[3], m[4]),
      end: toSec(m[5], m[6], m[7], m[8]),
      text: lines
        .slice(2)
        .join(" ")
        .replace(/<[^>]+>/g, "")
        .trim(),
    });
  }

  return cues;
}

/**
 * Remove cues que nao sao dialogo — usadas como anotacoes de audio pra
 * acessibilidade (`[CAR HORNS]`, `(music playing)`, `♪ ... ♪`). Nao tem
 * valor didatico e gastariam CPU do transcode a toa.
 *
 * Reindexa `index` na saida (mantem sequencia 0..N sem buracos).
 */
export function filterDialogueCues(cues: SrtCue[]): SrtCue[] {
  return cues
    .filter((c) => {
      const t = c.text.trim();
      if (!t) return false;
      // Comeca com [ ou ( → nota de som/direcao de acessibilidade
      if (/^[[(]/.test(t)) return false;
      // Comeca com ♪ (nota musical) → letra de musica cantada, geralmente
      // nao e conteudo de estudo linguistico
      if (/^[♪♫#]/.test(t)) return false;
      return true;
    })
    .map((c, i) => ({ ...c, index: i }));
}
