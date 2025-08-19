"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import type { FC } from "react";

const Home: FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000); // Shows splash screen for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 w-full h-screen bg-gradient-to-br from-[#00AAEC] to-[#1DA1F2] flex items-center justify-center z-50">
        <div className="flex flex-col items-center">
          <Image
            src="/twitter_logo.svg"
            alt="Twitter Logo"
            width={120}
            height={120}
            className="filter brightness-0 invert animate-custom-pulse w-30 h-30 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-30 lg:h-30"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-5 bg-white">
      <main className="text-center">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#00AAEC] animate-fade-in-up px-4">
          ¡Página cargada con éxito!
        </h1>
      </main>
    </div>
  );
};

export default Home;
