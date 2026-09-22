import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface QuestionResult {
  questionId: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selectedOption: number | null;
  correctAnswer: number;
  isCorrect: boolean | null;
  marksAwarded: number;
}

interface AttemptResult {
  attemptId: number;
  status: string;
  startTime: string;
  endTime: string;
  score: number;
  totalQuestions: number;
  answeredQuestions: number;
  questionResults: QuestionResult[];
}

const OPTIONS = ["A", "B", "C", "D"];

export default function ExamSubmitted() {
  const { examId } = useParams();
  const [result, setResult] = useState<AttemptResult | null>(null);
  const [activeTab, setActiveTab] = useState<"summary" | "corrections">("summary");

  useEffect(() => {
    const raw = sessionStorage.getItem(`exam_result_${examId}`);
    if (raw) {
      try {
        setResult(JSON.parse(raw));
      } catch {
        /* ignore parse errors */
      }
    }
  }, [examId]);

  const submittedAt = result?.endTime
    ? new Date(result.endTime).toLocaleString()
    : new Date().toLocaleString();

  const correct = result?.questionResults?.filter((q) => q.isCorrect === true).length ?? 0;
  const wrong = result?.questionResults?.filter((q) => q.isCorrect === false).length ?? 0;
  const unanswered = result?.questionResults?.filter((q) => q.isCorrect === null).length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-5 text-center">
        <div className="text-4xl mb-2">✅</div>
        <h1 className="text-xl font-bold text-slate-900">Exam Submitted</h1>
        <p className="text-sm text-slate-500 mt-1">Submitted at {submittedAt}</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Score card */}
        {result && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-slate-900">{Number(result.score).toFixed(2)}</p>
              <p className="text-xs text-slate-500 mt-1">Score</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-emerald-700">{correct}</p>
              <p className="text-xs text-emerald-600 mt-1">Correct</p>
            </div>
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-rose-700">{wrong}</p>
              <p className="text-xs text-rose-600 mt-1">Wrong</p>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-center shadow-sm">
              <p className="text-3xl font-bold text-slate-500">{unanswered}</p>
              <p className="text-xs text-slate-400 mt-1">Unanswered</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        {result?.questionResults && result.questionResults.length > 0 && (
          <>
            <div className="flex border-b border-slate-200 mb-4">
              <button
                onClick={() => setActiveTab("summary")}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                  activeTab === "summary"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab("corrections")}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer ${
                  activeTab === "corrections"
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                Corrections ({wrong} wrong)
              </button>
            </div>

            {/* Summary tab */}
            {activeTab === "summary" && (
              <div className="space-y-2">
                {result.questionResults.map((q, idx) => (
                  <div
                    key={q.questionId}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border text-sm ${
                      q.isCorrect === true
                        ? "bg-emerald-50 border-emerald-200"
                        : q.isCorrect === false
                        ? "bg-rose-50 border-rose-200"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        q.isCorrect === true
                          ? "bg-emerald-500 text-white"
                          : q.isCorrect === false
                          ? "bg-rose-500 text-white"
                          : "bg-slate-300 text-slate-700"
                      }`}
                    >
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate text-slate-700">{q.questionText}</span>
                    <span className={`font-semibold shrink-0 ${Number(q.marksAwarded) >= 0 ? "text-emerald-700" : "text-rose-700"}`}>
                      {Number(q.marksAwarded) >= 0 ? "+" : ""}{Number(q.marksAwarded).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Corrections tab */}
            {activeTab === "corrections" && (
              <div className="space-y-4">
                {result.questionResults.map((q, idx) => (
                  <div
                    key={q.questionId}
                    className={`bg-white border rounded-xl p-5 shadow-sm ${
                      q.isCorrect === false
                        ? "border-rose-300"
                        : q.isCorrect === true
                        ? "border-emerald-300"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <p className="text-sm font-medium text-slate-900 flex-1">
                        <span className="text-slate-400 mr-2">Q{idx + 1}.</span>
                        {q.questionText}
                      </p>
                      {q.isCorrect === true && (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full ml-2 shrink-0">✓ Correct</span>
                      )}
                      {q.isCorrect === false && (
                        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full ml-2 shrink-0">✗ Wrong</span>
                      )}
                      {q.isCorrect === null && (
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full ml-2 shrink-0">— Skipped</span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {[q.optionA, q.optionB, q.optionC, q.optionD].map((opt, i) => {
                        const isSelected = q.selectedOption === i;
                        const isCorrectAnswer = q.correctAnswer === i;
                        return (
                          <div
                            key={i}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                              isCorrectAnswer
                                ? "bg-emerald-50 border-emerald-400 text-emerald-900 font-semibold"
                                : isSelected && !isCorrectAnswer
                                ? "bg-rose-50 border-rose-400 text-rose-900"
                                : "bg-slate-50 border-slate-200 text-slate-600"
                            }`}
                          >
                            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isCorrectAnswer
                                ? "bg-emerald-500 text-white"
                                : isSelected
                                ? "bg-rose-500 text-white"
                                : "bg-slate-200 text-slate-500"
                            }`}>
                              {OPTIONS[i]}
                            </span>
                            <span>{opt}</span>
                            {isCorrectAnswer && (
                              <span className="ml-auto text-emerald-600 text-xs">✓ Correct</span>
                            )}
                            {isSelected && !isCorrectAnswer && (
                              <span className="ml-auto text-rose-600 text-xs">Your answer</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {!result && (
          <div className="text-center text-slate-500 py-10">
            <p>Your answers have been recorded.</p>
            <p className="text-sm mt-1">Result details are not available for this session.</p>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/exams"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Back to Exams
          </Link>
        </div>
      </div>
    </div>
  );
}
