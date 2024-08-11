"use client"
import { useUser } from "@account-kit/react"
import { useState } from "react"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { MediBoomer } from "../abis/types/MediBoomer"

const formSchema = z.object({
  medicineId: z.string({
    required_error: "Select the medicine",
  }),
  duration: z.coerce.number().positive(),
  dose: z.string().min(2, {
    message: "Dose must be at least 2 characters.",
  }),
  intakeTimeList: z.array(
    z.object({
      id: z.coerce.number(),
      time: z.string({
        required_error: "Select the intake time",
      }),
    })
  ),
})

type PrescriptionProps = {
  prescription?: MediBoomer.PrescriptionStruct
  intakeTimeList: MediBoomer.IntakeTimeStruct[] | undefined
  medicineList: MediBoomer.MedicineStruct[] | undefined
  action: (output: MediBoomer.PrescriptionStruct) => void
}

const Prescription = ({
  prescription,
  intakeTimeList,
  medicineList,
  action,
}: PrescriptionProps) => {
  const user = useUser()

  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      medicineId: prescription ? prescription.medicineId.toString() : "",
      dose: prescription ? prescription.dose : "",
      duration: prescription ? parseInt(prescription.duration.toString()) : 1,
      /* @ts-ignore */
      intakeTimeList: prescription
        ? prescription.intakeTimeList
        : [{ id: "", name: "" }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    name: "intakeTimeList",
    control: form.control,
  })

  if (!user) return <></>

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const ittTemp = values.intakeTimeList

    const ittl = intakeTimeList
      ?.filter((itt) => ittTemp.find((it) => it.time === itt.time))
      .map((itt) => ({ ...itt, id: itt.id.toString() }))

    if (ittl == undefined) return

    const output: MediBoomer.PrescriptionStruct = {
      ...values,
      intakeTimeList: ittl,
      id: 0,
      isDelivered: false,
      timeDelivered: 0,
    }

    action(output)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="medicineId"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Medicine</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
                disabled={prescription != undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a Medicine" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {medicineList?.map(({ id, name }, idx) => (
                    <SelectItem value={`${id}`} key={idx}>
                      {name}
                    </SelectItem>
                  ))}
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
              <FormLabel className="font-semibold">
                How long should the medicine be taken?
              </FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dose"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="font-semibold">Doses</FormLabel>
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
              name={`intakeTimeList.${index}.time`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-semibold">
                    Schedule {index}
                  </FormLabel>
                  <div className="flex flex-row space-x-3">
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
                        {intakeTimeList?.map(({ id, time }, idx) => (
                          <SelectItem value={time} key={idx}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {index > 0 && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => remove(index)}
                      >
                        Delete
                      </Button>
                    )}
                  </div>

                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        ))}
        <Button
          variant="secondary"
          onClick={(e) => {
            e.preventDefault()
            /* @ts-ignore */
            append({ id: "", time: "" })
          }}
        >
          Add new Schedule
        </Button>
        <div className="flex flex-col gap-6 pt-5 w-full items-end">
          <Button type="submit">
            {prescription != undefined ? "Save Changes of" : "Add New"} Medical
            Recipe
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default Prescription
