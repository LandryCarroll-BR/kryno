import { Effect, Layer } from "effect"
import { Climbing } from "@climbing/component"
import { NoActiveGymClimbingSessionError } from "@gym/application/errors/gym-climbing"
import { UnauthenticatedGymMemberError } from "@gym/application/errors/gym-membership"
import { GymRouteBoulderUnavailableError } from "@gym/application/errors/gym-route"
import { GymBoulderAttempts } from "@gym/application/services/gym-boulder-attempts"

export const GymBoulderAttemptsClimbing = Layer.effect(
  GymBoulderAttempts,
  Effect.gen(function* () {
    const climbing = yield* Climbing

    return {
      listForBoulders: Effect.fn("GymBoulderAttempts.listForBoulders")(
        function* ({ token, boulderIds }) {
          return yield* climbing
            .listBoulderAttemptHistory({
              token,
              boulderIds: [...boulderIds],
            })
            .pipe(
              Effect.catchTags({
                SchemaError: Effect.die,
                UnauthenticatedClimberError: () =>
                  new UnauthenticatedGymMemberError(),
              })
            )
        }
      ),
      log: Effect.fn("GymBoulderAttempts.log")(function* ({
        token,
        memberId,
        routeId,
        boulderId,
        outcome,
        moveTypes,
        video,
      }) {
        return yield* climbing
          .logExistingBoulderAttempt({
            token,
            boulderId,
            outcome,
            moveTypes,
            video,
          })
          .pipe(
            Effect.catchTags({
              SchemaError: Effect.die,
              UnauthenticatedClimberError: () =>
                new UnauthenticatedGymMemberError(),
              BoulderNotFoundError: () =>
                new GymRouteBoulderUnavailableError({
                  routeId,
                  boulderId,
                }),
              NoActiveClimbingSessionError: () =>
                new NoActiveGymClimbingSessionError({ memberId }),
            })
          )
      }),
    }
  })
)
