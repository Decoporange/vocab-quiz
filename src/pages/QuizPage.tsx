import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllQuestions, getSettings, getStudyData, saveStudyData } from "../db";
import { generateQuizChoices, resolveSessionQuestionCount, updateStudyDataForAnswer } from "../lib";
import type { Question, QuizAnswerRecord, QuizChoice, Settings, StudyData } from "../types";
import { createDefaultStudyData } from "../types";
import Card from "../components/Card";
import Button from "../components/Button";
import ProgressBar from "../components/ProgressBar";
import StreakBadge from "../components/StreakBadge";

const EXPLANATION_LABEL: Record<Question["explanationType"], string> = {
  synonym: "類義語",
  antonym: "対義語",
  note: "メモ"
};

/** 配列からcount件を重複なくランダムに抽出する（出題する問題の選定用） */
function pickRandomQuestions(questions: Question[], count: number): Question[] {
  const pool = [...questions];
  const size = Math.min(count, pool.length);
  const result: Question[] = [];

  for (let i = 0; i < size; i++) {
    const index = Math.floor(Math.random() * pool.length);
    result.push(pool[index]);
    pool.splice(index, 1);
  }

  return result;
}

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | {
      status: "ready";
      settings: Settings;
      allQuestions: Question[];
      rangeQuestions: Question[];
      sessionQuestions: Question[];
    };

export default function QuizPage() {
  const navigate = useNavigate();
  const [loadState, setLoadState] = useState<LoadState>({ status: "loading" });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [choices, setChoices] = useState<QuizChoice[]>([]);
  const [currentStudyData, setCurrentStudyData] = useState<StudyData | null>(null);
  const [selectedChoice, setSelectedChoice] = useState<QuizChoice | null>(null);
  const [answered, setAnswered] = useState(false);
  const [records, setRecords] = useState<QuizAnswerRecord[]>([]);

  // 初回ロード: 設定・全問題を取得し、出題範囲でセッション問題を確定する
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [settings, allQuestions] = await Promise.all([getSettings(), getAllQuestions()]);
        if (cancelled) return;

        const rangeQuestions = allQuestions.filter(
          (q) => q.id >= settings.rangeStart && q.id <= settings.rangeEnd
        );

        if (rangeQuestions.length === 0) {
          setLoadState({ status: "error", message: "出題範囲に該当する問題がありません" });
          return;
        }

        const sessionCount = resolveSessionQuestionCount(settings.questionCount, rangeQuestions.length);
        const sessionQuestions = pickRandomQuestions(rangeQuestions, sessionCount);
        setLoadState({ status: "ready", settings, allQuestions, rangeQuestions, sessionQuestions });
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "クイズの読み込みに失敗しました";
        setLoadState({ status: "error", message });
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const currentQuestion = useMemo(() => {
    if (loadState.status !== "ready") return null;
    return loadState.sessionQuestions[currentIndex] ?? null;
  }, [loadState, currentIndex]);

  // 問題が切り替わるたびに、選択肢生成とStudyData取得を行う
  useEffect(() => {
    if (loadState.status !== "ready" || !currentQuestion) return;

    let cancelled = false;

    async function prepareQuestion() {
      if (loadState.status !== "ready" || !currentQuestion) return;
      try {
        const generatedChoices = generateQuizChoices(
          currentQuestion,
          loadState.rangeQuestions,
          loadState.allQuestions,
          loadState.settings.direction
        );
        const studyData =
          (await getStudyData(currentQuestion.id)) ?? createDefaultStudyData(currentQuestion.id);

        if (cancelled) return;
        setChoices(generatedChoices);
        setCurrentStudyData(studyData);
        setSelectedChoice(null);
        setAnswered(false);
      } catch (err) {
        if (cancelled) return;
        const message = err instanceof Error ? err.message : "問題の読み込みに失敗しました";
        setLoadState({ status: "error", message });
      }
    }

    prepareQuestion();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  if (loadState.status === "loading") {
    return (
      <div className="app-shell">
        <div className="top-bar">
          <span className="top-bar-title">クイズ</span>
        </div>
        <Card>読み込み中…</Card>
      </div>
    );
  }

  if (loadState.status === "error") {
    return (
      <div className="app-shell">
        <div className="top-bar">
          <span className="top-bar-title">クイズ</span>
        </div>
        <div className="message error">{loadState.message}</div>
        <Button onClick={() => navigate("/")}>ホームに戻る</Button>
      </div>
    );
  }

  if (!currentQuestion || !currentStudyData) {
    return (
      <div className="app-shell">
        <div className="top-bar">
          <span className="top-bar-title">クイズ</span>
        </div>
        <Card>読み込み中…</Card>
      </div>
    );
  }

  const direction = loadState.settings.direction;
  const questionText = direction === "en-to-ja" ? currentQuestion.english : currentQuestion.japanese;
  const total = loadState.sessionQuestions.length;
  const isLastAnswerCorrect = selectedChoice?.isCorrect ?? false;

  async function handleSelect(choice: QuizChoice) {
    if (answered || !currentStudyData || !currentQuestion) return;

    setSelectedChoice(choice);
    setAnswered(true);

    const updated = updateStudyDataForAnswer(currentStudyData, choice.isCorrect);
    await saveStudyData(updated);
    setCurrentStudyData(updated);

    setRecords((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        english: currentQuestion.english,
        japanese: currentQuestion.japanese,
        isCorrect: choice.isCorrect
      }
    ]);
  }

  function handleNext() {
    if (currentIndex + 1 >= total) {
      const correct = records.filter((r) => r.isCorrect).length;
      navigate("/result", {
        state: {
          total: records.length,
          correct,
          wrong: records.length - correct,
          records
        }
      });
      return;
    }

    setCurrentIndex((i) => i + 1);
  }

  return (
    <div className="app-shell">
      <div className="top-bar">
        <span className="top-bar-title">
          {currentIndex + 1} / {total}
        </span>
        <StreakBadge streak={currentStudyData.streak} />
      </div>

      <ProgressBar value={currentIndex + 1} max={total} />

      <Card>
        <div className="card-row">
          <span className="label">{currentQuestion.id}</span>
          <span className="question-text">{questionText}</span>
        </div>
      </Card>

      <div className="choice-list">
        {choices.map((choice) => {
          let stateClass = "";
          if (answered) {
            if (choice.isCorrect) {
              stateClass = "correct";
            } else if (choice === selectedChoice) {
              stateClass = "wrong";
            }
          }

          return (
            <button
              key={choice.questionId}
              type="button"
              className={["choice-btn", stateClass, answered ? "disabled" : ""]
                .filter(Boolean)
                .join(" ")}
              onClick={() => handleSelect(choice)}
            >
              {choice.text}
            </button>
          );
        })}
      </div>

      {answered && (
        <>
          <div className={`message ${isLastAnswerCorrect ? "success" : "error"}`}>
            {isLastAnswerCorrect ? "正解！" : "不正解"}
          </div>

          {currentQuestion.explanation && (
            <Card>
              <div className="card-row">
                <span className="label">{EXPLANATION_LABEL[currentQuestion.explanationType]}</span>
                <span>{currentQuestion.explanation}</span>
              </div>
            </Card>
          )}

          <Button onClick={handleNext}>{currentIndex + 1 >= total ? "結果を見る" : "次の問題へ"}</Button>
        </>
      )}
    </div>
  );
}
