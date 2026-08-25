// Parser minimo de MP4 (ISO/IEC 14496-12) — o suficiente pra separar init
// segment (ftyp + moov) das media segments (moof + mdat) de um fMP4.
//
// Motivacao: para tocar cues encodadas em sequencia via MSE, so a PRIMEIRA
// fMP4 deve fornecer o init (ftyp+moov). As subsequentes precisam ter esse
// prefixo removido, senao a SourceBuffer rejeita.
//
// Nao interpretamos o conteudo dos boxes — so mapeamos as posicoes top-level
// e recortamos o ArrayBuffer.

export type Mp4Box = {
  /** Tipo do box (4 chars ASCII, ex: "ftyp", "moov", "moof", "mdat"). */
  type: string;
  /** Offset no ArrayBuffer onde o box comeca. */
  start: number;
  /** Tamanho total do box, incluindo header. */
  size: number;
};

/**
 * Enumera os boxes top-level do MP4. Nao entra em containers (moov, moof).
 * Boxes com size=0 (extends to EOF) ou size=1 (64-bit largesize) tratados.
 */
export function parseTopLevelBoxes(buf: ArrayBuffer): Mp4Box[] {
  const view = new DataView(buf);
  const total = buf.byteLength;
  const boxes: Mp4Box[] = [];
  let offset = 0;

  while (offset + 8 <= total) {
    let size = view.getUint32(offset);
    const type = String.fromCharCode(
      view.getUint8(offset + 4),
      view.getUint8(offset + 5),
      view.getUint8(offset + 6),
      view.getUint8(offset + 7)
    );

    if (size === 1) {
      // 64-bit largesize logo apos o header (bytes 8..15)
      if (offset + 16 > total) break;
      const hi = view.getUint32(offset + 8);
      const lo = view.getUint32(offset + 12);
      // JS numbers sao seguros ate 2^53; MP4 boxes gigantescos nao chegam nem
      // perto disso na pratica.
      size = hi * 2 ** 32 + lo;
    } else if (size === 0) {
      // Estende ate o fim do arquivo
      size = total - offset;
    }

    if (size < 8 || offset + size > total) break;
    boxes.push({ type, start: offset, size });
    offset += size;
  }

  return boxes;
}

/**
 * Separa init segment (tudo antes do primeiro moof) do resto (media segments).
 *
 * Init tipico: ftyp + moov (com +empty_moov, o moov e um template sem samples)
 * Media: sequencia de moof + mdat (styp/sidx opcionais entre eles)
 *
 * Se nao houver moof, retorna tudo como init.
 */
export function splitInitAndMedia(mp4: ArrayBuffer): {
  init: ArrayBuffer;
  media: ArrayBuffer;
} {
  const boxes = parseTopLevelBoxes(mp4);
  const firstMoof = boxes.find((b) => b.type === "moof");
  if (!firstMoof) {
    return { init: mp4, media: new ArrayBuffer(0) };
  }
  return {
    init: mp4.slice(0, firstMoof.start),
    media: mp4.slice(firstMoof.start),
  };
}
