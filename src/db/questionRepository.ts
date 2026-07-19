import type { Question } from "../types";
import { getDB, requestToPromise, STORE_QUESTIONS } from "./connection";

/**
 * 全Questionを取得する
 */
export async function getAllQuestions(): Promise<Question[]> {
  const db = await getDB();
  const tx = db.transaction(STORE_QUESTIONS, "readonly");
  const store = tx.objectStore(STORE_QUESTIONS);
  return requestToPromise(store.getAll());
}

/**
 * idを指定してQuestionを1件取得する
 */
export async function getQuestion(id: number): Promise<Question | undefined> {
  const db = await getDB();
  const tx = db.transaction(STORE_QUESTIONS, "readonly");
  const store = tx.objectStore(STORE_QUESTIONS);
  return requestToPromise(store.get(id));
}

/**
 * Questionを複数件まとめて保存（新規追加/上書き更新）する
 */
export async function saveQuestions(questions: Question[]): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(STORE_QUESTIONS, "readwrite");
  const store = tx.objectStore(STORE_QUESTIONS);

  for (const question of questions) {
    store.put(question);
  }

  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
