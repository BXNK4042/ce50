"use client";

import { useEffect, useRef } from "react";

export default function HeroVideo({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const savedTime = sessionStorage.getItem("hero_video_time");
    if (savedTime) {
      const time = parseFloat(savedTime);
      if (video.readyState >= 1) {
        video.currentTime = time;
      } else {
        const handleLoadedMetadata = () => {
          video.currentTime = time;
          video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        };
        video.addEventListener("loadedmetadata", handleLoadedMetadata);
      }
    }

    const handleTimeUpdate = () => {
      sessionStorage.setItem("hero_video_time", video.currentTime.toString());
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  return (
    <video
      ref={videoRef}
      src={src}
      autoPlay
      loop
      muted
      playsInline
      className="absolute inset-0 w-full h-full object-cover opacity-50 pointer-events-none z-0"
    />
  );
}
