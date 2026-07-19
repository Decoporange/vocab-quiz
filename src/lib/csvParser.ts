import type { ExplanationType, Question } from "../types";

const EXPLANATION_TYPES: readonly ExplanationType[] = ["synonym", "antonym", "note"];

/**
 * CSVテキストからQuestion配列を生成する。
 * 想定フォーマット: id,english,japanese,explanation_type,explanation
 * ヘッダー行がある場合は自動的にスキップする。
 */
export function parseQuestionsCsv(csvText: string): Question[] {
  const lines = csvText
    .split(/\r\n|\n|\r/)
    .filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return [];
  }

  const startIndex = isHeaderRow(lines[0]) ? 1 : 0;
  const questions: Question[] = [];

  for (let i = startIndex; i < lines.length; i++) {
    const lineNumber = i + 1;
    const fields = parseCsvLine(lines[i]);

    if (fields.length < 5) {
      throw new Error(`CSVの${lineNumber}行目: 列数が不足しています`);
    }

    const [idText, english, japanese, explanationTypeText, explanation] = fields;

    const id = Number(idText.trim());
    if (!Number.isInteger(id)) {
      throw new Error(`CSVの${lineNumber}行目: idが不正です (${idText})`);
    }

    const explanationType = explanationTypeText.trim() as ExplanationType;
    if (!EXPLANATION_TYPES.includes(explanationType)) {
      throw new Error(
        `CSVの${lineNumber}行目: explanation_typeが不正です (${explanationTypeText})`
      );
    }

    questions.push({
      id,
      english: english.trim(),
      japanese: japanese.trim(),
      explanationType,
      explanation: explanation.trim()
    });
  }

  return questions;
}

/**
 * 先頭行がヘッダー行かどうかを判定する（1列目が"id"かどうかで判定）
 */
function isHeaderRow(line: string): boolean {
  const firstField = parseCsvLine(line)[0]?.trim().toLowerCase();
  return firstField === "id";
}

/**
 * CSVの1行をフィールド配列に分解する。
 * ダブルクォート囲み・カンマを含むフィールド・""によるエスケープに対応する。
 */
function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (inQuotes) {
      if (char === '"') {
        if (line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        fields.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }

  fields.push(current);
  return fields;
}
