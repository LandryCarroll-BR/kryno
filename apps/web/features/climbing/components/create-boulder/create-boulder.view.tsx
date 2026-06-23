"use client"

import { useActionState } from "react"
import type { CreateBoulderViewModel } from "@climbing/adapters-next"
import { Alert, AlertDescription } from "@packages/ui/components/alert"
import { Button } from "@packages/ui/components/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@packages/ui/components/card"
import { Input } from "@packages/ui/components/input"
import { Label } from "@packages/ui/components/label"
import {
  NativeSelect,
  NativeSelectOption,
} from "@packages/ui/components/native-select"

const boulderGrades = [
  "VB",
  "V0",
  "V1",
  "V2",
  "V3",
  "V4",
  "V5",
  "V6",
  "V7",
  "V8",
  "V9",
  "V10",
  "V11",
  "V12",
  "V13",
  "V14",
  "V15",
  "V16",
  "V17",
]

const wallAngleOptions = [
  { label: "Slab", value: "SLAB" },
  { label: "Vertical", value: "VERTICAL" },
  { label: "Overhang", value: "OVERHANG" },
  { label: "Roof", value: "ROOF" },
]

const movementStyleOptions = [
  { label: "Coordination", value: "COORDINATION" },
  { label: "Power", value: "POWER" },
  { label: "Technical", value: "TECHNICAL" },
]

const initialState: CreateBoulderViewModel = {
  status: "idle",
}

export function CreateBoulderView({
  action,
}: {
  action: (
    previousState: CreateBoulderViewModel,
    formData: FormData
  ) => Promise<CreateBoulderViewModel>
}) {
  const [state, formAction, pending] = useActionState(action, initialState)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create boulder</CardTitle>
        <CardDescription>Add a problem to climb later.</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          {state.status === "success" && (
            <Alert>
              <AlertDescription>
                Created {state.name} at {state.grade}.
              </AlertDescription>
            </Alert>
          )}

          {state.status === "error" && (
            <Alert variant="destructive">
              <AlertDescription>{state.error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="boulder-name">Name</Label>
            <Input
              id="boulder-name"
              name="name"
              placeholder="Blue Circuit 12"
              disabled={pending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="boulder-grade">Grade</Label>
            <NativeSelect
              id="boulder-grade"
              name="grade"
              className="w-full"
              disabled={pending}
              defaultValue="V4"
            >
              {boulderGrades.map((grade) => (
                <NativeSelectOption key={grade} value={grade}>
                  {grade}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="boulder-wall-angle">Wall angle</Label>
            <NativeSelect
              id="boulder-wall-angle"
              name="wallAngle"
              className="w-full"
              disabled={pending}
              defaultValue="OVERHANG"
            >
              {wallAngleOptions.map((angle) => (
                <NativeSelectOption key={angle.value} value={angle.value}>
                  {angle.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <div className="space-y-2">
            <Label htmlFor="boulder-movement-style">Movement style</Label>
            <NativeSelect
              id="boulder-movement-style"
              name="movementStyle"
              className="w-full"
              disabled={pending}
              defaultValue="POWER"
            >
              {movementStyleOptions.map((style) => (
                <NativeSelectOption key={style.value} value={style.value}>
                  {style.label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </div>

          <Button type="submit" disabled={pending}>
            {pending ? "Creating boulder..." : "Create boulder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
