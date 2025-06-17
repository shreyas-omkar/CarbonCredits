"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

export default function Home() {
  const iframeRef = useRef(null);
  const clickForwarderRef = useRef(null);

  useEffect(() => {
    const handleClickForward = (e) => {
      const iframe = iframeRef.current;
      const forwarder = clickForwarderRef.current;
      if (!iframe || !forwarder) return;

      // Prevent recursive dispatch when dispatching synthetic click
      // We won't dispatch if the element found is the forwarder itself
      const rect = iframe.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Find the element at center point
      const el = document.elementFromPoint(centerX, centerY);

      if (!el || forwarder.contains(el)) {
        // If the element at center is inside forwarder div itself,
        // don't dispatch to avoid recursion
        return;
      }

      // Create and dispatch synthetic click event
      const event = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: centerY,
        view: window,
      });

      el.dispatchEvent(event);
    };

    const btn = clickForwarderRef.current;
    if (!btn) return;
    btn.addEventListener("click", handleClickForward);

    return () => {
      if (btn && btn.isConnected) {
        btn.removeEventListener("click", handleClickForward);
      }
    };
  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-green-700">
      {/* Fullscreen Sketchfab iframe */}
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
          }}
        />
      </div>

      {/* Black overlay with transparent center */}
      <div
        id="overlay-click-layer"
        className="pointer-events-none fixed inset-0 z-20"
        style={{
          backgroundColor: "rgba(0,0,0,0.95)",
          WebkitMaskImage: `radial-gradient(circle 500px at center, transparent 0%, black 100%)`,
          maskImage: `radial-gradient(circle 500px at center, transparent 0%, black 100%)`,
        }}
      />

      {/* Transparent forward-click full width/height */}
      {/* <div
        ref={clickForwarderRef}
        id="click-forwarder"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          zIndex: 30,
          background: "transparent",
          pointerEvents: "auto",
          cursor: "pointer",
        }}
      /> */}

      {/* Foreground UI */}
      <section className="relative z-40 flex flex-col justify-center items-start min-h-screen max-w-2xl p-6 md:p-12 pointer-events-auto">
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
      </section>
    </main>
  );
}
