import { DebugContracts } from "./_components/DebugContracts";
import type { NextPage } from "next";
import { getMetadata } from "~~/utils/scaffold-eth/getMetadata";

export const metadata = getMetadata({
  title: "Debug Contracts",
  description: "Debug your deployed 🏗 Scaffold-ETH 2 contracts in an easy way",
});

const Debug: NextPage = () => {
  return (
    <>
      <DebugContracts />
      <div className="glass-card text-center mt-8 max-w-4xl mx-auto">
        <h1 className="text-4xl my-0 text-white font-extrabold">Debug Contracts</h1>
        <p className="text-slate-300">
          You can debug & interact with your deployed contracts here.
          <br /> Check{" "}
          <code className="italic bg-black/40 text-primary font-bold [word-spacing:-0.5rem] px-1.5 py-0.5 rounded">
            packages / nextjs / app / debug / page.tsx
          </code>{" "}
        </p>
      </div>
    </>
  );
};

export default Debug;
