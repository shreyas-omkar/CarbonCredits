"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const iframeRef = useRef(null);

  useEffect(() => {
    // Wait some time for iframe and model to load,
    // then simulate a click at center of iframe viewport
    const timer = setTimeout(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;

      // Calculate center position of iframe relative to viewport
      const rect = iframe.getBoundingClientRect();
      const clickX = rect.left + rect.width / 2;
      const clickY = rect.top + rect.height / 2;

      // Create and dispatch a click event at center
      const clickEvent = new MouseEvent("click", {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: clickX,
        clientY: clickY,
      });

      document.elementFromPoint(clickX, clickY)?.dispatchEvent(clickEvent);
    }, 4000); // 4 seconds delay, adjust if needed

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-green-700">
      {/* Fullscreen Sketchfab embed as background */}
      <div className="fixed inset-0 z-10">
        <iframe
          ref={iframeRef}
          title="Lost robot"
          frameBorder="0"
          allowFullScreen
          mozallowfullscreen="true"
          webkitallowfullscreen="true"
          allow="autoplay; fullscreen; xr-spatial-tracking"
          src="https://sketchfab.com/models/5a5c314a82864818a3fa5a0f71b17990/embed?autospin=1&ui_controls=0&ui_infos=0&ui_stop=0&ui_vr=0&ui_help=0&ui_settings=0&ui_watermark=0"
          style={{
            width: "100%",
            height: "100%",
            border: "none",
            transformOrigin: "center center",
            // You can add scale or position adjustments here if needed
          }}
        />
      </div>

      {/* Black overlay with center hole */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 20,
          backgroundColor: "rgba(0,0,0,0.95)",
          // Use CSS mask to create a transparent center hole
          WebkitMaskImage: `radial-gradient(circle 500px at center, transparent 0%, black 100%)`,
          maskImage: `radial-gradient(circle 400px at center, transparent 0%, black 100%)`,
        }}
      />

      {/* Foreground Content */}
      <section className="relative z-30 flex flex-col justify-center items-start min-h-screen max-w-2xl p-6 md:p-12 pointer-events-auto">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Carbon Credits <br /> System
        </h1>
        <p className="mb-10 text-base sm:text-lg md:text-lg text-green-600 max-w-md">
          Join the movement to reduce emissions and reward sustainability with
          our transparent, scalable platform.
        </p>
        <Link
          href="/signup"
          className="w-max px-6 py-3 border-2 border-green-700 rounded text-green-700 hover:bg-green-700 hover:text-black transition text-sm sm:text-base"
          aria-label="Get Started"
        >
          Get Started
        </Link>

        {/* Attribution links below */}
        <p
          className="mt-12 text-xs font-normal text-green-400"
          style={{ maxWidth: "320px" }}
        >
        </p>
      </section>

    </main>
  );
}
