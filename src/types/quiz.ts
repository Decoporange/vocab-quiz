/**
 * クイズの出題方向
 * - en-to-ja: 英語を見て正しい日本語訳を選ぶ
 * - ja-to-en: 日本語訳を見て正しい英熟語を選ぶ
 */
export type QuizDirection = "en-to-ja" | "ja-to-en";

/**
 * 4択の選択肢1つ分
 */
export interface QuizChoice {
  questionId: number;
  text: string;
  isCorrect: boolean;
}

/**
 * 1問分の回答記録（Result画面表示用）
 */
export interface QuizAnswerRecord {
  questionId: number;
  english: string;
  japanese: string;
  isCorrect: boolean;
}

/**
 * 1回のクイズセッションの結果サマリー（Result画面表示用）
 */
export interface QuizResultSummary {
  total: number;
  correct: number;
  wrong: number;
  records: QuizAnswerRecord[];
}
