"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ImageUploader from "@/components/admin/ImageUploader";
import ClassScheduleGrid from "@/components/admin/ClassScheduleGrid";
import ExamScheduleTable from "@/components/admin/ExamScheduleTable";

interface AdminPageProps {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

type TabType =
  | "schedules_class"
  | "schedules_exam"
  | "students"
  | "works"
  | "teachers"
  | "rooms"
  | "users"
  | "internship"
  | "videos";

export default function CentralAdminPage({ params, searchParams }: AdminPageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = searchParams ? use(searchParams) : {};
  const lang = resolvedParams.lang;
  const isTh = lang === "th";
  const router = useRouter();

  // Auth States
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState<string>("admin");
  const [adminYear, setAdminYear] = useState<number>(1);
  const [token, setToken] = useState<string>("");
  const [authLoading, setAuthLoading] = useState(true);

  // Tab & Filter States
  const initialTab = (resolvedSearchParams.tab as TabType) || "schedules_class";
  const [activeTab, setActiveTab] = useState<TabType>(initialTab);
  const [selectedYear, setSelectedYear] = useState<number>(1);
  const [selectedTerm, setSelectedTerm] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");

  // Data States
  const [dataList, setDataList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Drawer / Form States
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Check Cookies on Load
  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const userRole = cookies.find((r) => r.startsWith("admin_role="))?.split("=")[1] || "";
    const userYearStr = cookies.find((r) => r.startsWith("admin_year="))?.split("=")[1] || "1";
    const userToken = cookies.find((r) => r.startsWith("admin_token="))?.split("=")[1] || "";

    const userYear = parseInt(userYearStr, 10) || 1;

    setIsLoggedIn(!!userToken || !!userRole);
    setRole(userRole || "admin");
    setAdminYear(userYear);
    setToken(userToken);
    setSelectedYear(userRole === "superadmin" ? 1 : userYear);
    setAuthLoading(false);
  }, []);

  // Fetch Data on Tab / Year / Auth change
  useEffect(() => {
    if (!isLoggedIn) return;
    if (activeTab !== "schedules_class" && activeTab !== "schedules_exam") {
      fetchData();
    }
  }, [activeTab, selectedYear, isLoggedIn]);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let endpoint = "";
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      switch (activeTab) {
        case "students":
          endpoint = `/people/students?year=${selectedYear}`;
          break;
        case "works":
          endpoint = `/works?year=${selectedYear}`;
          break;
        case "internship":
          endpoint = `/internship?year=${selectedYear}`;
          break;
        case "videos":
          endpoint = `/videos?year=${selectedYear}`;
          break;
        case "teachers":
          endpoint = `/people/teachers`;
          break;
        case "rooms":
          endpoint = `/rooms`;
          break;
        case "users":
          endpoint = `/users`;
          break;
      }

      if (!endpoint) return;

      const res = await fetch(`${backendUrl}${endpoint}`, { headers });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to fetch data");
      }
      const data = await res.json();
      setDataList(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || "Error loading data");
      setDataList([]);
    } finally {
      setLoading(false);
    }
  };

  // Open Create Form
  const handleCreate = () => {
    setEditingItem(null);
    const initialForm: Record<string, any> = { year: selectedYear };
    if (activeTab === "works") initialForm.scope = "branch";
    if (activeTab === "users") {
      initialForm.role = "admin";
      initialForm.year = 1;
    }
    if (activeTab === "videos") {
      initialForm.category = "General";
    }
    setFormData(initialForm);
    setIsDrawerOpen(true);
  };

  // Open Edit Form
  const handleEdit = (item: any) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsDrawerOpen(true);
  };

  // Delete Item
  const handleDelete = async (id: number | string) => {
    if (!confirm(isTh ? "คุณต้องการลบรายการนี้ใช่หรือไม่?" : "Are you sure you want to delete this item?")) {
      return;
    }
    setError("");
    try {
      let endpoint = "";
      switch (activeTab) {
        case "students":
          endpoint = `/people/students/${id}`;
          break;
        case "works":
          endpoint = `/works/${id}`;
          break;
        case "internship":
          endpoint = `/internship/${id}`;
          break;
        case "videos":
          endpoint = `/videos/${id}`;
          break;
        case "teachers":
          endpoint = `/people/teachers/${id}`;
          break;
        case "rooms":
          endpoint = `/rooms/${id}`;
          break;
        case "users":
          endpoint = `/users/${id}`;
          break;
      }

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: "DELETE",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete item");
      }

      setSuccessMsg(isTh ? "ลบข้อมูลสำเร็จ" : "Deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Error deleting item");
    }
  };

  // Save (Create / Update) Form
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let endpoint = "";
      let method = editingItem ? "PUT" : "POST";
      const payload = { ...formData };

      // Make sure year is included for year-scoped entities
      if (["students", "works", "internship", "videos"].includes(activeTab)) {
        payload.year = Number(payload.year || selectedYear);
      }

      switch (activeTab) {
        case "students":
          endpoint = editingItem ? `/people/students/${editingItem.id}` : `/people/students`;
          break;
        case "works":
          endpoint = editingItem ? `/works/${editingItem.id}` : `/works`;
          break;
        case "internship":
          endpoint = editingItem ? `/internship/${editingItem.id}` : `/internship`;
          break;
        case "videos":
          endpoint = editingItem ? `/videos/${editingItem.id}` : `/videos`;
          break;
        case "teachers":
          endpoint = editingItem ? `/people/teachers/${editingItem.id}` : `/people/teachers`;
          break;
        case "rooms":
          endpoint = editingItem ? `/rooms/${editingItem.id}` : `/rooms`;
          break;
        case "users":
          endpoint = editingItem ? `/users/${editingItem.id}` : `/users`;
          break;
      }

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to save item");
      }

      setSuccessMsg(isTh ? "บันทึกข้อมูลเรียบร้อยแล้ว" : "Saved successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
      setIsDrawerOpen(false);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Error saving item");
    } finally {
      setSaving(false);
    }
  };

  // Helper for Teachers advise_years multi-select checkboxes
  const getTeacherAdviseYears = (): number[] => {
    if (!formData.advise_years) return [];
    if (Array.isArray(formData.advise_years)) return formData.advise_years.map(Number);
    if (typeof formData.advise_years === "string") {
      try {
        const parsed = JSON.parse(formData.advise_years);
        return Array.isArray(parsed) ? parsed.map(Number) : [];
      } catch {
        return formData.advise_years.split(",").map(Number).filter((n) => !isNaN(n));
      }
    }
    return [];
  };

  const toggleTeacherAdviseYear = (yearNum: number) => {
    const current = new Set(getTeacherAdviseYears());
    if (current.has(yearNum)) {
      current.delete(yearNum);
    } else {
      current.add(yearNum);
    }
    setFormData({ ...formData, advise_years: Array.from(current) });
  };

  // Permission Checks
  const isSuperadmin = role === "superadmin";
  const canEditTab =
    isSuperadmin ||
    ["schedules_class", "schedules_exam", "students", "works", "internship", "videos"].includes(activeTab);

  if (authLoading) {
    return (
      <div className="w-full min-h-[60vh] flex items-center justify-center">
        <div className="text-zinc-500 font-medium">Loading session...</div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl text-center space-y-6">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-sky-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
          🔒
        </div>
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">
          {isTh ? "เข้าสู่ระบบสำหรับผู้ดูแลระบบ" : "Admin Login Required"}
        </h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {isTh
            ? "กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแลระบบเพื่อเข้าถึงแผงควบคุมกลาง"
            : "Please sign in with an admin account to access the Central CRUD Dashboard."}
        </p>
        <Link
          href={`/${lang}/admin/login`}
          className="inline-block w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-blue-500/20"
        >
          {isTh ? "ไปที่หน้าเข้าสู่ระบบ" : "Go to Login Page"}
        </Link>
      </div>
    );
  }

  // Filtered List
  const filteredData = dataList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return Object.values(item).some(
      (val) => val && String(val).toLowerCase().includes(query)
    );
  });

  return (
    <div className="w-full min-h-screen bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-6 flex flex-col justify-between shrink-0">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-8 bg-blue-600 dark:bg-sky-500 rounded-full" />
            <div>
              <h1 className="text-lg font-bold tracking-tight">Central Admin</h1>
              <div className="text-xs text-zinc-400">
                {isSuperadmin ? "⚡ Superadmin (God)" : `📌 Admin (Year ${adminYear})`}
              </div>
            </div>
          </div>

          <nav className="space-y-1 text-sm font-medium">
            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mb-2">
              {isTh ? "ตารางเรียน/สอบ" : "Schedules"}
            </div>
            <button
              onClick={() => setActiveTab("schedules_class")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === "schedules_class"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span>{isTh ? "ตารางเรียน" : "Class Schedule"}</span>
              <span className="text-xs opacity-75">📅</span>
            </button>

            <button
              onClick={() => setActiveTab("schedules_exam")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === "schedules_exam"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span>{isTh ? "ตารางสอบ" : "Exam Schedule"}</span>
              <span className="text-xs opacity-75">📝</span>
            </button>

            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mt-6 mb-2">
              {isTh ? "บุคลากร & นักศึกษา" : "People & Works"}
            </div>
            <button
              onClick={() => setActiveTab("students")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === "students"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span>{isTh ? "รายชื่อนักศึกษา" : "Student Roster"}</span>
              <span className="text-xs opacity-75">🎓</span>
            </button>

            <button
              onClick={() => setActiveTab("works")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === "works"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span>{isTh ? "ผลงานนักศึกษา" : "Student Works"}</span>
              <span className="text-xs opacity-75">🏆</span>
            </button>

            <button
              onClick={() => setActiveTab("teachers")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === "teachers"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span>{isTh ? "คณาจารย์/เจ้าหน้าที่" : "Teachers & Staff"}</span>
              <span className="text-xs opacity-75">👨‍🏫</span>
            </button>

            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mt-6 mb-2">
              {isTh ? "ฝึกงาน & มีเดีย" : "Internship & Media"}
            </div>
            <button
              onClick={() => setActiveTab("internship")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === "internship"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span>{isTh ? "หัวข้อการฝึกงาน" : "Internship Topics"}</span>
              <span className="text-xs opacity-75">💼</span>
            </button>

            <button
              onClick={() => setActiveTab("videos")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === "videos"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span>{isTh ? "สื่อวิดีโอ" : "Video Media"}</span>
              <span className="text-xs opacity-75">🎥</span>
            </button>

            <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider px-3 mt-6 mb-2">
              {isTh ? "สถานที่ & ผู้ใช้" : "Infrastructure"}
            </div>
            <button
              onClick={() => setActiveTab("rooms")}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                activeTab === "rooms"
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
              }`}
            >
              <span>{isTh ? "ห้องปฏิบัติการ/ห้องเรียน" : "CE Rooms"}</span>
              <span className="text-xs opacity-75">🏢</span>
            </button>

            {isSuperadmin && (
              <button
                onClick={() => setActiveTab("users")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all ${
                  activeTab === "users"
                    ? "bg-purple-600 text-white shadow-md shadow-purple-500/20"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                }`}
              >
                <span>{isTh ? "จัดการผู้ดูแลระบบ" : "User Accounts"}</span>
                <span className="text-xs opacity-75">👑</span>
              </button>
            )}
          </nav>
        </div>
        {/*
        <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800">
          <Link
            href={`/${lang}/api/admin/logout`}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/60 rounded-xl text-sm font-semibold transition-all"
          >
            {isTh ? "ออกจากระบบ" : "Logout"}
          </Link>
        </div>*/}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        {/* Header Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-white capitalize">
              {activeTab.replace("_", " ")}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              {canEditTab
                ? isTh
                  ? "จัดการและแก้ไขข้อมูลในระบบ"
                  : "Create, view, edit, and delete records."
                : isTh
                ? "มุมมองดูข้อมูลอย่างเดียว (สิทธิ์ Superadmin เท่านั้นสำหรับการแก้ไข)"
                : "Read-only mode for your role level."}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Year Selector Filter */}
            {["schedules_class", "schedules_exam", "students", "works", "internship", "videos"].includes(activeTab) && (
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-xs font-semibold text-zinc-400">
                  {isTh ? "ชั้นปี:" : "Year:"}
                </span>
                {isSuperadmin ? (
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="bg-transparent text-sm font-bold text-blue-600 dark:text-sky-400 focus:outline-none cursor-pointer"
                  >
                    <option value={1}>Year 1</option>
                    <option value={2}>Year 2</option>
                    <option value={3}>Year 3</option>
                    <option value={4}>Year 4</option>
                  </select>
                ) : (
                  <span className="text-sm font-bold text-blue-600 dark:text-sky-400">
                    Year {adminYear}
                  </span>
                )}
              </div>
            )}

            {/* Term Selector Filter for Schedules */}
            {["schedules_class", "schedules_exam"].includes(activeTab) && (
              <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-1.5 shadow-sm">
                <span className="text-xs font-semibold text-zinc-400">
                  {isTh ? "ภาคเรียน:" : "Term:"}
                </span>
                <select
                  value={selectedTerm}
                  onChange={(e) => setSelectedTerm(Number(e.target.value))}
                  className="bg-transparent text-sm font-bold text-blue-600 dark:text-sky-400 focus:outline-none cursor-pointer"
                >
                  <option value={1}>Term 1</option>
                  <option value={2}>Term 2</option>
                </select>
              </div>
            )}

            {/* Add Button */}
            {canEditTab && !["schedules_class", "schedules_exam"].includes(activeTab) && (
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>+</span>
                <span>{isTh ? "เพิ่มรายการใหม่" : "Add New"}</span>
              </button>
            )}
          </div>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-xl text-sm font-medium">
            ⚠️ {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 rounded-xl text-sm font-medium">
            ✅ {successMsg}
          </div>
        )}

        {/* Dynamic Views: Schedules or Standard CRUD Table */}
        {activeTab === "schedules_class" ? (
          <ClassScheduleGrid
            year={selectedYear}
            term={selectedTerm}
            token={token}
            onSaveSuccess={() => {
              setSuccessMsg(isTh ? "บันทึกตารางเรียนเรียบร้อยแล้ว" : "Class schedule saved successfully");
              setTimeout(() => setSuccessMsg(""), 3000);
            }}
          />
        ) : activeTab === "schedules_exam" ? (
          <ExamScheduleTable
            year={selectedYear}
            term={selectedTerm}
            token={token}
            onSaveSuccess={() => {
              setSuccessMsg(isTh ? "บันทึกตารางสอบเรียบร้อยแล้ว" : "Exam schedule saved successfully");
              setTimeout(() => setSuccessMsg(""), 3000);
            }}
          />
        ) : (
          <>
            {/* Search Bar */}
            <div className="mb-6">
              <input
                type="text"
                placeholder={isTh ? "ค้นหาข้อมูล..." : "Search records..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm"
              />
            </div>

            {/* Data Table */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
              {loading ? (
                <div className="p-12 text-center text-zinc-500 font-medium">
                  {isTh ? "กำลังโหลดข้อมูล..." : "Loading records..."}
                </div>
              ) : filteredData.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  {isTh ? "ไม่พบข้อมูลในระบบ" : "No records found."}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead>
                      <tr className="bg-zinc-100/70 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 font-semibold border-b border-zinc-200 dark:border-zinc-800">
                        <th className="p-4">ID</th>
                        {activeTab === "students" && (
                          <>
                            <th className="p-4">Student ID</th>
                            <th className="p-4">Name</th>
                            <th className="p-4">Track/Cohort</th>
                            <th className="p-4">Class Role</th>
                            <th className="p-4">Contact</th>
                          </>
                        )}
                        {activeTab === "works" && (
                          <>
                            <th className="p-4">Title</th>
                            <th className="p-4">Scope</th>
                            <th className="p-4">Authors</th>
                          </>
                        )}
                        {activeTab === "teachers" && (
                          <>
                            <th className="p-4">Name (TH)</th>
                            <th className="p-4">Name (EN)</th>
                            <th className="p-4">Advise Years</th>
                            <th className="p-4">Contact</th>
                          </>
                        )}
                        {activeTab === "internship" && (
                          <>
                            <th className="p-4">Host / Branch</th>
                            <th className="p-4">Topic Title</th>
                            <th className="p-4">Description</th>
                            <th className="p-4">Year</th>
                          </>
                        )}
                        {activeTab === "videos" && (
                          <>
                            <th className="p-4">Title</th>
                            <th className="p-4">Category</th>
                            <th className="p-4">File Path / Link</th>
                            <th className="p-4">Year</th>
                          </>
                        )}
                        {activeTab === "rooms" && (
                          <>
                            <th className="p-4">Room Name</th>
                            <th className="p-4">Description</th>
                          </>
                        )}
                        {activeTab === "users" && (
                          <>
                            <th className="p-4">Username</th>
                            <th className="p-4">Role</th>
                            <th className="p-4">Assigned Year</th>
                            <th className="p-4">Email</th>
                          </>
                        )}
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                      {filteredData.map((item, idx) => (
                        <tr
                          key={item.id || idx}
                          className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                        >
                          <td className="p-4 font-medium text-zinc-400">#{item.id || idx + 1}</td>
                          {activeTab === "students" && (
                            <>
                              <td className="p-4 font-semibold text-blue-600 dark:text-sky-400">
                                {item.student_id}
                              </td>
                              <td className="p-4 font-bold">{item.name_th}</td>
                              <td className="p-4">{item.track || "-"}</td>
                              <td className="p-4">{item.class_role || "-"}</td>
                              <td className="p-4 text-zinc-500">{item.contact || "-"}</td>
                            </>
                          )}
                          {activeTab === "works" && (
                            <>
                              <td className="p-4 font-bold">{item.title}</td>
                              <td className="p-4 capitalize">
                                <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300 text-xs font-semibold rounded-full">
                                  {item.scope}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-zinc-500">{item.author_ids || "-"}</td>
                            </>
                          )}
                          {activeTab === "teachers" && (
                            <>
                              <td className="p-4 font-bold">{item.name_th}</td>
                              <td className="p-4 text-zinc-500">{item.name_en || "-"}</td>
                              <td className="p-4 text-xs font-semibold">
                                {item.advise_years
                                  ? String(item.advise_years).replace(/[\[\]"]/g, "")
                                  : "-"}
                              </td>
                              <td className="p-4 text-zinc-500">{item.contact || "-"}</td>
                            </>
                          )}
                          {activeTab === "internship" && (
                            <>
                              <td className="p-4 font-bold text-blue-600 dark:text-sky-400">
                                {item.host_branch}
                              </td>
                              <td className="p-4 font-semibold">{item.title}</td>
                              <td className="p-4 text-xs text-zinc-500 max-w-xs truncate">
                                {item.description || "-"}
                              </td>
                              <td className="p-4 font-semibold">Year {item.year}</td>
                            </>
                          )}
                          {activeTab === "videos" && (
                            <>
                              <td className="p-4 font-bold">{item.title}</td>
                              <td className="p-4">
                                <span className="px-2.5 py-0.5 bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 text-xs font-semibold rounded-full">
                                  {item.category || "General"}
                                </span>
                              </td>
                              <td className="p-4 text-xs text-zinc-500 max-w-xs truncate">
                                {item.file_path}
                              </td>
                              <td className="p-4 font-semibold">Year {item.year}</td>
                            </>
                          )}
                          {activeTab === "rooms" && (
                            <>
                              <td className="p-4 font-bold">{item.name}</td>
                              <td className="p-4 text-zinc-500">{item.description || "-"}</td>
                            </>
                          )}
                          {activeTab === "users" && (
                            <>
                              <td className="p-4 font-bold">{item.username}</td>
                              <td className="p-4">
                                <span
                                  className={`px-2.5 py-0.5 text-xs font-bold rounded-full uppercase ${
                                    item.role === "superadmin"
                                      ? "bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
                                      : "bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-sky-300"
                                  }`}
                                >
                                  {item.role}
                                </span>
                              </td>
                              <td className="p-4 font-semibold">Year {item.year}</td>
                              <td className="p-4 text-zinc-500">{item.email}</td>
                            </>
                          )}
                          <td className="p-4 text-right space-x-2">
                            {canEditTab ? (
                              <>
                                <button
                                  onClick={() => handleEdit(item)}
                                  className="px-3 py-1 bg-zinc-100 hover:bg-blue-50 dark:bg-zinc-800 dark:hover:bg-blue-950 text-blue-600 dark:text-sky-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                >
                                  {isTh ? "แก้ไข" : "Edit"}
                                </button>
                                {item.id && (
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    className="px-3 py-1 bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                                  >
                                    {isTh ? "ลบ" : "Delete"}
                                  </button>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-zinc-400 italic">
                                {isTh ? "ดูได้อย่างเดียว" : "Read-only"}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>

      {/* Slide-Over Drawer for Create / Edit Form */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 h-full p-8 overflow-y-auto shadow-2xl flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-800">
            <div>
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-zinc-200 dark:border-zinc-800">
                <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                  {editingItem
                    ? isTh
                      ? "แก้ไขข้อมูล"
                      : "Edit Record"
                    : isTh
                    ? "เพิ่มข้อมูลใหม่"
                    : "Add New Record"}
                </h3>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-4">
                {/* Students Form */}
                {activeTab === "students" && (
                  <>
                    <ImageUploader
                      uploadEndpoint="/people/students/upload-image"
                      token={token}
                      initialUrl={formData.photo || ""}
                      onUploadSuccess={(url) => setFormData({ ...formData, photo: url })}
                      label="Student Photo"
                    />
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Student ID *</label>
                      <input
                        type="text"
                        required
                        value={formData.student_id || ""}
                        onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Name (TH) *</label>
                      <input
                        type="text"
                        required
                        value={formData.name_th || ""}
                        onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Name (EN)</label>
                      <input
                        type="text"
                        value={formData.name_en || ""}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Academic Year (1-4) *</label>
                      <select
                        value={formData.year || selectedYear}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      >
                        <option value={1}>Year 1 (Freshman)</option>
                        <option value={2}>Year 2 (Sophomore)</option>
                        <option value={3}>Year 3 (Junior)</option>
                        <option value={4}>Year 4 (Senior)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Track / Cohort (e.g. CE04)</label>
                      <input
                        type="text"
                        value={formData.track || ""}
                        onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Class Role (e.g. หัวหน้าห้อง)</label>
                      <input
                        type="text"
                        value={formData.class_role || ""}
                        onChange={(e) => setFormData({ ...formData, class_role: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Contact Info</label>
                      <input
                        type="text"
                        value={formData.contact || ""}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Student Works Form */}
                {activeTab === "works" && (
                  <>
                    <ImageUploader
                      uploadEndpoint="/works/upload-image"
                      token={token}
                      initialUrl={formData.image || ""}
                      onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
                      label="Work Cover Image"
                    />
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Title *</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Scope *</label>
                      <select
                        value={formData.scope || "branch"}
                        onChange={(e) => setFormData({ ...formData, scope: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      >
                        <option value="branch">Branch (สาขา)</option>
                        <option value="group">Group (กลุ่ม)</option>
                        <option value="solo">Solo (รายบุคคล)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Academic Year *</label>
                      <select
                        value={formData.year || selectedYear}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Teachers Form */}
                {activeTab === "teachers" && (
                  <>
                    <ImageUploader
                      uploadEndpoint="/people/teachers/upload-image"
                      token={token}
                      initialUrl={formData.photo || ""}
                      onUploadSuccess={(url) => setFormData({ ...formData, photo: url })}
                      label="Teacher Photo"
                    />
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Name (TH) *</label>
                      <input
                        type="text"
                        required
                        value={formData.name_th || ""}
                        onChange={(e) => setFormData({ ...formData, name_th: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Name (EN)</label>
                      <input
                        type="text"
                        value={formData.name_en || ""}
                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Advise Years (1-4)</label>
                      <div className="flex items-center gap-4 p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl">
                        {[1, 2, 3, 4].map((yNum) => (
                          <label key={yNum} className="flex items-center gap-1.5 text-xs font-medium cursor-pointer">
                            <input
                              type="checkbox"
                              checked={getTeacherAdviseYears().includes(yNum)}
                              onChange={() => toggleTeacherAdviseYear(yNum)}
                              className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>Year {yNum}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Contact Info</label>
                      <input
                        type="text"
                        value={formData.contact || ""}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Internship Topics Form */}
                {activeTab === "internship" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Host Branch / Company *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Software Engineering / Tech Corp"
                        value={formData.host_branch || ""}
                        onChange={(e) => setFormData({ ...formData, host_branch: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Topic Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Cloud & AI Systems Architecture"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Target Academic Year *</label>
                      <select
                        value={formData.year || selectedYear}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Video Media Form */}
                {activeTab === "videos" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Video Title *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Introduction to Embedded Systems"
                        value={formData.title || ""}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">File Path / Stream URL *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. /videos/embedded.mp4 or https://youtube.com/..."
                        value={formData.file_path || ""}
                        onChange={(e) => setFormData({ ...formData, file_path: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Category</label>
                      <input
                        type="text"
                        placeholder="e.g. Lecture, Tutorial, Workshop"
                        value={formData.category || ""}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <ImageUploader
                      uploadEndpoint="/works/upload-image"
                      token={token}
                      initialUrl={formData.thumbnail || ""}
                      onUploadSuccess={(url) => setFormData({ ...formData, thumbnail: url })}
                      label="Video Thumbnail"
                    />
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Academic Year *</label>
                      <select
                        value={formData.year || selectedYear}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                      </select>
                    </div>
                  </>
                )}

                {/* Rooms Form */}
                {activeTab === "rooms" && (
                  <>
                    <ImageUploader
                      uploadEndpoint="/rooms/upload-image"
                      token={token}
                      initialUrl={formData.image || ""}
                      onUploadSuccess={(url) => setFormData({ ...formData, image: url })}
                      label="Room Photo"
                    />
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Room Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={formData.description || ""}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                  </>
                )}

                {/* Users Form (Superadmin) */}
                {activeTab === "users" && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Username *</label>
                      <input
                        type="text"
                        required
                        value={formData.username || ""}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">
                        Password {editingItem ? "(leave blank to keep unchanged)" : "*"}
                      </label>
                      <input
                        type="password"
                        required={!editingItem}
                        value={formData.password || ""}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Email *</label>
                      <input
                        type="email"
                        required
                        value={formData.email || ""}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Role *</label>
                      <select
                        value={formData.role || "admin"}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      >
                        <option value="admin">Admin (Year-Scoped)</option>
                        <option value="superadmin">Superadmin (God Mode)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-zinc-500 mb-1">Assigned Responsible Year (1-4) *</label>
                      <select
                        value={formData.year || 1}
                        onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                        className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm"
                      >
                        <option value={1}>Year 1</option>
                        <option value={2}>Year 2</option>
                        <option value={3}>Year 3</option>
                        <option value={4}>Year 4</option>
                      </select>
                    </div>
                  </>
                )}

                <div className="pt-6 flex items-center justify-end gap-3 border-t border-zinc-200 dark:border-zinc-800 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsDrawerOpen(false)}
                    className="px-4 py-2 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-semibold text-sm rounded-xl transition-all cursor-pointer"
                  >
                    {isTh ? "ยกเลิก" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50"
                  >
                    {saving
                      ? isTh
                        ? "กำลังบันทึก..."
                        : "Saving..."
                      : isTh
                      ? "บันทึกข้อมูล"
                      : "Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
