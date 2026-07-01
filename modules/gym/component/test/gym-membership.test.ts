import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import { GymId, GymName } from "@gym/application/models/gym"

import { Gym } from "../src/index"
import { GymTestLayer } from "./index"

describe("Gym memberships", () => {
  it.effect("lists created gyms alphabetically", () =>
    Effect.gen(function* () {
      const gym = yield* Gym

      yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("The Spot"),
      })
      yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Brooklyn Boulders"),
      })

      const gyms = yield* gym.listGyms({ token: "user-token" })

      expect(gyms.map(({ gym }) => gym.name)).toEqual([
        "Brooklyn Boulders",
        "The Spot",
      ])
      expect(gyms.every(({ isMember }) => !isMember)).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("returns an empty list when no gyms exist", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const gyms = yield* gym.listGyms({ token: "user-token" })

      expect(gyms).toEqual([])
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("joins a gym and isolates membership state by user", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const created = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Movement"),
      })

      const result = yield* gym.joinGym({
        token: "user-token",
        gymId: created.id,
      })

      expect(result.gym).toEqual(created)
      expect(result.membership).toMatchObject({
        gymId: created.id,
        memberId: "member-1",
      })

      const memberGyms = yield* gym.listGyms({ token: "user-token" })
      const otherMemberGyms = yield* gym.listGyms({
        token: "other-user-token",
      })

      expect(memberGyms[0]?.isMember).toBe(true)
      expect(otherMemberGyms[0]?.isMember).toBe(false)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects duplicate memberships", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const created = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Duplicate Gym"),
      })

      yield* gym.joinGym({
        token: "user-token",
        gymId: created.id,
      })
      const error = yield* Effect.flip(
        gym.joinGym({
          token: "user-token",
          gymId: created.id,
        })
      )

      expect(
        Predicate.isTagged(error, "GymMembershipAlreadyExistsError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("rejects a missing gym", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const error = yield* Effect.flip(
        gym.joinGym({
          token: "user-token",
          gymId: GymId.make("missing-gym"),
        })
      )

      expect(Predicate.isTagged(error, "GymNotFoundError")).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("requires authentication to list or join gyms", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const created = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Protected Gym"),
      })
      const listError = yield* Effect.flip(
        gym.listGyms({ token: "invalid-token" })
      )
      const joinError = yield* Effect.flip(
        gym.joinGym({
          token: "invalid-token",
          gymId: created.id,
        })
      )

      expect(
        Predicate.isTagged(listError, "UnauthenticatedGymMemberError")
      ).toBe(true)
      expect(
        Predicate.isTagged(joinError, "UnauthenticatedGymMemberError")
      ).toBe(true)
    }).pipe(Effect.provide(GymTestLayer))
  )
})
