"use client";

import React, { useState, useEffect, useRef, DragEvent, ChangeEvent } from "react";

export interface ImageUploaderProps {
  uploadEndpoint: string;
  token: string;
  initialUrl?: string;
  onUploadSuccess: (url: string) => void;
  label?: string;
  acceptTypes?: string[];
  maxSizeMB?: number;
  multiple?: boolean;
}

const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

const parseInitialUrls = (raw?: string): string[] => {
  if (!raw) return [];
  if (raw.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch {}
  }
  if (raw.includes(",")) {
    return raw.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return [raw.trim()].filter(Boolean);
};

export default function ImageUploader({
  uploadEndpoint,
  token,
  initialUrl = "",
  onUploadSuccess,
  label = "Upload Image",
  acceptTypes = DEFAULT_ALLOWED_TYPES,
  maxSizeMB = 5,
  multiple = false,
}: ImageUploaderProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(() => parseInitialUrls(initialUrl));
  const [uploading, setUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageUrls(parseInitialUrls(initialUrl));
  }, [initialUrl]);

  const validateFile = (file: File): boolean => {
    setError("");
    const fileType = file.type.toLowerCase();
    const extension = file.name.split(".").pop()?.toLowerCase() || "";

    const validExtensions = ["jpg", "jpeg", "png", "webp"];
    const isTypeValid =
      acceptTypes.some((t) => fileType.includes(t.replace("image/", ""))) ||
      validExtensions.includes(extension);

    if (!isTypeValid) {
      setError("Invalid file type. Only JPG, PNG, and WebP are allowed.");
      return false;
    }

    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File size exceeds ${maxSizeMB}MB limit.`);
      return false;
    }

    return true;
  };

  const uploadSingleFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);

    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";
    const fullUrl = uploadEndpoint.startsWith("http")
      ? uploadEndpoint
      : `${baseUrl}${uploadEndpoint.startsWith("/") ? "" : "/"}${uploadEndpoint}`;

    const res = await fetch(fullUrl, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    return data.url || data.file_path || "";
  };

  const handleFiles = async (files: File[]) => {
    const validFiles = files.filter(validateFile);
    if (validFiles.length === 0) return;

    setUploading(true);
    setError("");

    try {
      const uploadedUrls: string[] = [];
      for (const f of validFiles) {
        const url = await uploadSingleFile(f);
        if (url) uploadedUrls.push(url);
      }

      if (multiple) {
        const nextUrls = [...imageUrls, ...uploadedUrls];
        setImageUrls(nextUrls);
        onUploadSuccess(JSON.stringify(nextUrls));
      } else {
        const singleUrl = uploadedUrls[0] || "";
        setImageUrls(singleUrl ? [singleUrl] : []);
        onUploadSuccess(singleUrl);
      }
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files ? Array.from(e.dataTransfer.files) : [];
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleRemove = (indexToRemove?: number) => {
    setError("");
    if (multiple && typeof indexToRemove === "number") {
      const nextUrls = imageUrls.filter((_, idx) => idx !== indexToRemove);
      setImageUrls(nextUrls);
      onUploadSuccess(nextUrls.length > 0 ? JSON.stringify(nextUrls) : "");
    } else {
      setImageUrls([]);
      onUploadSuccess("");
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "";

  const getDisplayUrl = (url: string) =>
    url.startsWith("http") || url.startsWith("data:")
      ? url
      : `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">{label}</label>}

      {imageUrls.length > 0 && (
        <div className={multiple ? "grid grid-cols-2 gap-2 mb-2" : "mb-2"}>
          {imageUrls.map((url, idx) => (
            <div key={idx} className="relative w-full h-36 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={getDisplayUrl(url)}
                alt={`Image preview ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => handleRemove(multiple ? idx : undefined)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(!multiple && imageUrls.length === 0) || multiple ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]"
              : "border-zinc-300 dark:border-zinc-700 hover:border-blue-500 bg-zinc-50 dark:bg-zinc-800/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple={multiple}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <div className="space-y-1 pointer-events-none">
            <div className="text-xl">📷</div>
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              {uploading
                ? "Uploading image..."
                : isDragging
                ? "Drop image(s) here..."
                : multiple
                ? "+ Add / Drag & drop image(s)"
                : "Click or drag & drop image to upload"}
            </div>
            <div className="text-[10px] text-zinc-400">
              Supported formats: JPG, PNG, WebP (Max {maxSizeMB}MB{multiple ? ", Multiple allowed" : ""})
            </div>
          </div>
        </div>
      ) : null}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
