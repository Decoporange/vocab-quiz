import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuestions, getSettings, saveSettings } from "../db";
import type { QuestionCount, QuizDirection, Settings } from "../types";
import { DEFAULT_SETTINGS } from "../types";
import Card from "../components/Card";
import Button from "../components/Button";

const QUESTION_COUNT_OPTIONS: { value: QuestionCount; label: string }[] = [
  { value: 10, label: "10" },
  { value: 20, label: "20" },
  { value: 30, label: "30" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
  { value: "all", label: "全問" }
];

export default function HomePage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const [loadedSettings, questions] = await Promise.all([getSettings(), getAllQuestions()]);
      setSettings(loadedSettings);
      setTotalQuestions(questions.length);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "データの読み込みに失敗しました");
    } finally {
      setLoading(false);
    }
  }

  function updateField<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }

  async function handleStart() {
    setError(null);

    if (settings.rangeStart > settings.rangeEnd) {
      setError("開始IDは終了ID以下にしてください");
      return;
    }

    await saveSettings(settings);
    navigate("/quiz");
  }

  const canStart = !loading && (totalQuestions ?? 0) > 0;

  return (
    <div className="app-shell">
      <div className="top-bar">
        <span className="top-bar-title">Vintage熟語クイズ</span>
      </div>

      {loadError && (
        <div className="message error">
          <span>{loadError}</span>
          <button type="button" className="link-btn" onClick={load}>
            再読み込み
          </button>
        </div>
      )}

      <Card>
        <div className="card-row">
          <span className="label">登録問題数</span>
          <span className="value-large">{loading ? "…" : totalQuestions}</span>
        </div>
      </Card>

      <Card>
        <div className="card-row">
          <span className="label">出題範囲</span>
          <div className="field-row">
            <div className="field">
              <label className="label" htmlFor="range-start">
                開始ID
              </label>
              <input
                id="range-start"
                type="number"
                inputMode="numeric"
                value={settings.rangeStart}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isNaN(value)) updateField("rangeStart", value);
                }}
              />
            </div>
            <div className="field">
              <label className="label" htmlFor="range-end">
                終了ID
              </label>
              <input
                id="range-end"
                type="number"
                inputMode="numeric"
                value={settings.rangeEnd}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  if (!Number.isNaN(value)) updateField("rangeEnd", value);
                }}
              />
            </div>
          </div>

          <span className="label">出題方向</span>
          <div className="segmented">
            <button
              type="button"
              className={settings.direction === "en-to-ja" ? "active" : ""}
              onClick={() => updateField("direction", "en-to-ja" as QuizDirection)}
            >
              英 → 日
            </button>
            <button
              type="button"
              className={settings.direction === "ja-to-en" ? "active" : ""}
              onClick={() => updateField("direction", "ja-to-en" as QuizDirection)}
            >
              日 → 英
            </button>
          </div>

          <span className="label">問題数</span>
          <div className="chip-grid">
            {QUESTION_COUNT_OPTIONS.map((option) => (
              <button
                key={option.label}
                type="button"
                className={["chip", settings.questionCount === option.value ? "active" : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => updateField("questionCount", option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {error && <div className="message error">{error}</div>}

      {!loading && (totalQuestions ?? 0) === 0 && (
        <div className="message error">問題が登録されていません。CSV管理から読み込んでください。</div>
      )}

      <Button onClick={handleStart} disabled={!canStart}>
        クイズを始める
      </Button>

      <button type="button" className="link-btn" onClick={() => navigate("/csv")}>
        CSV管理
      </button>

      <button type="button" className="link-btn" onClick={() => navigate("/stats")}>
        成績を見る
      </button>
    </div>
  );
}
