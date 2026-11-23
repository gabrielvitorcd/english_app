import { describe, expect, it } from 'vitest';
import { filterDialogueCues, parseSrt, type SrtCue } from './srt';

const SRT = `1
00:00:01,000 --> 00:00:02,500
Hello there.

2
00:01:02,250 --> 00:01:04,000
<i>How are</i>
<b>you?</b>

3
01:00:00.100 --> 01:00:01.900
Ponto nos milissegundos
`;

describe('parseSrt', () => {
  it('lê os blocos em ordem, com index sequencial e tempos em segundos', () => {
    expect(parseSrt(SRT)).toEqual([
      { index: 0, start: 1, end: 2.5, text: 'Hello there.' },
      { index: 1, start: 62.25, end: 64, text: 'How are you?' },
      { index: 2, start: 3600.1, end: 3601.9, text: 'Ponto nos milissegundos' },
    ]);
  });

  it('junta as linhas do texto com espaço e tira as tags HTML', () => {
    const [cue] = parseSrt('1\n00:00:00,000 --> 00:00:01,000\n<font color="red">Linha um</font>\nlinha dois\n');
    expect(cue.text).toBe('Linha um linha dois');
  });

  it('ignora o número da cue do arquivo e usa o próprio index', () => {
    const cues = parseSrt('7\n00:00:01,000 --> 00:00:02,000\nA\n\n42\n00:00:03,000 --> 00:00:04,000\nB');
    expect(cues.map((c) => c.index)).toEqual([0, 1]);
  });

  it('pula blocos com timestamp malformado sem quebrar a sequência do index', () => {
    const raw = [
      '1\n00:00:01,000 --> 00:00:02,000\nboa',
      '2\n00:00:03 --> 00:00:04\nsem milissegundos',
      '3\n0:00:05,000 --> 0:00:06,000\nhora com um dígito',
      '4\n00:00:07,000 -> 00:00:08,000\nseta errada',
      '5\n00:00:09,000 --> 00:00:10,000\noutra boa',
    ].join('\n\n');
    expect(parseSrt(raw).map((c) => [c.index, c.text])).toEqual([
      [0, 'boa'],
      [1, 'outra boa'],
    ]);
  });

  it('pula blocos com menos de 3 linhas (sem texto)', () => {
    const raw = '1\n00:00:01,000 --> 00:00:02,000\n\n2\n00:00:03,000 --> 00:00:04,000\ntexto';
    expect(parseSrt(raw)).toEqual([{ index: 0, start: 3, end: 4, text: 'texto' }]);
  });

  it('pula o bloco sem a linha do número (o timestamp precisa estar na 2ª linha)', () => {
    const raw = '00:00:01,000 --> 00:00:02,000\nsem número\nmais texto';
    expect(parseSrt(raw)).toEqual([]);
  });

  it('texto vazio ou só espaços devolve lista vazia', () => {
    expect(parseSrt('')).toEqual([]);
    expect(parseSrt('  \n\n  ')).toEqual([]);
  });

  it('aceita espaços extras em volta da seta e várias linhas em branco entre blocos', () => {
    const raw = '1\n00:00:01,000-->00:00:02,000\nA\n\n\n\n2\n00:00:03,000   -->   00:00:04,000\nB';
    expect(parseSrt(raw).map((c) => c.text)).toEqual(['A', 'B']);
  });

  it('arquivo com CRLF: separa os blocos, mas o \\r fica no meio do texto de várias linhas (comportamento atual)', () => {
    const raw = '1\r\n00:00:01,000 --> 00:00:02,000\r\nUm\r\nDois\r\n\r\n2\r\n00:00:03,000 --> 00:00:04,000\r\nTrês\r\n';
    const cues = parseSrt(raw);
    expect(cues).toHaveLength(2);
    expect(cues[0]).toMatchObject({ start: 1, end: 2 });
    expect(cues[0].text).toBe('Um\r Dois');
    expect(cues[1].text).toBe('Três');
  });

  it('não confere se o fim vem depois do início', () => {
    const [cue] = parseSrt('1\n00:00:05,000 --> 00:00:01,000\ninvertida');
    expect(cue).toMatchObject({ start: 5, end: 1 });
  });
});

describe('filterDialogueCues', () => {
  const cue = (index: number, text: string): SrtCue => ({ index, start: index, end: index + 1, text });

  it('tira anotações de som e música e reindexa de 0 sem buracos', () => {
    const cues = [
      cue(0, '[CAR HORNS]'),
      cue(1, 'Hi!'),
      cue(2, '(music playing)'),
      cue(3, '♪ la la la ♪'),
      cue(4, '♫ outra música'),
      cue(5, '# letra'),
      cue(6, 'Bye.'),
    ];
    expect(filterDialogueCues(cues)).toEqual([
      { index: 0, start: 1, end: 2, text: 'Hi!' },
      { index: 1, start: 6, end: 7, text: 'Bye.' },
    ]);
  });

  it('tira cues vazias ou só com espaços', () => {
    expect(filterDialogueCues([cue(0, ''), cue(1, '   '), cue(2, 'ok')]).map((c) => c.text)).toEqual(['ok']);
  });

  it('olha só o começo do texto (espaços antes são ignorados)', () => {
    const cues = [cue(0, '  [risos]'), cue(1, 'Hi [laughs]'), cue(2, '- (sighs) okay')];
    expect(filterDialogueCues(cues).map((c) => c.text)).toEqual(['Hi [laughs]', '- (sighs) okay']);
  });

  it('não altera a lista de entrada', () => {
    const cues = [cue(5, '[x]'), cue(9, 'fala')];
    filterDialogueCues(cues);
    expect(cues.map((c) => c.index)).toEqual([5, 9]);
  });
});
