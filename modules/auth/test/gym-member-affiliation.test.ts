import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Layer } from "effect"

import { Auth } from "@workspace/auth"
import { GymRecord, GymId } from "../src/domain/gym"
import { GymUserSessionId } from "../src/domain/gym-user"
import { AuthApplicationTestLayer, AuthTestLayer } from "../src/layers/test-layer"
import { GymRepository } from "../src/ports/repositories/gym-repository"

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

const GymMemberAffiliationTestLayer = Auth.layer.pipe(
  Layer.provideMerge(AuthApplicationTestLayer)
)

describe("Auth gym member affiliation", () => {
  it.effect("lets a verified gym-side user join, leave, and rejoin an active gym as a Member", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      yield* auth.signUpGymUser({
        email: "member@example.com",
        password: "correct horse battery staple",
        displayName: "Member",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const memberLogin = yield* auth.loginGymUser({
        email: "member@example.com",
        password: "correct horse battery staple",
      })

      yield* auth.signUpGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
        displayName: "Owner",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-2",
      })
      const ownerLogin = yield* auth.loginGymUser({
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
        sessionId: ownerLogin.sessionToken,
        name: "Boulder House",
      })
      const approval = yield* auth.approveGymCreationRequest({
        sessionId: adminLogin.sessionToken,
        requestId: request.request.id,
      })

      const join = yield* auth.joinGymAsMember({
        sessionId: memberLogin.sessionToken,
        gymId: approval.gym.id,
      })

      expect(join.affiliation.role).toBe("Member")
      expect(join.affiliation.status).toBe("active")
      expect(join.affiliation.userId).toBe(memberLogin.user.id)

      const current = yield* auth.currentGymUserSession({
        sessionId: memberLogin.sessionToken,
      })

      expect(current.activeAffiliations).toHaveLength(1)
      expect(current.activeAffiliations[0]?.gymId).toBe(approval.gym.id)
      expect(current.activeAffiliations[0]?.role).toBe("Member")

      const leave = yield* auth.leaveGymAsMember({
        sessionId: memberLogin.sessionToken,
        gymId: approval.gym.id,
      })

      expect(leave.affiliation.status).toBe("left")

      const afterLeave = yield* auth.currentGymUserSession({
        sessionId: memberLogin.sessionToken,
      })

      expect(afterLeave.activeAffiliations).toHaveLength(0)

      const rejoin = yield* auth.joinGymAsMember({
        sessionId: memberLogin.sessionToken,
        gymId: approval.gym.id,
      })

      expect(rejoin.affiliation.role).toBe("Member")
      expect(rejoin.affiliation.status).toBe("active")
    }).pipe(Effect.provide(AuthTestLayer))
  )

  it.effect("denies member join for pending or suspended gyms", () =>
    Effect.gen(function* () {
      const auth = yield* Auth
      const gyms = yield* GymRepository

      yield* auth.signUpGymUser({
        email: "member@example.com",
        password: "correct horse battery staple",
        displayName: "Member",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const memberLogin = yield* auth.loginGymUser({
        email: "member@example.com",
        password: "correct horse battery staple",
      })

      yield* gyms.saveGym(
        new GymRecord({
          id: GymId.make("pending-gym"),
          name: "Pending Gym",
          status: "pending",
        })
      )
      yield* gyms.saveGym(
        new GymRecord({
          id: GymId.make("suspended-gym"),
          name: "Suspended Gym",
          status: "suspended",
        })
      )

      const pendingJoin = yield* Effect.exit(
        auth.joinGymAsMember({
          sessionId: memberLogin.sessionToken,
          gymId: GymId.make("pending-gym"),
        })
      )
      const suspendedJoin = yield* Effect.exit(
        auth.joinGymAsMember({
          sessionId: memberLogin.sessionToken,
          gymId: GymId.make("suspended-gym"),
        })
      )

      expectFailureTag(pendingJoin, "GymAccessInactive")
      expectFailureTag(suspendedJoin, "GymAccessInactive")
    }).pipe(Effect.provide(GymMemberAffiliationTestLayer))
  )

  it.effect("denies member leave without an active member affiliation", () =>
    Effect.gen(function* () {
      const auth = yield* Auth
      const gyms = yield* GymRepository

      yield* auth.signUpGymUser({
        email: "member@example.com",
        password: "correct horse battery staple",
        displayName: "Member",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const memberLogin = yield* auth.loginGymUser({
        email: "member@example.com",
        password: "correct horse battery staple",
      })

      const gym = new GymRecord({
        id: GymId.make("active-gym"),
        name: "Active Gym",
        status: "active",
      })
      yield* gyms.saveGym(gym)

      const leave = yield* Effect.exit(
        auth.leaveGymAsMember({
          sessionId: memberLogin.sessionToken,
          gymId: gym.id,
        })
      )

      expectFailureTag(leave, "GymMemberAffiliationInvalid")
    }).pipe(Effect.provide(GymMemberAffiliationTestLayer))
  )

  it.effect("hides member affiliations for gyms that stop being active", () =>
    Effect.gen(function* () {
      const auth = yield* Auth
      const gyms = yield* GymRepository

      yield* auth.signUpGymUser({
        email: "member@example.com",
        password: "correct horse battery staple",
        displayName: "Member",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const memberLogin = yield* auth.loginGymUser({
        email: "member@example.com",
        password: "correct horse battery staple",
      })

      const gym = new GymRecord({
        id: GymId.make("active-gym"),
        name: "Active Gym",
        status: "active",
      })
      yield* gyms.saveGym(gym)
      yield* auth.joinGymAsMember({
        sessionId: memberLogin.sessionToken,
        gymId: gym.id,
      })
      yield* gyms.saveGym(
        new GymRecord({
          id: gym.id,
          name: gym.name,
          status: "suspended",
        })
      )

      const current = yield* auth.currentGymUserSession({
        sessionId: memberLogin.sessionToken,
      })

      expect(current.activeAffiliations).toHaveLength(0)
    }).pipe(Effect.provide(GymMemberAffiliationTestLayer))
  )

  it.effect("denies member affiliation for an invalid gym-side session", () =>
    Effect.gen(function* () {
      const auth = yield* Auth

      const join = yield* Effect.exit(
        auth.joinGymAsMember({
          sessionId: GymUserSessionId.make("missing-session"),
          gymId: GymId.make("active-gym"),
        })
      )

      expectFailureTag(join, "GymUserSessionInvalid")
    }).pipe(Effect.provide(AuthTestLayer))
  )
})
