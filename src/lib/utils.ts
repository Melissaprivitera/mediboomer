import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ethers } from "ethers"
import MediBoomerAbi from "@/components/abis/MediBoomer.json"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fetchContract = (signerOrProvider: any) =>
  new ethers.Contract(
    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "",
    MediBoomerAbi.abi,
    signerOrProvider
  )
