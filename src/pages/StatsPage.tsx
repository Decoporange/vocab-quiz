import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuestions, getAllStudyData } from "../db";
import type { Question, StudyData } from "../types";
import Card from "../components/Card";
import Button from "../components/Button";

type ScoreCategory = "ok" | "practice" | "weak";

const CATEGORY_LABEL: Record<ScoreCategory, string> = {
  ok: "OK",
  practice: "あと一歩",
  weak: "苦手"
};

function classifyScore(score: number): ScoreCategory {
  if (score >= 80) return "ok";
  if (score >= 40) return "practice";
  return "weak";
}

interface StatsRow {
  question: Question;
  studyData: StudyData;
  category: ScoreCategory;
}

export default function StatsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<StatsRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoadError(null);
    try {
      const [questions, studyDataList] = await Promise.all([getAllQuestions(), getAllStudyData()]);

      const studyDataById = new Map(studyDataList.map((s) => [s.id, s]));

      const merged: StatsRow[] = questions
        .map((question) => {
          const studyData = studyDataById.get(question.id);
          if (!studyData) return null;
          return { question, studyData, category: classifyScore(studyData.score) };
        })
        .filter((row): row is StatsRow => row !== null)
        .sort((a, b) => a.studyData.score - b.studyData.score);

      setRows(merged);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "成績データの読み込みに失敗しました");
    }
  }

  if (!rows) {
    return (
      <div className="app-shell">
        <div className="top-bar">
          <span className="top-bar-title">成績</span>
        </div>
        {loadError ? (
          <div className="message error">
            <span>{loadError}</span>
            <button type="button" className="link-btn" onClick={load}>
              再読み込み
            </button>
          </div>
        ) : (
          <Card>読み込み中…</Card>
        )}
      </div>
    );
  }

  const okCount = rows.filter((r) => r.category === "ok").length;
  const practiceCount = rows.filter((r) => r.category === "practice").length;
  const weakCount = rows.filter((r) => r.category === "weak").length;

  const totalCorrect = rows.reduce((sum, r) => sum + r.studyData.correct, 0);
  const totalWrong = rows.reduce((sum, r) => sum + r.studyData.wrong, 0);
  const totalAttempts = totalCorrect + totalWrong;
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;

  return (
    <div className="app-shell">
      <div className="top-bar">
        <span className="top-bar-title">成績</span>
      </div>

      <Card>
        <div className="card-row">
          <span className="label">登録問題数</span>
          <span className="value-large">{rows.length}</span>
        </div>
      </Card>

      <div className="stat-grid">
        <Card>
          <div className="card-row">
            <span className="label">OK</span>
            <span className="value-large">{okCount}</span>
          </div>
        </Card>
        <Card>
          <div className="card-row">
            <span className="label">あと一歩</span>
            <span className="value-large">{practiceCount}</span>
          </div>
        </Card>
        <Card>
          <div className="card-row">
            <span className="label">苦手</span>
            <span className="value-large">{weakCount}</span>
          </div>
        </Card>
        <Card>
          <div className="card-row">
            <span className="label">正答率</span>
            <span className="value-large">{accuracy}%</span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="card-row">
          <span className="label">問題一覧（苦手順）</span>
          <div className="stats-list">
            {rows.map((row) => (
              <div className={`stats-item ${row.category}`} key={row.question.id}>
                <div className="stats-item-main">
                  <span className="stats-item-id">
                    {row.question.id} ・ {CATEGORY_LABEL[row.category]}
                  </span>
                  <span className="stats-item-english">{row.question.english}</span>
                </div>
                <div className="stats-item-meta">
                  <div>score: {row.studyData.score}</div>
                  <div>
                    correct: {row.studyData.correct} / wrong: {row.studyData.wrong}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>

      <Button onClick={() => navigate("/")}>ホームに戻る</Button>
    </div>
  );
}
