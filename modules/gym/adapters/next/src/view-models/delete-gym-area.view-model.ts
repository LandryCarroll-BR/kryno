export type DeleteGymAreaViewModel = {
  readonly status:
    | "idle"
    | "success"
    | "invalid"
    | "forbidden"
    | "not-found"
    | "error"
  readonly message: string
  readonly fields: {
    readonly gymId: FieldViewModel
    readonly areaId: FieldViewModel
  }
  readonly errors: Record<keyof DeleteGymAreaViewModel["fields"], string>
}

export const deleteGymAreaInitialViewModel = {
  status: "idle",
  message: "",
  fields: {
    gymId: { label: "Gym", value: "" },
    areaId: { label: "Area", value: "" },
  },
  errors: {
    gymId: "",
    areaId: "",
  },
} satisfies DeleteGymAreaViewModel

type FieldViewModel = {
  readonly label: string
  readonly value: string
}
