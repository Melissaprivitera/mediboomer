"use client"
import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
} from "@account-kit/react"
import { CircleUser } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

const ConnectButton = () => {
  const user = useUser()
  const { openAuthModal } = useAuthModal()
  const { logout } = useLogout()

  const { isInitializing, isAuthenticating, isConnected, status } =
    useSignerStatus()

  const isLoading =
    isInitializing || (isAuthenticating && status !== "AWAITING_EMAIL_AUTH")

  return (
    <div className="flex flex-col items-center p-8 gap-4 justify-center text-center">
      {isLoading ? (
        <>Loading...</>
      ) : user ? (
        <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
          <form className="ml-auto flex-1 sm:flex-initial">
            <h3 className="text-sm">{user.email ?? user.address}</h3>
          </form>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                <CircleUser className="h-5 w-5" />
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Settings</DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <button className="btn btn-primary" onClick={openAuthModal}>
          Login or Sign-up
        </button>
      )}
    </div>
  )
}

export default ConnectButton
