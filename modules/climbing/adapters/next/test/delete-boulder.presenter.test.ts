import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import {
  CreatedBoulderNotFoundError,
  UnauthorizedToDeleteBoulderError,
} from "@climbing/application/errors/boulder"
import {
  Boulder,
  BoulderId,
  BoulderName,
} from "@climbing/application/models/boulder"
import { ClimberId } from "@climbing/application/models/climber"
import { DeleteBoulderInputSchema } from "@climbing/application/use-cases/delete-boulder"

import { DeleteBoulderPresenter } from "../src/presenters/delete-boulder.presenter"
import { deleteBoulderInitialViewModel } from "../src/view-models/delete-boulder.view-model"

describe("DeleteBoulderPresenter", () => {
  it.effect("presents the deleted boulder", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteBoulderPresenter
      const boulder = Boulder.make({
        id: BoulderId.make("boulder-1"),
        creatorClimberId: ClimberId.make("climber-1"),
        name: BoulderName.make("Test boulder"),
        grade: "V3",
        wallAngle: "VERTICAL",
        movementStyle: "TECHNICAL",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
      })

      const viewModel = yield* presenter.presentSuccess(boulder)

      expect(viewModel.status).toBe("success")
      expect(viewModel.message).toBe(
        "Test boulder was permanently deleted."
      )
      expect(viewModel.fields.boulderId.value).toBe("boulder-1")
    }).pipe(Effect.provide(DeleteBoulderPresenter.Live))
  )

  it.effect("presents malformed input as invalid", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteBoulderPresenter
      const schemaError = yield* Effect.flip(
        Schema.decodeUnknownEffect(DeleteBoulderInputSchema)(
          {
            token: "valid-token",
            boulderId: " ",
          },
          { errors: "all" }
        )
      )

      const viewModel = yield* presenter.presentSchemaError(
        deleteBoulderInitialViewModel,
        schemaError
      )

      expect(viewModel.status).toBe("invalid")
      expect(viewModel.errors.boulderId).not.toBe("")
    }).pipe(Effect.provide(DeleteBoulderPresenter.Live))
  )

  it.effect("presents a missing boulder", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteBoulderPresenter
      const viewModel = yield* presenter.presentCreatedBoulderNotFound(
        deleteBoulderInitialViewModel,
        new CreatedBoulderNotFoundError({
          climberId: ClimberId.make("climber-1"),
          boulderId: BoulderId.make("boulder-1"),
        })
      )

      expect(viewModel.status).toBe("error")
      expect(viewModel.message).toBe(
        "That boulder is no longer available in your boulders."
      )
    }).pipe(Effect.provide(DeleteBoulderPresenter.Live))
  )

  it.effect("presents an ownership mismatch as unauthorized", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteBoulderPresenter
      const viewModel = yield* presenter.presentUnauthorizedToDeleteBoulder(
        deleteBoulderInitialViewModel,
        new UnauthorizedToDeleteBoulderError({
          climberId: ClimberId.make("climber-2"),
          boulderId: BoulderId.make("boulder-1"),
        })
      )

      expect(viewModel.status).toBe("error")
      expect(viewModel.message).toBe(
        "You are not authorized to delete that boulder."
      )
    }).pipe(Effect.provide(DeleteBoulderPresenter.Live))
  )

  it.effect("presents unexpected defects as a retryable error", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteBoulderPresenter
      const viewModel = yield* presenter.presentUnexpectedError(
        deleteBoulderInitialViewModel
      )

      expect(viewModel.status).toBe("error")
      expect(viewModel.message).toBe(
        "Unable to delete this boulder. Please try again."
      )
    }).pipe(Effect.provide(DeleteBoulderPresenter.Live))
  )
})
