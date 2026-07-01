import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import { UnauthorizedGymAdministratorError } from "@gym/application/errors/gym"
import { Gym, GymId, GymName } from "@gym/application/models/gym"
import { CreateGymInputSchema } from "@gym/application/use-cases/create-gym"

import { CreateGymPresenter } from "../src/presenters/create-gym.presenter"
import { createGymInitialViewModel } from "../src/view-models/create-gym.view-model"

describe("CreateGymPresenter", () => {
  it.effect("presents a created gym and resets the form", () =>
    Effect.gen(function* () {
      const presenter = yield* CreateGymPresenter
      const gym = Gym.make({
        id: GymId.make("gym-1"),
        name: GymName.make("The Cliffs"),
      })

      const viewModel = yield* presenter.presentSuccess(gym)

      expect(viewModel.status).toBe("success")
      expect(viewModel.message).toBe("Created The Cliffs.")
      expect(viewModel.fields.name.value).toBe("")
      expect(viewModel.errors.name).toBe("")
    }).pipe(Effect.provide(CreateGymPresenter.Live))
  )

  it.effect("presents malformed input as invalid", () =>
    Effect.gen(function* () {
      const presenter = yield* CreateGymPresenter
      const schemaError = yield* Effect.flip(
        Schema.decodeUnknownEffect(CreateGymInputSchema)(
          {
            token: "admin-token",
            name: "   ",
          },
          { errors: "all" }
        )
      )

      const viewModel = yield* presenter.presentSchemaError(
        createGymInitialViewModel,
        schemaError
      )

      expect(viewModel.status).toBe("invalid")
      expect(viewModel.errors.name).not.toBe("")
    }).pipe(Effect.provide(CreateGymPresenter.Live))
  )

  it.effect("presents a non-administrator as forbidden", () =>
    Effect.gen(function* () {
      const presenter = yield* CreateGymPresenter
      const viewModel = yield* presenter.presentUnauthorizedError(
        createGymInitialViewModel,
        new UnauthorizedGymAdministratorError()
      )

      expect(viewModel.status).toBe("forbidden")
      expect(viewModel.message).toBe("You are not authorized to create gyms.")
    }).pipe(Effect.provide(CreateGymPresenter.Live))
  )

  it.effect("presents unexpected defects as a retryable error", () =>
    Effect.gen(function* () {
      const presenter = yield* CreateGymPresenter
      const viewModel = yield* presenter.presentUnexpectedError(
        createGymInitialViewModel
      )

      expect(viewModel.status).toBe("error")
      expect(viewModel.message).toBe(
        "Unable to create this gym. Please try again."
      )
    }).pipe(Effect.provide(CreateGymPresenter.Live))
  )
})
