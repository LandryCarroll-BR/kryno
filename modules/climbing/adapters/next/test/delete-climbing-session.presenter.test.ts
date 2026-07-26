import { describe, expect, it } from "@effect/vitest"
import { Effect, Schema } from "effect"
import {
  ActiveClimbingSessionCannotBeDeletedError,
  PastClimbingSessionNotFoundError,
} from "@climbing/application/errors/climbing-session"
import { ClimberId } from "@climbing/application/models/climber"
import {
  ClimbingSessionId,
  CompletedClimbingSession,
} from "@climbing/application/models/climbing-session"
import { DeleteClimbingSessionInputSchema } from "@climbing/application/use-cases/delete-climbing-session"

import { DeleteClimbingSessionPresenter } from "../src/presenters/delete-climbing-session.presenter"
import { deleteClimbingSessionInitialViewModel } from "../src/view-models/delete-climbing-session.view-model"

describe("DeleteClimbingSessionPresenter", () => {
  it.effect("presents the deleted session", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteClimbingSessionPresenter
      const session = CompletedClimbingSession.make({
        id: ClimbingSessionId.make("session-1"),
        climberId: ClimberId.make("climber-1"),
        attempts: [],
        startedAt: new Date("2026-01-01T09:00:00.000Z"),
        endedAt: new Date("2026-01-01T10:00:00.000Z"),
      })

      const viewModel = yield* presenter.presentSuccess(session)

      expect(viewModel.status).toBe("success")
      expect(viewModel.message).toBe(
        "Your past climbing session was permanently deleted."
      )
      expect(viewModel.fields.climbingSessionId.value).toBe("session-1")
    }).pipe(Effect.provide(DeleteClimbingSessionPresenter.Live))
  )

  it.effect("presents malformed input as invalid", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteClimbingSessionPresenter
      const schemaError = yield* Effect.flip(
        Schema.decodeUnknownEffect(DeleteClimbingSessionInputSchema)(
          {
            token: "valid-token",
            climbingSessionId: " ",
          },
          { errors: "all" }
        )
      )

      const viewModel = yield* presenter.presentSchemaError(
        deleteClimbingSessionInitialViewModel,
        schemaError
      )

      expect(viewModel.status).toBe("invalid")
      expect(viewModel.errors.climbingSessionId).not.toBe("")
    }).pipe(Effect.provide(DeleteClimbingSessionPresenter.Live))
  )

  it.effect("presents a missing past session", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteClimbingSessionPresenter
      const viewModel =
        yield* presenter.presentPastClimbingSessionNotFound(
          deleteClimbingSessionInitialViewModel,
          new PastClimbingSessionNotFoundError({
            climberId: ClimberId.make("climber-1"),
            climbingSessionId: ClimbingSessionId.make("session-1"),
          })
        )

      expect(viewModel.status).toBe("error")
      expect(viewModel.message).toBe(
        "That past climbing session is no longer available."
      )
    }).pipe(Effect.provide(DeleteClimbingSessionPresenter.Live))
  )

  it.effect("presents active-session deletion as blocked", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteClimbingSessionPresenter
      const viewModel =
        yield* presenter.presentActiveClimbingSessionCannotBeDeleted(
          deleteClimbingSessionInitialViewModel,
          new ActiveClimbingSessionCannotBeDeletedError({
            climberId: ClimberId.make("climber-1"),
            climbingSessionId: ClimbingSessionId.make("session-1"),
          })
        )

      expect(viewModel.status).toBe("error")
      expect(viewModel.message).toBe(
        "End this climbing session before deleting it."
      )
    }).pipe(Effect.provide(DeleteClimbingSessionPresenter.Live))
  )

  it.effect("presents unexpected defects as a retryable error", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteClimbingSessionPresenter
      const viewModel = yield* presenter.presentUnexpectedError(
        deleteClimbingSessionInitialViewModel
      )

      expect(viewModel.status).toBe("error")
      expect(viewModel.message).toBe(
        "Unable to delete this climbing session. Please try again."
      )
    }).pipe(Effect.provide(DeleteClimbingSessionPresenter.Live))
  )
})
