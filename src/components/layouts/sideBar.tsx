"use client"

import Link from "next/link"
import { Home, Package2, ShoppingCart } from "lucide-react"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const menu: { uri: string; Component: JSX.Element }[] = [
  { uri: "register", Component: <ShoppingCart className="h-5 w-5" /> },
]

const SideBar = () => {
  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r bg-background sm:flex">
      <nav className="flex flex-col items-center gap-4 px-2 sm:py-4">
        <Link
          href="/bitget"
          className="group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full bg-primary text-lg font-semibold text-primary-foreground md:h-8 md:w-8 md:text-base"
        >
          <Package2 className="h-4 w-4 transition-all group-hover:scale-110" />
          <span className="sr-only">MediBoomer</span>
        </Link>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/bitget"
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
              >
                <Home className="h-5 w-5" />
                <span className="sr-only">Dashboard</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">Dashboard</TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {menu.map(({ uri, Component }, idx) => (
          <TooltipProvider key={idx}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/${uri}`}
                  className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground transition-colors hover:text-foreground md:h-8 md:w-8"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {/* <Component></Component> */}
                  <span className="sr-only">{uri}</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">{uri}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </nav>
      <nav className="mt-auto flex flex-col items-center gap-4 px-2 sm:py-4"></nav>
    </aside>
  )
}
export default SideBar
