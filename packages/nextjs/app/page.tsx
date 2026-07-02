"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon, PlayIcon } from "@heroicons/react/24/outline";
import { InteractiveHero } from "~~/components/ui/interactive-hero";

const Home: NextPage = () => {
  return (
    <>
      <div className="relative flex flex-col grow overflow-hidden min-h-screen">
        {/* Hero Section */}
        <div className="relative z-10 w-full overflow-hidden border-b border-primary/10 bg-transparent py-12 px-6 sm:px-12 flex items-center justify-center">
          <div className="relative z-10 flex w-full max-w-6xl flex-col items-center justify-between gap-8 text-center md:flex-row md:text-left">
            <div className="max-w-2xl animate-fade-in">
              <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-primary uppercase bg-primary/10 border border-primary/20 rounded-full">
                ✨ Speedrun Ethereum
              </div>
              <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 mb-4">
                Challenge 🎲 Dice Game
              </h2>
              <p className="text-base sm:text-lg text-slate-300 max-w-xl leading-relaxed font-medium">
                🎰 La aleatoriedad en blockchains públicas y deterministas es vulnerable. El hash de bloque es sencillo
                de usar, pero débil. Este reto demuestra cómo explotar la aleatoriedad predecible y cómo proteger tus
                contratos inteligentes con soluciones seguras.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row shrink-0 items-center justify-center">
              <Link
                href="/dice"
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 px-8 py-3.5 text-base font-bold text-slate-950 shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:scale-[1.03] transition-all gap-2 cursor-pointer"
              >
                <PlayIcon className="h-5 w-5 stroke-[2.5]" />
                <span>Play Dice Game</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Interactive Hero Banner */}
        <div className="relative z-10 flex items-center flex-col w-full px-5 pt-8">
          <InteractiveHero />
        </div>

        {/* Footer shortcuts */}
        <div className="grow w-full mt-16 px-8 py-12">
          <div className="flex justify-center items-center gap-6 flex-col md:flex-row max-w-3xl mx-auto">
            <div className="glass-card flex flex-col px-8 py-10 text-center items-center max-w-xs">
              <BugAntIcon className="h-8 w-8 text-secondary" />
              <p className="mt-3 text-base-content/85">
                Experimenta con tu contrato inteligente en la pestaña{" "}
                <Link href="/debug" passHref className="link text-primary">
                  Debug Contracts
                </Link>
                .
              </p>
            </div>
            <div className="glass-card flex flex-col px-8 py-10 text-center items-center max-w-xs">
              <MagnifyingGlassIcon className="h-8 w-8 text-secondary" />
              <p className="mt-3 text-base-content/85">
                Explora tus transacciones locales en la pestaña{" "}
                <Link href="/blockexplorer" passHref className="link text-primary">
                  Block Explorer
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
