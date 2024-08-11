import { config } from "@/config"
import { cookieToInitialState } from "@account-kit/core"
import type { Metadata } from "next"
import { headers } from "next/headers"
import "./globals.css"
import { Providers } from "./providers"
import SideBar from "@/components/layouts/sideBar"
import TopNav from "@/components/layouts/topNav"
import { fonts } from "@/lib/fontApp"
import MediBoomerProvider from "@/components/web3/context/mediBoomerContext"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
  title: "MediBoomer",
  description: "Safe a life",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(
    config,
    headers().get("cookie") ?? undefined
  )

  return (
    <html lang="en" className={`${fonts}`}>
      <body className="relative h-screen">
        <Providers initialState={initialState}>
          <MediBoomerProvider>
            <div className="flex w-full flex-col bg-[#e1f8dc66]">
              <SideBar />
              <div className="flex flex-col sm:pl-14">
                <TopNav />
                <main>{children}</main>
              </div>
            </div>
          </MediBoomerProvider>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
