import { z } from "zod"
import {
  AlchemyAccountsUIConfig,
  cookieStorage,
  createConfig,
} from "@account-kit/react"
import { baseSepolia } from "@account-kit/infra"
import { QueryClient } from "@tanstack/react-query"
import { SupportedAccountTypes } from "@account-kit/core"
import { SmartAccountClientOptsSchema } from "@alchemy/aa-core"

const uiConfig: AlchemyAccountsUIConfig = {
  illustrationStyle: "outline",
  auth: {
    sections: [[{ type: "email" }]],
    addPasskeyOnSignup: false,
  },
}

export const chain = baseSepolia

export const config = createConfig(
  {
    rpcUrl: "/api/rpc/chain/" + chain.id,
    signerConnection: { rpcUrl: "/api/rpc" },
    chain,
    ssr: true,
    storage: cookieStorage,
    sessionConfig: {
      expirationTimeMs: 86400000,
    },
  },
  uiConfig
)

export const accountType: SupportedAccountTypes = "MultiOwnerModularAccount"
// setup the gas policy for sponsoring transactions
export const gasManagerConfig = {
  policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID!,
}

type SmartAccountClienOptions = z.infer<typeof SmartAccountClientOptsSchema>
export const accountClientOptions: Partial<SmartAccountClienOptions> = {
  txMaxRetries: 20,
}

export const queryClient = new QueryClient()
