"use client"

import { Hex } from "viem"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"

import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { MediBoomer } from "../abis/types/MediBoomer"
import { useMediBoomerContext } from "../web3/context/mediBoomerContext"
import { ReloadIcon } from "@radix-ui/react-icons"

const formSchema = z.object({
  medicines: z.array(
    z.object({
      prescriptionId: z.string(),
      medicineName: z.string(),
      isDelivered: z.boolean().default(false).optional(),
    })
  ),
})

type MedicinesProps = {
  prescriptionId: string
  medicineName: string
  isDelivered: boolean
}
type PrescriptionListPharmacyProps = {
  prescriptionList: MediBoomer.PrescriptionStruct[] | undefined
  medicineList: MediBoomer.MedicineStruct[] | undefined
  structure: MedicinesProps[] | undefined
  medicalRecipeId: string | null
}

const PrescriptionListPharmacy = ({
  prescriptionList,
  medicineList,
  structure,
  medicalRecipeId,
}: PrescriptionListPharmacyProps) => {
  const { userInfo, isSendingUserOperation, deliverMedicalRecipe } =
    useMediBoomerContext()
  const viewPrescription = (prescriptionId: string) => {
    console.log(prescriptionId)
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicines: structure,
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!prescriptionList || !medicalRecipeId) return

    const prescToDeliver = values.medicines.map((val) => {
      const tmp = prescriptionList.find(
        (p) => val.prescriptionId === p.id.toString()
      )
      const theItt = tmp?.intakeTimeList.map((itt, idx, array) => {
        return { id: itt.id.toString(), time: itt.time }
      })

      if (!tmp || !userInfo) return

      return {
        id: tmp.id.toString(),
        medicineId: tmp.medicineId,
        dose: tmp.dose,
        isDelivered: tmp.isDelivered,
        timeDelivered: parseInt(tmp.timeDelivered.toString()),
        duration: parseInt(tmp.duration.toString()),
        intakeTimeList: theItt,
      }
    })
    console.log("prescToDeliver :>> ", prescToDeliver)

    deliverMedicalRecipe(
      userInfo!.contractAddress.toString(),
      parseInt(medicalRecipeId),
      /* @ts-ignore */
      prescToDeliver
    )
  }

  const { fields } = useFieldArray({
    name: "medicines",
    control: form.control,
  })

  return (
    <div className="flex flex-col gap-y-5">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Card className="shadow-lg">
              <CardHeader className="px-7 flex flex-row w-full justify-between">
                <CardTitle>List of Prescriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Medicine Name</TableHead>
                      <TableHead className="text-right">
                        is Delivered?
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {prescriptionList?.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={2} className="h-24 text-center">
                          No medical recipes were found
                        </TableCell>
                      </TableRow>
                    )}
                    {fields.map((field, index) => (
                      <TableRow key={field.id}>
                        <TableCell className="font-medium">
                          {field.medicineName}
                        </TableCell>

                        <TableCell className="w-fit text-right">
                          <FormField
                            control={form.control}
                            name={`medicines.${index}.isDelivered`}
                            render={({ field }) => (
                              <FormItem className="flex flex-row justify-end space-x-3 space-y-0 p-2">
                                <FormControl>
                                  <Checkbox
                                    className="w-5 h-5"
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          <div className="flex justify-end w-full space-x-4">
            <Button variant="link">Cancel</Button>
            <Button type="submit" disabled={isSendingUserOperation}>
              {isSendingUserOperation && (
                <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
              )}
              Deliver Prescriptions
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default PrescriptionListPharmacy
