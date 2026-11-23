import 'fake-indexeddb/auto';
import { IDBFactory } from 'fake-indexeddb';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearStoredSession, loadSession, saveSession } from './sessionDb';

// Cada teste começa com um IndexedDB vazio.
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory();
});

const video = () => new File([new Uint8Array([0, 1, 2, 3, 250])], 'friends1x01.mkv', { type: 'video/x-matroska', lastModified: 1_700_000_000_000 });
const subtitle = () => new File(['1\n00:00:01,000 --> 00:00:02,000\nHi\n'], 'friends1x01.srt', { type: 'application/x-subrip', lastModified: 1_700_000_000_001 });

/** Lê o registro cru, sem passar pelo sessionDb, para conferir onde ele grava. */
function readRaw(): Promise<{ stores: string[]; version: number; value: unknown }> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('englishsrt');
    req.onerror = () => reject(req.error);
    req.onsuccess = () => {
      const db = req.result;
      const stores = Array.from(db.objectStoreNames);
      const get = db.transaction('session').objectStore('session').get('current');
      get.onsuccess = () => {
        resolve({ stores, version: db.version, value: get.result });
        db.close();
      };
      get.onerror = () => reject(get.error);
    };
  });
}

describe('sessionDb', () => {
  it('sem nada gravado, loadSession devolve null', async () => {
    expect(await loadSession()).toBeNull();
  });

  it('round-trip: o File volta com nome, tipo, data e conteúdo', async () => {
    await saveSession({ videoFile: video(), subtitleFile: subtitle() });
    const s = await loadSession();
    expect(s).not.toBeNull();
    expect(s!.videoFile).toBeInstanceOf(File);
    expect(s!.videoFile.name).toBe('friends1x01.mkv');
    expect(s!.videoFile.type).toBe('video/x-matroska');
    expect(s!.videoFile.lastModified).toBe(1_700_000_000_000);
    expect(Array.from(new Uint8Array(await s!.videoFile.arrayBuffer()))).toEqual([0, 1, 2, 3, 250]);
    expect(s!.subtitleFile.name).toBe('friends1x01.srt');
    expect(await s!.subtitleFile.text()).toBe('1\n00:00:01,000 --> 00:00:02,000\nHi\n');
  });

  it('grava um registro só: salvar de novo substitui o anterior', async () => {
    await saveSession({ videoFile: video(), subtitleFile: subtitle() });
    const outro = new File(['x'], 'outro.mp4', { type: 'video/mp4' });
    await saveSession({ videoFile: outro, subtitleFile: subtitle() });
    const s = await loadSession();
    expect(s!.videoFile.name).toBe('outro.mp4');
  });

  it('clearStoredSession apaga a sessão', async () => {
    await saveSession({ videoFile: video(), subtitleFile: subtitle() });
    await clearStoredSession();
    expect(await loadSession()).toBeNull();
  });

  it('clearStoredSession sem nada gravado não dá erro', async () => {
    await expect(clearStoredSession()).resolves.toBeUndefined();
    expect(await loadSession()).toBeNull();
  });

  it('usa o banco englishsrt (versão 1), store session, chave current', async () => {
    await saveSession({ videoFile: video(), subtitleFile: subtitle() });
    const raw = await readRaw();
    expect(raw.version).toBe(1);
    expect(raw.stores).toEqual(['session']);
    expect((raw.value as { videoFile: File }).videoFile.name).toBe('friends1x01.mkv');
  });

  it('guarda o objeto como veio, sem validar o formato', async () => {
    // Comportamento atual: não há validação; loadSession devolve o que estiver gravado.
    await saveSession({ videoFile: 'não é File' } as unknown as Parameters<typeof saveSession>[0]);
    expect(await loadSession()).toEqual({ videoFile: 'não é File' });
  });

  it('banco já criado numa versão maior: rejeita com VersionError', async () => {
    await new Promise<void>((resolve, reject) => {
      const req = indexedDB.open('englishsrt', 2);
      req.onupgradeneeded = () => req.result.createObjectStore('session');
      req.onsuccess = () => {
        req.result.close();
        resolve();
      };
      req.onerror = () => reject(req.error);
    });
    await expect(loadSession()).rejects.toMatchObject({ name: 'VersionError' });
  });
});
