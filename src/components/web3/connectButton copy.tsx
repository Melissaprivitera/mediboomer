"use client"
// import { ProfileCard } from "@/components/profileCard"
import {
  useAuthModal,
  useLogout,
  useSignerStatus,
  useUser,
} from "@account-kit/react"

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
      ) : user && isConnected ? (
        <div className="flex flex-col gap-2 p-2">
          <p className="text-xl font-bold">Success!</p>
          You are logged in as {user.email ?? "anon"}.
          <button className="btn btn-primary mt-6" onClick={() => logout()}>
            Log out
          </button>
          {/* <ProfileCard /> */}
        </div>
      ) : (
        <button className="btn btn-primary" onClick={openAuthModal}>
          Login new
        </button>
      )}
    </div>
  )
}

export default ConnectButton
