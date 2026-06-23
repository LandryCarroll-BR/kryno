import { Effect, Schema } from "effect"
import { CreateBoulderInputSchema } from "@climbing/application"
import { Climbing } from "@climbing/component"
import { Headers, Navigation } from "@packages/effect-next"

import {
  CreateBoulderPresenter,
  type CreateBoulderViewModel,
} from "../presenters/create-boulder.presenter"

const getString = (formData: FormData, name: string): string => {
  const value = formData.get(name)
  return typeof value === "string" ? value : ""
}

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
  previousState: _previousState,
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
      function* (formData: FormData) {
        const authToken = cookies.get("authToken")

        if (!authToken?.value) {
          return yield* redirectToSignIn
        }

        const input = yield* decodeInput(authToken.value, formData)
        const boulder = yield* climbing.createBoulder(input)

        return yield* presenter.presentSuccess(boulder)
      },
      Effect.catchTags({
        SchemaError: () => presenter.presentValidationError(),
        UnauthenticatedClimberError: () => redirectToSignIn,
      })
    ),
  }
})
