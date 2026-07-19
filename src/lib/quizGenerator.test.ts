import { describe, expect, it } from "vitest";
import type { Question } from "../types";
import { generateQuizChoices } from "./quizGenerator";

function makeRangeQuestions(): Question[] {
  return [
    { id: 1, english: "watch out", japanese: "気をつける", explanationType: "synonym", explanation: "look out" },
    { id: 2, english: "give up", japanese: "あきらめる", explanationType: "synonym", explanation: "abandon" },
    { id: 3, english: "look forward to", japanese: "楽しみにする", explanationType: "note", explanation: "" },
    { id: 4, english: "put off", japanese: "延期する", explanationType: "synonym", explanation: "postpone" },
    { id: 5, english: "take after", japanese: "似ている", explanationType: "note", explanation: "" },
    // id:1と日本語訳が完全一致する重複データ（除外対象）
    { id: 6, english: "be careful", japanese: "気をつける", explanationType: "synonym", explanation: "" }
  ];
}

function makeOutsideQuestions(): Question[] {
  return [
    { id: 7, english: "run into", japanese: "偶然出会う", explanationType: "synonym", explanation: "" },
    { id: 8, english: "call off", japanese: "中止する", explanationType: "synonym", explanation: "" },
    { id: 9, english: "get over", japanese: "克服する", explanationType: "synonym", explanation: "" },
    { id: 10, english: "come across", japanese: "見つける", explanationType: "synonym", explanation: "" }
  ];
}

describe("generateQuizChoices - 範囲内優先", () => {
  it("範囲内に十分な候補がある場合、不正解は範囲内のみから選ばれる", () => {
    const rangeQuestions = makeRangeQuestions();
    const allQuestions = [...rangeQuestions, ...makeOutsideQuestions()];
    const target = rangeQuestions[0]; // id:1

    for (let i = 0; i < 20; i++) {
      const choices = generateQuizChoices(target, rangeQuestions, allQuestions, "en-to-ja");
      const wrongIds = choices.filter((c) => !c.isCorrect).map((c) => c.questionId);
      const outsideIds = new Set(makeOutsideQuestions().map((q) => q.id));
      wrongIds.forEach((id) => expect(outsideIds.has(id)).toBe(false));
    }
  });

  it("選択肢は4件、正解は1件のみ、idはすべて一意", () => {
    const rangeQuestions = makeRangeQuestions();
    const allQuestions = [...rangeQuestions, ...makeOutsideQuestions()];
    const target = rangeQuestions[0];
    const choices = generateQuizChoices(target, rangeQuestions, allQuestions, "en-to-ja");

    expect(choices).toHaveLength(4);
    expect(choices.filter((c) => c.isCorrect)).toHaveLength(1);
    expect(new Set(choices.map((c) => c.questionId)).size).toBe(4);
  });

  it("正解と同じjapanese(id:6)は範囲内候補から除外される", () => {
    const rangeQuestions = makeRangeQuestions();
    const allQuestions = [...rangeQuestions, ...makeOutsideQuestions()];
    const target = rangeQuestions[0];

    for (let i = 0; i < 20; i++) {
      const choices = generateQuizChoices(target, rangeQuestions, allQuestions, "en-to-ja");
      expect(choices.map((c) => c.questionId)).not.toContain(6);
    }
  });
});

describe("generateQuizChoices - 不足時のみ全体補充", () => {
  it("範囲内候補が1件しかない場合、残り2件は範囲外から補充される", () => {
    // target(id:1)以外に範囲内候補はid:2のみ
    const rangeQuestions = makeRangeQuestions().slice(0, 2); // id:1, id:2
    const allQuestions = [...makeRangeQuestions(), ...makeOutsideQuestions()];
    const target = rangeQuestions[0];

    const choices = generateQuizChoices(target, rangeQuestions, allQuestions, "en-to-ja");
    const wrongIds = choices.filter((c) => !c.isCorrect).map((c) => c.questionId);

    expect(wrongIds).toHaveLength(3);
    expect(new Set(wrongIds).size).toBe(3);
    // 範囲内の唯一の候補(id:2)は必ず含まれる
    expect(wrongIds).toContain(2);
  });

  it("範囲内候補が0件の場合、3件すべて範囲外から補充される", () => {
    const rangeQuestions = [makeRangeQuestions()[0]]; // targetのみ
    const allQuestions = [...makeRangeQuestions(), ...makeOutsideQuestions()];
    const target = rangeQuestions[0];

    const choices = generateQuizChoices(target, rangeQuestions, allQuestions, "en-to-ja");
    const wrongIds = choices.filter((c) => !c.isCorrect).map((c) => c.questionId);

    expect(wrongIds).toHaveLength(3);
    expect(new Set(wrongIds).size).toBe(3);
  });

  it("範囲内・範囲外を合わせても3件確保できない場合はエラーになる", () => {
    const target: Question = {
      id: 1,
      english: "watch out",
      japanese: "気をつける",
      explanationType: "synonym",
      explanation: ""
    };
    const rangeQuestions = [target];
    const allQuestions = [target, { ...target, id: 2 }]; // 候補1件のみ

    expect(() => generateQuizChoices(target, rangeQuestions, allQuestions, "en-to-ja")).toThrow();
  });
});

describe("generateQuizChoices (ja-to-en)", () => {
  it("表示テキストがenglishフィールドになる", () => {
    const rangeQuestions = makeRangeQuestions();
    const allQuestions = [...rangeQuestions, ...makeOutsideQuestions()];
    const target = rangeQuestions[1]; // id:2 give up

    const choices = generateQuizChoices(target, rangeQuestions, allQuestions, "ja-to-en");
    expect(choices.find((c) => c.isCorrect)?.text).toBe("give up");
  });
});
