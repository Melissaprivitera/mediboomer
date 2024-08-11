import { Wallet } from "ethers"
import hre, { ethers } from "hardhat"
import { intakeTimeList, medicineList, wamList } from "./data"
import { getNetworkContract } from "./utils"

/**
 * How to run: npx hardhat run ignition/sandbox/1-querySC.ts
 */

async function main() {
  const contract = getNetworkContract("base-sepolia")
  let provider = ethers.getDefaultProvider("base-sepolia")

  const wallet = new Wallet(process.env.PRIVATE_KEY || "", provider)
  // Get contract
  const mediBoomer = await ethers.getContractAt("MediBoomer", contract, wallet)

  // const wl = await mediBoomer.getWamList()
  // console.log("wl :>> ", wl)

  // const ittl = await mediBoomer.getIntakeTimeList()
  // console.log("ittl :>> ", ittl)

  // const ml = await mediBoomer.getMedicineList()
  // console.log("ml :>> ", ml)

  const userAddress = "0x4445DD4729E16B61e5ee481c9eA070773345150b"
  // const presc = await mediBoomer.getPrescriptions(userAddress, 5)
  // console.log("presc :>> ", presc[0])
  // console.log("presc :>> ", presc[0].intakeTimeList)
  const pmrl = await mediBoomer.getPatientMedicalRecipeList(userAddress)
  console.log("pmrl :>> ", pmrl.slice(-1)[0].prescriptions)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
