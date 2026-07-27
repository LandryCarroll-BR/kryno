import { describe, expect, it } from "@effect/vitest"
import { Effect, Option } from "effect"
import type { ListGymRouteAttemptHistoryOutput } from "@gym/application/use-cases/list-gym-route-attempt-history"
import {
  GymArea,
  GymAreaId,
  GymAreaName,
} from "@gym/application/models/gym-area"
import {
  BoulderGrade,
  BoulderId,
  BoulderName,
  GymRoute,
  GymRouteId,
  GymRouteImageUrl,
  GymRouteOrder,
  GymRouteSetDate,
  MovementStyle,
  WallAngle,
} from "@gym/application/models/gym-route"
import { Gym, GymId, GymName } from "@gym/application/models/gym"

import { GetGymRoutesPresenter } from "../src/presenters/get-gym-routes.presenter"
import { ListGymRouteAttemptHistoryPresenter } from "../src/presenters/list-gym-route-attempt-history.presenter"
import { LogGymRouteAttemptPresenter } from "../src/presenters/log-gym-route-attempt.presenter"
import { logGymRouteAttemptInitialViewModel } from "../src/view-models/log-gym-route-attempt.view-model"

const gymId = GymId.make("gym-1")
const gym = Gym.make({ id: gymId, name: GymName.make("Movement") })
type RouteAttempt =
  ListGymRouteAttemptHistoryOutput["areas"][number]["routes"][number]["attempts"][number]

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
          imageUrl: Option.some(
            GymRouteImageUrl.make(`/uploads/gym-routes/${id}.png`)
          ),
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
      expect(result.fields.areas.value[0]?.routes[0]?.imageUrl).toBe(
        "/uploads/gym-routes/route-1.png"
      )
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

  it.effect("presents route attempt history with recent attempts first", () =>
    Effect.gen(function* () {
      const presenter = yield* ListGymRouteAttemptHistoryPresenter
      const areaId = GymAreaId.make("area-1")
      const route = GymRoute.make({
        id: GymRouteId.make("route-1"),
        areaId,
        order: GymRouteOrder.make(1),
        positionLabel: Option.none(),
        setOn: GymRouteSetDate.make("2026-07-02"),
        setterName: Option.none(),
        boulderId: BoulderId.make("boulder-1"),
        imageUrl: Option.some(
          GymRouteImageUrl.make("/uploads/gym-routes/route-1.png")
        ),
      })

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
                route,
                boulder: Option.some({
                  id: BoulderId.make("boulder-1"),
                  name: BoulderName.make("Blue 12"),
                  grade: BoulderGrade.make("V4"),
                  color: "BLUE",
                  wallAngle: WallAngle.make("OVERHANG"),
                  movementStyle: MovementStyle.make("POWER"),
                }),
                attempts: [
                  {
                    id: "attempt-old" as RouteAttempt["id"],
                    boulderId: BoulderId.make("boulder-1"),
                    ordinal: 1 as RouteAttempt["ordinal"],
                    outcome: "FELL",
                    occurredAt: new Date(1_000),
                  },
                  {
                    id: "attempt-new" as RouteAttempt["id"],
                    boulderId: BoulderId.make("boulder-1"),
                    ordinal: 2 as RouteAttempt["ordinal"],
                    outcome: "TOPPED",
                    occurredAt: new Date(2_000),
                  },
                ],
              },
            ],
          },
        ],
      })

      const viewRoute = result.fields.areas.value[0]?.routes[0]
      expect(viewRoute?.attemptCount).toBe(2)
      expect(viewRoute?.attempts.map(({ id }) => id)).toEqual([
        "attempt-new",
        "attempt-old",
      ])
      expect(viewRoute?.attempts[0]?.outcome).toEqual({
        label: "Topped",
        value: "TOPPED",
      })
      expect(viewRoute?.imageUrl).toBe("/uploads/gym-routes/route-1.png")
    }).pipe(Effect.provide(ListGymRouteAttemptHistoryPresenter.Live))
  )
})
