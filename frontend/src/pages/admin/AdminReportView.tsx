import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, BASE_URL, getToken } from "../../api/client";
import type { AdminAttemptReport } from "../../types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export default function AdminReportView() {
  const { examId, attemptId } = useParams();
  const [report, setReport] = useState<AdminAttemptReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!attemptId) return;
    setLoading(true);
    api
      .get<AdminAttemptReport>(`/api/admin/attempts/${attemptId}/report`, "admin")
      .then(setReport)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [attemptId]);

  async function handleExport(format: "pdf" | "csv" | "excel") {
    if (!attemptId) return;
    setDownloading(format);
    try {
      const res = await fetch(
        `${BASE_URL}/api/admin/attempts/${attemptId}/report/export?format=${format}`,
        {
          headers: {
            Authorization: `Bearer ${getToken("admin")}`,
          },
        }
      );
      if (!res.ok) throw new Error(`Export failed with status ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const ext = format === "excel" ? "xlsx" : format;
      const a = document.createElement("a");
      a.href = url;
      a.download = `attempt-${attemptId}-report.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Export failed");
    } finally {
      setDownloading(null);
    }
  }

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mb-3"></div>
        <p>Loading full proctoring report…</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <Link to={`/admin/exams/${examId}`} className="text-blue-600 hover:underline text-sm mb-4 inline-block">
          ← Back to Exam
        </Link>
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error || "Report not found"}
        </div>
      </div>
    );
  }

  const riskScore = report.currentRiskScore ?? 0;
  const riskColor =
    riskScore >= 75
      ? "text-rose-600 bg-rose-50 border-rose-200"
      : riskScore >= 40
      ? "text-amber-600 bg-amber-50 border-amber-200"
      : "text-emerald-600 bg-emerald-50 border-emerald-200";

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <Link
            to={`/admin/exams/${examId}`}
            className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors inline-flex items-center gap-1 mb-1"
          >
            ← Back to Exam Management
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            Proctoring Report: Attempt #{report.attemptId}
          </h1>
          <p className="text-sm text-slate-500">
            Exam: <span className="font-semibold text-slate-700">{report.examName}</span>{" "}
            {report.examSubject && `(${report.examSubject})`}
          </p>
        </div>

        {/* Export Toolbar */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 mr-1 font-medium">Export:</span>
          <button
            onClick={() => handleExport("pdf")}
            disabled={downloading !== null}
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {downloading === "pdf" ? "Exporting…" : "📄 PDF"}
          </button>
          <button
            onClick={() => handleExport("excel")}
            disabled={downloading !== null}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {downloading === "excel" ? "Exporting…" : "📊 Excel"}
          </button>
          <button
            onClick={() => handleExport("csv")}
            disabled={downloading !== null}
            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-800 text-white text-xs font-semibold rounded-md shadow-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {downloading === "csv" ? "Exporting…" : "📋 CSV"}
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Student</span>
          <p className="text-lg font-semibold text-slate-900 mt-1">{report.studentEmail}</p>
          {report.studentName && <p className="text-sm text-slate-500">{report.studentName}</p>}
          <p className="text-xs text-slate-400 mt-2">Attempt Number: #{report.attemptNumber}</p>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Status & Score</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                report.status === "SUBMITTED"
                  ? "bg-green-100 text-green-800"
                  : "bg-blue-100 text-blue-800"
              }`}
            >
              {report.status}
            </span>
            {report.flaggedForReview && (
              <span className="text-xs px-2 py-0.5 rounded font-bold bg-rose-600 text-white uppercase">
                FLAGGED
              </span>
            )}
          </div>
          <p className="text-xl font-bold text-slate-900 mt-2">
            Score: {report.score !== null ? `${report.score} pts` : "Pending"}
          </p>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Risk Assessment</span>
          <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-lg border text-xl font-extrabold ${riskColor}`}>
            {riskScore.toFixed(1)} / 100
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {riskScore >= 75 ? "High risk of academic misconduct" : riskScore >= 40 ? "Moderate suspicious activity" : "Low anomaly level"}
          </p>
        </div>

        <div>
          <span className="text-xs uppercase tracking-wider text-slate-400 font-bold">Timing</span>
          <p className="text-xs text-slate-600 mt-1">
            Started: {report.startTime ? new Date(report.startTime).toLocaleString() : "—"}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            Ended: {report.endTime ? new Date(report.endTime).toLocaleString() : "—"}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Duration limit: {report.examDurationMinutes} minutes
          </p>
        </div>
      </div>

      {/* Event Metrics Counter Row */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">Total Events</span>
          <p className="text-xl font-bold text-slate-800 mt-1">{report.totalEvents}</p>
        </div>
        <div className="bg-white border border-red-200 rounded-lg p-3 text-center bg-red-50/30">
          <span className="text-xs text-red-600 uppercase font-semibold">Critical / High</span>
          <p className="text-xl font-bold text-red-700 mt-1">{report.criticalEvents + report.highEvents}</p>
        </div>
        <div className="bg-white border border-amber-200 rounded-lg p-3 text-center bg-amber-50/30">
          <span className="text-xs text-amber-600 uppercase font-semibold">Medium</span>
          <p className="text-xl font-bold text-amber-700 mt-1">{report.mediumEvents}</p>
        </div>
        <div className="bg-white border border-yellow-200 rounded-lg p-3 text-center bg-yellow-50/30">
          <span className="text-xs text-yellow-600 uppercase font-semibold">Low</span>
          <p className="text-xl font-bold text-yellow-700 mt-1">{report.lowEvents}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <span className="text-xs text-slate-400 uppercase font-semibold">Info</span>
          <p className="text-xl font-bold text-slate-600 mt-1">{report.infoEvents}</p>
        </div>
        <div className="bg-white border border-purple-200 rounded-lg p-3 text-center bg-purple-50/30">
          <span className="text-xs text-purple-600 uppercase font-semibold">Warnings</span>
          <p className="text-xl font-bold text-purple-700 mt-1">{report.warnings.length}</p>
        </div>
      </div>

      {/* Risk Score Timeline Graph */}
      {report.riskTimeline && report.riskTimeline.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
          <div className="mb-4">
            <h3 className="text-base font-bold text-slate-800">Decayed Risk Score Progression</h3>
            <p className="text-xs text-slate-500">
              Evaluated over time with exponential decay. Spikes indicate anomaly density.
            </p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.riskTimeline.map((pt) => ({
                time: new Date(pt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                score: pt.score,
                event: pt.eventType || "Anomaly",
              }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#64748b" }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#64748b" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white text-xs p-2 rounded shadow-lg">
                          <p className="font-bold">{data.time}</p>
                          <p className="text-rose-300">Risk Score: {data.score}</p>
                          <p className="text-slate-300">Event: {data.event}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#ef4444"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: "#ef4444" }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Behavioral Warnings Issued */}
      {report.warnings.length > 0 && (
        <div className="bg-white border border-amber-200 rounded-xl p-6 shadow-xs bg-amber-50/20">
          <h3 className="text-base font-bold text-amber-900 mb-3">
            Behavioral Warnings Issued During Session ({report.warnings.length})
          </h3>
          <div className="space-y-2">
            {report.warnings.map((w) => (
              <div
                key={w.id}
                className="bg-white border border-amber-200 rounded-lg p-3 flex justify-between items-center text-sm"
              >
                <div>
                  <span className="font-bold text-amber-800 text-xs px-2 py-0.5 rounded bg-amber-100 mr-2">
                    Level {w.level}
                  </span>
                  <span className="font-medium text-slate-800">{w.message}</span>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <span>Risk: {w.riskScoreAtTime} pts</span> &middot;{" "}
                  <span>{new Date(w.createdAt).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Proctoring Event Log Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Full Proctoring Event Log</h3>
            <p className="text-xs text-slate-500">All browser and computer-vision detected signals</p>
          </div>
          <span className="text-xs text-slate-400 font-medium">{report.events.length} total entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500 text-left border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 font-semibold text-xs">ID</th>
                <th className="px-4 py-3 font-semibold text-xs">Event Type</th>
                <th className="px-4 py-3 font-semibold text-xs">Severity</th>
                <th className="px-4 py-3 font-semibold text-xs">Occurred At</th>
                <th className="px-4 py-3 font-semibold text-xs">Confidence</th>
                <th className="px-4 py-3 font-semibold text-xs">Duration</th>
                <th className="px-4 py-3 font-semibold text-xs">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.events.map((ev) => {
                const sevBadge =
                  ev.severity === "CRITICAL"
                    ? "bg-purple-100 text-purple-800 border-purple-200"
                    : ev.severity === "HIGH"
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : ev.severity === "MEDIUM"
                    ? "bg-amber-100 text-amber-800 border-amber-200"
                    : ev.severity === "LOW"
                    ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                    : "bg-slate-100 text-slate-700 border-slate-200";

                return (
                  <tr key={ev.id} className="hover:bg-slate-50/60 transition-colors text-xs">
                    <td className="px-4 py-2.5 text-slate-400 font-mono">#{ev.id}</td>
                    <td className="px-4 py-2.5 font-semibold text-slate-800">{ev.eventType}</td>
                    <td className="px-4 py-2.5">
                      <span className={`px-2 py-0.5 rounded-full font-bold border ${sevBadge}`}>
                        {ev.severity}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {new Date(ev.occurredAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-2.5 text-slate-600 font-mono">
                      {(ev.confidence * 100).toFixed(0)}%
                    </td>
                    <td className="px-4 py-2.5 text-slate-600">
                      {ev.durationSeconds ? `${ev.durationSeconds}s` : "—"}
                    </td>
                    <td className="px-4 py-2.5 text-slate-500 max-w-xs truncate font-mono" title={ev.metadata || ""}>
                      {ev.metadata || "—"}
                    </td>
                  </tr>
                );
              })}
              {report.events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                    No suspicious proctoring events recorded for this session.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
