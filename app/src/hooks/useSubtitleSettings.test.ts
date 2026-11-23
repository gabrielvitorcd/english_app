import { describe, expect, it } from 'vitest';
import { DEFAULT_SUBTITLE_SETTINGS, hexToRgba, subtitleStyle } from './useSubtitleSettings';

describe('hexToRgba', () => {
  it('#RRGGBB vira rgba com o alpha recebido', () => {
    expect(hexToRgba('#000000', 0.78)).toBe('rgba(0, 0, 0, 0.78)');
    expect(hexToRgba('#1a2B3c', 1)).toBe('rgba(26, 43, 60, 1)');
  });

  it('#RGB curto duplica cada dígito', () => {
    expect(hexToRgba('#fff', 0.5)).toBe('rgba(255, 255, 255, 0.5)');
    expect(hexToRgba('#f80', 0)).toBe('rgba(255, 136, 0, 0)');
  });

  it('funciona sem o #', () => {
    expect(hexToRgba('ff0000', 1)).toBe('rgba(255, 0, 0, 1)');
    expect(hexToRgba('0f0', 1)).toBe('rgba(0, 255, 0, 1)');
  });

  it("'transparent' devolve 'transparent' e ignora o alpha", () => {
    expect(hexToRgba('transparent', 0.9)).toBe('transparent');
  });

  it('não limita o alpha a 0..1 (comportamento atual)', () => {
    expect(hexToRgba('#000', 1.5)).toBe('rgba(0, 0, 0, 1.5)');
    expect(hexToRgba('#000', -1)).toBe('rgba(0, 0, 0, -1)');
  });

  it('#RRGGBBAA: usa só os 6 primeiros dígitos e descarta o alpha do hex (comportamento atual)', () => {
    expect(hexToRgba('#11223380', 1)).toBe('rgba(17, 34, 51, 1)');
  });

  it('valor inválido gera NaN no texto, sem erro (comportamento atual)', () => {
    expect(hexToRgba('#zzz', 1)).toBe('rgba(NaN, NaN, NaN, 1)');
    expect(hexToRgba('#ab', 1)).toBe('rgba(171, NaN, NaN, 1)');
    expect(hexToRgba('', 1)).toBe('rgba(NaN, NaN, NaN, 1)');
    // parseInt lê o começo válido de cada par: "TR" → NaN, "AN" → 10 ("A"), "SP" → NaN.
    expect(hexToRgba('TRANSPARENT', 1)).toBe('rgba(NaN, 10, NaN, 1)');
  });
});

describe('subtitleStyle', () => {
  it('monta o estilo a partir das configurações', () => {
    expect(
      subtitleStyle({ color: '#ffcc00', background: '#000', bgOpacity: 0.5, fontSize: 30, fontFamily: 'Georgia, serif' }),
    ).toEqual({
      color: '#ffcc00',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      fontSize: '30px',
      fontFamily: 'Georgia, serif',
    });
  });

  it('com os padrões', () => {
    expect(subtitleStyle(DEFAULT_SUBTITLE_SETTINGS)).toEqual({
      color: '#ffffff',
      backgroundColor: 'rgba(0, 0, 0, 0.78)',
      fontSize: '22px',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    });
  });

  it("fundo 'transparent' fica transparente qualquer que seja a opacidade", () => {
    const s = subtitleStyle({ ...DEFAULT_SUBTITLE_SETTINGS, background: 'transparent', bgOpacity: 1 });
    expect(s.backgroundColor).toBe('transparent');
  });

  it('a cor do texto passa como veio, sem conversão', () => {
    expect(subtitleStyle({ ...DEFAULT_SUBTITLE_SETTINGS, color: 'red' }).color).toBe('red');
  });
});
