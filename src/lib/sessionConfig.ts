import type { QuestionCount } from "../types";

/**
 * 設定のquestionCountと、出題範囲内で実際に利用可能な問題数から、
 * 今回のクイズセッションで出題する問題数を決定する。
 * - "all": 利用可能な全問
 * - number: 指定数と利用可能数の小さい方（指定数が利用可能数を超える場合は利用可能数に丸める）
 */
export function resolveSessionQuestionCount(
  questionCount: QuestionCount,
  availableCount: number
): number {
  if (questionCount === "all") {
    return availableCount;
  }

  return Math.min(questionCount, availableCount);
}
