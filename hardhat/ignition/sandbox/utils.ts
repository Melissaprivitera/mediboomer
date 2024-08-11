export type NetworkMB = "base-sepolia"

export const getNetworkContract = (network: NetworkMB): string => {
  const addresses: Record<NetworkMB, string> = {
    ["base-sepolia"]: "0x08381dC9Ce8A1B37be58CAAA2e83961B1fafE3A2",
    // [fraxtalSepolia]: "0x82f59Ed8eA678F7BD46E8CFd4A4A277f62898687",
  }

  return addresses[network] ?? ""
}
