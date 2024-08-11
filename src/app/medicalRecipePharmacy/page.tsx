"use client"

import { MediBoomer } from "@/components/abis/types/MediBoomer"
import PrescriptionListPharmacy from "@/components/web/prescriptionListPharmacy"
import { useMediBoomerContext } from "@/components/web3/context/mediBoomerContext"
import { useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"

type MedicinesProps = {
  prescriptionId: string
  medicineName: string
  isDelivered: boolean
}

const MedicalRecipesPharmacy = () => {
  const searchParams = useSearchParams()
  const { getPrescriptions, getMedicineList } = useMediBoomerContext()
  const [prescriptionList, setPrescriptionList] = useState<
    MediBoomer.PrescriptionStruct[]
  >([])
  const [medicineList, setMedicineList] = useState<
    MediBoomer.MedicineStruct[] | undefined
  >()
  const [structure, setStructure] = useState<MedicinesProps[]>()

  const userAddress = searchParams.get("userAddress")
  const medicalRecipeId = searchParams.get("medicalRecipeId")

  useEffect(() => {
    const asyncFunc = async () => {
      if (
        medicalRecipeId != undefined &&
        userAddress != undefined &&
        prescriptionList.length === 0
      ) {
        const prList = await getPrescriptions(
          userAddress,
          parseInt(medicalRecipeId)
        )

        setPrescriptionList(prList)
      }
    }
    asyncFunc()
  }, [medicalRecipeId, userAddress])

  useEffect(() => {
    const asyncFuncML = async () => {
      if (medicineList?.length) return

      const ml = await getMedicineList()

      setMedicineList(ml)
    }

    asyncFuncML()
  }, [])

  useEffect(() => {
    if (!prescriptionList || !medicineList) return

    if (structure) return

    const structureTmp = prescriptionList?.map((pl) => ({
      prescriptionId: pl.id.toString(),
      medicineName:
        medicineList?.find((m) => m.id.toString() === pl.medicineId.toString())
          ?.name ?? "",
      isDelivered: pl.isDelivered,
    }))

    console.log("structureTmp :>> ", structureTmp)

    setStructure(structureTmp)
  }, [prescriptionList, medicineList, structure])

  return (
    <div className="min-h-screen">
      <div className="flex flex-col mt-8 gap-y-10 max-w-4xl mx-auto min-h-screen">
        <div className="flex flex-row">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-2xl font-semibold tracking-tight sm:grow-0 content-center">
            Medical Recipe for <strong>Gonzalo Barría Marchant</strong>
          </h1>
        </div>
        <div className="flex flex-col">
          {prescriptionList && medicineList && structure && (
            <PrescriptionListPharmacy
              prescriptionList={prescriptionList}
              medicineList={medicineList}
              structure={structure}
              medicalRecipeId={medicalRecipeId}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MedicalRecipesPharmacy
