import { describe, expect, it } from "vitest";
import { parseQuestionsCsv } from "./csvParser";

describe("parseQuestionsCsv", () => {
  it("ヘッダー行ありのCSVを正しくパースする", () => {
    const csv = [
      "id,english,japanese,explanation_type,explanation",
      "980,watch out,気をつける/警戒する,synonym,look out / be careful"
    ].join("\n");

    const result = parseQuestionsCsv(csv);

    expect(result).toEqual([
      {
        id: 980,
        english: "watch out",
        japanese: "気をつける/警戒する",
        explanationType: "synonym",
        explanation: "look out / be careful"
      }
    ]);
  });

  it("ヘッダー行なしのCSVも正しくパースする", () => {
    const csv = "981,give up,あきらめる,synonym,abandon";
    const result = parseQuestionsCsv(csv);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe(981);
  });

  it("複数行を正しくパースする", () => {
    const csv = [
      "id,english,japanese,explanation_type,explanation",
      "980,watch out,気をつける,synonym,look out",
      "981,give up,あきらめる,synonym,abandon"
    ].join("\n");

    const result = parseQuestionsCsv(csv);
    expect(result).toHaveLength(2);
    expect(result.map((q) => q.id)).toEqual([980, 981]);
  });

  it("ダブルクォートで囲まれ、カンマを含むフィールドを正しく扱う", () => {
    const csv = [
      "id,english,japanese,explanation_type,explanation",
      '982,"look, listen","見る、聞く",note,"comma, test"'
    ].join("\n");

    const result = parseQuestionsCsv(csv);
    expect(result[0].english).toBe("look, listen");
    expect(result[0].japanese).toBe("見る、聞く");
    expect(result[0].explanation).toBe("comma, test");
  });

  it("explanation_typeが不正な場合はエラーを投げる", () => {
    const csv = [
      "id,english,japanese,explanation_type,explanation",
      "980,watch out,気をつける,invalid_type,look out"
    ].join("\n");

    expect(() => parseQuestionsCsv(csv)).toThrow();
  });

  it("idが数値でない場合はエラーを投げる", () => {
    const csv = [
      "id,english,japanese,explanation_type,explanation",
      "abc,watch out,気をつける,synonym,look out"
    ].join("\n");

    expect(() => parseQuestionsCsv(csv)).toThrow();
  });

  it("空文字列の場合は空配列を返す", () => {
    expect(parseQuestionsCsv("")).toEqual([]);
  });
});
