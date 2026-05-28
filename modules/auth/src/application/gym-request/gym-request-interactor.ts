import { Effect, Layer, Option } from "effect"

import {
  GymAffiliationRecord,
  GymCreationRequestApproved,
  GymCreationRequested,
  GymCreationRequestRecord,
  GymMemberJoined,
  GymMemberLeft,
  GymRecord,
  CurrentGymOwnerAccessSuccess,
  type ApproveGymCreationRequestInput,
  type CurrentGymOwnerAccessInput,
  type JoinGymAsMemberInput,
  type LeaveGymAsMemberInput,
  type RequestGymCreationInput,
} from "../../domain/gym.ts"
import {
  GymCreationRequestInvalid,
  GymMemberAffiliationInvalid,
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
  requireActiveMemberAffiliation,
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

    const requireCurrentVerifiedGymUser = (
      sessionId: RequestGymCreationInput["sessionId"]
    ) =>
      Effect.gen(function* () {
        const maybeSession = yield* gymUserRepository.findSessionById(sessionId)

        if (Option.isNone(maybeSession) || !maybeSession.value.active) {
          return yield* new GymUserSessionInvalid({ sessionId })
        }

        const maybeUser = yield* gymUserRepository.findById(
          maybeSession.value.userId
        )

        if (Option.isNone(maybeUser)) {
          return yield* new GymUserSessionInvalid({ sessionId })
        }

        return yield* requireVerifiedGymUser(maybeUser.value)
      })

    const requestCreation = Effect.fn("GymRequest.requestCreation")(
      (command: RequestGymCreationInput) =>
        Effect.gen(function* () {
          const user = yield* requireCurrentVerifiedGymUser(command.sessionId)

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
          const user = yield* requireCurrentVerifiedGymUser(command.sessionId)
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

    const joinAsMember = Effect.fn("GymRequest.joinAsMember")(
      (command: JoinGymAsMemberInput) =>
        Effect.gen(function* () {
          const user = yield* requireCurrentVerifiedGymUser(command.sessionId)
          const gym = yield* requireActiveGym(
            command.gymId,
            yield* gymRepository.findGymById(command.gymId)
          )
          const maybeExistingAffiliation = yield* gymRepository.findAffiliation(
            command.gymId,
            user.id
          )

          if (
            Option.isSome(maybeExistingAffiliation) &&
            maybeExistingAffiliation.value.status === "active" &&
            maybeExistingAffiliation.value.role !== "Member"
          ) {
            return yield* new GymMemberAffiliationInvalid({
              gymId: command.gymId,
              userId: user.id,
            })
          }

          const affiliation = new GymAffiliationRecord({
            gymId: gym.id,
            userId: user.id,
            role: "Member",
            status: "active",
          })

          yield* gymRepository.saveAffiliation(affiliation)

          return new GymMemberJoined({ gym, affiliation })
        })
    )

    const leaveAsMember = Effect.fn("GymRequest.leaveAsMember")(
      (command: LeaveGymAsMemberInput) =>
        Effect.gen(function* () {
          const user = yield* requireCurrentVerifiedGymUser(command.sessionId)
          const gym = yield* requireActiveGym(
            command.gymId,
            yield* gymRepository.findGymById(command.gymId)
          )
          const currentAffiliation = yield* requireActiveMemberAffiliation(
            command.gymId,
            user.id,
            yield* gymRepository.findAffiliation(command.gymId, user.id)
          )
          const leftAffiliation = new GymAffiliationRecord({
            gymId: currentAffiliation.gymId,
            userId: currentAffiliation.userId,
            role: "Member",
            status: "left",
          })

          yield* gymRepository.saveAffiliation(leftAffiliation)

          return new GymMemberLeft({ gym, affiliation: leftAffiliation })
        })
    )

    return {
      requestCreation,
      approveCreationRequest,
      currentOwnerAccess,
      joinAsMember,
      leaveAsMember,
    }
  })
)
