"use client";

import { useState, useEffect } from "react";

interface ClassCell {
  day: string;
  time_slot: string;
  code: string;
  name_en?: string;
  name_th?: string;
  room?: string;
  instructor_en?: string;
  instructor_th?: string;
  description_en?: string;
  description_th?: string;
}

interface ClassScheduleGridProps {
  year: number;
  term: number;
  token: string;
  onSaveSuccess: () => void;
}

const DAYS = [
  { key: "monday", label: "Mon (จันทร์)", color: "bg-yellow-500/10 border-yellow-500/30 text-yellow-600 dark:text-yellow-400" },
  { key: "tuesday", label: "Tue (อังคาร)", color: "bg-pink-500/10 border-pink-500/30 text-pink-600 dark:text-pink-400" },
  { key: "wednesday", label: "Wed (พุธ)", color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" },
  { key: "thursday", label: "Thu (พฤหัส)", color: "bg-orange-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400" },
  { key: "friday", label: "Fri (ศุกร์)", color: "bg-sky-500/10 border-sky-500/30 text-sky-600 dark:text-sky-400" },
  { key: "saturday", label: "Sat (เสาร์)", color: "bg-purple-500/10 border-purple-500/30 text-purple-600 dark:text-purple-400" },
];

const TIME_SLOTS = [
  "08:00 - 09:00",
  "09:00 - 10:00",
  "10:00 - 11:00",
  "11:00 - 12:00",
  "12:00 - 13:00",
  "13:00 - 14:00",
  "14:00 - 15:00",
  "15:00 - 16:00",
  "16:00 - 17:00",
];

export default function ClassScheduleGrid({
  year,
  term,
  token,
  onSaveSuccess,
}: ClassScheduleGridProps) {
  const [cells, setCells] = useState<Map<string, ClassCell>>(new Map());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeCellKey, setActiveCellKey] = useState<string | null>(null);
  const [cellForm, setCellForm] = useState<Partial<ClassCell>>({});
  const [error, setError] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    fetchSchedule();
  }, [year, term]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/schedule/class?year=${year}&term=${term}`);
      if (res.ok) {
        const data: ClassCell[] = await res.json();
        const map = new Map<string, ClassCell>();
        data.forEach((c) => {
          map.set(`${c.day}_${c.time_slot}`, c);
        });
        setCells(map);
      }
    } catch (err) {
      console.error("Failed to fetch grid schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = (day: string, slot: string) => {
    const key = `${day}_${slot}`;
    setActiveCellKey(key);
    const existing = cells.get(key);
    setCellForm(existing ? { ...existing } : { day, time_slot: slot, code: "" });
  };

  const handleApplyCell = () => {
    if (!activeCellKey) return;

    if (!cellForm.code?.trim()) {
      const updatedMap = new Map(cells);
      updatedMap.delete(activeCellKey);
      setCells(updatedMap);
      setActiveCellKey(null);
      return;
    }

    const updatedMap = new Map(cells);
    updatedMap.set(activeCellKey, cellForm as ClassCell);
    setCells(updatedMap);
    setActiveCellKey(null);
  };

  const handleSaveAll = async () => {
    setSaving(true);
    setError("");
    const rowsList = Array.from(cells.values());

    try {
      const res = await fetch(`${backendUrl}/schedule/class`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          year,
          term,
          rows: rowsList,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save timetable");
      }

      onSaveSuccess();
    } catch (err: any) {
      setError(err.message || "Error saving schedule");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
            Class Timetable Editor (Year {year}, Term {term})
          </h3>
          <p className="text-xs text-zinc-500">Click any slot to assign or clear a course.</p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving Timetable..." : "💾 Save Timetable"}
        </button>
      </div>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-xl text-xs font-semibold">{error}</div>}

      {loading ? (
        <div className="p-12 text-center text-zinc-500">Loading grid...</div>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-zinc-100 dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-800">
                <th className="p-3 font-bold border-r border-zinc-200 dark:border-zinc-800 w-28">Time Slot</th>
                {DAYS.map((d) => (
                  <th key={d.key} className="p-3 font-bold text-center border-r border-zinc-200 dark:border-zinc-800 min-w-[120px]">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {TIME_SLOTS.map((slot) => (
                <tr key={slot} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                  <td className="p-3 font-semibold text-zinc-500 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                    {slot}
                  </td>
                  {DAYS.map((d) => {
                    const key = `${d.key}_${slot}`;
                    const cell = cells.get(key);
                    return (
                      <td
                        key={d.key}
                        onClick={() => handleCellClick(d.key, slot)}
                        className="p-2 border-r border-zinc-200 dark:border-zinc-800 cursor-pointer hover:bg-blue-50/50 dark:hover:bg-blue-950/20 transition-colors"
                      >
                        {cell ? (
                          <div className={`p-2 rounded-lg border text-center space-y-1 ${d.color}`}>
                            <div className="font-extrabold">{cell.code}</div>
                            <div className="text-[10px] truncate">{cell.name_th || cell.name_en}</div>
                            {cell.room && <div className="text-[9px] font-semibold opacity-75">📍 {cell.room}</div>}
                          </div>
                        ) : (
                          <div className="h-12 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg flex items-center justify-center text-zinc-300 dark:text-zinc-700 hover:text-zinc-500">
                            +
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Inline Cell Modal */}
      {activeCellKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <h4 className="text-base font-bold text-zinc-900 dark:text-white">Edit Course Slot</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CPE 323"
                  value={cellForm.code || ""}
                  onChange={(e) => setCellForm({ ...cellForm, code: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Course Name (TH)</label>
                <input
                  type="text"
                  value={cellForm.name_th || ""}
                  onChange={(e) => setCellForm({ ...cellForm, name_th: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Room</label>
                <input
                  type="text"
                  placeholder="e.g. 113"
                  value={cellForm.room || ""}
                  onChange={(e) => setCellForm({ ...cellForm, room: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-500 mb-1">Instructor (TH)</label>
                <input
                  type="text"
                  value={cellForm.instructor_th || ""}
                  onChange={(e) => setCellForm({ ...cellForm, instructor_th: e.target.value })}
                  className="w-full p-2 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-xs"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveCellKey(null)}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-900"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCell}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
              >
                Apply Slot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
