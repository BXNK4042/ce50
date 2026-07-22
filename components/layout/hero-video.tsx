"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function HomeBackgroundVideo({ src }: { src: string }) {
  const pathname = usePathname();
  // Check if current page is the homepage for either language
  const isHome = pathname === "/th" || pathname === "/en" || pathname === "/";

  useEffect(() => {
    // Check if the global video element already exists in the document body
    let video = document.getElementById("global-hero-video") as HTMLVideoElement;

    if (!video) {
      video = document.createElement("video");
      video.id = "global-hero-video";
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.setAttribute("playsinline", "");
      
      // Styled with fixed, full-bleed positioning, pointer-events-none, and z-index -10 to place it behind all contents
      video.className = "fixed inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-500";
      video.style.zIndex = "0";
      video.style.opacity = "0";
      
      document.body.appendChild(video);
    }

    // Update src if it has changed
    const absoluteSrc = new URL(src, window.location.href).href;
    if (video.src !== absoluteSrc) {
      video.src = src;
      video.load();
      if (isHome) {
        video.play().catch((err) => {
          console.warn("Video play was prevented:", err);
        });
      }
    }

    if (isHome) {
      // Show the video with 50% opacity
      video.style.display = "block";
      // Accessing offsetWidth forces a reflow, allowing the transition to trigger correctly from display: none to block
      void video.offsetWidth;
      video.style.opacity = "0.5";

      if (video.paused) {
        video.play().catch((err) => {
          console.warn("Video play was prevented:", err);
        });
      }
    } else {
      // Fade out the video
      video.style.opacity = "0";
      const handleTransitionEnd = () => {
        if (video.style.opacity === "0") {
          video.style.display = "none";
        }
      };
      video.addEventListener("transitionend", handleTransitionEnd, { once: true });
    }
  }, [isHome, src]);

  return null;
}
