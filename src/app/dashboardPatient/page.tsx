"use client"

import MedicalRecipeList from "@/components/web/medicalRecipeList"
import Schedule from "@/components/web/schedule"
import { useMediBoomerContext } from "@/components/web3/context/mediBoomerContext"

const DashboardPatient = () => {
  const { userInfo } = useMediBoomerContext()

  return (
    <div className="flex flex-col my-8 gap-y-10 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-4xl font-semibold">Hi Albert!</h1>
      <div className="flex flex-col">
        <Schedule />
      </div>
      <div className="flex flex-col">
        <MedicalRecipeList
          medicalRecipes={[]}
          userAddress={userInfo?.contractAddress.toString()!}
        />
      </div>
    </div>
  )
}

export default DashboardPatient
