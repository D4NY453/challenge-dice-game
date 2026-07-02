import React, { useState } from "react";
import { Amount } from "./Amount";
import { Address } from "@scaffold-ui/components";
import { Address as AddressType, formatEther } from "viem";

export type Winner = {
  address: AddressType;
  amount: bigint;
};

export type WinnerEventsProps = {
  winners: Winner[];
};

export const WinnerEvents = ({ winners }: WinnerEventsProps) => {
  const [showUsdPrice, setShowUsdPrice] = useState(true);
  return (
    <div className="mx-10">
      <div className="flex w-auto justify-center h-10">
        <p className="flex justify-center text-lg font-bold">Winner Events</p>
      </div>

      <table className="mt-4 p-2 bg-warning/5 border border-warning/15 table table-zebra shadow-lg w-full overflow-hidden backdrop-blur-sm rounded-xl">
        <thead className="text-accent text-lg">
          <tr>
            <th className="bg-warning/10 border-b border-warning/20 text-lg backdrop-blur-sm text-white!" colSpan={3}>
              Address
            </th>
            <th
              className="bg-warning/10 border-b border-warning/20 text-lg backdrop-blur-sm text-white!"
              colSpan={2}
              onClick={() => {
                setShowUsdPrice(!showUsdPrice);
              }}
            >
              Won
            </th>
          </tr>
        </thead>
        <tbody>
          {winners.map(({ address, amount }, i) => (
            <tr key={i}>
              <td colSpan={3}>
                <Address address={address} size="lg" />
              </td>
              <td
                colSpan={2}
                onClick={() => {
                  setShowUsdPrice(!showUsdPrice);
                }}
              >
                <Amount
                  showUsdPrice={showUsdPrice}
                  amount={Number(formatEther(amount))}
                  disableToggle
                  className="text-lg"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
