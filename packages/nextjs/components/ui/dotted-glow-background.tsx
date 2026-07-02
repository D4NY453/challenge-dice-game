"use client";

import React, { useEffect, useRef } from "react";

interface DottedGlowBackgroundProps {
  className?: string;
  opacity?: number;
  gap?: number;
  radius?: number;
  colorLightVar?: string;
  glowColorLightVar?: string;
  colorDarkVar?: string;
  glowColorDarkVar?: string;
  backgroundOpacity?: number;
  speedMin?: number;
  speedMax?: number;
  speedScale?: number;
}

export const DottedGlowBackground: React.FC<DottedGlowBackgroundProps> = ({
  className = "",
  opacity = 1,
  gap = 12,
  radius = 2,
  colorLightVar = "--color-neutral-500",
  glowColorLightVar = "--color-neutral-600",
  colorDarkVar = "--color-neutral-500",
  glowColorDarkVar = "--color-sky-800",
  backgroundOpacity = 0,
  speedMin = 0.3,
  speedMax = 1.6,
  speedScale = 1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Helper to resolve CSS variables to actual colors
    const resolveColor = (varName: string, fallback: string): string => {
      if (typeof window === "undefined") return fallback;
      const val = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
      return val || fallback;
    };

    // Detect if dark mode is active
    const isDarkMode = (): boolean => {
      if (typeof window === "undefined") return true;
      const html = document.documentElement;
      return html.getAttribute("data-theme") === "dark" || html.classList.contains("dark");
    };

    // Track active colors
    let dotColor = "#888888";
    let glowColor = "#0284c7";

    const updateColors = () => {
      const dark = isDarkMode();
      dotColor = resolveColor(dark ? colorDarkVar : colorLightVar, "#888888");
      glowColor = resolveColor(dark ? glowColorDarkVar : glowColorLightVar, "#0284c7");
    };

    // Handle resize
    const handleResize = () => {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;
      canvas.width = width * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    updateColors();

    window.addEventListener("resize", handleResize);

    // Watch for theme changes
    const observer = new MutationObserver(() => {
      updateColors();
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme", "class"] });

    // Initialize dots with random phases and speeds
    const cols = Math.ceil(width / gap) + 1;
    const rows = Math.ceil(height / gap) + 1;
    const dots: { phase: number; speed: number }[] = [];

    for (let i = 0; i < cols * rows; i++) {
      dots.push({
        phase: Math.random() * Math.PI * 2,
        speed: (speedMin + Math.random() * (speedMax - speedMin)) * speedScale * 0.015,
      });
    }

    // Animation loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw background if backgroundOpacity > 0
      if (backgroundOpacity > 0) {
        ctx.fillStyle = `rgba(0, 0, 0, ${backgroundOpacity})`;
        ctx.fillRect(0, 0, width, height);
      }

      // Draw dots
      let index = 0;
      for (let x = 0; x < width; x += gap) {
        for (let y = 0; y < height; y += gap) {
          const dot = dots[index];
          if (!dot) continue;

          // Update phase
          dot.phase = (dot.phase + dot.speed) % (Math.PI * 2);

          // Calculate current intensity (0 to 1)
          const intensity = (Math.sin(dot.phase) + 1) / 2; // Normalize to [0, 1]

          // Base dot
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fillStyle = dotColor;
          ctx.globalAlpha = intensity * opacity;
          ctx.fill();

          // Glow effect (only if intensity is relatively high to save CPU and look premium)
          if (intensity > 0.4) {
            ctx.beginPath();
            ctx.arc(x, y, radius * 3.5, 0, Math.PI * 2);
            ctx.fillStyle = glowColor;
            ctx.globalAlpha = (intensity - 0.4) * 0.25 * opacity;
            ctx.fill();
          }

          index++;
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, [
    gap,
    radius,
    opacity,
    colorLightVar,
    glowColorLightVar,
    colorDarkVar,
    glowColorDarkVar,
    backgroundOpacity,
    speedMin,
    speedMax,
    speedScale,
  ]);

  return <canvas ref={canvasRef} className={`absolute inset-0 block ${className}`} />;
};
