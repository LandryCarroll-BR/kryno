import { describe, expect, it } from "@effect/vitest"
import { Effect, Option, Schema } from "effect"
import { GymArea, GymAreaId, GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRoute,
  GymRouteId,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { Gym, GymId, GymName } from "@gym/application/models/gym"
import { CreateGymRouteInputSchema } from "@gym/application/use-cases/create-gym-route"

import { CreateGymAreaPresenter } from "../src/presenters/create-gym-area.presenter"
import { CreateGymRoutePresenter } from "../src/presenters/create-gym-route.presenter"
import { GetGymManagementPresenter } from "../src/presenters/get-gym-management.presenter"
import { createGymAreaInitialViewModel } from "../src/view-models/create-gym-area.view-model"
import { createGymRouteInitialViewModel } from "../src/view-models/create-gym-route.view-model"

describe("Gym management presenters", () => {
  it.effect("presents duplicate area names at the name field", () =>
    Effect.gen(function* () {
      const presenter = yield* CreateGymAreaPresenter
      const viewModel = yield* presenter.presentConflict(
        createGymAreaInitialViewModel
      )

      expect(viewModel.status).toBe("conflict")
      expect(viewModel.errors.name).not.toBe("")
    }).pipe(Effect.provide(CreateGymAreaPresenter.Live))
  )

  it.effect("maps route schema issues to their fields", () =>
    Effect.gen(function* () {
      const presenter = yield* CreateGymRoutePresenter
      const error = yield* Effect.flip(
        Schema.decodeUnknownEffect(CreateGymRouteInputSchema)(
          {
            token: "admin-token",
            gymId: "gym-1",
            areaId: "area-1",
            order: "0",
            positionLabel: "",
            setOn: "not-a-date",
            setterName: "",
            boulderId: "",
          },
          { errors: "all" }
        )
      )
      const viewModel = yield* presenter.presentSchemaError(
        createGymRouteInitialViewModel,
        error
      )

      expect(viewModel.status).toBe("invalid")
      expect(viewModel.errors.order).not.toBe("")
      expect(viewModel.errors.setOn).not.toBe("")
    }).pipe(Effect.provide(CreateGymRoutePresenter.Live))
  )

  it.effect("presents nested routes and unavailable boulders", () =>
    Effect.gen(function* () {
      const presenter = yield* GetGymManagementPresenter
      const gymId = GymId.make("gym-1")
      const areaId = GymAreaId.make("area-1")
      const viewModel = yield* presenter.presentSuccess({
        gym: Gym.make({
          id: gymId,
          name: GymName.make("The Cliffs"),
        }),
        areas: [
          {
            area: GymArea.make({
              id: areaId,
              gymId,
              name: GymAreaName.make("Barrel"),
            }),
            routes: [
              GymRoute.make({
                id: GymRouteId.make("route-1"),
                areaId,
                order: GymRouteOrder.make(1),
                positionLabel: Option.none(),
                setOn: GymRouteSetDate.make("2026-06-30"),
                setterName: Option.none(),
                boulderId: Option.some(
                  BoulderId.make("deleted-boulder")
                ),
              }),
            ],
          },
        ],
        assignableBoulders: [],
      })

      expect(viewModel.status).toBe("success")
      expect(
        viewModel.fields.areas.value[0]?.routes[0]?.boulder
      ).toMatchObject({
        id: "deleted-boulder",
        available: false,
      })
    }).pipe(Effect.provide(GetGymManagementPresenter.Live))
  )
})
