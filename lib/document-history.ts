import type {
  AskSession,
  HistoryEntry,
  SingleHistoryEntry,
} from "@/lib/document-history-types";

const DB_NAME = "sumvora-history";
const STORE_NAME = "history";
const DB_VERSION = 1;
const MAX_ENTRIES = 20;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available."));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("analyzedAt", "analyzedAt", { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = operation(store);

        request.onsuccess = () => resolve(request.result as T);
        request.onerror = () => reject(request.error);
      }),
  );
}

async function trimOldEntries(): Promise<void> {
  const entries = await listHistoryEntries();
  if (entries.length <= MAX_ENTRIES) return;

  const toDelete = entries.slice(MAX_ENTRIES);
  await Promise.all(toDelete.map((entry) => deleteHistoryEntry(entry.id)));
}

export async function saveHistoryEntry(entry: HistoryEntry): Promise<void> {
  await runTransaction("readwrite", (store) => store.put(entry));
  await trimOldEntries();
}

export async function listHistoryEntries(): Promise<HistoryEntry[]> {
  const entries = await runTransaction<HistoryEntry[]>("readonly", (store) =>
    store.getAll(),
  );

  return entries.sort(
    (a, b) =>
      new Date(b.analyzedAt).getTime() - new Date(a.analyzedAt).getTime(),
  );
}

export async function getHistoryEntry(
  id: string,
): Promise<HistoryEntry | undefined> {
  return runTransaction<HistoryEntry | undefined>("readonly", (store) =>
    store.get(id),
  );
}

export async function deleteHistoryEntry(id: string): Promise<void> {
  await runTransaction("readwrite", (store) => store.delete(id));
}

export async function updateSingleHistoryEntry(
  id: string,
  updates: Partial<
    Pick<SingleHistoryEntry, "summary" | "askSessions" | "responseLanguage">
  >,
): Promise<void> {
  const existing = await getHistoryEntry(id);
  if (!existing || existing.type !== "single") return;

  await saveHistoryEntry({
    ...existing,
    ...updates,
  });
}

export async function appendAskSession(
  id: string,
  session: AskSession,
): Promise<void> {
  const existing = await getHistoryEntry(id);
  if (!existing || existing.type !== "single") return;

  const askSessions = [...(existing.askSessions ?? []), session];
  await updateSingleHistoryEntry(id, { askSessions });
}
