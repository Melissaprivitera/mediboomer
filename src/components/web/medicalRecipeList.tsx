"use client"

import { useRouter } from "next/navigation"

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
import { useMediBoomerContext } from "../web3/context/mediBoomerContext"
import { UserRole } from "@/lib/constants"

type MedicalRecipeListProps = {
  medicalRecipes: MediBoomer.MedicalRecipeStruct[]
  userAddress: string
}

const MedicalRecipeList = ({
  medicalRecipes,
  userAddress,
}: MedicalRecipeListProps) => {
  const router = useRouter()
  const { userInfo } = useMediBoomerContext()

  const viewRecipe = (medicalRecipeId: string, userAddress: string) => {
    router.push(
      `/medicalRecipe?medicalRecipeId=${medicalRecipeId}&userAddress=${userAddress}`
    )
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="px-7 flex flex-row w-full justify-between">
        <CardTitle className="w-64">List of Medical Recipes</CardTitle>
        <div className="flex w-full justify-end">
          {userInfo?.userRole === UserRole.Doctor && (
            <Button
              variant="destructive"
              onClick={() =>
                router.push(`/medicalRecipe?userAddress=${userAddress}`)
              }
            >
              New Recipe
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Recipe Name</TableHead>
              <TableHead className="hidden sm:table-cell">
                Doctor&amp;s Name
              </TableHead>
              <TableHead className="hidden sm:table-cell">Created At</TableHead>
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
            {medicalRecipes.map(
              ({ id, doctorId, doctorName, createdAt }, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <div className="font-medium">Receipt {id.toString()}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {doctorName}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {createdAt.toString()}
                  </TableCell>
                  <TableCell className="text-right">
                    {doctorId === userInfo?.id && (
                      <Button
                        size="sm"
                        onClick={() => viewRecipe(id.toString(), userAddress)}
                        variant="outline"
                      >
                        View Recipes
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default MedicalRecipeList
