"use client"
import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useMediBoomerContext } from "@/components/web3/context/mediBoomerContext"

import { useUser } from "@account-kit/react"
import MedicalRecipeListPharmacy from "@/components/web/medicalRecipeListPharmacy"
import { MediBoomer } from "@/components/abis/types/MediBoomer"
import { ZeroAddress } from "ethers"

const formSchema = z.object({
  patientAddress: z.string().min(2, {
    message: "Address must be at least 2 characters.",
  }),
})

const SearchMedicalRecipesPharmacy = () => {
  const router = useRouter()
  const searchParams = useSearchParams()

  const { userInfo, user, getPatientMedicalRecipeList } = useMediBoomerContext()
  const [isLoading, setIsLoading] = useState(false)
  const [patientAddress, setPatientAddress] = useState<string>("")
  const [patientMedicalRecipeList, setPatientMedicalRecipeList] =
    useState<MediBoomer.MedicalRecipeStruct[]>()

  const userAddress = searchParams.get("userAddress")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      patientAddress: userAddress ?? "",
    },
  })

  useEffect(() => {
    const asyncFunction = async (userAddress: string) => {
      const pml = await getPatientMedicalRecipeList(userAddress)
      setPatientMedicalRecipeList(pml)
      setPatientAddress(userAddress)
    }

    if (userAddress != undefined && userAddress !== "") {
      asyncFunction(userAddress)
    }
  }, [searchParams])

  if (userInfo == undefined || userInfo?.contractAddress === ZeroAddress)
    return <></>

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    if (!user) return

    router.push(
      `/searchMedicalRecipesPharmacy?userAddress=${values.patientAddress}`
    )

    const pml = await getPatientMedicalRecipeList(values.patientAddress)
    setPatientMedicalRecipeList(pml)
    setPatientAddress(values.patientAddress)

    setIsLoading(false)
  }

  return (
    <div className="flex flex-col max-w-4xl mx-auto min-h-screen">
      <div className="flex flex-col p-4 md:p-8 bg-background my-8 shadow-lg rounded-lg gap-y-5 ">
        <h1 className="text-xl font-semibold text-center">
          Search Medical Recipes by Patient Address
        </h1>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="patientAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Patient Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Search
            </Button>
          </form>
        </Form>
      </div>
      <div className="flex flex-col ">
        {patientMedicalRecipeList && (
          <MedicalRecipeListPharmacy
            medicalRecipes={patientMedicalRecipeList}
            userAddress={patientAddress}
          />
        )}
      </div>
    </div>
  )
}

export default SearchMedicalRecipesPharmacy
