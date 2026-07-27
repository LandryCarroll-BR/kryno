import { describe, expect, it } from "@effect/vitest"
import { Effect, Option, Schema } from "effect"
import { GymArea, GymAreaId, GymAreaName } from "@gym/application/models/gym-area"
import {
  BoulderId,
  GymRoute,
  GymRouteId,
  GymRouteImageUrl,
  GymRouteOrder,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { Gym, GymId, GymName } from "@gym/application/models/gym"
import { CreateGymRouteInputSchema } from "@gym/application/use-cases/create-gym-route"
import { DeleteGymRouteInputSchema } from "@gym/application/use-cases/delete-gym-route"

import { CreateGymAreaPresenter } from "../src/presenters/create-gym-area.presenter"
import { CreateGymRoutePresenter } from "../src/presenters/create-gym-route.presenter"
import { DeleteGymRoutePresenter } from "../src/presenters/delete-gym-route.presenter"
import { GetGymManagementPresenter } from "../src/presenters/get-gym-management.presenter"
import { createGymAreaInitialViewModel } from "../src/view-models/create-gym-area.view-model"
import { createGymRouteInitialViewModel } from "../src/view-models/create-gym-route.view-model"
import { deleteGymRouteInitialViewModel } from "../src/view-models/delete-gym-route.view-model"

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

  it.effect("maps inline boulder schema issues to their fields", () =>
    Effect.gen(function* () {
      const presenter = yield* CreateGymRoutePresenter
      const error = yield* Effect.flip(
        Schema.decodeUnknownEffect(CreateGymRouteInputSchema)(
          {
            token: "admin-token",
            gymId: "gym-1",
            areaId: "area-1",
            order: "1",
            positionLabel: "",
            setOn: "2026-07-10",
            setterName: "",
            boulderSource: "new",
            boulderGrade: "VX",
            boulderColor: "CHARTREUSE",
            boulderWallAngle: "SIDEWAYS",
            boulderMovementStyle: "LUCK",
          },
          { errors: "all" }
        )
      )
      const viewModel = yield* presenter.presentSchemaError(
        createGymRouteInitialViewModel,
        error
      )

      expect(viewModel.status).toBe("invalid")
      expect(viewModel.errors.boulderGrade).not.toBe("")
      expect(viewModel.errors.boulderColor).not.toBe("")
      expect(viewModel.errors.boulderWallAngle).not.toBe("")
      expect(viewModel.errors.boulderMovementStyle).not.toBe("")
    }).pipe(Effect.provide(CreateGymRoutePresenter.Live))
  )

  it.effect("maps route image schema issues to the image field", () =>
    Effect.gen(function* () {
      const presenter = yield* CreateGymRoutePresenter
      const error = yield* Effect.flip(
        Schema.decodeUnknownEffect(CreateGymRouteInputSchema)(
          {
            token: "admin-token",
            gymId: "gym-1",
            areaId: "area-1",
            order: "1",
            positionLabel: "",
            setOn: "2026-07-10",
            setterName: "",
            boulderId: "boulder-1",
            routeImage: {
              bytes: new Uint8Array(5 * 1024 * 1024 + 1),
              contentType: "image/gif",
              fileName: "route.gif",
            },
          },
          { errors: "all" }
        )
      )
      const viewModel = yield* presenter.presentSchemaError(
        createGymRouteInitialViewModel,
        error
      )

      expect(viewModel.status).toBe("invalid")
      expect(viewModel.errors.routeImage).not.toBe("")
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
                boulderId: BoulderId.make("deleted-boulder"),
                imageUrl: Option.some(
                  GymRouteImageUrl.make("/uploads/gym-routes/route-1.png")
                ),
              }),
            ],
          },
        ],
        boulders: [],
        assignableBoulders: [],
      })

      expect(viewModel.status).toBe("success")
      expect(
        viewModel.fields.areas.value[0]?.routes[0]?.boulder
      ).toMatchObject({
        id: "deleted-boulder",
        color: "UNSPECIFIED",
        available: false,
      })
      expect(viewModel.fields.areas.value[0]?.routes[0]?.imageUrl).toBe(
        "/uploads/gym-routes/route-1.png"
      )
    }).pipe(Effect.provide(GetGymManagementPresenter.Live))
  )

  it.effect("presents deleted routes as success", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteGymRoutePresenter
      const route = GymRoute.make({
        id: GymRouteId.make("route-1"),
        areaId: GymAreaId.make("area-1"),
        order: GymRouteOrder.make(3),
        positionLabel: Option.none(),
        setOn: GymRouteSetDate.make("2026-06-30"),
        setterName: Option.none(),
        boulderId: BoulderId.make("boulder-1"),
      })

      const viewModel = yield* presenter.presentSuccess(route)

      expect(viewModel.status).toBe("success")
      expect(viewModel.message).toBe("Deleted route 3.")
      expect(viewModel.fields.routeId.value).toBe("route-1")
    }).pipe(Effect.provide(DeleteGymRoutePresenter.Live))
  )

  it.effect("maps route delete schema issues to their fields", () =>
    Effect.gen(function* () {
      const presenter = yield* DeleteGymRoutePresenter
      const error = yield* Effect.flip(
        Schema.decodeUnknownEffect(DeleteGymRouteInputSchema)(
          {
            token: "admin-token",
            gymId: "",
            routeId: "",
          },
          { errors: "all" }
        )
      )

      const viewModel = yield* presenter.presentSchemaError(
        deleteGymRouteInitialViewModel,
        error
      )
      const forbidden = yield* presenter.presentForbidden(
        deleteGymRouteInitialViewModel
      )
      const notFound = yield* presenter.presentNotFound(
        deleteGymRouteInitialViewModel
      )
      const unexpected = yield* presenter.presentUnexpectedError(
        deleteGymRouteInitialViewModel
      )

      expect(viewModel.status).toBe("invalid")
      expect(viewModel.errors.gymId).not.toBe("")
      expect(viewModel.errors.routeId).not.toBe("")
      expect(forbidden.status).toBe("forbidden")
      expect(notFound.status).toBe("not-found")
      expect(unexpected.status).toBe("error")
    }).pipe(Effect.provide(DeleteGymRoutePresenter.Live))
  )
})
