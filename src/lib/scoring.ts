import type { StudyData } from "../types";

/** 不正解時のscore減少幅（固定） */
export const WRONG_ANSWER_PENALTY = 15;

/** 正解時の基本加点 */
export const CORRECT_ANSWER_BASE_BONUS = 5;

/** 正解時のstreak連動ボーナスの倍率 */
export const CORRECT_ANSWER_STREAK_MULTIPLIER = 2;

/** 正解時の加点上限 */
export const CORRECT_ANSWER_MAX_BONUS = 20;

/** scoreの下限/上限 */
export const SCORE_MIN = 0;
export const SCORE_MAX = 100;

/**
 * scoreを0〜100の範囲にclampする
 */
export function clampScore(score: number): number {
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, score));
}

/**
 * 正解時の加点を計算する。
 * newStreak: この正解によって更新された後のstreak値
 * 加点 = 基本+5 + streak*2（上限+20）
 */
export function calculateCorrectBonus(newStreak: number): number {
  const bonus = CORRECT_ANSWER_BASE_BONUS + newStreak * CORRECT_ANSWER_STREAK_MULTIPLIER;
  return Math.min(bonus, CORRECT_ANSWER_MAX_BONUS);
}

/**
 * 正解時のStudyData更新。
 * - streakを+1
 * - streak連動ボーナスをscoreに加算（0〜100でclamp）
 * - correctを+1
 */
export function applyCorrectAnswer(studyData: StudyData): StudyData {
  const newStreak = studyData.streak + 1;
  const bonus = calculateCorrectBonus(newStreak);

  return {
    ...studyData,
    score: clampScore(studyData.score + bonus),
    correct: studyData.correct + 1,
    streak: newStreak
  };
}

/**
 * 不正解時のStudyData更新。
 * - streakを0にリセット
 * - scoreを固定-15（0〜100でclamp）
 * - wrongを+1
 */
export function applyWrongAnswer(studyData: StudyData): StudyData {
  return {
    ...studyData,
    score: clampScore(studyData.score - WRONG_ANSWER_PENALTY),
    wrong: studyData.wrong + 1,
    streak: 0
  };
}

/**
 * 回答結果に応じてStudyDataを更新する（正解/不正解の分岐窓口）
 */
export function updateStudyDataForAnswer(studyData: StudyData, isCorrect: boolean): StudyData {
  return isCorrect ? applyCorrectAnswer(studyData) : applyWrongAnswer(studyData);
}
