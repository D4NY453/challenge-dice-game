import React from "react";
import { Address } from "@scaffold-ui/components";
import { Address as AddressType } from "viem";

export type Roll = {
  address: AddressType;
  amount: number;
  roll: string;
};

export type RollEventsProps = {
  rolls: Roll[];
};

export const RollEvents = ({ rolls }: RollEventsProps) => {
  return (
    <div className="mx-10">
      <div className="flex w-auto justify-center h-10">
        <p className="flex justify-center text-lg font-bold">Roll Events</p>
      </div>

      <table className="mt-4 p-2 bg-warning/5 border border-warning/15 table table-zebra shadow-lg w-full overflow-hidden backdrop-blur-sm rounded-xl">
        <thead className="text-accent text-lg">
          <tr>
            <th className="bg-warning/10 border-b border-warning/20 text-lg backdrop-blur-sm text-white!" colSpan={3}>
              <span>Address</span>
            </th>
            <th className="bg-warning/10 border-b border-warning/20 text-lg backdrop-blur-sm text-white!">
              <span>Roll</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rolls.map(({ address, roll }, i) => (
            <tr key={i}>
              <td colSpan={3} className="py-3.5">
                <Address address={address} size="lg" />
              </td>
              <td className="col-span-1 text-lg">
                <span> {roll} </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
