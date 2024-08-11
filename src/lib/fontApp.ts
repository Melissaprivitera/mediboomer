import { Chicle, Work_Sans, Nunito } from "next/font/google"

const nunito = Nunito({ subsets: ["latin"], weight: "400", display: "swap" })

const chicle = Chicle({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-chicle",
  display: "swap",
})

const workSans = Work_Sans({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-work-sans",
  display: "swap",
})

export const fonts = `${nunito.className} ${chicle.variable} ${workSans.variable}`
