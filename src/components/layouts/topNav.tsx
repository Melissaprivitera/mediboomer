"use client"

import Link from "next/link"
import { toast } from "sonner"
import { Hex } from "viem"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb"
import ConnectButton from "../web3/connectButton"
import MediBoomerAbi from "@/components/abis/MediBoomer.json"
import { useMediBoomerContext } from "../web3/context/mediBoomerContext"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

const HeaderSection = () => {
  return (
    <>
      <Breadcrumb className=" md:flex">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/">MediBoomer</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </>
  )
}
const TopNav = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { clientBundler, user } = useMediBoomerContext()
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!user) return

    // setShowToast(true)

    clientBundler.watchContractEvent({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      eventName: "MedicalRecipeAdded",
      onLogs: (logs) => {
        /* @ts-ignore */
        console.log('logs[0]?.args? :>> ', logs[0]?.args);
        /* @ts-ignore */
        if (logs[0]?.args?.userAddress === user?.address) {
          toast("Medical Recipe Added", {
            description: "Medical Recipe added successfully",
            action: {
              label: "Close",
              onClick: () => console.log("close"),
            },
          })
          console.log("showing toast")
          // setShowToast(false)
          const userAddress = searchParams.get("userAddress")
          router.push(`/searchMedicalRecipes?userAddress=${userAddress}`)
        }
      },
    })
  }, [user, showToast])

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 justify-between">
      <HeaderSection />
      <ConnectButton />
    </header>
  )
}

export default TopNav
