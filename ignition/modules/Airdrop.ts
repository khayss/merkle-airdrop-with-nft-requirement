import { config } from "../../configs/config";
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export const AirdropModule = buildModule("AirdropModule", (m) => {
  const tokenAddressArgs = m.getParameter("tokenAddress", config.TOKEN_ADDRESS);
  const ownerAddressArgs = m.getParameter("owner", config.OWNER);
  const merkleRootArgs = m.getParameter("merkleRoot", config.MERKLE_ROOT);

  const airdrop = m.contract("Airdrop", [
    ownerAddressArgs,
    tokenAddressArgs,
    merkleRootArgs,
  ]);

  return { airdrop };
});
