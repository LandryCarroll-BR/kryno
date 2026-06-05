import { makePersistenceError, DrizzleDatabase } from "@workspace/drizzle"
import { eq } from "drizzle-orm"
import { Effect, Layer, Option } from "effect"

import { normalizeEmailIdentity } from "../../domain/email-identity.ts"
import {
  GymId,
  GymStaffInvitationId,
  GymStaffInvitationRecord,
} from "../../domain/gym.ts"
import { GymUserId } from "../../domain/gym-user.ts"
import { GymStaffInvitationRepository } from "../../ports/repositories/gym-staff-invitation-repository.ts"
import { gymStaffInvitations } from "../../schema.ts"

type GymStaffInvitationRow = typeof gymStaffInvitations.$inferSelect

export const GymStaffInvitationRepositoryPostgresAdapter = Layer.effect(
  GymStaffInvitationRepository,
  Effect.gen(function* () {
    const database = yield* DrizzleDatabase
    const db = database.db

    const run = <A>(operation: string, effect: Effect.Effect<A, unknown>) =>
      effect.pipe(
        Effect.mapError((error) => makePersistenceError(operation, error))
      )

    return {
      findByToken: (token) =>
        run(
          "auth.gymStaffInvitation.findByToken",
          db
            .select()
            .from(gymStaffInvitations)
            .where(eq(gymStaffInvitations.tokenDigest, token))
            .limit(1)
        ).pipe(
          Effect.map((rows) => Option.fromNullishOr(rows[0])),
          Effect.map(Option.map(rowToGymStaffInvitationRecord))
        ),
      save: (invitation) =>
        run(
          "auth.gymStaffInvitation.save",
          db
            .insert(gymStaffInvitations)
            .values({
              id: invitation.id,
              gymId: invitation.gymId,
              invitedEmail: normalizeEmailIdentity(invitation.invitedEmail),
              normalizedInvitedEmail: normalizeEmailIdentity(
                invitation.invitedEmail
              ),
              invitedByUserId: invitation.invitedByUserId,
              tokenDigest: invitation.token,
              status: invitation.status,
              acceptedAt:
                invitation.acceptedAtMillis === undefined
                  ? null
                  : new Date(invitation.acceptedAtMillis),
              revokedAt:
                invitation.revokedAtMillis === undefined
                  ? null
                  : new Date(invitation.revokedAtMillis),
              expiresAt: new Date(invitation.expiresAtMillis),
              updatedAt: new Date(),
            })
            .onConflictDoUpdate({
              target: gymStaffInvitations.id,
              set: {
                invitedEmail: normalizeEmailIdentity(invitation.invitedEmail),
                normalizedInvitedEmail: normalizeEmailIdentity(
                  invitation.invitedEmail
                ),
                status: invitation.status,
                acceptedAt:
                  invitation.acceptedAtMillis === undefined
                    ? null
                    : new Date(invitation.acceptedAtMillis),
                revokedAt:
                  invitation.revokedAtMillis === undefined
                    ? null
                    : new Date(invitation.revokedAtMillis),
                expiresAt: new Date(invitation.expiresAtMillis),
                updatedAt: new Date(),
              },
            })
        ),
    }
  })
)

const rowToGymStaffInvitationRecord = (row: GymStaffInvitationRow) =>
  new GymStaffInvitationRecord({
    id: GymStaffInvitationId.make(row.id),
    gymId: GymId.make(row.gymId),
    invitedEmail: row.invitedEmail,
    invitedByUserId: GymUserId.make(row.invitedByUserId),
    token: row.tokenDigest,
    expiresAtMillis: dateToMillis(row.expiresAt),
    status: row.status,
    acceptedAtMillis:
      row.acceptedAt === null ? undefined : dateToMillis(row.acceptedAt),
    revokedAtMillis:
      row.revokedAt === null ? undefined : dateToMillis(row.revokedAt),
  })

const dateToMillis = (value: Date | string) =>
  value instanceof Date ? value.getTime() : new Date(value).getTime()
