"use client"
import { Hex } from "viem"

import { MediBoomer } from "@/components/abis/types/MediBoomer"
import { Button } from "@/components/ui/button"
import PrescriptionList from "@/components/web/prescriptionList"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import Prescription from "@/components/web/prescription"
import { useMediBoomerContext } from "@/components/web3/context/mediBoomerContext"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ZeroAddress } from "ethers"
import { ReloadIcon } from "@radix-ui/react-icons"

const MedicalRecipe = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const {
    getIntakeTimeList,
    getMedicineList,
    getWamList,
    addMedicineRecipe,
    userInfo,
    getPrescriptions,
    getPatientInfo,
    isSendingUserOperation
  } = useMediBoomerContext()
  const [open, setOpen] = useState(false)
  // const [isLoading, setLoading] = useState(false)

  const [intakeTimeList, setIntakeTimeList] =
    useState<MediBoomer.IntakeTimeStruct[]>()
  const [medicineList, setMedicineList] = useState<
    MediBoomer.MedicineStruct[] | undefined
  >()
  const [wamList, setWamList] = useState<
    MediBoomer.WaysAdministeringMedicinesStruct[] | undefined
  >()

  const [prescriptionList, setPrescriptionList] = useState<
    MediBoomer.PrescriptionStruct[]
  >([])
  const [prescription, setPrescription] =
    useState<MediBoomer.PrescriptionStruct>()
  const userAddress = searchParams.get("userAddress")
  const medicalRecipeId = searchParams.get("medicalRecipeId")
  const [patientInfo, setPatientInfo] = useState<MediBoomer.UserStruct>()

  useEffect(() => {
    const asyncFunc = async () => {
      if (userAddress != undefined && patientInfo == undefined) {
        const patient = await getPatientInfo(userAddress)

        setPatientInfo(patient)
      }
    }
    asyncFunc()
  }, [userAddress])

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
    const asyncFunc = async () => {
      if (intakeTimeList?.length) return

      const ittl = await getIntakeTimeList()

      setIntakeTimeList(ittl)
    }
    const asyncFuncML = async () => {
      if (medicineList?.length) return

      const ml = await getMedicineList()

      setMedicineList(ml)
    }
    const asyncFuncWL = async () => {
      if (wamList?.length) return

      const wl = await getWamList()

      setWamList(wl)
    }

    asyncFunc()
    asyncFuncML()
    asyncFuncWL()
  }, [])

  useEffect(() => {
    if (!open && prescription != undefined) setPrescription(undefined)
  }, [open])

  const editPrescription = (index: number) => {
    setPrescription(prescriptionList[index])
    setOpen(true)
  }

  const saveMedicalRecipe = () => {
    if (userInfo == undefined || userInfo?.contractAddress === ZeroAddress)
      return


    console.log("prescriptionList :>> ", prescriptionList)

    addMedicineRecipe(
      userInfo.contractAddress as Hex,
      userAddress as Hex,
      userInfo.id,
      userInfo.name,
      prescriptionList
    )
  }

  return (
    <div className="flex flex-col mt-8 gap-y-10 max-w-4xl mx-auto min-h-screen">
      <div className="flex flex-row">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-2xl font-semibold tracking-tight sm:grow-0 content-center">
          Medical Recipe{" "}
          {medicalRecipeId != undefined ? `${medicalRecipeId} of` : `for`}{" "}
          {patientInfo?.name}
        </h1>
        <div className="flex flex-row max-w-fit ml-auto gap-8  justify-end">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              {medicalRecipeId == undefined && (
                <Button variant="destructive">New Prescription</Button>
              )}
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>
                  {prescription != undefined ? "Edit" : "New"} prescription
                </SheetTitle>
                <SheetDescription>
                  Make changes to your prescrition here. Click save when you are
                  done.
                </SheetDescription>
              </SheetHeader>
              <div className="pt-5">
                <Prescription
                  prescription={prescription}
                  intakeTimeList={intakeTimeList}
                  medicineList={medicineList}
                  action={(output) => {
                    const outputFixed = { ...output, id: output.id.toString() }
                    if (prescription) {
                      prescriptionList.forEach((pl, idx, array) => {
                        if (
                          pl.medicineId.toString() ===
                          output.medicineId.toString()
                        ) {
                          array[idx] = outputFixed
                        }
                      })
                    } else {
                      setPrescriptionList([...prescriptionList, outputFixed])
                    }
                    setOpen(false)
                  }}
                />
              </div>
              {/* <SheetFooter>
                <SheetClose asChild>
                  <Button type="submit">Save changes</Button>
                </SheetClose>
              </SheetFooter> */}
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <div className="flex flex-col">
        <PrescriptionList
          prescriptionList={prescriptionList}
          wamList={wamList}
          medicineList={medicineList}
          editPrescription={editPrescription}
        />
      </div>
      <div className="flex justify-end w-full space-x-4">
        <Button
          variant="link"
          onClick={() =>
            router.push(`/searchMedicalRecipes?userAddress=${userAddress}`)
          }
        >
          {medicalRecipeId == undefined ? "Cancel" : "Back"}
        </Button>
        {medicalRecipeId == undefined && (
          <Button
            type="submit"
            disabled={isSendingUserOperation || prescriptionList.length === 0}
            onClick={saveMedicalRecipe}
          >
            {isSendingUserOperation && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Create Medical Recipe
          </Button>
        )}
      </div>
    </div>
  )
}

export default MedicalRecipe
