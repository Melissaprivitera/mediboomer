export const UserRole = {
  Doctor: 0,
  Pharmacist: 1,
  Patient: 2,
}

export const MedicalRecipeStatus = {
  Created: 0,
  PartialDelivered: 1,
  FullyDelivered: 2,
}

export const getURLsRole = (role: number): string[] => {
  const { Doctor, Pharmacist, Patient } = UserRole
  const urls = {
    [Doctor]: ["/searchMedicalRecipes", "/medicalRecipe"],
    [Patient]: ["/dashboardPatient"],
    [Pharmacist]: ["/medicalRecipePharmacy", "/searchMedicalRecipesPharmacy"],
  }

  return urls[role] ?? []
}

export const getMedicalRecipeStatus = (medicalRecipeStatus: number): string => {
  const { Created, PartialDelivered, FullyDelivered } = MedicalRecipeStatus
  const status = {
    [Created]: "Created",
    [PartialDelivered]: "Partially Delivered",
    [FullyDelivered]: "Deliver Completed",
  }

  return status[medicalRecipeStatus] ?? ""
}
