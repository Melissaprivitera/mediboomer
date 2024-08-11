"use client"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { BriefcaseMedical, HeartPulse, Pill } from "lucide-react"
import { Hex } from "viem"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useMediBoomerContext } from "@/components/web3/context/mediBoomerContext"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { UserRole } from "@/lib/constants"
import { useEffect, useState } from "react"
import MediBoomerAbi from "@/components/abis/MediBoomer.json"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  userRole: z.enum(
    [`${UserRole.Doctor}`, `${UserRole.Pharmacist}`, `${UserRole.Patient}`],
    {
      required_error: "You need to select a Role",
    }
  ),
})

const Register = () => {
  const { addUser, user, isSendingUserOperation, getUserInfo, clientBundler } =
    useMediBoomerContext()
  const [showToast, setShowToast] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      userRole: `${UserRole.Patient}`,
    },
  })

  // if (userInfo == undefined || userInfo?.contractAddress === ZeroAddress)
  //   return <></>

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return

    await addUser(
      user.userId,
      values.name,
      user.email!,
      user.address,
      parseInt(values.userRole)
    )
    setIsRegistered(true)
  }

  useEffect(() => {
    const asyncFunc = async () => {
      if (!isSendingUserOperation && isRegistered) {
        setIsRegistered(false)
        await getUserInfo(user?.address as Hex)
        router.push(`/`)
      }
    }
    asyncFunc()
  }, [isRegistered, isSendingUserOperation])

  useEffect(() => {
    if (!user || showToast) return

    setShowToast(true)

    const unwatch = clientBundler.watchContractEvent({
      address: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Hex,
      abi: MediBoomerAbi.abi,
      eventName: "UserAdded",
      onLogs: (logs) => {
        /* @ts-ignore */
        if (logs[0]?.args?.userAddress === user?.address) {
          /* @ts-ignore */
          console.log("showing toast", logs[0])

          /* @ts-ignore */
          toast(`Congratulations ${logs[0]?.args?.name}`, {
            description: "You have successfully registered on MediBoomer",
            action: {
              label: "Close",
              onClick: () => console.log("close"),
            },
          })
        }
      },
    })
  }, [user, showToast])

  return (
    <div className="flex flex-col my-8 gap-y-10 max-w-4xl mx-auto min-h-screen">
      <h1 className="text-4xl font-semibold">Welcome to MediBoomer</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card className="shadow-lg">
            <CardHeader className="flex flex-row w-full justify-between">
              <CardTitle>Finalize registration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Frederick Smith" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userRole"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Pick a Role</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="grid grid-cols-3 gap-4"
                      >
                        <div>
                          <RadioGroupItem
                            value={`${UserRole.Patient}`}
                            id={`${UserRole.Patient}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${UserRole.Patient}`}
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <BriefcaseMedical className="mb-3 h-6 w-6" />
                            Patient
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value={`${UserRole.Pharmacist}`}
                            id={`${UserRole.Pharmacist}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${UserRole.Pharmacist}`}
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <Pill className="mb-3 h-6 w-6" />
                            Pharmacist
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem
                            value={`${UserRole.Doctor}`}
                            id={`${UserRole.Doctor}`}
                            className="peer sr-only"
                          />
                          <Label
                            htmlFor={`${UserRole.Doctor}`}
                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                          >
                            <HeartPulse className="mb-3 h-6 w-6" />
                            Doctor
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end w-full space-x-4">
                <Button type="submit" disabled={isSendingUserOperation}>
                  {isSendingUserOperation && (
                    <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Submit
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}

export default Register
