import { describe, expect, it } from "@effect/vitest"
import { Effect, Option, Schema } from "effect"
import {
  BoulderId,
  GymRoute,
  GymRouteId,
  GymRouteImageUrl,
  GymRouteOrder,
  GymRoutePositionLabel,
  GymRouteSetDate,
} from "@gym/application/models/gym-route"
import { GymAreaId } from "@gym/application/models/gym-area"
import { EditGymRouteInputSchema } from "@gym/application/use-cases/edit-gym-route"

import { EditGymRoutePresenter } from "../src/presenters/edit-gym-route.presenter"
import { editGymRouteInitialViewModel } from "../src/view-models/edit-gym-route.view-model"

describe("EditGymRoutePresenter", () => {
  it.effect("presents an updated route and reflects saved fields", () =>
    Effect.gen(function* () {
      const presenter = yield* EditGymRoutePresenter
      const route = GymRoute.make({
        id: GymRouteId.make("route-1"),
        areaId: GymAreaId.make("area-2"),
        order: GymRouteOrder.make(3),
        positionLabel: Option.some(GymRoutePositionLabel.make("Right arete")),
        setOn: GymRouteSetDate.make("2026-07-08"),
        setterName: Option.none(),
        boulderId: BoulderId.make("boulder-1"),
        imageUrl: Option.some(
          GymRouteImageUrl.make("/uploads/gym-routes/route-1.webp")
        ),
      })

      const viewModel = yield* presenter.presentSuccess(route)

      expect(viewModel.status).toBe("success")
      expect(viewModel.message).toBe("Updated route 3.")
      expect(viewModel.fields.routeId.value).toBe("route-1")
      expect(viewModel.fields.areaId.value).toBe("area-2")
      expect(viewModel.fields.order.value).toBe("3")
      expect(viewModel.fields.positionLabel.value).toBe("Right arete")
      expect(viewModel.fields.setterName.value).toBe("")
      expect(viewModel.fields.routeImage.value).toBe("")
      expect(viewModel.errors.order).toBe("")
    }).pipe(Effect.provide(EditGymRoutePresenter.Live))
  )

  it.effect("presents malformed input as invalid", () =>
    Effect.gen(function* () {
      const presenter = yield* EditGymRoutePresenter
      const schemaError = yield* Effect.flip(
        Schema.decodeUnknownEffect(EditGymRouteInputSchema)(
          {
            token: "admin-token",
            gymId: "gym-1",
            routeId: "route-1",
            areaId: "area-1",
            order: "0",
            positionLabel: null,
            setOn: "2026-07-08",
            setterName: null,
          },
          { errors: "all" }
        )
      )

      const viewModel = yield* presenter.presentSchemaError(
        editGymRouteInitialViewModel,
        schemaError
      )

      expect(viewModel.status).toBe("invalid")
      expect(viewModel.message).toContain("Invalid input")
      expect(viewModel.errors.order).not.toBe("")
    }).pipe(Effect.provide(EditGymRoutePresenter.Live))
  )

  it.effect("presents recoverable edit failures", () =>
    Effect.gen(function* () {
      const presenter = yield* EditGymRoutePresenter

      const forbidden = yield* presenter.presentForbidden(
        editGymRouteInitialViewModel
      )
      const notFound = yield* presenter.presentNotFound(
        editGymRouteInitialViewModel
      )
      const conflict = yield* presenter.presentConflict(
        editGymRouteInitialViewModel
      )
      const unexpected = yield* presenter.presentUnexpectedError(
        editGymRouteInitialViewModel
      )

      expect(forbidden.status).toBe("forbidden")
      expect(notFound.status).toBe("not-found")
      expect(conflict.status).toBe("conflict")
      expect(conflict.errors.order).toBe(
        "Route order must be unique within an area."
      )
      expect(unexpected.status).toBe("error")
      expect(unexpected.message).toBe(
        "Unable to update this route. Please try again."
      )
    }).pipe(Effect.provide(EditGymRoutePresenter.Live))
  )
})
