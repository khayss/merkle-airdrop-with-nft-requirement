import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { config } from "../../configs/config";

const MyTokenModule = buildModule("MyTokenModule", (m) => {
  const ownerArgs = m.getParameter("owner", config.OWNER);

  const myToken = m.contract("MyToken", [ownerArgs], {});

  return { myToken };
});

export default MyTokenModule;
