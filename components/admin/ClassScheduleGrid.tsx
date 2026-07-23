"use client";

import { useState, useEffect } from "react";
import { DotsSixVertical, ArrowsDownUp } from "@phosphor-icons/react";

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
  const [draggedOriginKey, setDraggedOriginKey] = useState<string | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

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

  // Open Edit Form
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

  // Drag & Drop Move Handlers
  const handleDragStart = (e: React.DragEvent, originKey: string) => {
    e.stopPropagation();
    setDraggedOriginKey(originKey);
    const cell = cells.get(originKey);
    if (cell) {
      e.dataTransfer.setData("text/plain", JSON.stringify({ originKey, cell }));
    }
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (dragOverKey !== targetKey) {
      setDragOverKey(targetKey);
    }
  };

  const handleDragLeave = () => {
    setDragOverKey(null);
  };

  const handleDrop = (e: React.DragEvent, targetDay: string, targetSlot: string) => {
    e.preventDefault();
    setDragOverKey(null);
    if (!draggedOriginKey) return;

    const targetKey = `${targetDay}_${targetSlot}`;
    if (draggedOriginKey === targetKey) return;

    const originCell = cells.get(draggedOriginKey);
    if (!originCell) return;

    const updatedMap = new Map(cells);
    updatedMap.delete(draggedOriginKey);
    updatedMap.set(targetKey, {
      ...originCell,
      day: targetDay,
      time_slot: targetSlot,
    });

    setCells(updatedMap);
    setDraggedOriginKey(null);
  };

  // Border Drag / Resize Actions
  const handleTopBorderClick = (e: React.MouseEvent, day: string, currentSlot: string) => {
    e.stopPropagation();
    const idx = TIME_SLOTS.indexOf(currentSlot);
    const updatedMap = new Map(cells);
    const currentKey = `${day}_${currentSlot}`;
    const currentCell = cells.get(currentKey);

    if (e.altKey || e.shiftKey) {
      // Shorten top
      updatedMap.delete(currentKey);
    } else if (idx > 0 && currentCell) {
      // Extend top
      const prevSlot = TIME_SLOTS[idx - 1];
      updatedMap.set(`${day}_${prevSlot}`, { ...currentCell, day, time_slot: prevSlot });
    }
    setCells(updatedMap);
  };

  const handleBottomBorderClick = (e: React.MouseEvent, day: string, currentSlot: string) => {
    e.stopPropagation();
    const idx = TIME_SLOTS.indexOf(currentSlot);
    const updatedMap = new Map(cells);
    const currentKey = `${day}_${currentSlot}`;
    const currentCell = cells.get(currentKey);

    if (e.altKey || e.shiftKey) {
      // Shorten bottom
      updatedMap.delete(currentKey);
    } else if (idx < TIME_SLOTS.length - 1 && currentCell) {
      // Extend bottom
      const nextSlot = TIME_SLOTS[idx + 1];
      updatedMap.set(`${day}_${nextSlot}`, { ...currentCell, day, time_slot: nextSlot });
    }
    setCells(updatedMap);
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Class Timetable (Year {year}, Term {term})</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Interactive Border Resize & Move
            </span>
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Drag card body to <b>move</b>. Click top/bottom borders to <b>extend</b> (or <b>Shift+Click</b> to shorten). Click center to edit details.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-semibold text-xs rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "💾 Save Timetable"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-400 font-mono text-xs">Loading interactive schedule grid...</div>
      ) : (
        <div className="overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900/80 shadow-sm">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400 font-mono uppercase text-[10.5px]">
                <th className="p-3 font-bold border-r border-zinc-800 w-28 text-center">Time Slot</th>
                {DAYS.map((d) => (
                  <th key={d.key} className="p-3 font-bold text-center border-r border-zinc-800 min-w-[140px]">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/80">
              {TIME_SLOTS.map((slot) => (
                <tr key={slot} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 font-mono font-medium text-zinc-400 border-r border-zinc-800 bg-zinc-950/40 text-center">
                    {slot}
                  </td>
                  {DAYS.map((d) => {
                    const key = `${d.key}_${slot}`;
                    const cell = cells.get(key);
                    const isDragOver = dragOverKey === key;

                    return (
                      <td
                        key={d.key}
                        data-day={d.key}
                        data-slot={slot}
                        onDragOver={(e) => handleDragOver(e, key)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, d.key, slot)}
                        onClick={() => handleCellClick(d.key, slot)}
                        className={`p-1 border-r border-zinc-800/80 transition-all relative ${
                          isDragOver
                            ? "bg-blue-500/20 ring-2 ring-blue-500/80 ring-inset"
                            : "hover:bg-zinc-800/50"
                        }`}
                      >
                        {cell ? (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, key)}
                            className={`p-2.5 rounded-xl border relative text-center space-y-1 group/card cursor-grab active:cursor-grabbing transition-all shadow-xs ${d.color}`}
                          >
                            {/* Top Border Resize Zone */}
                            <div
                              onClick={(e) => handleTopBorderClick(e, d.key, slot)}
                              title="Click to extend top (Shift+Click to shorten)"
                              className="absolute top-0 inset-x-0 h-2 cursor-ns-resize hover:bg-blue-500/60 rounded-t-xl transition-all z-20 group-hover/card:bg-blue-500/30"
                            />

                            {/* Card Body & Move Gripper */}
                            <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-400 pointer-events-none">
                              <DotsSixVertical size={14} className="opacity-60 group-hover/card:opacity-100" />
                              <span className="font-mono text-[9px] opacity-75">Move</span>
                            </div>
                            <div className="font-extrabold text-sm tracking-tight pointer-events-none">{cell.code}</div>
                            <div className="text-[10.5px] font-medium truncate pointer-events-none">{cell.name_th || cell.name_en}</div>
                            {cell.room && <div className="text-[9.5px] font-mono opacity-80 pointer-events-none">📍 {cell.room}</div>}

                            {/* Bottom Border Resize Zone */}
                            <div
                              onClick={(e) => handleBottomBorderClick(e, d.key, slot)}
                              title="Click to extend bottom (Shift+Click to shorten)"
                              className="absolute bottom-0 inset-x-0 h-2 cursor-ns-resize hover:bg-blue-500/60 rounded-b-xl transition-all z-20 group-hover/card:bg-blue-500/30"
                            />
                          </div>
                        ) : (
                          <div className="h-14 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-600 hover:text-zinc-300 hover:border-zinc-700 transition-all text-xs">
                            <span className="text-sm font-semibold">+</span>
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

      {/* Inline Cell Edit Modal */}
      {activeCellKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-zinc-100">Edit Class Slot</h4>
              <span className="text-xs font-mono text-zinc-400">{activeCellKey.replace("_", " @ ")}</span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CPE 323"
                  value={cellForm.code || ""}
                  onChange={(e) => setCellForm({ ...cellForm, code: e.target.value })}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Course Name (TH)</label>
                <input
                  type="text"
                  value={cellForm.name_th || ""}
                  onChange={(e) => setCellForm({ ...cellForm, name_th: e.target.value })}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Room</label>
                <input
                  type="text"
                  placeholder="e.g. 113"
                  value={cellForm.room || ""}
                  onChange={(e) => setCellForm({ ...cellForm, room: e.target.value })}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Instructor (TH)</label>
                <input
                  type="text"
                  value={cellForm.instructor_th || ""}
                  onChange={(e) => setCellForm({ ...cellForm, instructor_th: e.target.value })}
                  className="w-full p-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-xs text-white focus:outline-none focus:ring-2 focus:ring-zinc-100"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveCellKey(null)}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCell}
                className="px-4 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-xs font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all"
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
