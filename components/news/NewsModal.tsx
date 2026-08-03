"use client";

import React, { useState, useEffect } from "react";
import { X, Plus, Pencil, FloppyDisk } from "@phosphor-icons/react";
import ImageUploader from "@/components/admin/ImageUploader";

export interface NewsArticle {
  id?: number;
  title: string;
  category: "competition" | "scholarship" | "other" | string;
  body?: string;
  link?: string;
  image?: string;
  published_at?: string;
  author_username?: string;
}

interface NewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  articleToEdit?: NewsArticle | null;
  lang: string;
  token?: string;
}

export default function NewsModal({
  isOpen,
  onClose,
  onSuccess,
  articleToEdit,
  lang,
  token,
}: NewsModalProps) {
  const isTh = lang === "th";
  const backendUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("competition");
  const [body, setBody] = useState("");
  const [link, setLink] = useState("");
  const [image, setImage] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (articleToEdit) {
      setTitle(articleToEdit.title || "");
      setCategory(articleToEdit.category || "competition");
      setBody(articleToEdit.body || "");
      setLink(articleToEdit.link || "");
      setImage(articleToEdit.image || "");
      setPublishedAt(articleToEdit.published_at || new Date().toISOString().split("T")[0]);
    } else {
      setTitle("");
      setCategory("competition");
      setBody("");
      setLink("");
      setImage("");
      setPublishedAt(new Date().toISOString().split("T")[0]);
    }
    setError("");
  }, [articleToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    setError("");

    try {
      const endpoint = articleToEdit ? `/news/${articleToEdit.id}` : `/news/`;
      const method = articleToEdit ? "PUT" : "POST";

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          title,
          category,
          body: body || null,
          link: link || null,
          image: image || null,
          published_at: publishedAt || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || "Failed to save news article");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Error saving news article");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            {articleToEdit ? <Pencil size={16} /> : <Plus size={16} />}
            <span>
              {articleToEdit
                ? isTh
                  ? "แก้ไขข่าวสาร"
                  : "Edit News Article"
                : isTh
                ? "เขียนข่าวสารใหม่"
                : "Write News Article"}
            </span>
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {isTh ? "หัวข้อข่าว *" : "Title *"}
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={isTh ? "ระบุหัวข้อข่าวหรือประกาศ..." : "Enter news title..."}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isTh ? "หมวดหมู่" : "Category"}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="competition">{isTh ? "การแข่งขัน" : "Competition"}</option>
                <option value="scholarship">{isTh ? "ทุนการศึกษา" : "Scholarship"}</option>
                <option value="other">{isTh ? "อื่นๆ" : "Other"}</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                {isTh ? "วันที่เผยแพร่" : "Published Date"}
              </label>
              <input
                type="date"
                value={publishedAt}
                onChange={(e) => setPublishedAt(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {isTh ? "รูปปกข่าว" : "Cover Image"}
            </label>
            <ImageUploader
              initialUrl={image}
              uploadEndpoint="/news/upload-image"
              token={token || ""}
              onUploadSuccess={(url) => setImage(url)}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {isTh ? "ลิงก์ข่าวภายนอก" : "External Link"}
            </label>
            <input
              type="url"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              {isTh ? "เนื้อหาข่าวสาร" : "Body Content"}
            </label>
            <textarea
              rows={5}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={isTh ? "รายละเอียดข่าว..." : "News description..."}
              className="w-full px-3 py-2 text-xs bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              {isTh ? "ยกเลิก" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-sm active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
            >
              <FloppyDisk size={14} />
              <span>{loading ? (isTh ? "กำลังบันทึก..." : "Saving...") : isTh ? "บันทึกข่าว" : "Save Article"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
