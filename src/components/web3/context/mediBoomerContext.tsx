"use client"

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react"
import { MediBoomer } from "@/components/abis/types/MediBoomer"
import MediBoomerAbi from "@/components/abis/MediBoomer.json"
import { ZeroAddress } from "ethers"
import {
  SendUserOperationWithEOA,
  useBundlerClient,
  useSendUserOperation,
  useSmartAccountClient,
  useUser,
  UseUserResult,
} from "@account-kit/react"
import { usePathname, useRouter } from "next/navigation"

import { accountType, accountClientOptions as opts } from "@/config"
import { Hex, encodeFunctionData } from "viem"
import { EntryPointRegistryBase } from "@alchemy/aa-core"
import { ClientWithAlchemyMethods } from "@account-kit/infra"
import { getURLsRole, UserRole } from "@/lib/constants"

type MediBoomerProviderProps = {
  children: ReactNode
}

type MediBoomerContextType = {
  sendUserOperationResult:
    | SendUserOperationWithEOA<keyof EntryPointRegistryBase<unknown>>
    | undefined
  isSendingUserOperation: boolean
  isSendUserOperationError: Error | null
  getMedicineList: () => Promise<MediBoomer.MedicineStruct[] | undefined>
  addWaysAdministeringMedicines: (name: string, userAddress: string) => void
  getWamList: () => Promise<
    MediBoomer.WaysAdministeringMedicinesStruct[] | undefined
  >
  getUserInfo: (
    userAddress: string
  ) => Promise<MediBoomer.UserStruct | undefined>
  getPatientInfo: (
    userAddress: string
  ) => Promise<MediBoomer.UserStruct | undefined>

  addUser: (
    id: string,
    name: string,
    email: string,
    userAddress: string,
    userRole: number
  ) => Promise<void>
  clientBundler: ClientWithAlchemyMethods
  userInfo: MediBoomer.UserStruct | undefined
  user: UseUserResult | undefined
  getPatientMedicalRecipeList: (
    userAddress: string
  ) => Promise<MediBoomer.MedicalRecipeStruct[]>
  getIntakeTimeList: () => Promise<MediBoomer.IntakeTimeStruct[] | undefined>
  addMedicineRecipe: (
    doctorAddress: string,
    patientAddress: string,
    doctorId: string,
    doctorName: string,
    prescriptionList: MediBoomer.PrescriptionStruct[]
  ) => void
  getPrescriptions: (
    userAddress: string,
    medicalRecipeId: number
  ) => Promise<MediBoomer.PrescriptionStruct[]>
  deliverMedicalRecipe: (
    pharmacistAddress: string,
    medicalRecipeId: number,
    prescriptionList: MediBoomer.PrescriptionStruct[]
  ) => void
}

export const MediBoomerContext = createContext<MediBoomerContextType | null>(
  null
)

const MediBoomerProvider = ({ children }: MediBoomerProviderProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const user = useUser()
  const clientBundler = useBundlerClient()
  const { client } = useSmartAccountClient({
    type: accountType,
    policyId: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID!,
    opts,
  })
  const [userInfo, setUserInfo] = useState<MediBoomer.UserStruct>()

  const {
    sendUserOperation,
    sendUserOperationResult,
    isSendingUserOperation,
    error: isSendUserOperationError,
  } = useSendUserOperation({
    client,
    waitForTxn: true,
    onSuccess: ({ hash, request }) => {
      // [optional] Do something with the hash and request
    },
    onError: (error) => {
      console.log("error en uo :>> ", error)
      // [optional] Do something with the error
    },
  })

  useEffect(() => {
    const asyncFunc = async () => {
      if (user && userInfo == undefined) {
        const userInfoTmp = await getUserInfo(user.address)

        setUserInfo(userInfoTmp)
      }
    }

    asyncFunc()
  }, [user, userInfo])

  useEffect(() => {
    const asyncFunc = async () => {
      if (!user || userInfo == undefined) return

      const role = parseInt(userInfo?.userRole.toString())
      const urls = getURLsRole(role)

      if (
        userInfo?.contractAddress === ZeroAddress &&
        pathname.indexOf("/register") === -1
      ) {
        router.push("/register")
      } else if (!urls.includes(pathname)) {
        if (userInfo == undefined || userInfo?.contractAddress === ZeroAddress)
          return

        if (userInfo.userRole === UserRole.Doctor)
          router.push("/searchMedicalRecipes")
        if (userInfo.userRole === UserRole.Pharmacist)
          router.push("/searchMedicalRecipesPharmacy")
        if (userInfo.userRole === UserRole.Patient)
          router.push("/dashboardPatient")
      }
    }

    asyncFunc()
  }, [user, userInfo, pathname])

  const getMedicineList = async (): Promise<
    MediBoomer.MedicineStruct[] | undefined
  > => {
    const medicineList = (await clientBundler.readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      functionName: "getMedicineList",
      args: [],
    })) as MediBoomer.MedicineStruct[]

    return medicineList
  }

  const addWaysAdministeringMedicines = (
    name: string,
    userAddress: string
  ): void => {
    const target = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex
    const value = "0"

    const data = encodeFunctionData({
      abi: MediBoomerAbi.abi,
      functionName: "addWaysAdministeringMedicines",
      args: [name, userAddress],
    })

    sendUserOperation({
      uo: { target, data, value: value ? BigInt(value) : 0n },
    })
  }

  const addUser = async (
    id: string,
    name: string,
    email: string,
    userAddress: string,
    userRole: number
  ): Promise<void> => {
    const value = "0"
    if (!user || userInfo?.contractAddress !== ZeroAddress) return

    const target = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex
    const addr = userAddress as Hex

    const data = encodeFunctionData({
      abi: MediBoomerAbi.abi,
      functionName: "addUser",
      args: [id, name, email, addr, userRole],
    })

    sendUserOperation({
      uo: { target, data, value: value ? BigInt(value) : 0n },
    })
  }

  const addMedicineRecipe = (
    doctorAddress: string,
    patientAddress: string,
    doctorId: string,
    doctorName: string,
    prescriptionList: MediBoomer.PrescriptionStruct[]
  ): void => {
    const target = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex
    const value = "0"

    const data = encodeFunctionData({
      abi: MediBoomerAbi.abi,
      functionName: "addMedicalRecipe",
      args: [
        doctorAddress,
        patientAddress,
        doctorId,
        doctorName,
        prescriptionList,
      ],
    })

    sendUserOperation({
      uo: { target, data, value: value ? BigInt(value) : 0n },
    })
  }

  const deliverMedicalRecipe = (
    pharmacistAddress: string,
    medicalRecipeId: number,
    prescriptionList: MediBoomer.PrescriptionStruct[]
  ): void => {
    const target = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex
    const value = "0"

    const data = encodeFunctionData({
      abi: MediBoomerAbi.abi,
      functionName: "deliverMedicalRecipe",
      args: [pharmacistAddress, medicalRecipeId, prescriptionList],
    })

    sendUserOperation({
      uo: { target, data, value: value ? BigInt(value) : 0n },
    })
  }

  const getWamList = async (): Promise<
    MediBoomer.WaysAdministeringMedicinesStruct[] | undefined
  > => {
    const wamList = (await clientBundler.readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      functionName: "getWamList",
      args: [],
    })) as MediBoomer.WaysAdministeringMedicinesStruct[]

    return wamList
  }

  const getUserInfo = async (
    userAddress: string
  ): Promise<MediBoomer.UserStruct | undefined> => {
    const userInfo = (await clientBundler.readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      functionName: "getUserInfo",
      args: [userAddress],
    })) as MediBoomer.UserStruct

    setUserInfo(userInfo)

    return userInfo
  }

  const getPatientInfo = async (
    userAddress: string
  ): Promise<MediBoomer.UserStruct | undefined> => {
    const userInfo = (await clientBundler.readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      functionName: "getUserInfo",
      args: [userAddress],
    })) as MediBoomer.UserStruct

    return userInfo
  }

  const getPatientMedicalRecipeList = async (
    userAddress: string
  ): Promise<MediBoomer.MedicalRecipeStruct[]> => {
    const pml = (await clientBundler.readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      functionName: "getPatientMedicalRecipeList",
      args: [userAddress],
    })) as MediBoomer.MedicalRecipeStruct[]

    return pml
  }

  const getIntakeTimeList = async (): Promise<
    MediBoomer.IntakeTimeStruct[] | undefined
  > => {
    const intakeTimeList = (await clientBundler.readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      functionName: "getIntakeTimeList",
      args: [],
    })) as MediBoomer.IntakeTimeStruct[] | undefined

    return intakeTimeList
  }

  const getPrescriptions = async (
    userAddress: string,
    medicalRecipeId: number
  ): Promise<MediBoomer.PrescriptionStruct[]> => {
    const pml = (await clientBundler.readContract({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      functionName: "getPrescriptions",
      args: [userAddress, medicalRecipeId],
    })) as MediBoomer.PrescriptionStruct[]

    return pml
  }

  return (
    <MediBoomerContext.Provider
      value={{
        addMedicineRecipe,
        addUser,
        addWaysAdministeringMedicines,
        deliverMedicalRecipe,
        getIntakeTimeList,
        getMedicineList,
        getPatientInfo,
        getPatientMedicalRecipeList,
        getPrescriptions,
        getUserInfo,
        getWamList,

        userInfo,
        user,

        isSendingUserOperation,
        sendUserOperationResult,
        isSendUserOperationError,

        clientBundler,
      }}
    >
      {children}
    </MediBoomerContext.Provider>
  )
}

export default MediBoomerProvider
export const useMediBoomerContext = () =>
  useContext(MediBoomerContext) as MediBoomerContextType
