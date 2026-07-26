import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import { GymArea, GymAreaId, GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRoute,
  GymRouteId,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { Gym, GymId, GymName } from "@gym/application/models/gym"

import { GetGymRoutesPresenter } from "../src/presenters/get-gym-routes.presenter"
import { LogGymRouteAttemptPresenter } from "../src/presenters/log-gym-route-attempt.presenter"
import { logGymRouteAttemptInitialViewModel } from "../src/view-models/log-gym-route-attempt.view-model"

const gymId = GymId.make("gym-1")
const gym = Gym.make({ id: gymId, name: GymName.make("Movement") })

describe("Gym routes presenters", () => {
  it.effect("presents a join prompt without leaking routes to nonmembers", () =>
    Effect.gen(function* () {
      const presenter = yield* GetGymRoutesPresenter
      const result = yield* presenter.presentSuccess({
        gym,
        isMember: false,
        areas: [],
      })

      expect(result.status).toBe("success")
      expect(result.fields.gym.value?.isMember).toBe(false)
      expect(result.fields.areas.value).toEqual([])
      expect(result.message).toContain("Join Movement")
    }).pipe(Effect.provide(GetGymRoutesPresenter.Live))
  )

  it.effect("serializes missing route boulders as unavailable", () =>
    Effect.gen(function* () {
      const presenter = yield* GetGymRoutesPresenter
      const areaId = GymAreaId.make("area-1")
      const makeRoute = (id: string, order: number, boulderId: string) =>
        GymRoute.make({
          id: GymRouteId.make(id),
          areaId,
          order: GymRouteOrder.make(order),
          positionLabel: Option.none(),
          setOn: GymRouteSetDate.make("2026-07-02"),
          setterName: Option.none(),
          boulderId: BoulderId.make(boulderId),
        })
      const missingRoute = makeRoute("route-1", 1, "missing-boulder")

      const result = yield* presenter.presentSuccess({
        gym,
        isMember: true,
        areas: [
          {
            area: GymArea.make({
              id: areaId,
              gymId,
              name: GymAreaName.make("Cave"),
            }),
            routes: [
              {
                route: missingRoute,
                boulder: Option.none(),
              },
            ],
          },
        ],
      })

      expect(result.fields.areas.value[0]?.routes[0]?.boulder).toMatchObject({
        id: "missing-boulder",
        available: false,
      })
    }).pipe(Effect.provide(GetGymRoutesPresenter.Live))
  )

  it.effect("presents logged attempts and recoverable failures", () =>
    Effect.gen(function* () {
      const presenter = yield* LogGymRouteAttemptPresenter
      const success = yield* presenter.presentSuccess({
        gymId,
        routeId: GymRouteId.make("route-1"),
        attempt: {
          id: "attempt-1",
          boulderId: BoulderId.make("boulder-1"),
          ordinal: 2,
          outcome: "TOPPED",
          occurredAt: new Date(0),
        },
      })
      const forbidden = yield* presenter.presentMembershipRequired(
        logGymRouteAttemptInitialViewModel
      )
      const noSession = yield* presenter.presentNoActiveSession(
        logGymRouteAttemptInitialViewModel
      )

      expect(success).toMatchObject({
        status: "success",
        message: "Logged attempt 2.",
        fields: {
          gymId: { value: "gym-1" },
          routeId: { value: "route-1" },
          outcome: { value: "TOPPED" },
        },
      })
      expect(forbidden.status).toBe("forbidden")
      expect(noSession.message).toContain("Start a climbing session")
    }).pipe(Effect.provide(LogGymRouteAttemptPresenter.Live))
  )
})
