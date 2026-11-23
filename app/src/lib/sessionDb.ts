// Persistencia da sessao do player no IndexedDB.
// Guarda direto os objetos File (structured-cloneable), sem serializar
// pra base64. Sobrevive a fechar/reabrir a aba.
//
// Uma unica store `session` com um unico registro na chave `current`.

const DB_NAME = "englishsrt";
const DB_VERSION = 1;
const STORE = "session";
const CURRENT_KEY = "current";

export type StoredSession = {
  videoFile: File;
  subtitleFile: File;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
    req.onblocked = () =>
      reject(new Error("IndexedDB bloqueado por outra aba"));
  });
}

export async function saveSession(s: StoredSession): Promise<void> {
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put(s, CURRENT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}

export async function loadSession(): Promise<StoredSession | null> {
  const db = await openDB();
  try {
    return await new Promise<StoredSession | null>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(CURRENT_KEY);
      req.onsuccess = () => resolve((req.result as StoredSession) ?? null);
      req.onerror = () => reject(req.error);
    });
  } finally {
    db.close();
  }
}

export async function clearStoredSession(): Promise<void> {
  const db = await openDB();
  try {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).delete(CURRENT_KEY);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
}
