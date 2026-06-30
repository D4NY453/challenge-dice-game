import { artifacts, deployScript } from "../rocketh/deploy.js";
import { getAddress } from "viem";

export default deployScript(
  async env => {
    const diceGame = env.get("DiceGame");
    const diceGameAddress = diceGame.address;

    // Uncomment to deploy RiggedRoll contract
    const riggedRoll = await env.deploy("RiggedRoll", {
      account: env.namedAccounts.deployer,
      artifact: artifacts.RiggedRoll,
      args: [diceGameAddress],
    });

    // Please replace the text "Your Address" with your own address.
    try {
      await env.execute(riggedRoll, {
        functionName: "transferOwnership",
        args: [getAddress("0x5f21e7eDaA062ce33EfA1032266d533B48C0EB03")],
        account: env.namedAccounts.deployer,
      });
    } catch (err) {
      console.log(err);
    }
  },
  { tags: ["RiggedRoll"] },
);
