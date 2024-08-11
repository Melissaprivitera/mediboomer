"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MediBoomer } from "../abis/types/MediBoomer"
import { useRouter } from "next/navigation"
import { getMedicalRecipeStatus } from "@/lib/constants"

type MedicalRecipeListPharmacyProps = {
  medicalRecipes: MediBoomer.MedicalRecipeStruct[]
  userAddress: string
}

const MedicalRecipeListPharmacy = ({
  medicalRecipes,
  userAddress,
}: MedicalRecipeListPharmacyProps) => {
  const router = useRouter()

  const viewRecipe = (medicalRecipeId: string, userAddress: string) => {
    router.push(
      `/medicalRecipePharmacy?medicalRecipeId=${medicalRecipeId}&userAddress=${userAddress}`
    )
  }
  return (
    <Card className="shadow-lg">
      <CardHeader className="px-7 flex flex-row w-full justify-between">
        <CardTitle className="w-64">List of Medical Recipes</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipe Name</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
              <TableHead className="text-right"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {medicalRecipes.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No medical recipes were found
                </TableCell>
              </TableRow>
            )}
            {medicalRecipes.map(({ id, status }) => (
              <TableRow key={id}>
                <TableCell>
                  <div className="font-medium">Receipt {id.toString()}</div>
                  <div className="hidden text-xs text-muted-foreground md:inline">
                    {id}
                  </div>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  {getMedicalRecipeStatus(parseInt(status.toString()))}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    onClick={() => viewRecipe(id.toString(), userAddress)}
                    variant="outline"
                  >
                    View Recipes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default MedicalRecipeListPharmacy
