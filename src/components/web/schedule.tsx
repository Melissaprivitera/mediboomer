"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

const Schedule = () => {
  const docId = "987-ASDdFF-65"
  const medicalRecipes = [
    {
      day: "11 of August",
      medicineName: "Aspirina",
      wam: "Vía Oral",
      intakeTime: "18:00",
    },
    {
      day: "11 of August",
      medicineName: "Propoleo",
      wam: "Vía Oral",
      intakeTime: "19:00",
    },
    {
      day: "12 of August",
      medicineName: "Aspirina",
      wam: "Vía Oral",
      intakeTime: "18:00",
    },
    {
      day: "12 of August",
      medicineName: "Propoleo",
      wam: "Vía Oral",
      intakeTime: "19:00",
    },
  ]

  const viewRecipe = (medicalRecipeId: string) => {
    console.log(medicalRecipeId)
  }

  return (
    <div className="flex flex-col gap-y-2">
      <div>
        <Card className="shadow-lg">
          <CardHeader className="px-7 flex flex-row w-full justify-between">
            <CardTitle className="w-64">Schedule of Medicines</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[150px]">Intake Time</TableHead>
                  <TableHead className="hidden sm:table-cell ">
                    Medicine Name
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {medicalRecipes.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="h-24 text-center">
                      No medical recipes were found
                    </TableCell>
                  </TableRow>
                )}
                {medicalRecipes.map(
                  ({ day, medicineName, wam, intakeTime }, index) => (
                    <TableRow key={index}>
                      <TableCell className="hidden sm:table-cell">
                        {day} - {intakeTime}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{medicineName}</div>
                        <div className="hidden text-xs text-muted-foreground md:inline">
                          {wam}
                        </div>
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

export default Schedule
