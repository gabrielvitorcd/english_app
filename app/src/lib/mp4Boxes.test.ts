import { describe, expect, it } from 'vitest';
import { parseTopLevelBoxes, splitInitAndMedia } from './mp4Boxes';

/** Monta um box: 4 bytes de tamanho (big-endian) + 4 do tipo + payload preenchido com `fill`. */
function box(type: string, payloadSize: number, fill = 0): Uint8Array {
  const out = new Uint8Array(8 + payloadSize).fill(fill);
  new DataView(out.buffer).setUint32(0, 8 + payloadSize);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  return out;
}

/** Box com size=1 e o tamanho real nos 8 bytes seguintes (largesize de 64 bits). */
function largeBox(type: string, payloadSize: number, fill = 0): Uint8Array {
  const out = new Uint8Array(16 + payloadSize).fill(fill);
  const view = new DataView(out.buffer);
  view.setUint32(0, 1);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  view.setUint32(8, 0);
  view.setUint32(12, 16 + payloadSize);
  return out;
}

function concat(...parts: Uint8Array[]): ArrayBuffer {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) {
    out.set(p, off);
    off += p.length;
  }
  return out.buffer;
}

const bytes = (buf: ArrayBuffer) => Array.from(new Uint8Array(buf));

describe('parseTopLevelBoxes', () => {
  it('lista os boxes de topo com tipo, início e tamanho', () => {
    const buf = concat(box('ftyp', 8), box('moov', 20), box('moof', 4), box('mdat', 12));
    expect(parseTopLevelBoxes(buf)).toEqual([
      { type: 'ftyp', start: 0, size: 16 },
      { type: 'moov', start: 16, size: 28 },
      { type: 'moof', start: 44, size: 12 },
      { type: 'mdat', start: 56, size: 20 },
    ]);
  });

  it('não entra nos containers: o conteúdo do moov conta como payload', () => {
    const inner = box('trak', 8);
    const moov = new Uint8Array(8 + inner.length);
    new DataView(moov.buffer).setUint32(0, moov.length);
    moov.set([0x6d, 0x6f, 0x6f, 0x76], 4); // "moov"
    moov.set(inner, 8);
    expect(parseTopLevelBoxes(concat(moov))).toEqual([{ type: 'moov', start: 0, size: 24 }]);
  });

  it('size=1 lê o largesize de 64 bits', () => {
    const buf = concat(box('ftyp', 0), largeBox('mdat', 10));
    expect(parseTopLevelBoxes(buf)).toEqual([
      { type: 'ftyp', start: 0, size: 8 },
      { type: 'mdat', start: 8, size: 26 },
    ]);
  });

  it('size=0 vai até o fim do buffer', () => {
    const last = box('mdat', 12);
    new DataView(last.buffer).setUint32(0, 0);
    const buf = concat(box('ftyp', 4), last);
    expect(parseTopLevelBoxes(buf)).toEqual([
      { type: 'ftyp', start: 0, size: 12 },
      { type: 'mdat', start: 12, size: 20 },
    ]);
  });

  it('para no box que passa do fim do buffer (truncado) e devolve os anteriores', () => {
    const truncated = box('mdat', 100).slice(0, 30);
    const buf = concat(box('ftyp', 4), truncated);
    expect(parseTopLevelBoxes(buf)).toEqual([{ type: 'ftyp', start: 0, size: 12 }]);
  });

  it('para no box com tamanho menor que o cabeçalho (2..7)', () => {
    const bad = box('free', 4);
    new DataView(bad.buffer).setUint32(0, 7);
    const buf = concat(box('ftyp', 0), bad, box('moov', 0));
    expect(parseTopLevelBoxes(buf)).toEqual([{ type: 'ftyp', start: 0, size: 8 }]);
  });

  it('largesize sem os 8 bytes extras para a leitura', () => {
    const header = largeBox('mdat', 0).slice(0, 12);
    const buf = concat(box('ftyp', 0), header);
    expect(parseTopLevelBoxes(buf)).toEqual([{ type: 'ftyp', start: 0, size: 8 }]);
  });

  it('ignora sobra final menor que 8 bytes e buffer vazio', () => {
    expect(parseTopLevelBoxes(concat(box('ftyp', 0), new Uint8Array(5)))).toEqual([
      { type: 'ftyp', start: 0, size: 8 },
    ]);
    expect(parseTopLevelBoxes(new ArrayBuffer(0))).toEqual([]);
  });
});

describe('splitInitAndMedia', () => {
  it('init = tudo antes do primeiro moof; media = do primeiro moof até o fim', () => {
    const ftyp = box('ftyp', 4, 1);
    const moov = box('moov', 8, 2);
    const moof1 = box('moof', 2, 3);
    const mdat1 = box('mdat', 6, 4);
    const moof2 = box('moof', 2, 5);
    const mdat2 = box('mdat', 3, 6);
    const buf = concat(ftyp, moov, moof1, mdat1, moof2, mdat2);

    const { init, media } = splitInitAndMedia(buf);
    expect(bytes(init)).toEqual(bytes(concat(ftyp, moov)));
    expect(bytes(media)).toEqual(bytes(concat(moof1, mdat1, moof2, mdat2)));
  });

  it('boxes opcionais antes do moof (styp/sidx) ficam no init', () => {
    const buf = concat(box('ftyp', 0), box('moov', 0), box('styp', 0), box('moof', 0), box('mdat', 0));
    const { init, media } = splitInitAndMedia(buf);
    expect(init.byteLength).toBe(24);
    expect(parseTopLevelBoxes(media).map((b) => b.type)).toEqual(['moof', 'mdat']);
  });

  it('sem moof: init é o próprio buffer (mesma referência) e media fica vazio', () => {
    const buf = concat(box('ftyp', 4), box('moov', 4));
    const { init, media } = splitInitAndMedia(buf);
    expect(init).toBe(buf);
    expect(media.byteLength).toBe(0);
  });

  it('moof logo no começo: init vazio', () => {
    const buf = concat(box('moof', 0), box('mdat', 4));
    const { init, media } = splitInitAndMedia(buf);
    expect(init.byteLength).toBe(0);
    expect(media.byteLength).toBe(20);
  });

  it('moof depois de um box truncado não é encontrado: tudo vira init', () => {
    const bad = box('free', 0);
    new DataView(bad.buffer).setUint32(0, 4);
    const buf = concat(box('ftyp', 0), bad, box('moof', 0), box('mdat', 0));
    const { init, media } = splitInitAndMedia(buf);
    expect(init).toBe(buf);
    expect(media.byteLength).toBe(0);
  });
});
