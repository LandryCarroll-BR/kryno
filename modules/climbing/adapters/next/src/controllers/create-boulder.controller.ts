import { Effect, Schema } from "effect"
import { CreateBoulderInputSchema } from "@climbing/application"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import { CreateBoulderPresenter } from "../presenters/create-boulder.presenter"

import {
  createBoulderForm,
  type CreateBoulderFieldsViewModel,
  type CreateBoulderViewModel,
} from "../view-models/create-boulder.view-model"

const submittedStateFrom = (
  previousState: CreateBoulderViewModel,
  formData: FormData
): CreateBoulderViewModel => ({
  status: "idle",
  form: createBoulderForm,
  fields: {
    name: {
      status: "valid",
      value: getSubmittedString(previousState, formData, "name"),
    },
    grade: {
      status: "valid",
      value: getSubmittedString(previousState, formData, "grade"),
    },
    wallAngle: {
      status: "valid",
      value: getSubmittedString(previousState, formData, "wallAngle"),
    },
    movementStyle: {
      status: "valid",
      value: getSubmittedString(previousState, formData, "movementStyle"),
    },
  },
  fieldErrors: {
    name: "",
    grade: "",
    wallAngle: "",
    movementStyle: "",
  },
})

const decodeInput = (token: string, formData: FormData) =>
  Schema.decodeUnknownEffect(CreateBoulderInputSchema)(
    {
      token,
      name: getString(formData, "name"),
      grade: getString(formData, "grade"),
      wallAngle: getString(formData, "wallAngle"),
      movementStyle: getString(formData, "movementStyle"),
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
        const submittedState = submittedStateFrom(previousState, formData)

        return Effect.gen(function* () {
          const authToken = cookies.get("authToken")

          if (!authToken?.value) {
            return yield* redirectToSignIn
          }

          const input = yield* decodeInput(authToken.value, formData)
          const boulder = yield* climbing.createBoulder(input)

          return yield* presenter.presentSuccess(submittedState, boulder)
        }).pipe(
          Effect.catchTags({
            SchemaError: (error) =>
              presenter.presentInputParseError(submittedState, error),
            UnauthenticatedClimberError: () => redirectToSignIn,
          })
        )
      }
    ),
  }
})

const getSubmittedString = (
  previousState: CreateBoulderViewModel,
  formData: FormData,
  field: keyof CreateBoulderFieldsViewModel
): string => {
  const value = formData.get(field)
  return typeof value === "string" ? value : previousState.fields[field].value
}

const getString = (formData: FormData, name: string): string => {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}
