"use client"
import { useUser } from "@account-kit/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ReloadIcon } from "@radix-ui/react-icons"
import { useFieldArray, useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { useMediBoomerContext } from "@/components/web3/context/mediBoomerContext"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  medicineId: z.string({
    required_error: "Select the medicine",
  }),
  duration: z.coerce.number().positive(),
  doses: z.string({
    required_error: "Indicate the dosage of the medication",
  }),
  intakeTimes: z.array(
    z.object({
      intakeTime: z.string({
        required_error: "Select the intake time",
      }),
    })
  ),
})

const Prescription = () => {
  const router = useRouter()
  const user = useUser()
  const { userInfo } = useMediBoomerContext()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineId: "",
      doses: "",
      duration: 0,
      intakeTimes: [{ intakeTime: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "intakeTimes",
    control: form.control,
  })

  useEffect(() => {
    // if (userInfo?.userRole !== UserRole.Doctor) {
    //   router.push("/")
    // }
  }, [userInfo])

  if (!user) return <></>

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    if (!user) return

    // await addUser(
    //   user.userId,
    //   values.name,
    //   user.email!,
    //   user.address,
    //   parseInt(values.userRole)
    // )
    setIsLoading(false)

    // router.push("/")
    console.log("values :>> ", values)
  }

  return (
    <div className="flex flex-1 flex-col p-4 md:p-8 max-w-4xl mx-auto bg-background m-8 shadow-lg rounded-lg gap-y-5">
      <h1 className="text-xl font-semibold text-center">Prescription</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="medicineId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Medicine</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a Medicine" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="m@example.com">m@example.com</SelectItem>
                    <SelectItem value="m@google.com">m@google.com</SelectItem>
                    <SelectItem value="m@support.com">m@support.com</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How long should the medicine be taken?</FormLabel>
                <FormControl>
                  <Input type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="doses"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Doses</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Indicate the dosage of the medication"
                    className="resize-none"
                    {...field}
                  >
                    {field.value}
                  </Textarea>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {fields.map((field, index) => (
            <div key={field.id}>
              <FormField
                control={form.control}
                name={`intakeTimes.${index}.intakeTime`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule {index}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a Intake Time" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0">00:00</SelectItem>
                        <SelectItem value="1">01:00</SelectItem>
                        <SelectItem value="2">02:00</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index > 0 && (
                <Button variant="destructive" onClick={() => remove(index)}>
                  Delete
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="secondary"
            onClick={() => append({ intakeTime: "" })}
          >
            Append
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <ReloadIcon className="mr-2 h-4 w-4 animate-spin" />}
            Add New Medical Recipe
          </Button>
        </form>
      </Form>
    </div>
  )
}

export default Prescription
