"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AdminShell, { TabType } from "@/components/admin/AdminShell";
import LinearDataTable from "@/components/admin/LinearDataTable";
import LinearCrudDrawer from "@/components/admin/LinearCrudDrawer";
import ClassScheduleGrid from "@/components/admin/ClassScheduleGrid";
import ExamScheduleTable from "@/components/admin/ExamScheduleTable";

interface AdminPageProps {
  params: Promise<{ lang: string }>;
  searchParams?: Promise<{ tab?: string }>;
}

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
  const [dataCounts, setDataCounts] = useState<Record<string, number>>({});
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

    if (!userToken && !userRole) {
      router.push(`/${lang}/admin/login`);
      return;
    }

    setIsLoggedIn(true);
    setRole(userRole || "admin");
    setAdminYear(userYear);
    setToken(userToken);
    setSelectedYear(userRole === "superadmin" ? 1 : userYear);
    setAuthLoading(false);
  }, [lang, router]);

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
      const list = Array.isArray(data) ? data : [];
      setDataList(list);
      setDataCounts((prev) => ({ ...prev, [activeTab]: list.length }));
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

  // Save Form Handler
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      let endpoint = "";
      let method = editingItem ? "PUT" : "POST";
      const payload = { ...formData };

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

      setIsDrawerOpen(false);
      setSuccessMsg(isTh ? "บันทึกข้อมูลสำเร็จ" : "Saved successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchData();
    } catch (err: any) {
      setError(err.message || "Error saving item");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-[100dvh] bg-zinc-950 flex items-center justify-center text-zinc-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="h-4 w-4 border-2 border-zinc-700 border-t-zinc-200 rounded-full animate-spin" />
          <span>Authenticating Admin Session...</span>
        </div>
      </div>
    );
  }

  // Define Columns and Fields per Tab
  const getTableColumns = () => {
    switch (activeTab) {
      case "students":
        return [
          { key: "student_id", labelEn: "Student ID", labelTh: "รหัสนิสิต" },
          { key: "name_th", labelEn: "Name (TH)", labelTh: "ชื่อภาษาไทย" },
          { key: "name_en", labelEn: "Name (EN)", labelTh: "ชื่อภาษาอังกฤษ" },
          { key: "track", labelEn: "Track", labelTh: "สายรหัส" },
          { key: "class_role", labelEn: "Class Role", labelTh: "ตำแหน่งในห้อง" },
          { key: "contact", labelEn: "Contact", labelTh: "การติดต่อ" },
        ];
      case "works":
        return [
          { key: "title", labelEn: "Title", labelTh: "ชื่อผลงาน" },
          { key: "scope", labelEn: "Scope", labelTh: "ขอบเขต" },
          { key: "year", labelEn: "Cohort Year", labelTh: "ชั้นปี" },
          { key: "description", labelEn: "Description", labelTh: "รายละเอียด" },
        ];
      case "teachers":
        return [
          { key: "name_th", labelEn: "Name (TH)", labelTh: "ชื่อภาษาไทย" },
          { key: "name_en", labelEn: "Name (EN)", labelTh: "ชื่อภาษาอังกฤษ" },
          { key: "contact", labelEn: "Contact", labelTh: "การติดต่อ" },
        ];
      case "rooms":
        return [
          { key: "name", labelEn: "Room Name", labelTh: "ชื่อห้อง" },
          { key: "description", labelEn: "Description", labelTh: "รายละเอียด" },
        ];
      case "users":
        return [
          { key: "username", labelEn: "Username", labelTh: "ชื่อผู้ใช้" },
          { key: "email", labelEn: "Email", labelTh: "อีเมล" },
          { key: "role", labelEn: "Role", labelTh: "สิทธิ์การใช้งาน" },
          { key: "year", labelEn: "Cohort Year", labelTh: "ชั้นปีที่ดูแล" },
        ];
      case "internship":
        return [
          { key: "host_branch", labelEn: "Host Branch / Company", labelTh: "สาขา/บริษัทที่ฝึก" },
          { key: "title", labelEn: "Topic / Title", labelTh: "หัวข้อ" },
          { key: "description", labelEn: "Description", labelTh: "รายละเอียด" },
          { key: "year", labelEn: "Year", labelTh: "ปี" },
        ];
      case "videos":
        return [
          { key: "title", labelEn: "Title", labelTh: "หัวข้อ" },
          { key: "category", labelEn: "Category", labelTh: "หมวดหมู่" },
          { key: "file_path", labelEn: "File / Video URL", labelTh: "ลิงก์วิดีโอ" },
          { key: "year", labelEn: "Year", labelTh: "ปี" },
        ];
      default:
        return [];
    }
  };

  const getFormFields = () => {
    switch (activeTab) {
      case "students":
        return [
          { name: "student_id", labelEn: "Student ID", labelTh: "รหัสนิสิต", required: true },
          { name: "name_th", labelEn: "Name (TH)", labelTh: "ชื่อภาษาไทย", required: true },
          { name: "name_en", labelEn: "Name (EN)", labelTh: "ชื่อภาษาอังกฤษ" },
          { name: "track", labelEn: "Track", labelTh: "สายรหัส" },
          { name: "class_role", labelEn: "Class Role", labelTh: "ตำแหน่งในห้อง" },
          { name: "contact", labelEn: "Contact", labelTh: "การติดต่อ" },
          { name: "photo", labelEn: "Profile Photo", labelTh: "รูปโปรไฟล์", type: "image" as const },
        ];
      case "works":
        return [
          { name: "title", labelEn: "Title", labelTh: "ชื่อผลงาน", required: true },
          {
            name: "scope",
            labelEn: "Scope",
            labelTh: "ขอบเขต",
            type: "select" as const,
            options: [
              { value: "branch", label: "Branch (สาขา)" },
              { value: "group", label: "Group (กลุ่ม)" },
              { value: "solo", label: "Solo (บุคคล)" },
            ],
          },
          { name: "description", labelEn: "Description", labelTh: "รายละเอียด", type: "textarea" as const },
          { name: "image", labelEn: "Cover Image", labelTh: "รูปหน้าปก", type: "image" as const },
        ];
      case "teachers":
        return [
          { name: "name_th", labelEn: "Name (TH)", labelTh: "ชื่อภาษาไทย", required: true },
          { name: "name_en", labelEn: "Name (EN)", labelTh: "ชื่อภาษาอังกฤษ" },
          { name: "contact", labelEn: "Contact", labelTh: "การติดต่อ" },
          { name: "photo", labelEn: "Photo", labelTh: "รูปถ่าย", type: "image" as const },
        ];
      case "rooms":
        return [
          { name: "name", labelEn: "Room Name", labelTh: "ชื่อห้อง", required: true },
          { name: "description", labelEn: "Description", labelTh: "รายละเอียด", type: "textarea" as const },
          { name: "image", labelEn: "Room Image", labelTh: "รูปห้อง", type: "image" as const },
        ];
      case "users":
        return [
          { name: "username", labelEn: "Username", labelTh: "ชื่อผู้ใช้", required: true },
          { name: "email", labelEn: "Email", labelTh: "อีเมล", required: true },
          { name: "password", labelEn: "Password", labelTh: "รหัสผ่าน", type: "text" as const, required: !editingItem },
          {
            name: "role",
            labelEn: "Role",
            labelTh: "สิทธิ์การใช้งาน",
            type: "select" as const,
            options: [
              { value: "admin", label: "Admin" },
              { value: "superadmin", label: "Super Admin" },
              { value: "writer", label: "Writer" },
            ],
          },
          { name: "year", labelEn: "Cohort Year", labelTh: "ชั้นปีที่ดูแล", type: "number" as const },
        ];
      case "internship":
        return [
          { name: "host_branch", labelEn: "Host Branch / Company", labelTh: "สาขา/บริษัทที่ฝึก", required: true },
          { name: "title", labelEn: "Topic / Title", labelTh: "หัวข้อ", required: true },
          { name: "description", labelEn: "Description", labelTh: "รายละเอียด", type: "textarea" as const },
        ];
      case "videos":
        return [
          { name: "title", labelEn: "Title", labelTh: "หัวข้อ", required: true },
          { name: "file_path", labelEn: "File / Video URL", labelTh: "ลิงก์วิดีโอ", required: true },
          { name: "category", labelEn: "Category", labelTh: "หมวดหมู่" },
          { name: "description", labelEn: "Description", labelTh: "รายละเอียด", type: "textarea" as const },
          { name: "thumbnail", labelEn: "Thumbnail", labelTh: "รูปตัวอย่าง", type: "image" as const },
        ];
      default:
        return [];
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case "schedules_class":
        return isTh ? "ตารางเรียน" : "Class Schedule";
      case "schedules_exam":
        return isTh ? "ตารางสอบ" : "Exam Schedule";
      case "students":
        return isTh ? "จัดการข้อมูลนิสิต" : "Student Directory";
      case "works":
        return isTh ? "จัดการผลงานนิสิต" : "Student Works Portfolio";
      case "teachers":
        return isTh ? "จัดการคณาจารย์" : "Faculty & Staff";
      case "rooms":
        return isTh ? "จัดการห้องเรียน" : "Rooms Directory";
      case "users":
        return isTh ? "จัดการผู้ใช้งานระบบ" : "Admin Accounts";
      case "internship":
        return isTh ? "จัดการข้อมูลฝึกงาน" : "Internship Records";
      case "videos":
        return isTh ? "จัดการสื่อวิดีโอ" : "Media Library";
      default:
        return "Admin View";
    }
  };

  return (
    <AdminShell
      activeTab={activeTab}
      onTabChange={(tab) => {
        setActiveTab(tab);
        setSearchQuery("");
      }}
      selectedYear={selectedYear}
      onYearChange={setSelectedYear}
      selectedTerm={selectedTerm}
      onTermChange={setSelectedTerm}
      role={role}
      adminYear={adminYear}
      lang={lang}
      isTh={isTh}
    >
      {/* Toast Notifications */}
      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-xl flex items-center justify-between animate-fade-in">
          <span>{successMsg}</span>
        </div>
      )}
      {error && (
        <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl flex items-center justify-between animate-fade-in">
          <span>{error}</span>
        </div>
      )}

      {/* Dynamic Tab Views */}
      {activeTab === "schedules_class" ? (
        <ClassScheduleGrid
          year={selectedYear}
          term={selectedTerm}
          token={token}
          onSaveSuccess={() => {
            fetchData();
            setSuccessMsg("Class timetable saved successfully!");
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
        />
      ) : activeTab === "schedules_exam" ? (
        <ExamScheduleTable
          year={selectedYear}
          term={selectedTerm}
          token={token}
          onSaveSuccess={() => {
            fetchData();
            setSuccessMsg("Exam schedule saved successfully!");
            setTimeout(() => setSuccessMsg(""), 4000);
          }}
        />
      ) : (
        <LinearDataTable
          data={dataList}
          columns={getTableColumns()}
          loading={loading}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onCreate={handleCreate}
          onRefresh={fetchData}
          isTh={isTh}
          title={getTabTitle()}
          subtitle={`Year ${selectedYear} Cohort Management`}
        />
      )}

      {/* Crud Slide-Over Drawer */}
      <LinearCrudDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onSave={handleSave}
        title={getTabTitle()}
        isEditing={Boolean(editingItem)}
        formData={formData}
        setFormData={setFormData}
        fields={getFormFields()}
        saving={saving}
        error={error}
        isTh={isTh}
        token={token}
      />
    </AdminShell>
  );
}
