import { buildModule } from "@nomicfoundation/hardhat-ignition/modules"

const MediBoomerModule = buildModule("MediBoomerModule", (m) => {
  const library = m.library("Utils")

  const mediBoomer = m.contract("MediBoomer", [30], {
    libraries: { Utils: library },
  })

  return { mediBoomer }
})

export default MediBoomerModule
