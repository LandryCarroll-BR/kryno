import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Layer } from "effect"

import { Auth } from "@workspace/auth"
import { GymId } from "../src/domain/gym"
import {
  GymUserId,
  GymUserRegistrationRecord,
  GymUserSessionId,
  GymUserSessionRecord,
} from "../src/domain/gym-user"
import { SystemAdminSessionId } from "../src/domain/system-admin"
import {
  AuthApplicationTestLayer,
  AuthTestLayer,
} from "../src/layers/test-layer"
import { GymUserRegistrationRepository } from "../src/ports/repositories/gym-user-registration-repository"

const GymRequestTestLayer = Auth.layer.pipe(
  Layer.provideMerge(AuthApplicationTestLayer)
)

const expectFailureTag = <Tag extends string>(
  exit: Exit.Exit<unknown, { readonly _tag: string }>,
  tag: Tag
) => {
  expect(Exit.isFailure(exit)).toBe(true)
  if (Exit.isFailure(exit)) {
    const failure = exit.cause.reasons.find(Cause.isFailReason)
    expect(failure).toBeDefined()
    if (failure !== undefined) {
      expect(failure.error._tag).toBe(tag)
    }
  }
}

describe("Auth gym request admin approval", () => {
  it.effect("lets a verified gym-side user request a gym and an admin approve it into active Owner access", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
        displayName: "Owner",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const gymUserLogin = yield* auth.loginGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
      })

      yield* auth.bootstrapFirstSystemAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })
      const adminLogin = yield* auth.loginSystemAdmin({
        email: "admin@example.com",
        password: "correct horse battery staple",
      })

      const request = yield* auth.requestGymCreation({
        sessionId: gymUserLogin.sessionToken,
        name: "Boulder House",
      })

      expect(request.request.status).toBe("pending")
      expect(request.gym.status).toBe("pending")
      expect(request.request.requesterUserId).toBe(gymUserLogin.user.id)

      const approval = yield* auth.approveGymCreationRequest({
        sessionId: adminLogin.sessionToken,
        requestId: request.request.id,
      })

      expect(approval.gym.id).toBe(request.gym.id)
      expect(approval.gym.status).toBe("active")
      expect(approval.ownerAffiliation.role).toBe("Owner")
      expect(approval.ownerAffiliation.userId).toBe(gymUserLogin.user.id)

      const ownerAccess = yield* auth.currentGymOwnerAccess({
        sessionId: gymUserLogin.sessionToken,
        gymId: approval.gym.id,
      })

      expect(ownerAccess.gym.status).toBe("active")
      expect(ownerAccess.affiliation.role).toBe("Owner")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("denies gym request creation for an unverified gym-side session", () =>
    Effect.gen(function* () {
      const auth = yield* Auth
      const gymUsers = yield* GymUserRegistrationRepository

      const unverifiedUser = new GymUserRegistrationRecord({
        id: GymUserId.make("unverified-user"),
        email: "unverified@example.com",
        displayName: "Unverified",
        emailVerified: false,
      })
      const unverifiedSession = new GymUserSessionRecord({
        id: GymUserSessionId.make("unverified-session"),
        userId: unverifiedUser.id,
        tokenDigest: "digest:unverified-session-token",
        expiresAtMillis: Number.MAX_SAFE_INTEGER,
        active: true,
      })

      yield* gymUsers.save(unverifiedUser)
      yield* gymUsers.saveSession(unverifiedSession)

      const request = yield* Effect.exit(
        auth.requestGymCreation({
          sessionId: GymUserSessionId.make("unverified-session-token"),
          name: "Unverified Boulder House",
        })
      )

      expectFailureTag(request, "GymUserUnverified")
    }).pipe(Effect.provide(GymRequestTestLayer))
  )

  it.effect("denies approval without a valid system-admin session", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
        displayName: "Owner",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const gymUserLogin = yield* auth.loginGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
      })

      const request = yield* auth.requestGymCreation({
        sessionId: gymUserLogin.sessionToken,
        name: "Boulder House",
      })

      const approval = yield* Effect.exit(
        auth.approveGymCreationRequest({
          sessionId: SystemAdminSessionId.make("missing-admin-session"),
          requestId: request.request.id,
        })
      )

      expectFailureTag(approval, "SystemAdminSessionInvalid")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("requires an active gym for Owner access", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
        displayName: "Owner",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const gymUserLogin = yield* auth.loginGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
      })

      const access = yield* Effect.exit(
        auth.currentGymOwnerAccess({
          sessionId: gymUserLogin.sessionToken,
          gymId: GymId.make("missing-gym"),
        })
      )

      expectFailureTag(access, "GymAccessInactive")
    }).pipe(Effect.provide(AuthTestLayer))
  )
})
