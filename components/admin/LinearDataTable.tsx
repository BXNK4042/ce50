"use client";

import { useState } from "react";
import {
  MagnifyingGlass,
  Plus,
  PencilSimple,
  Trash,
  Funnel,
  CaretUpDown,
  CheckCircle,
  XCircle,
  Copy,
  DotsThree,
  ArrowClockwise,
} from "@phosphor-icons/react";

interface Column {
  key: string;
  labelEn: string;
  labelTh: string;
  render?: (val: any, item: any) => React.ReactNode;
}

interface LinearDataTableProps {
  data: any[];
  columns: Column[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onEdit: (item: any) => void;
  onDelete: (id: any) => void;
  onCreate: () => void;
  onRefresh?: () => void;
  isTh: boolean;
  title: string;
  subtitle?: string;
}

export default function LinearDataTable({
  data,
  columns,
  loading,
  searchQuery,
  onSearchChange,
  onEdit,
  onDelete,
  onCreate,
  onRefresh,
  isTh,
  title,
  subtitle,
}: LinearDataTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  // Filtered & Sorted Data
  const filteredData = data.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return Object.values(item).some(
      (val) => val !== null && val !== undefined && String(val).toLowerCase().includes(q)
    );
  });

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;
    if (typeof valA === "number" && typeof valB === "number") {
      return sortOrder === "asc" ? valA - valB : valB - valA;
    }
    return sortOrder === "asc"
      ? String(valA).localeCompare(String(valB))
      : String(valB).localeCompare(String(valA));
  });

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("asc");
    }
  };

  const copyToClipboard = (text: string | number) => {
    navigator.clipboard.writeText(String(text));
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-white dark:bg-zinc-900/90 rounded-2xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm overflow-hidden transition-colors">
      {/* Table Header Bar */}
      <div className="p-4 sm:p-5 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/40">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-200/70 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
              {filteredData.length} {isTh ? "รายการ" : "items"}
            </span>
          </div>
          {subtitle && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-64">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={isTh ? "ค้นหาข้อมูล..." : "Search data..."}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
            />
          </div>

          {/* Refresh Button */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="p-2 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 rounded-lg transition-all"
              title={isTh ? "รีเฟรชข้อมูล" : "Refresh data"}
            >
              <ArrowClockwise size={16} className={loading ? "animate-spin" : ""} />
            </button>
          )}

          {/* Create Button */}
          <button
            onClick={onCreate}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all"
          >
            <Plus size={14} weight="bold" />
            <span>{isTh ? "เพิ่มรายการใหม่" : "New Entry"}</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-zinc-700 dark:text-zinc-300">
          <thead className="bg-zinc-100/70 dark:bg-zinc-950/60 text-zinc-500 dark:text-zinc-400 border-b border-zinc-200/80 dark:border-zinc-800/80 font-medium uppercase text-[10.5px] tracking-wider">
            <tr>
              <th className="py-3 px-4 w-12 text-center font-mono">#</th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="py-3 px-4 cursor-pointer select-none hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{isTh ? col.labelTh : col.labelEn}</span>
                    <CaretUpDown size={12} className="opacity-50" />
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 w-24 text-right">{isTh ? "การจัดการ" : "Actions"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
            {loading ? (
              Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4 text-center">
                    <div className="h-3 w-4 bg-zinc-200 dark:bg-zinc-800 rounded mx-auto" />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="py-4 px-4">
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
                    </td>
                  ))}
                  <td className="py-4 px-4 text-right">
                    <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-12 ml-auto" />
                  </td>
                </tr>
              ))
            ) : sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + 2}
                  className="py-12 text-center text-zinc-400 dark:text-zinc-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Funnel size={32} weight="thin" className="opacity-40" />
                    <p className="text-xs font-medium">
                      {isTh ? "ไม่พบข้อมูลที่ตรงกับการค้นหา" : "No matching data found"}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedData.map((item, index) => (
                <tr
                  key={item.id || index}
                  className="hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors group"
                >
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-zinc-400">
                    {index + 1}
                  </td>
                  {columns.map((col) => {
                    const val = item[col.key];
                    return (
                      <td key={col.key} className="py-3 px-4">
                        {col.render ? (
                          col.render(val, item)
                        ) : typeof val === "boolean" ? (
                          val ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                              <CheckCircle size={12} weight="fill" /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-500/10 text-zinc-500 border border-zinc-500/20">
                              <XCircle size={12} weight="fill" /> Inactive
                            </span>
                          )
                        ) : (
                          <span className="text-zinc-800 dark:text-zinc-200 line-clamp-1">
                            {val !== undefined && val !== null ? String(val) : "—"}
                          </span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onEdit(item)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-md transition-all"
                        title={isTh ? "แก้ไข" : "Edit"}
                      >
                        <PencilSimple size={15} />
                      </button>
                      <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 rounded-md transition-all"
                        title={isTh ? "ลบ" : "Delete"}
                      >
                        <Trash size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/40 dark:bg-zinc-950/30 flex items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 font-mono">
        <span>Showing {sortedData.length} records</span>
        <span>Linear B2B Table v2.0</span>
      </div>
    </div>
  );
}
