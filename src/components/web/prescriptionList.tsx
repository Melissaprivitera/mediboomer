"use client"

import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MediBoomer } from "../abis/types/MediBoomer"

type PrescriptionListProps = {
  prescriptionList: MediBoomer.PrescriptionStruct[]
  wamList: MediBoomer.WaysAdministeringMedicinesStruct[] | undefined
  medicineList: MediBoomer.MedicineStruct[] | undefined
  editPrescription: (index: number) => void
}

const PrescriptionList = ({
  prescriptionList,
  wamList,
  medicineList,
  editPrescription,
}: PrescriptionListProps) => {

  const viewPrescription = (prescriptionId: string) => {
    console.log(prescriptionId)
  }

  return (
    <div className="flex flex-col gap-y-5">
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
                  <TableHead className="hidden sm:table-cell">Doses</TableHead>
                  <TableHead className="hidden sm:table-cell">
                    Ways of Administering Medicines
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    How long
                  </TableHead>
                  <TableHead className="text-right">
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {prescriptionList?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-24 text-center">
                      No medical recipes were found
                    </TableCell>
                  </TableRow>
                )}
                {prescriptionList?.map(
                  ({ medicineId, dose, isDelivered, duration }, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">
                        {
                          medicineList?.find(
                            (ml) => ml.id.toString() === medicineId.toString()
                          )?.name
                        }
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {dose}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {
                          wamList?.find(
                            (w) =>
                              w.id ===
                              medicineList?.find(
                                (ml) =>
                                  ml.id.toString() === medicineId.toString()
                              )?.wamId
                          )?.name
                        }
                        {isDelivered}
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {duration} day
                        {parseInt(duration.toString()) > 1 ? "s" : ""}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>View</DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => editPrescription(index)}
                            >
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PrescriptionList
