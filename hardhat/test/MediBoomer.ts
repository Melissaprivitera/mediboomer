import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { assert, expect } from "chai"
import { ethers } from "hardhat"
import { UserRole } from "./enums"

describe("MediBoomer", function () {
  async function deployMediBoomer() {
    const [owner, account1, account2, account3] = await ethers.getSigners()

    const MediBoomer = await ethers.getContractFactory("MediBoomer", {
      libraries: {
        Utils: process.env.UTILS_ADDRESS || "",
      },
    })

    const mediBoomer = await MediBoomer.deploy("30")

    return { mediBoomer, owner, account1, account2, account3 }
  }

  describe("Basic Test", () => {
    it("Add User", async () => {
      const { mediBoomer, account1, account2 } =
        await loadFixture(deployMediBoomer)
      let id = "123-1323DSR"
      let userName = "Gonzalo"
      let email = "gbm@gbm.com"

      await mediBoomer.addUser(
        id,
        userName,
        email,
        account1.address,
        UserRole.Patient,
      )

      const patientList = await mediBoomer.getPatientList()

      assert.equal(patientList[0].name, userName)
    })

    it("Add Ways of Administering Medicines", async () => {
      const { mediBoomer, account1 } = await loadFixture(deployMediBoomer)
      const wamName = "Oral"

      await mediBoomer.addWaysAdministeringMedicines(wamName, account1.address)

      const wamList = await mediBoomer.getWamList()

      assert.equal(wamList[0].name, wamName)
    })

    it("Add Medicine", async () => {
      const { mediBoomer, account1 } = await loadFixture(deployMediBoomer)
      const wamName = "Oral"
      await mediBoomer.addWaysAdministeringMedicines(wamName, account1.address)
      const wamList = await mediBoomer.getWamList()

      const medicineName = "Aspirina"
      await mediBoomer.addMedicine(
        medicineName,
        wamList[0].id,
        account1.address,
      )
      const medicineList = await mediBoomer.getMedicineList()

      assert.equal(medicineList[0].name, medicineName)
    })

    it("Add Intake Time", async () => {
      const { mediBoomer, account1 } = await loadFixture(deployMediBoomer)
      const time = "15:00"
      await mediBoomer.addIntakeTime(time, account1.address)
      const ittList = await mediBoomer.getIntakeTimeList()

      assert.equal(ittList[0].time, time)
    })

    it("Add Medical Recipe", async () => {
      const { mediBoomer, account1, account2 } =
        await loadFixture(deployMediBoomer)
      let time = "15:00"
      await mediBoomer.addIntakeTime(time, account1.address)

      const wamName = "Oral"
      await mediBoomer.addWaysAdministeringMedicines(wamName, account1.address)
      const wamList = await mediBoomer.getWamList()

      let medicineName = "Aspirina"
      await mediBoomer.addMedicine(
        medicineName,
        wamList[0].id,
        account1.address,
      )
      medicineName = "Antiinflamatorio"
      await mediBoomer.addMedicine(
        medicineName,
        wamList[0].id,
        account1.address,
      )
      const medicineList = await mediBoomer.getMedicineList()
      const dose = "2 cucharadas"

      let prescriptionArr = [
        {
          id: "44",
          medicineId: medicineList[1].id,
          dose,
          isDelivered: false,
          timeDelivered: 0,
          duration: 2,
          intakeTimeList: [
            {
              id: "15",
              time,
            },
          ],
        },
      ]

      const doctorId = "6546-ASD66-A66"
      const doctorName = "Peter"
      await mediBoomer.addMedicalRecipe(
        account1.address,
        account2.address,
        doctorId,
        doctorName,
        prescriptionArr,
      )
      prescriptionArr = [
        ...prescriptionArr,
        {
          id: "44",
          medicineId: medicineList[0].id,
          dose,
          isDelivered: false,
          timeDelivered: 0,
          duration: 2,
          intakeTimeList: [
            {
              id: "18",
              time: "18:00",
            },
            {
              id: "22",
              time: "22:00",
            },
          ],
        },
      ]
      await mediBoomer.addMedicalRecipe(
        account1.address,
        account2.address,
        doctorId,
        doctorName,
        prescriptionArr,
      )
      const pml = await mediBoomer.getPatientMedicalRecipeList(account2.address)

      assert.equal(pml[0].doctorId, doctorId)

      const pl = await mediBoomer.getPrescriptions(account2.address, pml[1].id)

      assert.equal(pl[0].dose, prescriptionArr[0].dose)
    })

    it("Deliver Medical Recipe", async () => {
      const { mediBoomer, account1, account2, account3 } =
        await loadFixture(deployMediBoomer)
      let time = "15:00"
      await mediBoomer.addIntakeTime(time, account1.address)

      const wamName = "Oral"
      await mediBoomer.addWaysAdministeringMedicines(wamName, account1.address)
      const wamList = await mediBoomer.getWamList()

      let medicineName = "Aspirina"
      await mediBoomer.addMedicine(
        medicineName,
        wamList[0].id,
        account1.address,
      )
      medicineName = "Antiinflamatorio"
      await mediBoomer.addMedicine(
        medicineName,
        wamList[0].id,
        account1.address,
      )
      const medicineList = await mediBoomer.getMedicineList()
      const dose = "2 cucharadas"

      let prescriptionArr = [
        {
          id: "44",
          medicineId: medicineList[1].id,
          dose,
          isDelivered: false,
          timeDelivered: 0,
          duration: 2,
          intakeTimeList: [
            {
              id: "15",
              time,
            },
          ],
        },
      ]

      const doctorId = "6546-ASD66-A66"
      const doctorName = "Peter"
      await mediBoomer.addMedicalRecipe(
        account1.address, //doctor
        account2.address, //paciente
        doctorId,
        doctorName,
        prescriptionArr,
      )
      prescriptionArr = [
        ...prescriptionArr,
        {
          id: "45",
          medicineId: medicineList[0].id,
          dose,
          isDelivered: false,
          timeDelivered: 0,
          duration: 2,
          intakeTimeList: [
            {
              id: "18",
              time: "18:00",
            },
            {
              id: "22",
              time: "22:00",
            },
          ],
        },
      ]

      await mediBoomer.addMedicalRecipe(
        account1.address,
        account2.address,
        doctorId,
        doctorName,
        prescriptionArr,
      )

      let pml = await mediBoomer.getPatientMedicalRecipeList(account2.address)

      assert.equal(pml[0].doctorId, doctorId)

      let presc = await mediBoomer.getPrescriptions(account2.address, pml[1].id)

      let prescToDeliver = presc.map((val, idx) => {
        const ittt = val?.intakeTimeList.map((itt, idx, array) => {
          /* @ts-ignore */
          return { id: itt.id, time: itt.time }
        })

        return {
          // ...val,
          // "3": idx === 0,
          id: val.id.toString(),
          medicineId: val.medicineId,
          dose: val.dose,
          // isDelivered: true,
          isDelivered: idx === 0,
          timeDelivered: parseInt(val.timeDelivered.toString()),
          duration: parseInt(val.duration.toString()),
          intakeTimeList: ittt,
        }
      })

      await mediBoomer.deliverMedicalRecipe(
        account3.address,
        pml[1].id,
        prescToDeliver,
      )

      pml = await mediBoomer.getPatientMedicalRecipeList(account2.address)

      assert.equal(pml[1].status.toString(), "1")

      prescToDeliver = presc.map((val, idx) => {
        const ittt = val?.intakeTimeList.map((itt, idx, array) => {
          /* @ts-ignore */
          return { id: itt.id, time: itt.time }
        })

        return {
          // ...val,
          // "3": idx === 0,
          id: val.id.toString(),
          medicineId: val.medicineId,
          dose: val.dose,
          isDelivered: true,
          timeDelivered: parseInt(val.timeDelivered.toString()),
          duration: parseInt(val.duration.toString()),
          intakeTimeList: ittt,
        }
      })

      await mediBoomer.deliverMedicalRecipe(
        account3.address,
        pml[1].id,
        prescToDeliver,
      )

      pml = await mediBoomer.getPatientMedicalRecipeList(account2.address)

      assert.equal(pml[1].status.toString(), "2")
    })
  })
})
