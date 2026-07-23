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
}

const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

export default function ImageUploader({
  uploadEndpoint,
  token,
  initialUrl = "",
  onUploadSuccess,
  label = "Upload Image",
  acceptTypes = DEFAULT_ALLOWED_TYPES,
  maxSizeMB = 5,
}: ImageUploaderProps) {
  const [imageUrl, setImageUrl] = useState<string>(initialUrl);
  const [uploading, setUploading] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setImageUrl(initialUrl);
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

  const uploadFile = async (file: File) => {
    if (!validateFile(file)) return;

    setUploading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
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
      const returnedUrl: string = data.url || data.file_path || "";
      setImageUrl(returnedUrl);
      onUploadSuccess(returnedUrl);
    } catch (err: any) {
      setError(err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadFile(file);
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

    const file = e.dataTransfer.files?.[0];
    if (file) {
      uploadFile(file);
    }
  };

  const handleRemove = () => {
    setImageUrl("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onUploadSuccess("");
  };

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
  const displayUrl = imageUrl
    ? imageUrl.startsWith("http") || imageUrl.startsWith("data:")
      ? imageUrl
      : `${baseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`
    : "";

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400">{label}</label>}

      {imageUrl ? (
        <div className="relative w-full h-44 bg-zinc-900 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 group shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={displayUrl}
            alt="Thumbnail preview"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleRemove}
              className="px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer"
            >
              Remove Image
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer ${
            isDragging
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 scale-[1.01]"
              : "border-zinc-300 dark:border-zinc-700 hover:border-blue-500 bg-zinc-50 dark:bg-zinc-800/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />
          <div className="space-y-1 pointer-events-none">
            <div className="text-2xl mb-1">📷</div>
            <div className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">
              {uploading
                ? "Uploading image..."
                : isDragging
                ? "Drop image here..."
                : "Click or drag & drop image to upload"}
            </div>
            <div className="text-[10px] text-zinc-400">Supported formats: JPG, PNG, WebP (Max {maxSizeMB}MB)</div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
    </div>
  );
}
