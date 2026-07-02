"use client";

import React from "react";
import { GlassCube } from "./glass-cube";
import { motion } from "framer-motion";

export const InteractiveHero: React.FC = () => {
  // Framer Motion variants for floating elements
  const floatAnimation = (delay: number = 0, duration: number = 4) => ({
    y: [0, -10, 0],
    rotate: [0, 2, -2, 0],
    transition: {
      duration,
      repeat: Infinity,
      ease: "easeInOut" as const,
      delay,
    },
  });

  const letterVariants = {
    initial: { y: 0 },
    animate: (i: number) => ({
      y: [0, -6, 0],
      transition: {
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut" as const,
        delay: i * 0.12,
      },
    }),
  };

  const diceWord = "DICE".split("");
  const gameWord = "GAME".split("");

  return (
    <div className="relative w-full max-w-[727px] h-auto min-h-[260px] sm:h-[260px] flex items-center justify-center rounded-2xl bg-transparent overflow-hidden p-6 select-none">
      {/* Main stacked typography container */}
      <div className="flex flex-col items-center justify-center relative z-10 select-none">
        {/* DICE WORD */}
        <div className="flex space-x-1 select-none">
          {diceWord.map((letter, i) => (
            <motion.span
              key={`dice-${i}`}
              custom={i}
              variants={letterVariants}
              initial="initial"
              animate="animate"
              className="text-6xl sm:text-7xl font-black tracking-widest text-transparent select-none"
              style={{
                WebkitTextStroke: "2.5px #f5b324",
                filter: "drop-shadow(0 0 15px rgba(245, 179, 36, 0.8))",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* GAME WORD */}
        <div className="flex space-x-1 -mt-2 select-none">
          {gameWord.map((letter, i) => (
            <motion.span
              key={`game-${i}`}
              custom={i + 4}
              variants={letterVariants}
              initial="initial"
              animate="animate"
              className="text-6xl sm:text-7xl font-black tracking-widest text-transparent select-none"
              style={{
                WebkitTextStroke: "2.5px #f5b324",
                filter: "drop-shadow(0 0 15px rgba(245, 179, 36, 0.8))",
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>

        {/* Centered SPEEDRUN ETHEREUM Badge */}
        <div className="mt-4 flex items-center space-x-1.5 text-xs font-bold tracking-wider text-emerald-400 bg-emerald-950/20 border border-emerald-500/30 px-3 py-0.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.1)] backdrop-blur-sm">
          <span>SPEEDRUN ETHEREUM</span>
          <span className="animate-pulse">⚡</span>
        </div>
      </div>

      <motion.div
        animate={floatAnimation(0, 4.5)}
        className="absolute top-2 sm:top-4 left-6 sm:left-12 z-20 pointer-events-none"
      >
        <GlassCube isRolling={true} size={95} />
      </motion.div>

      {/* Floating Cards (Ace of Spades & Hearts) */}
      {/* Ace of Spades (Moved to left) */}
      <motion.div
        animate={floatAnimation(0.6, 5)}
        className="absolute bottom-8 left-4 sm:left-12 md:left-16 w-16 h-24 rounded-lg border border-slate-200 bg-white shadow-md pointer-events-none origin-bottom-right select-none relative"
        style={{ transform: "rotate(-12deg)" }}
      >
        {/* Top-left index */}
        <div className="absolute top-1.5 left-1.5 flex flex-col items-center text-slate-900">
          <span className="text-xs font-bold leading-none">A</span>
          <span className="text-[10px] leading-none mt-0.5">♠</span>
        </div>

        {/* Center suit */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-slate-900">
          ♠
        </div>

        {/* Bottom-right index */}
        <div className="absolute bottom-1.5 right-1.5 flex flex-col items-center text-slate-900 transform rotate-180">
          <span className="text-xs font-bold leading-none">A</span>
          <span className="text-[10px] leading-none mt-0.5">♠</span>
        </div>
      </motion.div>

      {/* Ace of Hearts (Moved to right) */}
      <motion.div
        animate={floatAnimation(1.2, 4.8)}
        className="absolute top-8 right-4 sm:right-12 md:right-16 w-16 h-24 rounded-lg border border-slate-200 bg-white shadow-md pointer-events-none origin-bottom-left select-none relative"
        style={{ transform: "rotate(15deg)" }}
      >
        {/* Top-left index */}
        <div className="absolute top-1.5 left-1.5 flex flex-col items-center text-red-600">
          <span className="text-xs font-bold leading-none">A</span>
          <span className="text-[10px] leading-none mt-0.5">♥</span>
        </div>

        {/* Center suit */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-red-600">
          ♥
        </div>

        {/* Bottom-right index */}
        <div className="absolute bottom-1.5 right-1.5 flex flex-col items-center text-red-600 transform rotate-180">
          <span className="text-xs font-bold leading-none">A</span>
          <span className="text-[10px] leading-none mt-0.5">♥</span>
        </div>
      </motion.div>

      {/* Another secondary 3D Glass Cube for visual depth */}
      <motion.div
        animate={floatAnimation(1.8, 5.2)}
        className="absolute bottom-2 sm:bottom-4 right-6 sm:right-12 z-20 pointer-events-none"
      >
        <GlassCube isRolling={true} size={85} />
      </motion.div>
    </div>
  );
};
