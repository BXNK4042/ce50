"use client";

import { useState } from "react";

interface RoomImageGalleryProps {
  images?: string[] | null;
  title: string;
  tag: string;
  location: string;
}

export default function RoomImageGallery({ images, title, tag, location }: RoomImageGalleryProps) {
  if (!images || images.length === 0) return null;

  const [activeImage, setActiveImage] = useState(images[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Large Hero Image (Aspect 16:9) */}
      <div className="relative aspect-[16/9] w-full rounded-3xl overflow-hidden bg-zinc-900 border border-blue-100 dark:border-zinc-800 shadow-xl group">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-80" />

        {/* Top Floating Badges */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2">
          <span className="px-3.5 py-1.5 text-xs font-bold rounded-full bg-blue-600/90 dark:bg-sky-500/90 text-white backdrop-blur-md shadow-md">
            {tag}
          </span>
          <span className="px-3.5 py-1.5 text-xs font-semibold rounded-full bg-black/60 text-white backdrop-blur-md border border-white/10 shadow-md">
            📍 {location}
          </span>
        </div>
      </div>

      {/* Thumbnails Row */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 gap-4">
          {images.map((img, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveImage(img)}
              className={`relative aspect-[16/9] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeImage === img
                  ? "border-blue-600 dark:border-sky-400 scale-[1.02] shadow-md"
                  : "border-transparent opacity-70 hover:opacity-100 hover:border-blue-300 dark:hover:border-zinc-700"
              }`}
            >
              <img src={img} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
