import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { config as configEnv } from "./configs/config";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      forking: {
        // url: `https://eth-sepolia.g.alchemy.com/v2/${configEnv.ALCHEMY_API_KEY}`,
        url: "https://rpc.mevblocker.io",
        // blockNumber: 6716470,
      },
    },
  },
};

export default config;
