// Passo 4 — cache de cues transcodadas em IndexedDB.
//
// Motivacao: no browser + WORKERFS + WASM, encodar uma cue de 3s custa ~14s.
// Uma sessao de estudo de 300 cues seria proibitiva. Este cache guarda o MP4
// resultante indexado por chave escolhida pelo chamador, e transforma a 2a
// abertura da sessao em algo instantaneo.
//
// A biblioteca e agnostica ao formato da chave — quem monta e o caller:
//
//   Passo 3 (scratch):   `${videoFingerprint}_${startSec}_${durationSec}_${audioIdx}`
//   Passo 5 (producao):  `${videoFingerprint}_${srtHash}_cue${cueIndex}`
//
// Roda tanto na main thread quanto em Web Worker — IndexedDB e crypto.subtle
// estao disponiveis em ambos.

const DB_NAME = "english-srt-slice-cache";
const STORE = "cues";
const DB_VERSION = 1;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        // Object store simples key-value; o key e string, value e ArrayBuffer
        req.result.createObjectStore(STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}

/**
 * Le uma cue previamente cacheada. Retorna `null` se nao existir.
 */
export async function getCachedSlice(
  key: string
): Promise<ArrayBuffer | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).get(key);
    req.onsuccess = () => resolve((req.result as ArrayBuffer | undefined) ?? null);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Grava o MP4 de uma cue. Sobrescreve se ja existir a mesma chave.
 * O ArrayBuffer NAO precisa ser transferable — a IDB clona internamente.
 */
export async function putCachedSlice(
  key: string,
  mp4: ArrayBuffer
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(mp4, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

/**
 * Limpa TODAS as cues cacheadas. Uso do usuario (botao "limpar cache").
 */
export async function clearSliceCache(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * Conta quantas cues estao cacheadas (util pra UI de "N cues em cache").
 */
export async function countCachedSlices(): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Fingerprint do video: name + size + lastModified. Nao e criptograficamente
 * seguro, mas o custo de gerar e zero e a colisao na pratica requer o usuario
 * ter dois arquivos exatamente com o mesmo nome, tamanho e mtime — improvavel
 * fora de um teste artificial.
 *
 * Alternativa (nao usada): hash SHA-256 dos primeiros N MB. Custa I/O.
 */
export function videoFingerprint(file: File): string {
  return `${file.name}::${file.size}::${file.lastModified}`;
}

/**
 * Hash SHA-256 de um texto (ex: conteudo do arquivo .srt). Usado para
 * detectar quando o usuario troca a legenda — cai o cache pra aquela combinacao
 * de video + srt.
 */
export async function sha256Hex(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
