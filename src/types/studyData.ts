/**
 * 問題ごとの学習データ。CSV（Question）とは別管理。
 */
export interface StudyData {
  id: number;
  score: number;
  correct: number;
  wrong: number;
  streak: number;
}

/**
 * 新規問題に割り当てる学習データの初期値
 */
export const DEFAULT_STUDY_DATA: Omit<StudyData, "id"> = {
  score: 50,
  correct: 0,
  wrong: 0,
  streak: 0
};

/**
 * 指定idの初期StudyDataを生成する
 */
export function createDefaultStudyData(id: number): StudyData {
  return { id, ...DEFAULT_STUDY_DATA };
}
