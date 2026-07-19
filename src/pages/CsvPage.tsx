import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuestions, importQuestions } from "../db";
import { parseQuestionsCsv } from "../lib";
import Card from "../components/Card";

type Status =
  | { type: "success"; text: string }
  | { type: "error"; text: string };

export default function CsvPage() {
  const navigate = useNavigate();
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<Status | null>(null);
  const [importing, setImporting] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  useEffect(() => {
    refreshCount();
  }, []);

  async function refreshCount() {
    try {
      const questions = await getAllQuestions();
      setTotalQuestions(questions.length);
      setLoadError(null);
    } catch (err) {
      setLoadError(toMessage(err, "登録問題数の取得に失敗しました"));
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setFileName(file.name);
    setImporting(true);
    setStatus(null);

    try {
      if (!file.name.toLowerCase().endsWith(".csv")) {
        throw new Error("CSVファイル(.csv)を選択してください");
      }

      const text = await file.text();

      if (text.trim().length === 0) {
        throw new Error("ファイルが空です");
      }

      const questions = parseQuestionsCsv(text);

      if (questions.length === 0) {
        throw new Error("読み込める問題が0件でした。フォーマットを確認してください");
      }

      await importQuestions(questions);
      await refreshCount();
      setStatus({ type: "success", text: `${questions.length}件のCSVを取り込みました` });
    } catch (err) {
      setStatus({ type: "error", text: toMessage(err, "CSVの読み込みに失敗しました") });
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <span className="top-bar-title">CSV管理</span>
      </div>

      <Card>
        <div className="card-row">
          <span className="label">登録問題数</span>
          <span className="value-large">{totalQuestions ?? "…"}</span>
        </div>
      </Card>

      {loadError && (
        <div className="message error">
          {loadError}
          <button type="button" className="link-btn" onClick={refreshCount}>
            再読み込み
          </button>
        </div>
      )}

      <Card>
        <div className="card-row">
          <span className="label">CSVファイルを選択</span>

          <label className={["btn", "btn-primary", importing ? "btn-disabled-look" : ""].filter(Boolean).join(" ")}>
            {importing ? "取り込み中…" : "ファイルを選ぶ"}
            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={importing}
              className="file-input-hidden"
            />
          </label>

          {fileName && <span className="file-name">選択中: {fileName}</span>}

          <span className="hint-text">
            列の順序: id, english, japanese, explanation_type, explanation
            <br />
            explanation_type は synonym / antonym / note のいずれか
          </span>
        </div>
      </Card>

      {status && (
        <div className={`message ${status.type}`}>
          <pre className="message-pre">{status.text}</pre>
        </div>
      )}

      <button type="button" className="link-btn" onClick={() => navigate("/")}>
        ホームに戻る
      </button>
    </div>
  );
}

function toMessage(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}
