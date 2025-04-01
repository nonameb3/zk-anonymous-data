import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

const DEFAULT_ACCOUNT = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"; // harthat account

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    local: {
      url: `http://127.0.0.1:8545/`,
      chainId: 31337,
      accounts: [process.env.PRIVATE_KEY || DEFAULT_ACCOUNT],
    },
  },
};

export default config;
