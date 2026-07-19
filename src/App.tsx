import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import QuizPage from "./pages/QuizPage";
import CsvPage from "./pages/CsvPage";
import ResultPage from "./pages/ResultPage";
import StatsPage from "./pages/StatsPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/csv" element={<CsvPage />} />
      <Route path="/result" element={<ResultPage />} />
      <Route path="/stats" element={<StatsPage />} />
    </Routes>
  );
}
