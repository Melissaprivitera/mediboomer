import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

const UtilsModule = buildModule("UtilsModule", (m) => {
  const Utils = m.contract("Utils")

  return { Utils }
})

export default UtilsModule
