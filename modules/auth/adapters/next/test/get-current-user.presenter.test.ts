import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { CurrentUser, UserId } from "@auth/application/models/user"

import { GetCurrentUserPresenter } from "../src/presenters/get-current-user.presenter"

describe("GetCurrentUserPresenter", () => {
  it.effect("exposes the current user's safe role", () =>
    Effect.gen(function* () {
      const presenter = yield* GetCurrentUserPresenter
      const currentUser = CurrentUser.make({
        id: UserId.make("user-1"),
        username: "admin",
        email: "admin@example.com",
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        role: "admin",
      })

      const viewModel = yield* presenter.presentSuccess(
        Option.some(currentUser)
      )

      expect(viewModel.status).toBe("success")
      expect(viewModel.role).toBe("admin")
    }).pipe(Effect.provide(GetCurrentUserPresenter.Live))
  )
})
