export type ProjectState = any;

const DB_NAME = "book-smith";
const DB_VERSION = 1;
const STORE_NAME = "projectStates";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(
  db: IDBDatabase,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const req = fn(store);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getProjectState(projectId: string): Promise<ProjectState | null> {
  const db = await openDb();
  const record = await tx<any>(db, "readonly", (store) => store.get(projectId));
  return record?.state ?? null;
}

export async function setProjectState(projectId: string, state: ProjectState): Promise<void> {
  const db = await openDb();
  await tx(db, "readwrite", (store) =>
    store.put({ id: projectId, state, updatedAt: Date.now() })
  );
}

export async function deleteProjectState(projectId: string): Promise<void> {
  const db = await openDb();
  await tx(db, "readwrite", (store) => store.delete(projectId));
}

// Backward-compat: migrate a legacy localStorage key into IndexedDB
export async function migrateLocalStorageProjectStateIfNeeded(projectId: string): Promise<void> {
  try {
    const legacyKey = `ai-book-smith-state-${projectId}`;
    const legacy = localStorage.getItem(legacyKey);
    if (!legacy) return;
    const parsed = JSON.parse(legacy);
    await setProjectState(projectId, parsed);
    localStorage.removeItem(legacyKey);
  } catch {
    // ignore migration failure
  }
}


