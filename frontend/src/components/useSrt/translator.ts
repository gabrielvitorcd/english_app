const DB_NAME = "translator-cache";
const DB_VERSION = 3;
const STORE_NAME = "translations";

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
  });

  return dbPromise;
}

function makeKey(word: string, targetLang: string): string {
  return `${targetLang}:${word}`;
}

async function getFromCache(word: string, targetLang: string): Promise<{ translation: string; detectedLang: string } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(makeKey(word, targetLang));

      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve({ translation: result.translation, detectedLang: result.detectedLang });
        } else {
          resolve(null);
        }
      };

      request.onerror = () => {
        resolve(null);
      };
    });
  } catch {
    return null;
  }
}

async function saveToCache(word: string, translation: string, detectedLang: string, targetLang: string): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      store.put({ id: makeKey(word, targetLang), word, translation, detectedLang, targetLang });

      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  } catch {
    // Falha silenciosa - cache é otimização
  }
}

export async function translateWord(word: string, toLang = "pt"): Promise<string | null> {
  const clean = word.toLowerCase().replace(/[^a-z]/g, "");

  if (!clean || clean.length === 0) return null;

  // Tenta buscar do IndexedDB
  const cached = await getFromCache(clean, toLang);
  if (cached) {
    return cached.translation;
  }

  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(clean)}&langpair=autodetect|${toLang}`;
    const res = await fetch(url);
    const data = await res.json();

    if (data.responseStatus === 200 && data.responseData?.translatedText) {
      const translation = data.responseData.translatedText;
      const detectedLang = data.responseData.detectedLanguage || "unknown";
      await saveToCache(clean, translation, detectedLang, toLang);
      return translation;
    }

    return null;
  } catch {
    return null;
  }
}
