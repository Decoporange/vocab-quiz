import type { StudyData } from "../types";
import { getDB, requestToPromise, STORE_STUDY_DATA } from "./connection";

/**
 * 全StudyDataを取得する
 */
export async function getAllStudyData(): Promise<StudyData[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_STUDY_DATA, "readonly");
  const store = tx.objectStore(STORE_STUDY_DATA);
  return requestToPromise(store.getAll());
}

/**
 * idを指定してStudyDataを1件取得する
 */
export async function getStudyData(id: number): Promise<StudyData | undefined> {
  const db = await getDB();
  const tx = db.transaction(STORE_STUDY_DATA, "readonly");
  const store = tx.objectStore(STORE_STUDY_DATA);
  return requestToPromise(store.get(id));
}

/**
 * StudyDataを1件保存（新規追加/上書き更新）する
 */
export async function saveStudyData(studyData: StudyData): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_STUDY_DATA, "readwrite");
  tx.objectStore(STORE_STUDY_DATA).put(studyData);

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

/**
 * StudyDataを複数件まとめて保存（新規追加/上書き更新）する
 */
export async function saveStudyDataBulk(studyDataList: StudyData[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_STUDY_DATA, "readwrite");
  const store = tx.objectStore(STORE_STUDY_DATA);

  for (const studyData of studyDataList) {
    store.put(studyData);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
