"use client";

import { useState, useEffect } from "react";
import { Save } from "lucide-react";

interface ExamItem {
  code: string;
  name_en?: string;
  name_th?: string;
  date_raw?: string;
  start_time?: string;
  end_time?: string;
  midterm_en?: string;
  midterm_th?: string;
  finals_en?: string;
  finals_th?: string;
}

interface ExamScheduleTableProps {
  year: number;
  term: number;
  token: string;
  onSaveSuccess: () => void;
}

export default function ExamScheduleTable({
  year,
  term,
  token,
  onSaveSuccess,
}: ExamScheduleTableProps) {
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    fetchExams();
  }, [year, term]);

  const fetchExams = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/schedule/exam?year=${year}&term=${term}`);
      if (res.ok) {
        const data: ExamItem[] = await res.json();
        setExams(data);
      }
    } catch (err) {
      console.error("Failed to fetch exam schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRow = () => {
    setExams([
      ...exams,
      {
        code: `CPE ${300 + exams.length + 1}`,
        name_th: "",
        date_raw: "2026-10-15",
        start_time: "09:00",
        end_time: "12:00",
      },
    ]);
  };

  const handleRemoveRow = (index: number) => {
    setExams(exams.filter((_, idx) => idx !== index));
  };

  const handleChange = (index: number, field: keyof ExamItem, value: string) => {
    const updated = [...exams];
    updated[index] = { ...updated[index], [field]: value };
    setExams(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch(`${backendUrl}/schedule/exam`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          year,
          term,
          exams,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save exam schedule");
      }

      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || "Error saving exam schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Exam Schedule Spreadsheet (Year {year}, Term {term})
          </h3>
          <p className="text-xs text-zinc-500">Edit exam dates, start/end times, and subjects.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleAddRow}
            className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-xs rounded-xl transition-all cursor-pointer"
          >
            + Add Row
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-xs rounded-xl shadow-xs active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Exam Schedule"}</span>
          </button>
        </div>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}

      {loading ? (
        <div className="p-12 text-center text-zinc-500">Loading exams...</div>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-bold">Course Code *</th>
                <th className="p-3 font-bold">Name (TH)</th>
                <th className="p-3 font-bold">Exam Date</th>
                <th className="p-3 font-bold">Start Time</th>
                <th className="p-3 font-bold">End Time</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {exams.map((item, idx) => (
                <tr key={idx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.code}
                      onChange={(e) => handleChange(idx, "code", e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg font-bold"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.name_th || ""}
                      onChange={(e) => handleChange(idx, "name_th", e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="date"
                      value={item.date_raw || ""}
                      onChange={(e) => handleChange(idx, "date_raw", e.target.value)}
                      className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.start_time || ""}
                      onChange={(e) => handleChange(idx, "start_time", e.target.value)}
                      className="w-24 p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center"
                    />
                  </td>
                  <td className="p-2">
                    <input
                      type="text"
                      value={item.end_time || ""}
                      onChange={(e) => handleChange(idx, "end_time", e.target.value)}
                      className="w-24 p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-center"
                    />
                  </td>
                  <td className="p-2 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveRow(idx)}
                      className="px-2.5 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/30 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg font-bold text-xs cursor-pointer"
                      title="Remove Row"
                    >
                      Remove Row
                    </button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-zinc-400">
                    No exam schedules added. Click &quot;+ Add Row&quot; above to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
