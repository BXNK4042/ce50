"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe } from "@phosphor-icons/react";
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
  const [syncingGnews, setSyncingGnews] = useState(false);

  const handleSyncGNews = async () => {
    setSyncingGnews(true);
    setError("");
    try {
      const res = await fetch(`${backendUrl}/news/sync-gnews`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to sync GNews");
      }
      const data = await res.json();
      setSuccessMsg(isTh ? `ดึงข่าว GNews สำเร็จ (${data.inserted || 0} ข่าวใหม่)` : `GNews synced successfully (${data.inserted || 0} new items)`);
      setTimeout(() => setSuccessMsg(""), 4000);
      fetchData();
    } catch (err: any) {
      setError(err.message || "GNews sync failed");
    } finally {
      setSyncingGnews(false);
    }
  };

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

    if (!userToken || !userRole) {
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
    if (role !== "superadmin" && (activeTab === "teachers" || activeTab === "rooms" || activeTab === "users" || activeTab === "news")) {
      setActiveTab("schedules_class");
      return;
    }
    if (activeTab !== "schedules_class" && activeTab !== "schedules_exam") {
      fetchData();
    }
  }, [activeTab, selectedYear, isLoggedIn, role]);

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
          endpoint = `/internship/students?year=${selectedYear}`;
          break;
        case "videos":
          endpoint = `/videos?year=${selectedYear}`;
          break;
        case "news":
          endpoint = `/news`;
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
    setFormData(initialForm);
    setIsDrawerOpen(true);
  };

  // Open Edit Form
  const handleEdit = (item: any) => {
    setEditingItem(item);
    const itemCopy = { ...item };
    if (Array.isArray(itemCopy.advise_years)) {
      itemCopy.advise_years = itemCopy.advise_years.join(", ");
    }
    if (Array.isArray(itemCopy.author_ids)) {
      itemCopy.author_ids = itemCopy.author_ids.join(", ");
    }
    setFormData(itemCopy);
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
          endpoint = `/internship/students/${id}`;
          break;
        case "videos":
          endpoint = `/videos/${id}`;
          break;
        case "news":
          endpoint = `/news/${id}`;
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

      if (["students", "works", "videos"].includes(activeTab)) {
        payload.year = Number(payload.year || selectedYear);
      }

      if (activeTab === "teachers" && typeof payload.advise_years === "string") {
        const raw = payload.advise_years.trim();
        if (raw) {
          payload.advise_years = raw.startsWith("[")
            ? raw
            : raw.split(",").map((s: string) => s.trim()).filter(Boolean);
        } else {
          payload.advise_years = null;
        }
      }

      if (activeTab === "works" && typeof payload.author_ids === "string") {
        const raw = payload.author_ids.trim();
        payload.author_ids = raw ? raw : null;
      }

      switch (activeTab) {
        case "students":
          endpoint = editingItem ? `/people/students/${editingItem.id}` : `/people/students`;
          break;
        case "works":
          endpoint = editingItem ? `/works/${editingItem.id}` : `/works`;
          break;
        case "internship":
          endpoint = editingItem ? `/internship/students/${editingItem.id}` : `/internship/students`;
          break;
        case "videos":
          endpoint = editingItem ? `/videos/${editingItem.id}` : `/videos`;
          break;
        case "news":
          endpoint = editingItem ? `/news/${editingItem.id}` : `/news`;
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
          { key: "slug", labelEn: "Slug / ID", labelTh: "รหัส/Slug" },
          { key: "title_th", labelEn: "Title (TH)", labelTh: "ชื่อภาษาไทย" },
          { key: "title_en", labelEn: "Title (EN)", labelTh: "ชื่อภาษาอังกฤษ" },
          { key: "location_th", labelEn: "Location", labelTh: "สถานที่" },
          { key: "tag_th", labelEn: "Tag", labelTh: "หมวดหมู่ห้อง" },
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
          { key: "company", labelEn: "Company", labelTh: "บริษัทที่ฝึกงาน" },
          { key: "position_th", labelEn: "Position", labelTh: "ตำแหน่ง" },
          { key: "name_th", labelEn: "Student Name", labelTh: "ชื่อนิสิต" },
          { key: "period_th", labelEn: "Period", labelTh: "ระยะเวลา" },
        ];
      case "news":
        return [
          { key: "id", labelEn: "ID", labelTh: "รหัส" },
          { key: "title", labelEn: "Title", labelTh: "หัวข้อข่าว" },
          { key: "category", labelEn: "Category", labelTh: "หมวดหมู่" },
          { key: "published_at", labelEn: "Published Date", labelTh: "วันที่เผยแพร่" },
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
          { name: "photo", labelEn: "Profile Photo", labelTh: "รูปโปรไฟล์", type: "image" as const, uploadEndpoint: "/people/students/upload-image" },
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
          { name: "author_ids", labelEn: "Author Student IDs", labelTh: "รหัสนิสิตผู้สร้าง (JSON/Comma)", placeholderEn: "e.g. 1, 2, 3" },
          { name: "image", labelEn: "Cover Image", labelTh: "รูปหน้าปก", type: "image" as const, uploadEndpoint: "/works/upload-image" },
        ];
      case "teachers":
        return [
          { name: "name_th", labelEn: "Name (TH)", labelTh: "ชื่อภาษาไทย", required: true },
          { name: "name_en", labelEn: "Name (EN)", labelTh: "ชื่อภาษาอังกฤษ" },
          { name: "role_th", labelEn: "Role (TH)", labelTh: "ตำแหน่ง (ไทย)" },
          { name: "role_en", labelEn: "Role (EN)", labelTh: "ตำแหน่ง (อังกฤษ)" },
          { name: "advise_years", labelEn: "Advise Years", labelTh: "ชั้นปีที่ดูแล (Comma/JSON)", placeholderEn: "e.g. 1, 2, 3" },
          { name: "contact", labelEn: "Contact", labelTh: "การติดต่อ" },
          { name: "photo", labelEn: "Photo", labelTh: "รูปถ่าย", type: "image" as const, uploadEndpoint: "/people/teachers/upload-image" },
        ];
      case "rooms":
        return [
          { name: "slug", labelEn: "Room Slug / ID", labelTh: "รหัสห้อง / Slug (เช่น 113, server-room)", required: true },
          { name: "name", labelEn: "Display Name", labelTh: "ชื่อระบุ", required: true },
          { name: "title_th", labelEn: "Title (TH)", labelTh: "ชื่อภาษาไทย (เช่น ห้องเรียน 113)", required: true },
          { name: "title_en", labelEn: "Title (EN)", labelTh: "ชื่อภาษาอังกฤษ (เช่น Classroom 113)", required: true },
          { name: "location_th", labelEn: "Location (TH)", labelTh: "สถานที่ (ไทย)" },
          { name: "location_en", labelEn: "Location (EN)", labelTh: "สถานที่ (อังกฤษ)" },
          { name: "tag_th", labelEn: "Tag (TH)", labelTh: "แท็กประเภท (ไทย)" },
          { name: "tag_en", labelEn: "Tag (EN)", labelTh: "แท็กประเภท (อังกฤษ)" },
          { name: "desc_th", labelEn: "Description (TH)", labelTh: "รายละเอียด (ไทย)", type: "textarea" as const },
          { name: "desc_en", labelEn: "Description (EN)", labelTh: "รายละเอียด (อังกฤษ)", type: "textarea" as const },
          { name: "features_th", labelEn: "Features TH (JSON/Comma)", labelTh: "สิ่งอำนวยความสะดวก (ไทย)", type: "textarea" as const },
          { name: "features_en", labelEn: "Features EN (JSON/Comma)", labelTh: "สิ่งอำนวยความสะดวก (อังกฤษ)", type: "textarea" as const },
          { name: "image", labelEn: "Room Images", labelTh: "รูปภาพห้อง", type: "image" as const, uploadEndpoint: "/rooms/upload-image", multiple: true },
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
          { name: "student_id", labelEn: "Student ID", labelTh: "รหัสนิสิต" },
          { name: "company", labelEn: "Company", labelTh: "บริษัทที่ฝึกงาน", required: true },
          { name: "position_th", labelEn: "Position (TH)", labelTh: "ตำแหน่ง (ไทย)", required: true },
          { name: "position_en", labelEn: "Position (EN)", labelTh: "ตำแหน่ง (อังกฤษ)" },
          { name: "period_th", labelEn: "Period (TH)", labelTh: "ระยะเวลา (ไทย)" },
          { name: "period_en", labelEn: "Period (EN)", labelTh: "ระยะเวลา (อังกฤษ)" },
          { name: "summary_th", labelEn: "Summary (TH)", labelTh: "สรุป (ไทย)", type: "textarea" as const },
          { name: "summary_en", labelEn: "Summary (EN)", labelTh: "สรุป (อังกฤษ)", type: "textarea" as const },
          { name: "description_th", labelEn: "Description (TH)", labelTh: "รายละเอียด (ไทย)", type: "textarea" as const },
          { name: "description_en", labelEn: "Description (EN)", labelTh: "รายละเอียด (อังกฤษ)", type: "textarea" as const },
          { name: "tech", labelEn: "Technologies", labelTh: "เทคโนโลยีที่ใช้" },
          { name: "advice_th", labelEn: "Advice (TH)", labelTh: "คำแนะนำ (ไทย)", type: "textarea" as const },
          { name: "advice_en", labelEn: "Advice (EN)", labelTh: "คำแนะนำ (อังกฤษ)", type: "textarea" as const },
          { name: "stipend_th", labelEn: "Stipend (TH)", labelTh: "ค่าตอบแทน (ไทย)" },
          { name: "stipend_en", labelEn: "Stipend (EN)", labelTh: "ค่าตอบแทน (อังกฤษ)" },
          { name: "welfare_th", labelEn: "Welfare (TH)", labelTh: "สวัสดิการ (ไทย)" },
          { name: "welfare_en", labelEn: "Welfare (EN)", labelTh: "สวัสดิการ (อังกฤษ)" },
          { name: "rating", labelEn: "Rating", labelTh: "คะแนนรีวิว (1-5)", type: "number" as const },
          { name: "bg_image", labelEn: "Background Image", labelTh: "รูปพื้นหลัง", type: "image" as const, uploadEndpoint: "/internship/upload-image" },
          { name: "logo", labelEn: "Company Logo", labelTh: "โลโก้บริษัท", type: "image" as const, uploadEndpoint: "/internship/upload-image" },
        ];
      case "news":
        return [
          { name: "title", labelEn: "Title", labelTh: "หัวข้อข่าว", required: true },
          {
            name: "category",
            labelEn: "Category",
            labelTh: "หมวดหมู่",
            type: "select" as const,
            options: [
              { value: "competition", label: "Competition (การแข่งขัน)" },
              { value: "scholarship", label: "Scholarship (ทุนการศึกษา)" },
              { value: "other", label: "Other (อื่นๆ)" },
            ],
          },
          { name: "published_at", labelEn: "Published Date", labelTh: "วันที่เผยแพร่ (YYYY-MM-DD)", type: "date" as const },
          { name: "link", labelEn: "External Link", labelTh: "ลิงก์ภายนอก" },
          { name: "image", labelEn: "Cover Image", labelTh: "รูปปกข่าว", type: "image" as const, uploadEndpoint: "/news/upload-image" },
          { name: "body", labelEn: "Body Content", labelTh: "เนื้อหาข่าว", type: "textarea" as const },
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
      case "news":
        return isTh ? "จัดการข่าวสารและประกาศ" : "News & Announcements";
      default:
        return "Admin View";
    }
  };

  if (role === "writer") {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-8 rounded-2xl max-w-md shadow-xl space-y-4">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto text-xl font-mono font-bold">
            ✍️
          </div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {isTh ? "บัญชีประเภทผู้เขียน (Writer Account)" : "Writer Account Notice"}
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {isTh
              ? "สิทธิ์ประเภท Writer ไม่สามารถเข้าถึง Dashboard การจัดการระบบ (ตารางเรียน/สอบ นิสิต อาจารย์ ห้องเรียน) ได้"
              : "Writer accounts do not have access to the Administrative Dashboard management features."}
          </p>
          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                document.cookie = "admin_token=; path=/; max-age=0";
                document.cookie = "admin_role=; path=/; max-age=0";
                document.cookie = "admin_year=; path=/; max-age=0";
                router.push(`/${lang}/admin/login`);
              }}
              className="w-full py-2.5 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs rounded-xl shadow-xs hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-all cursor-pointer"
            >
              {isTh ? "ออกจากระบบ (Log Out)" : "Log Out"}
            </button>
            <Link
              href={`/${lang}`}
              className="text-xs text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors pt-1"
            >
              {isTh ? "← กลับสู่หน้าหลัก" : "← Return to Homepage"}
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          customAction={
            activeTab === "news" ? (
              <button
                type="button"
                onClick={handleSyncGNews}
                disabled={syncingGnews}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/20 rounded-lg text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              >
                <Globe size={14} className={syncingGnews ? "animate-spin" : ""} />
                <span>{syncingGnews ? (isTh ? "กำลังดึงข่าว..." : "Syncing...") : (isTh ? "Sync GNews" : "Sync GNews")}</span>
              </button>
            ) : undefined
          }
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
