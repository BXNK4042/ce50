"use client";

import { X, Check, FloppyDisk, Image as ImageIcon } from "@phosphor-icons/react";
import ImageUploader from "@/components/admin/ImageUploader";

interface FieldConfig {
  name: string;
  labelEn: string;
  labelTh: string;
  type?: "text" | "number" | "select" | "textarea" | "image" | "boolean";
  options?: { value: string | number; label: string }[];
  placeholderEn?: string;
  placeholderTh?: string;
  required?: boolean;
}

interface LinearCrudDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (e: React.FormEvent) => void;
  title: string;
  isEditing: boolean;
  formData: Record<string, any>;
  setFormData: React.Dispatch<React.SetStateAction<Record<string, any>>>;
  fields: FieldConfig[];
  saving: boolean;
  error?: string;
  isTh: boolean;
  token?: string;
}

export default function LinearCrudDrawer({
  isOpen,
  onClose,
  onSave,
  title,
  isEditing,
  formData,
  setFormData,
  fields,
  saving,
  error,
  isTh,
  token = "",
}: LinearCrudDrawerProps) {
  if (!isOpen) return null;

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-zinc-900 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col justify-between overflow-hidden">
          {/* Drawer Header */}
          <div className="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-950/40">
            <div>
              <span className="text-[11px] font-mono font-medium tracking-wider uppercase text-zinc-400">
                {isEditing ? (isTh ? "แก้ไขรายการ" : "Edit Entry") : (isTh ? "เพิ่มรายการใหม่" : "New Entry")}
              </span>
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mt-0.5">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-all"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Form Body */}
          <form id="crud-form" onSubmit={onSave} className="p-5 flex-1 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg">
                {error}
              </div>
            )}

            {fields.map((field) => {
              const value = formData[field.name] ?? "";

              if (field.type === "image") {
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {isTh ? field.labelTh : field.labelEn}
                    </label>
                    <ImageUploader
                      uploadEndpoint={`${backendUrl}/upload`}
                      token={token}
                      initialUrl={value}
                      onUploadSuccess={(url: string) => handleChange(field.name, url)}
                    />
                  </div>
                );
              }

              if (field.type === "select") {
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {isTh ? field.labelTh : field.labelEn} {field.required && "*"}
                    </label>
                    <select
                      value={value}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                    >
                      <option value="">{isTh ? "-- เลือก --" : "-- Select --"}</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                );
              }

              if (field.type === "textarea") {
                return (
                  <div key={field.name} className="space-y-1.5">
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                      {isTh ? field.labelTh : field.labelEn} {field.required && "*"}
                    </label>
                    <textarea
                      value={value}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      required={field.required}
                      rows={4}
                      placeholder={isTh ? field.placeholderTh : field.placeholderEn}
                      className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all resize-none"
                    />
                  </div>
                );
              }

              if (field.type === "boolean") {
                return (
                  <div key={field.name} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950/60 border border-zinc-200 dark:border-zinc-800 rounded-lg">
                    <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer">
                      {isTh ? field.labelTh : field.labelEn}
                    </label>
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="h-4 w-4 text-zinc-900 rounded border-zinc-300 focus:ring-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:checked:bg-zinc-100"
                    />
                  </div>
                );
              }

              return (
                <div key={field.name} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {isTh ? field.labelTh : field.labelEn} {field.required && "*"}
                  </label>
                  <input
                    type={field.type || "text"}
                    value={value}
                    onChange={(e) =>
                      handleChange(
                        field.name,
                        field.type === "number" ? Number(e.target.value) : e.target.value
                      )
                    }
                    required={field.required}
                    placeholder={isTh ? field.placeholderTh : field.placeholderEn}
                    className="w-full px-3 py-2 text-xs bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-all"
                  />
                </div>
              );
            })}
          </form>

          {/* Drawer Footer Actions */}
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/60 dark:hover:bg-zinc-800 rounded-lg transition-all"
            >
              {isTh ? "ยกเลิก" : "Cancel"}
            </button>
            <button
              type="submit"
              form="crud-form"
              disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 text-xs font-semibold rounded-lg shadow-sm active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <FloppyDisk size={15} />
              <span>
                {saving
                  ? isTh
                    ? "กำลังบันทึก..."
                    : "Saving..."
                  : isEditing
                  ? isTh
                    ? "บันทึกการแก้ไข"
                    : "Update Entry"
                  : isTh
                  ? "สร้างรายการ"
                  : "Create Entry"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
