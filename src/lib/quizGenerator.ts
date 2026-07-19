import type { Question, QuizChoice, QuizDirection } from "../types";

/**
 * 出題方向に応じて、選択肢として表示するフィールドを返す
 */
function getDisplayField(direction: QuizDirection): "english" | "japanese" {
  return direction === "en-to-ja" ? "japanese" : "english";
}

/**
 * 対象問題に対する4択の選択肢を生成する。
 *
 * ルール:
 * - 不正解候補はまず現在の出題範囲内（rangeQuestions）から選ぶ
 * - 範囲内だけで3件確保できない場合のみ、登録済み全問題（allQuestions）から不足分を補充する
 * - 不正解3つは対象問題および互いに異なるid（重複なし）
 * - 表示フィールドの値が正解と完全一致する問題は不正解候補から除外する
 *   （4択内に正解が複数生まれることを防ぐため）
 * - 範囲内・全体を合わせても3件確保できない場合はエラーとする
 */
export function generateQuizChoices(
  targetQuestion: Question,
  rangeQuestions: Question[],
  allQuestions: Question[],
  direction: QuizDirection
): QuizChoice[] {
  const field = getDisplayField(direction);
  const correctText = targetQuestion[field];

  const isValidCandidate = (q: Question) => q.id !== targetQuestion.id && q[field] !== correctText;

  const inRangeCandidates = rangeQuestions.filter(isValidCandidate);
  let wrongQuestions = pickRandom(inRangeCandidates, 3);

  if (wrongQuestions.length < 3) {
    const usedIds = new Set([targetQuestion.id, ...wrongQuestions.map((q) => q.id)]);
    const outsideCandidates = allQuestions.filter(
      (q) => isValidCandidate(q) && !usedIds.has(q.id)
    );
    const additionalNeeded = 3 - wrongQuestions.length;
    wrongQuestions = [...wrongQuestions, ...pickRandom(outsideCandidates, additionalNeeded)];
  }

  if (wrongQuestions.length < 3) {
    throw new Error("4択を生成するための不正解候補が不足しています");
  }

  const wrongChoices: QuizChoice[] = wrongQuestions.map((q) => ({
    questionId: q.id,
    text: q[field],
    isCorrect: false
  }));

  const correctChoice: QuizChoice = {
    questionId: targetQuestion.id,
    text: correctText,
    isCorrect: true
  };

  return shuffle([correctChoice, ...wrongChoices]);
}

/**
 * 配列から最大count件を重複なくランダムに抽出する（items.lengthがcount未満なら全件返す）
 */
function pickRandom<T>(items: T[], count: number): T[] {
  const pool = [...items];
  const size = Math.min(count, pool.length);
  const result: T[] = [];

  for (let i = 0; i < size; i++) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool[index]);
    pool.splice(index, 1);
  }

  return result;
}

/**
 * 配列をシャッフルする（Fisher-Yates）
 */
function shuffle<T>(items: T[]): T[] {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}
