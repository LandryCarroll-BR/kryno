import { Effect, Layer, Option } from "effect"

import {
  GymAffiliationRecord,
  GymCreationRequestApproved,
  GymCreationRequested,
  GymCreationRequestRecord,
  GymRecord,
  CurrentGymOwnerAccessSuccess,
  type ApproveGymCreationRequestInput,
  type CurrentGymOwnerAccessInput,
  type RequestGymCreationInput,
} from "../../domain/gym.ts"
import {
  GymCreationRequestInvalid,
  GymUserSessionInvalid,
} from "../../domain/errors.ts"
import { GymRepository } from "../../ports/repositories/gym-repository.ts"
import { GymUserRegistrationRepository } from "../../ports/repositories/gym-user-registration-repository.ts"
import { SystemAdminBootstrapRepository } from "../../ports/repositories/system-admin-bootstrap-repository.ts"
import { AuthIdGenerator } from "../../ports/services/auth-id-generator.ts"
import { requireVerifiedGymUser } from "../gym-user-authentication/gym-user-authentication-policy.ts"
import { requireActiveSystemAdminSession } from "../system-admin-authentication/system-admin-authentication-policy.ts"
import { GymRequest } from "./gym-request-input-boundary.ts"
import {
  requireActiveGym,
  requireActiveOwnerAffiliation,
  requirePendingGymCreationRequest,
} from "./gym-request-policy.ts"

export const GymRequestInteractor = Layer.effect(
  GymRequest,
  Effect.gen(function* () {
    const gymRepository = yield* GymRepository
    const gymUserRepository = yield* GymUserRegistrationRepository
    const systemAdminRepository = yield* SystemAdminBootstrapRepository
    const ids = yield* AuthIdGenerator

    const requestCreation = Effect.fn("GymRequest.requestCreation")(
      (command: RequestGymCreationInput) =>
        Effect.gen(function* () {
          const maybeSession = yield* gymUserRepository.findSessionById(
            command.sessionId
          )

          if (Option.isNone(maybeSession) || !maybeSession.value.active) {
            return yield* new GymUserSessionInvalid({
              sessionId: command.sessionId,
            })
          }

          const maybeUser = yield* gymUserRepository.findById(
            maybeSession.value.userId
          )

          if (Option.isNone(maybeUser)) {
            return yield* new GymUserSessionInvalid({
              sessionId: command.sessionId,
            })
          }

          const user = yield* requireVerifiedGymUser(maybeUser.value)

          const gym = new GymRecord({
            id: yield* ids.nextGymId,
            name: command.name,
            status: "pending",
          })
          const request = new GymCreationRequestRecord({
            id: yield* ids.nextGymCreationRequestId,
            gymId: gym.id,
            requesterUserId: user.id,
            status: "pending",
          })

          yield* gymRepository.saveGym(gym)
          yield* gymRepository.saveCreationRequest(request)

          return new GymCreationRequested({ request, gym })
        })
    )

    const approveCreationRequest = Effect.fn(
      "GymRequest.approveCreationRequest"
    )((command: ApproveGymCreationRequestInput) =>
      Effect.gen(function* () {
        yield* requireActiveSystemAdminSession(
          command.sessionId,
          yield* systemAdminRepository.findSessionById(command.sessionId)
        )

        const request = yield* requirePendingGymCreationRequest(
          command.requestId,
          yield* gymRepository.findCreationRequestById(command.requestId)
        )

        const maybeGym = yield* gymRepository.findGymById(request.gymId)

        if (Option.isNone(maybeGym)) {
          return yield* new GymCreationRequestInvalid({
            requestId: command.requestId,
          })
        }

        const gym = new GymRecord({
          id: maybeGym.value.id,
          name: maybeGym.value.name,
          status: "active",
        })
        const approvedRequest = new GymCreationRequestRecord({
          id: request.id,
          gymId: request.gymId,
          requesterUserId: request.requesterUserId,
          status: "approved",
        })
        const ownerAffiliation = new GymAffiliationRecord({
          gymId: gym.id,
          userId: request.requesterUserId,
          role: "Owner",
          status: "active",
        })

        yield* gymRepository.saveGym(gym)
        yield* gymRepository.saveCreationRequest(approvedRequest)
        yield* gymRepository.saveAffiliation(ownerAffiliation)

        return new GymCreationRequestApproved({
          request: approvedRequest,
          gym,
          ownerAffiliation,
        })
      })
    )

    const currentOwnerAccess = Effect.fn("GymRequest.currentOwnerAccess")(
      (command: CurrentGymOwnerAccessInput) =>
        Effect.gen(function* () {
          const maybeSession = yield* gymUserRepository.findSessionById(
            command.sessionId
          )

          if (Option.isNone(maybeSession) || !maybeSession.value.active) {
            return yield* new GymUserSessionInvalid({
              sessionId: command.sessionId,
            })
          }

          const maybeUser = yield* gymUserRepository.findById(
            maybeSession.value.userId
          )

          if (Option.isNone(maybeUser)) {
            return yield* new GymUserSessionInvalid({
              sessionId: command.sessionId,
            })
          }

          const user = yield* requireVerifiedGymUser(maybeUser.value)
          const gym = yield* requireActiveGym(
            command.gymId,
            yield* gymRepository.findGymById(command.gymId)
          )
          const affiliation = yield* requireActiveOwnerAffiliation(
            command.gymId,
            user.id,
            yield* gymRepository.findAffiliation(command.gymId, user.id)
          )

          return new CurrentGymOwnerAccessSuccess({ gym, affiliation })
        })
    )

    return {
      requestCreation,
      approveCreationRequest,
      currentOwnerAccess,
    }
  })
)
