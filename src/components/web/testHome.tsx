"use client"
import { MediBoomer } from "@/components/abis/types/MediBoomer"
import { Button } from "@/components/ui/button"
import { OpStatus } from "@/components/web/opStatus"
import { useMediBoomerContext } from "@/components/web3/context/mediBoomerContext"
import { useUser } from "@account-kit/react"
import { useEffect, useState } from "react"
import MediBoomerAbi from "@/components/abis/MediBoomer.json"
import { Hex } from "viem"
import { UserRole } from "@/lib/constants"
import { toast } from "sonner"

export default function TestHome() {
  const { addUser } = useMediBoomerContext()
  const user = useUser()

  const {
    isSendingUserOperation,
    sendUserOperationResult,
    isSendUserOperationError,
    getMedicineList,
    addWaysAdministeringMedicines,
    getWamList,
    clientBundler,
  } = useMediBoomerContext()
  const [showToast, setShowToast] = useState(false)

  const [wamList, setWamList] = useState<
    MediBoomer.WaysAdministeringMedicinesStruct[] | undefined
  >()
  const [medicineList, setMedicineList] = useState<
    MediBoomer.MedicineStruct[] | undefined
  >()

  useEffect(() => {
    const asyncFunc = async () => {
      if (!user) return

      const wl = await getWamList()
      setWamList(wl)
      const ml = await getMedicineList()
      setMedicineList(ml)
    }

    asyncFunc()
  }, [user])

  useEffect(() => {
    if (!user || showToast) return

    setShowToast(true)

    const unwatch = clientBundler.watchContractEvent({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      eventName: "WamAdded",
      onLogs: (logs) => {
        /* @ts-ignore */
        if (logs[0]?.args?.userAddress === user?.address) {
          console.log("showing toast")

          toast("Wam Agregado", {
            description: "Wam Agregado Exitosamente",
            action: {
              label: "Close",
              onClick: () => console.log("close"),
            },
          })
        }
      },
    })
  }, [user, showToast])

  const addAlUser = async () => {
    if (!user) return

    const name = "Juan Salvador Gaviota"
    const role = UserRole.Patient
    await addUser(user.userId, name, user.email!, user.address, role)
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 gap-4 justify-center text-center">
      <h1 className="text-5xl font-chicle">MediBoomer</h1>
      {user && (
        <>
          <div className="text-center text-lg font-semibold">
            Send a Transaction!
          </div>

          <div className="my-2 flex flex-col gap-4">
            <Button
              disabled={isSendingUserOperation}
              onClick={() =>
                addWaysAdministeringMedicines("Oral21", user.address)
              }
            >
              Add WAM
            </Button>
            <Button onClick={() => addAlUser()}>addealo</Button>

            {wamList?.map((wam) => (
              <div key={wam.id}>
                <span>{wam.id}</span>
                <span>{wam.name}</span>
              </div>
            ))}
            {medicineList?.map((ml) => (
              <div key={ml.id}>
                <span>{ml.id}</span>
                <span>{ml.name}</span>
                <span>{ml.wamId}</span>
              </div>
            ))}
          </div>
          <OpStatus
            sendUserOperationResult={sendUserOperationResult}
            isSendingUserOperation={isSendingUserOperation}
            isSendUserOperationError={isSendUserOperationError}
          />
        </>
      )}
    </main>
  )
}
