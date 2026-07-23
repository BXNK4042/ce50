"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
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
  const [activeBlockKeys, setActiveBlockKeys] = useState<string[] | null>(null);
  const [cellForm, setCellForm] = useState<Partial<ClassCell>>({});
  const [error, setError] = useState("");
  const [draggedBlockKeys, setDraggedBlockKeys] = useState<string[] | null>(null);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  useEffect(() => {
    setMounted(true);
  }, []);

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
  const handleCellClick = (
    day: string,
    blockKeys: string[],
    startSlot: string,
    cell: ClassCell | null
  ) => {
    setActiveBlockKeys(blockKeys);
    setCellForm(cell ? { ...cell } : { day, time_slot: startSlot, code: "" });
  };

  const handleApplyCell = () => {
    if (!activeBlockKeys || activeBlockKeys.length === 0) return;

    const updatedMap = new Map(cells);
    if (!cellForm.code?.trim()) {
      activeBlockKeys.forEach((k) => updatedMap.delete(k));
    } else {
      activeBlockKeys.forEach((k) => {
        const slot = k.split("_").slice(1).join("_");
        const day = k.split("_")[0];
        updatedMap.set(k, {
          ...(cellForm as ClassCell),
          day,
          time_slot: slot,
        });
      });
    }

    setCells(updatedMap);
    setActiveBlockKeys(null);
  };

  // Drag & Drop Move Handlers
  const handleDragStart = (
    e: React.DragEvent,
    blockKeys: string[],
    cell: ClassCell
  ) => {
    e.stopPropagation();
    setDraggedBlockKeys(blockKeys);
    e.dataTransfer.setData("text/plain", JSON.stringify({ blockKeys, cell }));
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

  const handleDrop = (
    e: React.DragEvent,
    targetDay: string,
    targetSlot: string
  ) => {
    e.preventDefault();
    setDragOverKey(null);
    if (!draggedBlockKeys || draggedBlockKeys.length === 0) return;

    const targetIdx = TIME_SLOTS.indexOf(targetSlot);
    if (targetIdx === -1) return;

    const firstOriginKey = draggedBlockKeys[0];
    const originCell = cells.get(firstOriginKey);
    if (!originCell) return;

    const spanCount = draggedBlockKeys.length;
    const updatedMap = new Map(cells);

    // Delete old block keys
    draggedBlockKeys.forEach((k) => updatedMap.delete(k));

    // Move to new target slots
    for (let i = 0; i < spanCount; i++) {
      if (targetIdx + i < TIME_SLOTS.length) {
        const newSlot = TIME_SLOTS[targetIdx + i];
        const newKey = `${targetDay}_${newSlot}`;
        updatedMap.set(newKey, {
          ...originCell,
          day: targetDay,
          time_slot: newSlot,
        });
      }
    }

    setCells(updatedMap);
    setDraggedBlockKeys(null);
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

  // Pre-calculate spans per day & slot
  type SpanInfo = {
    rowSpan: number;
    shouldRender: boolean;
    blockKeys: string[];
    startSlot: string;
    endSlot: string;
    cell: ClassCell | null;
  };

  const spans: Record<string, SpanInfo>[] = TIME_SLOTS.map(() => ({}));

  DAYS.forEach((d) => {
    let s = 0;
    while (s < TIME_SLOTS.length) {
      const slot = TIME_SLOTS[s];
      const key = `${d.key}_${slot}`;
      const cell = cells.get(key);

      if (cell && cell.code?.trim()) {
        let rowSpan = 1;
        const blockKeys = [key];
        let nextS = s + 1;
        while (nextS < TIME_SLOTS.length) {
          const nextSlot = TIME_SLOTS[nextS];
          const nextKey = `${d.key}_${nextSlot}`;
          const nextCell = cells.get(nextKey);
          if (nextCell && nextCell.code?.trim() === cell.code?.trim()) {
            rowSpan++;
            blockKeys.push(nextKey);
            nextS++;
          } else {
            break;
          }
        }

        spans[s][d.key] = {
          rowSpan,
          shouldRender: true,
          blockKeys,
          startSlot: slot,
          endSlot: TIME_SLOTS[s + rowSpan - 1],
          cell,
        };

        for (let k = s + 1; k < s + rowSpan; k++) {
          spans[k][d.key] = {
            rowSpan: 0,
            shouldRender: false,
            blockKeys: [],
            startSlot: "",
            endSlot: "",
            cell: null,
          };
        }

        s = nextS;
      } else {
        spans[s][d.key] = {
          rowSpan: 1,
          shouldRender: true,
          blockKeys: [key],
          startSlot: slot,
          endSlot: slot,
          cell: null,
        };
        s++;
      }
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <span>Class Timetable (Year {year}, Term {term})</span>
            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Merged Course Blocks
            </span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Drag card body to <b>move</b>. Click block to edit details.
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 font-semibold text-xs rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-50 cursor-pointer"
        >
          {saving ? "Saving..." : "💾 Save Timetable"}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold rounded-xl">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-zinc-500 dark:text-zinc-400 font-mono text-xs">Loading interactive schedule grid...</div>
      ) : (
        <div className="overflow-x-auto border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900/80 shadow-sm">
          <table className="w-full text-xs text-left border-collapse select-none">
            <thead>
              <tr className="bg-zinc-50 dark:bg-zinc-950/80 border-b border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 font-mono uppercase text-[10.5px]">
                <th className="p-3 font-bold border-r border-zinc-200 dark:border-zinc-800 w-28 text-center">Time Slot</th>
                {DAYS.map((d) => (
                  <th key={d.key} className="p-3 font-bold text-center border-r border-zinc-200 dark:border-zinc-800 min-w-[140px]">
                    {d.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
              {TIME_SLOTS.map((slot, slotIdx) => (
                <tr key={slot} className="h-14 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                  <td className="p-3 font-mono font-medium text-zinc-500 dark:text-zinc-400 border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 text-center">
                    {slot}
                  </td>
                  {DAYS.map((d) => {
                    const spanInfo = spans[slotIdx][d.key];
                    if (!spanInfo || !spanInfo.shouldRender) return null;

                    const key = `${d.key}_${slot}`;
                    const isDragOver = spanInfo.blockKeys.some((k) => k === dragOverKey);
                    const cell = spanInfo.cell;

                    const startTime = spanInfo.startSlot.split(" - ")[0];
                    const endTime = spanInfo.endSlot.split(" - ")[1];
                    const timeRangeText = spanInfo.rowSpan > 1 ? `${startTime} - ${endTime}` : null;

                    return (
                      <td
                        key={d.key}
                        rowSpan={spanInfo.rowSpan}
                        data-day={d.key}
                        data-slot={slot}
                        style={{ height: "100%" }}
                        onDragOver={(e) => handleDragOver(e, key)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, d.key, slot)}
                        onClick={() => handleCellClick(d.key, spanInfo.blockKeys, spanInfo.startSlot, cell)}
                        className={`p-1 border-r border-zinc-200 dark:border-zinc-800/80 transition-all relative h-full ${
                          isDragOver
                            ? "bg-blue-500/20 ring-2 ring-blue-500/80 ring-inset"
                            : "hover:bg-zinc-100/60 dark:hover:bg-zinc-800/50"
                        }`}
                      >
                        {cell ? (
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, spanInfo.blockKeys, cell)}
                            className={`h-full min-h-full flex-1 p-2.5 rounded-xl border relative text-center flex flex-col justify-between group/card cursor-grab active:cursor-grabbing transition-all shadow-xs ${d.color}`}
                          >
                            <div className="space-y-1">
                              {/* Header & Duration */}
                              <div className="flex items-center justify-between gap-1 text-[10px] text-zinc-500 dark:text-zinc-400 pointer-events-none">
                                <DotsSixVertical size={14} className="opacity-60 group-hover/card:opacity-100" />
                                {timeRangeText ? (
                                  <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-200/80 dark:bg-zinc-950/40 text-zinc-800 dark:text-zinc-300">
                                    {timeRangeText}
                                  </span>
                                ) : (
                                  <span className="font-mono text-[9px] opacity-75">Move</span>
                                )}
                              </div>
                              <div className="font-extrabold text-sm tracking-tight pointer-events-none">{cell.code}</div>
                              <div className="text-[10.5px] font-medium truncate pointer-events-none">{cell.name_th || cell.name_en}</div>
                            </div>

                            {cell.room && (
                              <div className="text-[9.5px] font-mono opacity-80 pointer-events-none pt-1">📍 {cell.room}</div>
                            )}
                          </div>
                        ) : (
                          <div className="h-14 border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all text-xs">
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
      {mounted && activeBlockKeys && activeBlockKeys.length > 0 && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-zinc-950/70 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-6 rounded-2xl w-full max-w-md space-y-4 shadow-2xl z-[10000]">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">Edit Class Block</h4>
              <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                {activeBlockKeys[0].split("_")[0]} (
                {activeBlockKeys[0].split("_").slice(1).join("_").split(" - ")[0]} -{" "}
                {activeBlockKeys[activeBlockKeys.length - 1]
                  .split("_")
                  .slice(1)
                  .join("_")
                  .split(" - ")[1]}
                )
              </span>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Course Code *</label>
                <input
                  type="text"
                  placeholder="e.g. CPE 323"
                  value={cellForm.code || ""}
                  onChange={(e) => setCellForm({ ...cellForm, code: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Course Name (TH)</label>
                <input
                  type="text"
                  value={cellForm.name_th || ""}
                  onChange={(e) => setCellForm({ ...cellForm, name_th: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Room</label>
                <input
                  type="text"
                  placeholder="e.g. 113"
                  value={cellForm.room || ""}
                  onChange={(e) => setCellForm({ ...cellForm, room: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Instructor (TH)</label>
                <input
                  type="text"
                  value={cellForm.instructor_th || ""}
                  onChange={(e) => setCellForm({ ...cellForm, instructor_th: e.target.value })}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setActiveBlockKeys(null)}
                className="px-3 py-1.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyCell}
                className="px-4 py-1.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all"
              >
                Apply Block
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

