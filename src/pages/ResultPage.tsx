import { useLocation, useNavigate } from "react-router-dom";
import type { QuizResultSummary } from "../types";
import Card from "../components/Card";
import Button from "../components/Button";

export default function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const result = location.state as QuizResultSummary | null;

  if (!result) {
    return (
      <div className="app-shell">
        <div className="top-bar">
          <span className="top-bar-title">結果</span>
        </div>
        <div className="message error">結果データがありません</div>
        <Button onClick={() => navigate("/")}>ホームに戻る</Button>
      </div>
    );
  }

  const accuracy = result.total > 0 ? Math.round((result.correct / result.total) * 100) : 0;
  const wrongRecords = result.records.filter((r) => !r.isCorrect);

  return (
    <div className="app-shell">
      <div className="top-bar">
        <span className="top-bar-title">結果</span>
      </div>

      <Card>
        <div className="card-row">
          <span className="label">正答率</span>
          <span className="value-large">{accuracy}%</span>
        </div>
      </Card>

      <div className="stat-grid">
        <Card>
          <div className="card-row">
            <span className="label">正解</span>
            <span className="value-large">{result.correct}</span>
          </div>
        </Card>
        <Card>
          <div className="card-row">
            <span className="label">不正解</span>
            <span className="value-large">{result.wrong}</span>
          </div>
        </Card>
      </div>

      {wrongRecords.length > 0 && (
        <Card>
          <div className="card-row">
            <span className="label">間違えた問題</span>
            <div>
              {wrongRecords.map((record) => (
                <div className="review-item" key={record.questionId}>
                  <span className="review-item-english">{record.english}</span>
                  <span className="review-item-japanese">{record.japanese}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}

      <Button onClick={() => navigate("/")}>ホームに戻る</Button>
    </div>
  );
}
