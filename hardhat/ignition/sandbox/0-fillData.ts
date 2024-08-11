import { Wallet } from "ethers"
import hre, { ethers } from "hardhat"
import { intakeTimeList, medicineList, wamList } from "./data"
import { getNetworkContract } from "./utils"

/**
 * How to run: npx hardhat run ignition/sandbox/0-fillData.ts
 */

async function main() {
  const contract = getNetworkContract("base-sepolia")
  let provider = ethers.getDefaultProvider("base-sepolia")

  const wallet = new Wallet(process.env.PRIVATE_KEY || "", provider)
  // Get contract
  const mediBoomer = await ethers.getContractAt("MediBoomer", contract, wallet)

  for (const wam of wamList) {
    let tx = await mediBoomer.addWaysAdministeringMedicines(wam, wallet.address)
    await tx.wait()
  }

  const wl = await mediBoomer.getWamList()
  console.log("wl :>> ", wl)

  for (const intakeTime of intakeTimeList) {
    let tx = await mediBoomer.addIntakeTime(intakeTime, wallet.address)
    await tx.wait()
  }

  const ittl = await mediBoomer.getIntakeTimeList()
  console.log("ittl :>> ", ittl)

  for (const medicine of medicineList) {
    let tx = await mediBoomer.addMedicine(medicine.name, medicine.wamId, wallet.address)
    await tx.wait()
  }

  const ml = await mediBoomer.getMedicineList()
  console.log("ml :>> ", ml)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
