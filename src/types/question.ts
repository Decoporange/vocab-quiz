/**
 * 解説の種別
 */
export type ExplanationType = "synonym" | "antonym" | "note";

/**
 * Vintage熟語の問題データ（CSVから読み込む）
 */
export interface Question {
  id: number;
  english: string;
  japanese: string;
  explanationType: ExplanationType;
  explanation: string;
}
