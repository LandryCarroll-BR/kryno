import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import { GymName } from "@gym/application/models/gym"

import { Gym } from "../src/index"
import { GymTestLayer } from "./index"

describe("Gym.createGym", () => {
  it.effect("creates gyms for an administrator with deterministic ids", () =>
    Effect.gen(function* () {
      const gym = yield* Gym

      const first = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("The Cliffs"),
      })
      const second = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("The Cliffs"),
      })

      expect(first).toEqual({
        id: "gym-1",
        name: "The Cliffs",
      })
      expect(second).toEqual({
        id: "gym-2",
        name: "The Cliffs",
      })
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects blank gym names", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const error = yield* Effect.flip(
        gym.createGym({
          token: "admin-token",
          name: "   " as GymName,
        })
      )

      expect(Predicate.isTagged(error, "SchemaError")).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects invalid sessions before creating a gym", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const error = yield* Effect.flip(
        gym.createGym({
          token: "invalid-token",
          name: GymName.make("Unauthorized Gym"),
        })
      )

      expect(Predicate.isTagged(error, "UnauthenticatedGymCreatorError")).toBe(
        true
      )

      const created = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Admin Gym"),
      })
      expect(created.id).toBe("gym-1")
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects signed-in non-administrators before creating a gym", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const error = yield* Effect.flip(
        gym.createGym({
          token: "user-token",
          name: GymName.make("User Gym"),
        })
      )

      expect(Predicate.isTagged(error, "UnauthorizedGymCreatorError")).toBe(
        true
      )

      const created = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Admin Gym"),
      })
      expect(created.id).toBe("gym-1")
    }).pipe(Effect.provide(GymTestLayer))
  )
})
