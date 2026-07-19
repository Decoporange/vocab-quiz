import type { QuizDirection } from "./quiz";

/**
 * 1回のクイズで出題する問題数。"all"は出題範囲内の全問を出題する。
 */
export type QuestionCount = number | "all";

/**
 * 出題設定
 * - 出題範囲（開始/終了ID）
 * - 出題方向（英→日 / 日→英）
 * - 1回のクイズで出題する問題数
 */
export interface Settings {
  rangeStart: number;
  rangeEnd: number;
  direction: QuizDirection;
  questionCount: QuestionCount;
}

/**
 * 初期設定値（問題番号848〜1323、英→日、10問）
 */
export const DEFAULT_SETTINGS: Settings = {
  rangeStart: 848,
  rangeEnd: 1323,
  direction: "en-to-ja",
  questionCount: 10
};

