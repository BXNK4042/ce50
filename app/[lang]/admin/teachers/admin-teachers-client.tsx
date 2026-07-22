"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Teacher } from "@/lib/types";

interface AdminTeachersClientProps {
  lang: string;
}

export default function AdminTeachersClient({ lang }: AdminTeachersClientProps) {
  const isTh = lang === "th";

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Search & Filter
  const [search, setSearch] = useState("");
  const [selectedYear, setSelectedYear] = useState<string>("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  // Form State
  const [formNameTh, setFormNameTh] = useState("");
  const [formNameEn, setFormNameEn] = useState("");
  const [formPhoto, setFormPhoto] = useState("");
  const [formContact, setFormContact] = useState("");
  const [formAdviseYears, setFormAdviseYears] = useState<string[]>([]);

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Delete Confirmation State
  const [deletingTeacher, setDeletingTeacher] = useState<Teacher | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    const role = document.cookie
      .split("; ")
      .find((row) => row.startsWith("admin_role="))
      ?.split("=")[1];
    setIsLoggedIn(!!role);

    if (role) {
      loadTeachers();
    } else {
      setLoading(false);
    }
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.teachers();
      const formatted = data.map((t) => {
        let adviseYears: string[] = [];
        if (t.advise_years) {
          if (typeof t.advise_years === "string") {
            try {
              adviseYears = JSON.parse(t.advise_years);
            } catch {
              // ignore
            }
          } else if (Array.isArray(t.advise_years)) {
            adviseYears = t.advise_years;
          }
        }
        return { ...t, advise_years: adviseYears };
      });
      setTeachers(formatted);
    } catch (err: any) {
      setError(err.message || (isTh ? "ไม่สามารถดึงข้อมูลอาจารย์ได้" : "Failed to load teachers"));
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingTeacher(null);
    setFormNameTh("");
    setFormNameEn("");
    setFormPhoto("");
    setFormContact("");
    setFormAdviseYears([]);
    setIsModalOpen(true);
  };

  const openEditModal = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setFormNameTh(teacher.name_th || "");
    setFormNameEn(teacher.name_en || "");
    setFormPhoto(teacher.photo || "");
    setFormContact(teacher.contact || "");
    setFormAdviseYears(teacher.advise_years || []);
    setIsModalOpen(true);
  };

  const toggleAdviseYear = (yr: string) => {
    setFormAdviseYears((prev) =>
      prev.includes(yr) ? prev.filter((y) => y !== yr) : [...prev, yr]
    );
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await api.uploadTeacherImage(file);
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      const fullUrl = res.url.startsWith("http") ? res.url : `${backendUrl}${res.url}`;
      setFormPhoto(fullUrl);
      showToast(isTh ? "อัปโหลดรูปภาพสำเร็จ" : "Image uploaded successfully");
    } catch (err: any) {
      showToast(err.message || (isTh ? "อัปโหลดรูปภาพล้มเหลว" : "Upload failed"), "error");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formNameTh.trim()) {
      showToast(isTh ? "กรุณาระบุชื่ออาจารย์ (ภาษาไทย)" : "Thai Name is required", "error");
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<Teacher> = {
        name_th: formNameTh.trim(),
        name_en: formNameEn.trim() || null,
        photo: formPhoto.trim() || null,
        contact: formContact.trim() || null,
        advise_years: formAdviseYears,
      };

      if (editingTeacher) {
        await api.updateTeacher(editingTeacher.id, payload);
        showToast(isTh ? "อัปเดตข้อมูลอาจารย์เรียบร้อย" : "Teacher updated successfully");
      } else {
        await api.createTeacher(payload);
        showToast(isTh ? "เพิ่มอาจารย์คนใหม่เรียบร้อย" : "Teacher created successfully");
      }

      setIsModalOpen(false);
      await loadTeachers();
    } catch (err: any) {
      showToast(err.message || (isTh ? "บันทึกข้อมูลล้มเหลว" : "Failed to save teacher"), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTeacher) return;
    setDeleting(true);
    try {
      await api.deleteTeacher(deletingTeacher.id);
      showToast(isTh ? "ลบข้อมูลอาจารย์เรียบร้อย" : "Teacher deleted successfully");
      setDeletingTeacher(null);
      await loadTeachers();
    } catch (err: any) {
      showToast(err.message || (isTh ? "ลบข้อมูลล้มเหลว" : "Failed to delete teacher"), "error");
    } finally {
      setDeleting(false);
    }
  };

  // Filtered teachers
  const filteredTeachers = teachers.filter((t) => {
    const matchesSearch =
      (t.name_th && t.name_th.toLowerCase().includes(search.toLowerCase())) ||
      (t.name_en && t.name_en.toLowerCase().includes(search.toLowerCase())) ||
      (t.contact && t.contact.toLowerCase().includes(search.toLowerCase()));

    const matchesYear =
      selectedYear === "all" ||
      (t.advise_years && t.advise_years.includes(selectedYear));

    return matchesSearch && matchesYear;
  });

  if (loading) {
    return (
      <main className="w-full min-h-[70vh] flex flex-col items-center justify-center p-6">
        <span className="w-10 h-10 border-4 border-[#4483cc] border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  if (!isLoggedIn) {
    return (
      <main className="w-full min-h-[80vh] flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-900">
        <div className="max-w-md w-full text-center bg-white dark:bg-zinc-950 p-8 border border-zinc-200 dark:border-zinc-800 shadow-xl">
          <div className="w-14 h-14 mx-auto text-amber-500 mb-4 flex items-center justify-center rounded-full bg-amber-500/10">
            🔒
          </div>
          <h2 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-white">
            {isTh ? "จำเป็นต้องเข้าสู่ระบบ" : "Authentication Required"}
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-6 text-sm">
            {isTh
              ? "คุณต้องเข้าสู่ระบบผู้ดูแลระบบเพื่อจัดการข้อมูลอาจารย์"
              : "You must be logged in as an admin to manage faculty data."}
          </p>
          <Link
            href={`/${lang}/admin/login`}
            className="inline-block w-full py-3 bg-[#4483cc] hover:bg-[#336bb3] text-white font-semibold transition-all uppercase tracking-wider text-sm"
          >
            {isTh ? "เข้าสู่ระบบระบบผู้ดูแล" : "Log In Now"}
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="w-full min-h-[85vh] py-12 px-6 md:px-16 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-[100] transition-all transform animate-bounce">
          <div
            className={`px-5 py-3 border shadow-2xl flex items-center gap-3 backdrop-blur-md text-sm font-semibold ${
              toast.type === "success"
                ? "bg-emerald-500/90 text-white border-emerald-600"
                : "bg-red-500/90 text-white border-red-600"
            }`}
          >
            <span>{toast.type === "success" ? "✓" : "✕"}</span>
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Top Bar Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#4483cc] bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 border border-blue-200 dark:border-blue-800">
                Admin Panel
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                Total: {teachers.length} {isTh ? "คน" : "faculty records"}
              </span>
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase text-zinc-900 dark:text-white">
              {isTh ? "จัดการข้อมูลคณาจารย์" : "Faculty & Teachers Management"}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/${lang}/people/teachers`}
              className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 transition-colors"
            >
              {isTh ? "ดูหน้าคณาจารย์" : "View Live Page"}
            </Link>
            <button
              onClick={openCreateModal}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-white bg-[#4483cc] hover:bg-[#356fb3] shadow-md transition-all flex items-center gap-2"
            >
              <span>+</span>
              <span>{isTh ? "เพิ่มอาจารย์ใหม่" : "Add Teacher"}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white dark:bg-zinc-950 p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
          <div className="sm:col-span-2 relative">
            <input
              type="text"
              placeholder={isTh ? "ค้นหาชื่อภาษาไทย, English name, หรืออีเมล..." : "Search name, contact..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4483cc]"
            />
          </div>
          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4483cc]"
            >
              <option value="all">{isTh ? "ชั้นปีที่ปรึกษาทั้งหมด" : "All Advise Years"}</option>
              <option value="1">{isTh ? "อาจารย์ที่ปรึกษาปี 1" : "Year 1 Advisor"}</option>
              <option value="2">{isTh ? "อาจารย์ที่ปรึกษาปี 2" : "Year 2 Advisor"}</option>
              <option value="3">{isTh ? "อาจารย์ที่ปรึกษาปี 3" : "Year 3 Advisor"}</option>
              <option value="4">{isTh ? "อาจารย์ที่ปรึกษาปี 4" : "Year 4 Advisor"}</option>
            </select>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-500 text-sm">
            {error}
          </div>
        )}

        {/* Teachers Table / Grid */}
        {filteredTeachers.length === 0 ? (
          <div className="py-20 text-center bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-500">
            {isTh ? "ไม่พบข้อมูลอาจารย์ตรงตามเงื่อนไข" : "No teacher records found."}
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-lg">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  <th className="py-4 px-4 w-16">ID</th>
                  <th className="py-4 px-4 w-20">{isTh ? "รูปถ่าย" : "Photo"}</th>
                  <th className="py-4 px-6">{isTh ? "ชื่อ-นามสกุล (TH)" : "Thai Name"}</th>
                  <th className="py-4 px-6">{isTh ? "ชื่อ-นามสกุล (EN)" : "English Name"}</th>
                  <th className="py-4 px-6">{isTh ? "อาจารย์ที่ปรึกษา" : "Advise Years"}</th>
                  <th className="py-4 px-6">{isTh ? "ช่องทางติดต่อ" : "Contact"}</th>
                  <th className="py-4 px-4 text-right">{isTh ? "การจัดการ" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                {filteredTeachers.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <td className="py-4 px-4 font-mono text-zinc-400 text-xs">#{t.id}</td>
                    <td className="py-4 px-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shrink-0">
                        {t.photo ? (
                          <img
                            src={t.photo}
                            alt={t.name_th}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                        ) : (
                          <span className="text-xs font-bold text-zinc-400">
                            {t.name_th ? t.name_th.slice(0, 1) : "?"}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 font-semibold text-zinc-900 dark:text-white">
                      {t.name_th}
                    </td>
                    <td className="py-4 px-6 text-zinc-600 dark:text-zinc-300">
                      {t.name_en || <span className="text-zinc-400 italic">-</span>}
                    </td>
                    <td className="py-4 px-6">
                      {t.advise_years && t.advise_years.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {t.advise_years.map((yr) => (
                            <span
                              key={yr}
                              className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-300 dark:border-blue-800"
                            >
                              Year {yr}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-xs italic">
                          {isTh ? "ไม่มีชั้นปี" : "None"}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {t.contact || <span className="text-zinc-400 italic">-</span>}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(t)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#4483cc] border border-[#4483cc]/30 hover:bg-[#4483cc] hover:text-white transition-colors"
                        >
                          {isTh ? "แก้ไข" : "Edit"}
                        </button>
                        <button
                          onClick={() => setDeletingTeacher(t)}
                          className="px-3 py-1.5 text-xs font-semibold text-red-500 border border-red-500/30 hover:bg-red-600 hover:text-white transition-colors"
                        >
                          {isTh ? "ลบ" : "Delete"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-lg w-full p-6 shadow-2xl flex flex-col gap-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-4">
              <h2 className="text-xl font-bold uppercase text-zinc-900 dark:text-white">
                {editingTeacher
                  ? isTh
                    ? `แก้ไขอาจารย์ #${editingTeacher.id}`
                    : `Edit Teacher #${editingTeacher.id}`
                  : isTh
                  ? "เพิ่มข้อมูลอาจารย์ใหม่"
                  : "Add New Teacher"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="flex flex-col gap-4">
              {/* Thai Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {isTh ? "ชื่อ-นามสกุล (ภาษาไทย) *" : "Thai Name *"}
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ดร.สมชาย ใจดี"
                  value={formNameTh}
                  onChange={(e) => setFormNameTh(e.target.value)}
                  className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4483cc]"
                />
              </div>

              {/* English Name */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {isTh ? "ชื่อ-นามสกุล (ภาษาอังกฤษ)" : "English Name"}
                </label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Somchai Jaidee"
                  value={formNameEn}
                  onChange={(e) => setFormNameEn(e.target.value)}
                  className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4483cc]"
                />
              </div>

              {/* Contact */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {isTh ? "อีเมล / ช่องทางติดต่อ" : "Contact / Email"}
                </label>
                <input
                  type="text"
                  placeholder="somchai.j@ce.ac.th"
                  value={formContact}
                  onChange={(e) => setFormContact(e.target.value)}
                  className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4483cc]"
                />
              </div>

              {/* Advise Years */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {isTh ? "อาจารย์ที่ปรึกษาประจำชั้นปี" : "Advise Years"}
                </label>
                <div className="flex items-center gap-3 py-2">
                  {["1", "2", "3", "4"].map((yr) => {
                    const active = formAdviseYears.includes(yr);
                    return (
                      <button
                        type="button"
                        key={yr}
                        onClick={() => toggleAdviseYear(yr)}
                        className={`px-3 py-1.5 text-xs font-bold border transition-all ${
                          active
                            ? "bg-[#4483cc] text-white border-[#4483cc]"
                            : "bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-300 dark:border-zinc-700 hover:border-zinc-400"
                        }`}
                      >
                        Year {yr}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Upload / URL */}
              <div className="flex flex-col gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">
                  {isTh ? "รูปถ่ายอาจารย์" : "Teacher Photo"}
                </label>

                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    id="teacher-photo-upload"
                    className="hidden"
                  />
                  <label
                    htmlFor="teacher-photo-upload"
                    className="px-3.5 py-2 border border-dashed border-zinc-300 dark:border-zinc-700 hover:border-[#4483cc] bg-zinc-50 dark:bg-zinc-900 text-xs font-semibold cursor-pointer transition-colors flex items-center gap-2"
                  >
                    <span>📁</span>
                    <span>
                      {uploading
                        ? isTh
                          ? "กำลังอัปโหลด..."
                          : "Uploading..."
                        : isTh
                        ? "อัปโหลดไฟล์ภาพ..."
                        : "Upload Image File..."}
                    </span>
                  </label>

                  {formPhoto && (
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border border-zinc-300 dark:border-zinc-700">
                      <img src={formPhoto} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <input
                  type="text"
                  placeholder={
                    isTh ? "หรือวาง URL รูปภาพ /professors/..." : "Or image URL /professors/..."
                  }
                  value={formPhoto}
                  onChange={(e) => setFormPhoto(e.target.value)}
                  className="px-3.5 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-[#4483cc]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                >
                  {isTh ? "ยกเลิก" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-white bg-[#4483cc] hover:bg-[#356fb3] disabled:opacity-50"
                >
                  {saving ? (isTh ? "กำลังบันทึก..." : "Saving...") : isTh ? "บันทึก" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingTeacher && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 max-w-sm w-full p-6 shadow-2xl flex flex-col gap-4 text-center">
            <div className="w-12 h-12 mx-auto text-red-500 rounded-full bg-red-500/10 flex items-center justify-center text-xl font-bold">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
              {isTh ? "ยืนยันการลบข้อมูล" : "Confirm Deletion"}
            </h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              {isTh
                ? `คุณต้องการลบข้อมูลอาจารย์ "${deletingTeacher.name_th}" หรือไม่? Action นี้ไม่สามารถย้อนกลับได้`
                : `Are you sure you want to delete "${deletingTeacher.name_th}"? This action cannot be undone.`}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setDeletingTeacher(null)}
                className="flex-1 py-2.5 text-xs font-semibold border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300"
              >
                {isTh ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? (isTh ? "กำลังลบ..." : "Deleting...") : isTh ? "ยืนยันลบ" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
