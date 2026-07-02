"use client";

import { useCallback, useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import { useWatchBalance } from "@scaffold-ui/hooks";
import type { NextPage } from "next";
import { Address as AddressType, encodePacked, formatEther, keccak256, parseEther } from "viem";
import { usePublicClient } from "wagmi";
import { Amount, Roll, RollEvents, Winner, WinnerEvents } from "~~/app/dice/_components";
import { GlassDice } from "~~/components/ui/glass-dice";
import {
  useScaffoldContract,
  useScaffoldEventHistory,
  useScaffoldReadContract,
  useScaffoldWriteContract,
} from "~~/hooks/scaffold-eth";

const ROLL_ETH_VALUE = "0.002";
const MAX_TABLE_ROWS = 10;

const DiceGame: NextPage = () => {
  const [rolls, setRolls] = useState<Roll[]>([]);
  const [winners, setWinners] = useState<Winner[]>([]);

  const [rolled, setRolled] = useState(false);
  const [isRolling, setIsRolling] = useState(false);
  const [displayValue, setDisplayValue] = useState<string>("0");
  const [rollError, setRollError] = useState<string | null>(null);

  const publicClient = usePublicClient();

  const { data: riggedRollContract } = useScaffoldContract({ contractName: "RiggedRoll" });
  const { data: riggedRollBalance } = useWatchBalance({
    address: riggedRollContract?.address,
  });
  const { data: prize } = useScaffoldReadContract({ contractName: "DiceGame", functionName: "prize" });
  const { data: diceGameContract } = useScaffoldContract({ contractName: "DiceGame" });
  const { data: currentNonce } = useScaffoldReadContract({ contractName: "DiceGame", functionName: "nonce" });

  const { data: rollsHistoryData, isLoading: rollsHistoryLoading } = useScaffoldEventHistory({
    contractName: "DiceGame",
    eventName: "Roll",
    watch: true,
  });

  // Calculate deterministic roll outcome on frontend
  const predictRoll = async (): Promise<string | null> => {
    if (!publicClient || !diceGameContract || currentNonce === undefined) return null;
    try {
      const block = await publicClient.getBlock({ blockTag: "latest" });
      const encoded = encodePacked(
        ["bytes32", "address", "uint256"],
        [block.hash, diceGameContract.address, currentNonce],
      );
      const hash = keccak256(encoded);
      const rollVal = BigInt(hash) % 16n;
      return rollVal.toString(16).toUpperCase();
    } catch (err) {
      console.error("Error predicting roll", err);
      return null;
    }
  };

  useEffect(() => {
    if (
      !rollsHistoryLoading &&
      Boolean(rollsHistoryData?.length) &&
      (rollsHistoryData?.length as number) > rolls.length
    ) {
      setIsRolling(false);

      const newRolls =
        rollsHistoryData?.map(({ args }) => ({
          address: args.player as AddressType,
          amount: Number(args.amount),
          roll: (args.roll as bigint).toString(16).toUpperCase(),
        })) || [];

      setRolls(newRolls);

      if (newRolls[0]) {
        setDisplayValue(newRolls[0].roll);
      }
    }
  }, [rolls, rollsHistoryData, rollsHistoryLoading]);

  // Load initial display value
  useEffect(() => {
    if (rolls[0] && displayValue === "0") {
      setDisplayValue(rolls[0].roll);
    }
  }, [rolls, displayValue]);

  const { data: winnerHistoryData, isLoading: winnerHistoryLoading } = useScaffoldEventHistory({
    contractName: "DiceGame",
    eventName: "Winner",
    watch: true,
  });

  useEffect(() => {
    if (
      !winnerHistoryLoading &&
      Boolean(winnerHistoryData?.length) &&
      (winnerHistoryData?.length as number) > winners.length
    ) {
      setIsRolling(false);

      setWinners(
        winnerHistoryData?.map(({ args }) => ({
          address: args.winner as AddressType,
          amount: args.amount as bigint,
        })) || [],
      );
    }
  }, [winnerHistoryData, winnerHistoryLoading, winners.length]);

  const { writeContractAsync: writeDiceGameAsync, isError: rollTheDiceError } = useScaffoldWriteContract({
    contractName: "DiceGame",
  });

  const { writeContractAsync: writeRiggedRollAsync, isError: riggedRollError } = useScaffoldWriteContract({
    contractName: "RiggedRoll",
  });

  const immediateStopRolling = useCallback(() => {
    setIsRolling(false);
    setRolled(false);
  }, []);

  useEffect(() => {
    if (rollTheDiceError || riggedRollError) {
      immediateStopRolling();
    }
  }, [immediateStopRolling, riggedRollError, rollTheDiceError]);

  const handleRoll = async (isRigged: boolean) => {
    if (!rolled) {
      setRolled(true);
    }
    setIsRolling(true);
    setRollError(null);

    // Predict the roll outcome immediately on frontend
    const predicted = await predictRoll();
    if (predicted) {
      setDisplayValue(predicted);
    }

    try {
      if (isRigged) {
        await writeRiggedRollAsync({ functionName: "riggedRoll" });
      } else {
        await writeDiceGameAsync({ functionName: "rollTheDice", value: parseEther(ROLL_ETH_VALUE) });
      }
      setRollError(null);
    } catch (err: any) {
      console.error("Error executing roll", err);
      // Extract clean error message
      const errMsg = err?.message || err?.shortMessage || "";
      if (errMsg.includes("Losing roll")) {
        setRollError("Losing roll! (Outcome > 5)");
      } else if (errMsg.includes("user rejected") || errMsg.includes("User rejected")) {
        setRollError("Transaction rejected by user.");
      } else {
        setRollError("Transaction reverted (failed).");
      }
      setIsRolling(false);
    }
  };

  return (
    <div className="py-10 px-10">
      <div className="grid grid-cols-3 max-lg:grid-cols-1">
        <div className="max-lg:row-start-2">
          <RollEvents rolls={rolls.slice(0, MAX_TABLE_ROWS)} />
        </div>

        <div className="flex flex-col items-center pt-4 max-lg:row-start-1">
          <div className="flex w-full justify-center">
            <span className="text-xl"> Roll a 0, 1, 2, 3, 4 or 5 to win the prize! </span>
          </div>

          <div className="flex items-center mt-1">
            <span className="text-lg mr-2">Prize:</span>
            <Amount amount={prize ? Number(formatEther(prize)) : 0} showUsdPrice className="text-lg" />
          </div>

          <button
            onClick={() => handleRoll(false)}
            disabled={isRolling}
            className="mt-2 btn bg-warning/15 hover:bg-warning/35 border border-warning/30 hover:border-warning/60 text-white btn-xl normal-case font-xl text-lg backdrop-blur-sm shadow-lg hover:shadow-warning/20 transition-all duration-300"
          >
            Roll the dice!
          </button>
          <div className="mt-4 pt-2 flex flex-col items-center w-full justify-center border-t-4 border-primary">
            <span className="text-2xl">Rigged Roll</span>
            <div className="flex mt-2 items-center">
              <span className="mr-2 text-lg">Address:</span>{" "}
              <Address size="lg" address={riggedRollContract?.address} />{" "}
            </div>
            <div className="flex mt-1 items-center">
              <span className="text-lg mr-2">Balance:</span>
              <Amount amount={Number(riggedRollBalance?.formatted || 0)} showUsdPrice className="text-lg" />
            </div>
          </div>
          <button
            onClick={() => handleRoll(true)}
            disabled={isRolling}
            className="mt-2 btn bg-warning/15 hover:bg-warning/35 border border-warning/30 hover:border-warning/60 text-white btn-xl normal-case font-xl text-lg backdrop-blur-sm shadow-lg hover:shadow-warning/20 transition-all duration-300"
          >
            Rigged Roll!
          </button>

          <div className="flex flex-col mt-8 items-center justify-center bg-transparent">
            <GlassDice value={displayValue} isRolling={isRolling} size={300} />
            {rollError && (
              <div className="mt-4 px-4 py-2 rounded-lg bg-red-950/40 border border-red-500/50 text-red-200 font-semibold text-center text-sm max-w-xs backdrop-blur-sm animate-pulse">
                ❌ {rollError}
              </div>
            )}
          </div>
        </div>

        <div className="max-lg:row-start-3">
          <WinnerEvents winners={winners.slice(0, MAX_TABLE_ROWS)} />
        </div>
      </div>
    </div>
  );
};

export default DiceGame;
