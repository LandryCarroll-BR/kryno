import { describe, expect, it } from "@effect/vitest"
import { Cause, Effect, Exit, Layer } from "effect"
import { TestClock } from "effect/testing"

import { Auth } from "@workspace/auth"
import { GymRecord, GymId } from "../src/domain/gym"
import { AuthEmailDelivery } from "../src/ports/services/auth-email-delivery"
import { AuthApplicationTestLayer } from "../src/layers/test-layer"
import { GymRepository } from "../src/ports/repositories/gym-repository"

const GymStaffInvitationTestLayer = Auth.layer.pipe(
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

describe("Auth gym Staff invitation", () => {
  it.effect("lets an active gym Owner invite Staff and the invited user accept Staff access", () =>
    Effect.gen(function* () {
      const auth = yield* Auth
      const emails = yield* AuthEmailDelivery

      yield* auth.signUpGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
        displayName: "Owner",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const ownerLogin = yield* auth.loginGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
      })

      yield* auth.signUpGymUser({
        email: "staff@example.com",
        password: "correct horse battery staple",
        displayName: "Staff",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-2",
      })
      const staffLogin = yield* auth.loginGymUser({
        email: "staff@example.com",
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

      const invitation = yield* auth.createGymStaffInvitation({
        sessionId: ownerLogin.sessionToken,
        gymId: approval.gym.id,
        email: "staff@example.com",
      })

      expect(invitation.invitation.gymId).toBe(approval.gym.id)
      expect(invitation.invitation.invitedEmail).toBe("staff@example.com")
      expect(invitation.invitation.status).toBe("pending")

      const deliveries = yield* emails.sentGymStaffInvitationTokens
      expect(deliveries).toEqual([
        {
          email: "staff@example.com",
          token: "gym-staff-invitation-token-1",
          gymId: approval.gym.id,
        },
      ])

      const acceptance = yield* auth.acceptGymStaffInvitation({
        sessionId: staffLogin.sessionToken,
        token: "gym-staff-invitation-token-1",
      })

      expect(acceptance.affiliation.role).toBe("Staff")
      expect(acceptance.affiliation.status).toBe("active")
      expect(acceptance.affiliation.userId).toBe(staffLogin.user.id)

      const current = yield* auth.currentGymUserSession({
        sessionId: staffLogin.sessionToken,
      })
      expect(current.activeAffiliations[0]?.role).toBe("Staff")
    }).pipe(Effect.provide(GymStaffInvitationTestLayer))
  )

  it.effect("denies Staff invitation creation by a non-Owner", () =>
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

      const gyms = yield* GymRepository
      yield* gyms.saveGym(
        new GymRecord({
          id: GymId.make("active-gym"),
          name: "Active Gym",
          status: "active",
        })
      )

      const invitation = yield* Effect.exit(
        auth.createGymStaffInvitation({
          sessionId: memberLogin.sessionToken,
          gymId: GymId.make("active-gym"),
          email: "staff@example.com",
        })
      )

      expectFailureTag(invitation, "GymOwnerAccessDenied")
    }).pipe(Effect.provide(GymStaffInvitationTestLayer))
  )

  it.effect("denies Owner self-assignment to Staff through invitation", () =>
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

      const invitation = yield* Effect.exit(
        auth.createGymStaffInvitation({
          sessionId: ownerLogin.sessionToken,
          gymId: approval.gym.id,
          email: "owner@example.com",
        })
      )

      expectFailureTag(invitation, "GymStaffSelfAssignmentDenied")
    }).pipe(Effect.provide(GymStaffInvitationTestLayer))
  )

  it.effect("denies Staff invitation acceptance for invalid tokens or the wrong invited user", () =>
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
      const ownerLogin = yield* auth.loginGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
      })
      yield* auth.signUpGymUser({
        email: "staff@example.com",
        password: "correct horse battery staple",
        displayName: "Staff",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-2",
      })
      yield* auth.signUpGymUser({
        email: "other@example.com",
        password: "correct horse battery staple",
        displayName: "Other",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-3",
      })
      const otherLogin = yield* auth.loginGymUser({
        email: "other@example.com",
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
      yield* auth.createGymStaffInvitation({
        sessionId: ownerLogin.sessionToken,
        gymId: approval.gym.id,
        email: "staff@example.com",
      })

      const missing = yield* Effect.exit(
        auth.acceptGymStaffInvitation({
          sessionId: otherLogin.sessionToken,
          token: "missing-token",
        })
      )
      const wrongUser = yield* Effect.exit(
        auth.acceptGymStaffInvitation({
          sessionId: otherLogin.sessionToken,
          token: "gym-staff-invitation-token-1",
        })
      )

      expectFailureTag(missing, "GymStaffInvitationInvalid")
      expectFailureTag(wrongUser, "GymStaffInvitationInvalid")
    }).pipe(Effect.provide(GymStaffInvitationTestLayer))
  )

  it.effect("denies expired Staff invitations", () =>
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
      const ownerLogin = yield* auth.loginGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
      })
      yield* auth.signUpGymUser({
        email: "staff@example.com",
        password: "correct horse battery staple",
        displayName: "Staff",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-2",
      })
      const staffLogin = yield* auth.loginGymUser({
        email: "staff@example.com",
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
      yield* auth.createGymStaffInvitation({
        sessionId: ownerLogin.sessionToken,
        gymId: approval.gym.id,
        email: "staff@example.com",
      })

      yield* TestClock.adjust("7 days")

      const acceptance = yield* Effect.exit(
        auth.acceptGymStaffInvitation({
          sessionId: staffLogin.sessionToken,
          token: "gym-staff-invitation-token-1",
        })
      )

      expectFailureTag(acceptance, "GymStaffInvitationInvalid")
    }).pipe(Effect.provide(GymStaffInvitationTestLayer))
  )

  it.effect("denies Staff invitation creation and acceptance for inactive gyms", () =>
    Effect.gen(function* () {
      const auth = yield* Auth
      const gyms = yield* GymRepository

      yield* auth.signUpGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
        displayName: "Owner",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-1",
      })
      const ownerLogin = yield* auth.loginGymUser({
        email: "owner@example.com",
        password: "correct horse battery staple",
      })
      yield* auth.signUpGymUser({
        email: "staff@example.com",
        password: "correct horse battery staple",
        displayName: "Staff",
      })
      yield* auth.verifyGymUserEmail({
        token: "gym-user-email-verification-token-2",
      })
      const staffLogin = yield* auth.loginGymUser({
        email: "staff@example.com",
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
      yield* auth.createGymStaffInvitation({
        sessionId: ownerLogin.sessionToken,
        gymId: approval.gym.id,
        email: "staff@example.com",
      })
      yield* gyms.saveGym(
        new GymRecord({
          id: approval.gym.id,
          name: approval.gym.name,
          status: "suspended",
        })
      )

      const createForSuspended = yield* Effect.exit(
        auth.createGymStaffInvitation({
          sessionId: ownerLogin.sessionToken,
          gymId: approval.gym.id,
          email: "another-staff@example.com",
        })
      )
      const acceptForSuspended = yield* Effect.exit(
        auth.acceptGymStaffInvitation({
          sessionId: staffLogin.sessionToken,
          token: "gym-staff-invitation-token-1",
        })
      )

      expectFailureTag(createForSuspended, "GymAccessInactive")
      expectFailureTag(acceptForSuspended, "GymAccessInactive")
    }).pipe(Effect.provide(GymStaffInvitationTestLayer))
  )
})
