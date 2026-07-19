/**
 * IndexedDBの接続管理。
 * DBのオープン・スキーマ定義のみを担当する。
 */

const DB_NAME = "vintage-quiz-db";
const DB_VERSION = 1;

export const STORE_QUESTIONS = "questions";
export const STORE_STUDY_DATA = "studyData";
export const STORE_SETTINGS = "settings";

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * DB接続を取得する（未接続なら初期化する）
 */
export function getDB(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;

      if (!db.objectStoreNames.contains(STORE_QUESTIONS)) {
        db.createObjectStore(STORE_QUESTIONS, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE_STUDY_DATA)) {
        db.createObjectStore(STORE_STUDY_DATA, { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains(STORE_SETTINGS)) {
        // 設定は単一レコードとして固定キー "default" で保存する
        db.createObjectStore(STORE_SETTINGS, { keyPath: "key" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

  return dbPromise;
}

/**
 * IDBRequestをPromiseに変換する共通ヘルパー
 */
export function requestToPromise<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
