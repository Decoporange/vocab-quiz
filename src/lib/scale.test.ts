import { describe, expect, it } from "vitest";
import type { Question } from "../types";
import { parseQuestionsCsv } from "./csvParser";
import { generateQuizChoices } from "./quizGenerator";

const RANGE_START = 848;
const RANGE_END = 1323; // 848〜1323 = 476問

function buildCsv(count: number): string {
  const header = "id,english,japanese,explanation_type,explanation";
  const rows: string[] = [header];

  for (let i = 0; i < count; i++) {
    const id = RANGE_START + i;
    rows.push(`${id},phrase ${id},意味 ${id},synonym,syn ${id}`);
  }

  return rows.join("\n");
}

describe("476問規模での動作確認", () => {
  it("848〜1323の476件をCSVから正しくパースできる", () => {
    const csv = buildCsv(RANGE_END - RANGE_START + 1);
    const questions = parseQuestionsCsv(csv);

    expect(questions).toHaveLength(476);
    expect(questions[0].id).toBe(848);
    expect(questions[questions.length - 1].id).toBe(1323);
  });

  it("476件規模でも4択が範囲内から正しく生成される（en-to-ja）", () => {
    const csv = buildCsv(RANGE_END - RANGE_START + 1);
    const questions = parseQuestionsCsv(csv);
    const target = questions[100];

    for (let i = 0; i < 50; i++) {
      const choices = generateQuizChoices(target, questions, questions, "en-to-ja");
      expect(choices).toHaveLength(4);
      expect(choices.filter((c) => c.isCorrect)).toHaveLength(1);
      expect(new Set(choices.map((c) => c.questionId)).size).toBe(4);
    }
  });

  it("範囲を狭く絞った場合でも不足分が全体から正しく補充される", () => {
    const csv = buildCsv(RANGE_END - RANGE_START + 1);
    const allQuestions = parseQuestionsCsv(csv);
    // 出題範囲を2件だけに絞る（target自身以外は1件しか範囲内候補がない）
    const narrowRange: Question[] = allQuestions.slice(0, 2);
    const target = narrowRange[0];

    const choices = generateQuizChoices(target, narrowRange, allQuestions, "en-to-ja");
    const wrongIds = choices.filter((c) => !c.isCorrect).map((c) => c.questionId);

    expect(wrongIds).toHaveLength(3);
    expect(new Set(wrongIds).size).toBe(3);
    // 範囲内唯一の候補が含まれている
    expect(wrongIds).toContain(narrowRange[1].id);
  });

  it("476件規模のCSVパース+4択生成が実用的な時間で完了する", () => {
    const csv = buildCsv(RANGE_END - RANGE_START + 1);
    const start = performance.now();

    const questions = parseQuestionsCsv(csv);
    for (const target of questions) {
      generateQuizChoices(target, questions, questions, "en-to-ja");
    }

    const elapsedMs = performance.now() - start;
    expect(elapsedMs).toBeLessThan(2000);
  });
});
