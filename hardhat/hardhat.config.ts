import { HardhatUserConfig } from "hardhat/config"
import "@nomicfoundation/hardhat-toolbox"
import * as dotenv from "dotenv"

dotenv.config()

const config: HardhatUserConfig = {
  solidity: "0.8.18",
  defaultNetwork: "localhost",
  networks: {
    base: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 1000000000,
    },
    baseSepolia: {
      url: "https://sepolia.base.org",
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 1000000000,
    },
    fraxtalTestnetL2: {
      url: "https://rpc.testnet.frax.com",
      accounts: [process.env.PRIVATE_KEY as string],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: process.env.BLOCKSCOUT_KEY as string,
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://base-sepolia.blockscout.com/api",
          browserURL: "https://base-sepolia.blockscout.com",
        },
      },
    ],
  },
}

export default config
