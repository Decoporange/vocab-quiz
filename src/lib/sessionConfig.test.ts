import { describe, expect, it } from "vitest";
import { resolveSessionQuestionCount } from "./sessionConfig";

describe("resolveSessionQuestionCount", () => {
  it('questionCount="all"の場合、利用可能な全問数を返す', () => {
    expect(resolveSessionQuestionCount("all", 50)).toBe(50);
  });

  it('questionCount="all"かつ利用可能数が0の場合、0を返す', () => {
    expect(resolveSessionQuestionCount("all", 0)).toBe(0);
  });

  it("指定数が利用可能数以下の場合、指定数をそのまま返す", () => {
    expect(resolveSessionQuestionCount(10, 50)).toBe(10);
  });

  it("指定数が利用可能数を超える場合、利用可能数に丸める", () => {
    expect(resolveSessionQuestionCount(100, 30)).toBe(30);
  });
});
