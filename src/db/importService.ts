import type { Question } from "../types";
import { createDefaultStudyData } from "../types";
import { getAllStudyData, saveStudyDataBulk } from "./studyDataRepository";
import { saveQuestions } from "./questionRepository";

/**
 * CSVから読み込んだQuestion一覧をDBに反映する。
 *
 * ルール:
 * - 既存id: Question情報を更新し、StudyDataは保持する
 * - 新規id: StudyDataを初期値で新規作成する
 */
export async function importQuestions(questions: Question[]): Promise<void> {
  const existingStudyDataList = await getAllStudyData();
  const existingIds = new Set(existingStudyDataList.map((s) => s.id));

  const newStudyDataList = questions
    .filter((q) => !existingIds.has(q.id))
    .map((q) => createDefaultStudyData(q.id));

  await saveQuestions(questions);

  if (newStudyDataList.length > 0) {
    await saveStudyDataBulk(newStudyDataList);
  }
}
