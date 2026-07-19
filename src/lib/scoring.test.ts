import { describe, expect, it } from "vitest";
import type { StudyData } from "../types";
import {
  applyCorrectAnswer,
  applyWrongAnswer,
  calculateCorrectBonus,
  clampScore,
  updateStudyDataForAnswer
} from "./scoring";

function makeStudyData(overrides: Partial<StudyData> = {}): StudyData {
  return { id: 1, score: 50, correct: 0, wrong: 0, streak: 0, ...overrides };
}

describe("clampScore", () => {
  it("範囲内の値はそのまま返す", () => {
    expect(clampScore(50)).toBe(50);
  });

  it("100を超える場合は100にclampする", () => {
    expect(clampScore(120)).toBe(100);
  });

  it("0未満の場合は0にclampする", () => {
    expect(clampScore(-30)).toBe(0);
  });
});

describe("calculateCorrectBonus", () => {
  it("streak=1なら 5 + 1*2 = 7", () => {
    expect(calculateCorrectBonus(1)).toBe(7);
  });

  it("streak=7なら 5 + 7*2 = 19", () => {
    expect(calculateCorrectBonus(7)).toBe(19);
  });

  it("streak=8で上限20をこえるため20にcapされる (5+16=21→20)", () => {
    expect(calculateCorrectBonus(8)).toBe(20);
  });

  it("streakが大きくても上限20を超えない", () => {
    expect(calculateCorrectBonus(100)).toBe(20);
  });
});

describe("applyCorrectAnswer", () => {
  it("streak0からの正解: streak1, bonus7, score57, correct+1", () => {
    const result = applyCorrectAnswer(makeStudyData({ score: 50, streak: 0, correct: 3 }));
    expect(result.streak).toBe(1);
    expect(result.score).toBe(57);
    expect(result.correct).toBe(4);
  });

  it("streak7からの正解: streak8, bonusは20にcapされる", () => {
    const result = applyCorrectAnswer(makeStudyData({ score: 50, streak: 7 }));
    expect(result.streak).toBe(8);
    expect(result.score).toBe(70);
  });

  it("scoreが上限を超える場合は100にclampされる", () => {
    const result = applyCorrectAnswer(makeStudyData({ score: 95, streak: 0 }));
    expect(result.score).toBe(100);
  });

  it("wrongやidは変化しない", () => {
    const result = applyCorrectAnswer(makeStudyData({ wrong: 2, id: 999 }));
    expect(result.wrong).toBe(2);
    expect(result.id).toBe(999);
  });
});

describe("applyWrongAnswer", () => {
  it("scoreが15減少し、streakが0にリセットされ、wrongが+1される", () => {
    const result = applyWrongAnswer(makeStudyData({ score: 50, streak: 5, wrong: 1 }));
    expect(result.score).toBe(35);
    expect(result.streak).toBe(0);
    expect(result.wrong).toBe(2);
  });

  it("scoreが下限を下回る場合は0にclampされる", () => {
    const result = applyWrongAnswer(makeStudyData({ score: 5 }));
    expect(result.score).toBe(0);
  });

  it("correctは変化しない", () => {
    const result = applyWrongAnswer(makeStudyData({ correct: 10 }));
    expect(result.correct).toBe(10);
  });
});

describe("updateStudyDataForAnswer", () => {
  it("isCorrect=trueならapplyCorrectAnswer相当の結果になる", () => {
    const base = makeStudyData({ score: 50, streak: 0 });
    const result = updateStudyDataForAnswer(base, true);
    expect(result).toEqual(applyCorrectAnswer(base));
  });

  it("isCorrect=falseならapplyWrongAnswer相当の結果になる", () => {
    const base = makeStudyData({ score: 50, streak: 3 });
    const result = updateStudyDataForAnswer(base, false);
    expect(result).toEqual(applyWrongAnswer(base));
  });
});
