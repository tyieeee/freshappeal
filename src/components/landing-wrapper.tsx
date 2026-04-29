"use client";
import { useState, useEffect } from "react";
import { LoadingPage } from "./loading-page";

interface LandingWrapperProps {
  children: React.ReactNode;
}

export function LandingWrapper({ children }: LandingWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload images
    const images = [
      "/hero.png",
      "/cap.png",
      "/man.jpeg",
      "/collection1.jpeg",
      "/collection2.jpeg",
      "/collection3.jpeg",
      "/collection4.jpeg",
      "/cap1.jpeg",
      "/cap2.jpeg",
      "/jacket.jpeg",
      "/tshirt.png",
      "/logo.png"
    ];

    let loadedCount = 0;
    const totalImages = images.length;

    images.forEach((src) => {
      const img = new Image();
      img.src = src;
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setIsLoading(false);
        }
      };
    });

    // Fallback timeout in case images fail to load
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <>
      {isLoading && <LoadingPage onComplete={() => setIsLoading(false)} />}
      {!isLoading && children}
    </>
  );
}
