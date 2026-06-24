import { Effect, Schema } from "effect"
import { CreateBoulderInputSchema } from "@climbing/application"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { CreateBoulderPresenter } from "../presenters/create-boulder.presenter"

import {
  gradeOptions,
  movementStyleOptions,
  wallAngleOptions,
  type CreateBoulderViewModel,
} from "../view-models/create-boulder.view-model"

const decodeInput = (token: string, values: CreateBoulderViewModel["fields"]) =>
  Schema.decodeUnknownEffect(CreateBoulderInputSchema)(
    {
      token,
      name: values.name.value,
      grade: values.grade.value,
      wallAngle: values.wallAngle.value,
      movementStyle: values.movementStyle.value,
    },
    { errors: "all" }
  )

export const CreateBoulderController = Effect.fn(
  "CreateBoulderController.make"
)(function* ({
  previousState,
  redirectUrl,
}: {
  previousState: CreateBoulderViewModel
  redirectUrl: string
}) {
  const climbing = yield* Climbing
  const cookies = yield* Headers.Cookies
  const presenter = yield* CreateBoulderPresenter
  const redirectToSignIn = Navigation.Redirect(redirectUrl)

  return {
    handle: Effect.fn("CreateBoulderController.handle")(
      (formData: FormData) => {
        const submittedFields = submittedFieldsFrom(previousState, formData)

        return Effect.gen(function* () {
          const authToken = cookies.get("authToken")

          if (!authToken?.value) {
            return yield* redirectToSignIn
          }

          const input = yield* decodeInput(authToken.value, submittedFields)
          const boulder = yield* climbing.createBoulder(input)

          return yield* presenter.presentSuccess(submittedFields, boulder)
        }).pipe(
          Effect.catchTags({
            SchemaError: (error) =>
              presenter.presentInputParseError(submittedFields, error),
            UnauthenticatedClimberError: () => redirectToSignIn,
          })
        )
      }
    ),
  }
})

const submittedFieldsFrom = (
  previousState: CreateBoulderViewModel,
  formData: FormData
): CreateBoulderViewModel["fields"] => ({
  name: {
    ...previousState.fields.name,
    value: stringFromFormData(formData, "name", previousState.fields.name.value),
    error: "",
  },
  grade: {
    ...previousState.fields.grade,
    value: optionFromFormData(
      formData,
      "grade",
      gradeOptions,
      previousState.fields.grade.value
    ),
    error: "",
  },
  wallAngle: {
    ...previousState.fields.wallAngle,
    value: optionFromFormData(
      formData,
      "wallAngle",
      wallAngleOptions.map((option) => option.value),
      previousState.fields.wallAngle.value
    ),
    error: "",
  },
  movementStyle: {
    ...previousState.fields.movementStyle,
    value: optionFromFormData(
      formData,
      "movementStyle",
      movementStyleOptions.map((option) => option.value),
      previousState.fields.movementStyle.value
    ),
    error: "",
  },
})

const stringFromFormData = (
  formData: FormData,
  name: string,
  fallback: string
): string => {
  const value = formData.get(name)
  return typeof value === "string" ? value : fallback
}

const optionFromFormData = <TValue extends string>(
  formData: FormData,
  name: string,
  options: readonly TValue[],
  fallback: TValue
): TValue => {
  const value = formData.get(name)

  if (typeof value !== "string") {
    return fallback
  }

  return options.find((option) => option === value) ?? fallback
}
