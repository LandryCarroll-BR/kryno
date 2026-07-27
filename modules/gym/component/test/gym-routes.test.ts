import { describe, expect, it } from "@effect/vitest"
import { Effect, Predicate } from "effect"
import { GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { GymName } from "@gym/application/models/gym"

import { Gym } from "../src/index"
import { GymTestLayer } from "./index"

const createPublishedRoute = (gym: Gym["Service"]) =>
  Effect.gen(function* () {
    const createdGym = yield* gym.createGym({
      token: "admin-token",
      name: GymName.make("Movement"),
    })
    const area = yield* gym.createGymArea({
      token: "admin-token",
      gymId: createdGym.id,
      name: GymAreaName.make("Cave"),
    })
    const route = yield* gym.createGymRoute({
      token: "admin-token",
      gymId: createdGym.id,
      areaId: area.id,
      order: GymRouteOrder.make(1),
      positionLabel: "Left",
      setOn: GymRouteSetDate.make("2026-07-02"),
      setterName: "Morgan",
      boulderId: BoulderId.make("admin-boulder-1"),
    })

    return { createdGym, area, route }
  })

describe("Gym member routes", () => {
  it.effect("withholds routes until the user joins, then enriches them", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const { createdGym, route } = yield* createPublishedRoute(gym)

      const beforeJoin = yield* gym.getGymRoutes({
        token: "user-token",
        gymId: createdGym.id,
      })
      expect(beforeJoin).toMatchObject({
        gym: createdGym,
        isMember: false,
        areas: [],
      })

      yield* gym.joinGym({
        token: "user-token",
        gymId: createdGym.id,
      })
      const afterJoin = yield* gym.getGymRoutes({
        token: "user-token",
        gymId: createdGym.id,
      })

      expect(afterJoin.isMember).toBe(true)
      expect(afterJoin.areas[0]?.area.name).toBe("Cave")
      expect(afterJoin.areas[0]?.routes[0]?.route).toEqual(route)
      expect(afterJoin.areas[0]?.routes[0]?.boulder).toMatchObject({
        value: {
          id: "admin-boulder-1",
          name: "Blue 12",
          grade: "V4",
        },
      })
    }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect(
    "requires membership and verifies that the route belongs to the gym",
    () =>
      Effect.gen(function* () {
        const gym = yield* Gym
        const { createdGym, route } = yield* createPublishedRoute(gym)
        const otherGym = yield* gym.createGym({
          token: "admin-token",
          name: GymName.make("Other Gym"),
        })

        const membershipError = yield* Effect.flip(
          gym.logGymRouteAttempt({
            token: "user-token",
            gymId: createdGym.id,
            routeId: route.id,
            outcome: "FELL",
            moveTypes: [],
          })
        )
        expect(
          Predicate.isTagged(membershipError, "GymMembershipRequiredError")
        ).toBe(true)

        yield* gym.joinGym({
          token: "user-token",
          gymId: otherGym.id,
        })
        const wrongGym = yield* Effect.flip(
          gym.logGymRouteAttempt({
            token: "user-token",
            gymId: otherGym.id,
            routeId: route.id,
            outcome: "FELL",
            moveTypes: [],
          })
        )
        expect(Predicate.isTagged(wrongGym, "GymRouteNotFoundError")).toBe(true)
      }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect(
    "logs the route's boulder and preserves active-session failures",
    () =>
      Effect.gen(function* () {
        const gym = yield* Gym
        const { createdGym, route } = yield* createPublishedRoute(gym)
        yield* gym.joinGym({
          token: "user-token",
          gymId: createdGym.id,
        })

        const result = yield* gym.logGymRouteAttempt({
          token: "user-token",
          gymId: createdGym.id,
          routeId: route.id,
          outcome: "TOPPED",
          moveTypes: ["HEEL_HOOK", "FLAG"],
        })
        expect(result).toMatchObject({
          gymId: createdGym.id,
          routeId: route.id,
          attempt: {
            boulderId: "admin-boulder-1",
            ordinal: 1,
            outcome: "TOPPED",
            moveTypes: ["HEEL_HOOK", "FLAG"],
          },
        })

        yield* gym.joinGym({
          token: "other-user-token",
          gymId: createdGym.id,
        })
        const noSession = yield* Effect.flip(
          gym.logGymRouteAttempt({
            token: "other-user-token",
            gymId: createdGym.id,
            routeId: route.id,
            outcome: "FELL",
            moveTypes: [],
          })
        )
        expect(
          Predicate.isTagged(noSession, "NoActiveGymClimbingSessionError")
        ).toBe(true)
      }).pipe(Effect.provide(GymTestLayer))
  )

  it.effect("lists a member's attempt history for the gym's routes", () =>
    Effect.gen(function* () {
      const gym = yield* Gym
      const { createdGym, route } = yield* createPublishedRoute(gym)
      const otherGym = yield* gym.createGym({
        token: "admin-token",
        name: GymName.make("Other Gym"),
      })
      const otherArea = yield* gym.createGymArea({
        token: "admin-token",
        gymId: otherGym.id,
        name: GymAreaName.make("Slab"),
      })
      yield* gym.createGymRoute({
        token: "admin-token",
        gymId: otherGym.id,
        areaId: otherArea.id,
        order: GymRouteOrder.make(1),
        positionLabel: "Right",
        setOn: GymRouteSetDate.make("2026-07-03"),
        setterName: "Ari",
        boulderId: BoulderId.make("admin-boulder-2"),
      })

      const beforeJoin = yield* gym.listGymRouteAttemptHistory({
        token: "user-token",
        gymId: createdGym.id,
      })
      expect(beforeJoin).toMatchObject({
        gym: createdGym,
        isMember: false,
        areas: [],
      })

      yield* gym.joinGym({
        token: "user-token",
        gymId: createdGym.id,
      })
      const result = yield* gym.listGymRouteAttemptHistory({
        token: "user-token",
        gymId: createdGym.id,
      })

      expect(result.isMember).toBe(true)
      expect(result.areas).toHaveLength(1)
      expect(result.areas[0]?.routes[0]?.route).toEqual(route)
      expect(result.areas[0]?.routes[0]?.attempts).toMatchObject([
        {
          id: "gym-history-attempt-1",
          boulderId: "admin-boulder-1",
          ordinal: 1,
          moveTypes: ["HEEL_HOOK"],
        },
      ])
      expect(
        result.areas.flatMap((area) =>
          area.routes.flatMap((gymRoute) =>
            gymRoute.attempts.map((attempt) => attempt.boulderId)
          )
        )
      ).toEqual(["admin-boulder-1"])
    }).pipe(Effect.provide(GymTestLayer))
  )
})
