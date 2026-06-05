import { describe, expect, it } from "@effect/vitest"
import { DrizzleDatabase, type DrizzleDatabaseShape } from "@workspace/drizzle"
import { Effect, Layer, Option } from "effect"

import { GymRepositoryPostgresAdapter } from "../src/adapters/repositories/gym-repository-postgres.ts"
import { GymStaffInvitationRepositoryPostgresAdapter } from "../src/adapters/repositories/gym-staff-invitation-repository-postgres.ts"
import { GymUserRegistrationRepositoryPostgresAdapter } from "../src/adapters/repositories/gym-user-registration-repository-postgres.ts"
import { SystemAdminBootstrapRepositoryPostgresAdapter } from "../src/adapters/repositories/system-admin-bootstrap-repository-postgres.ts"
import {
  GymAffiliationRecord,
  GymCreationRequestId,
  GymCreationRequestRecord,
  GymId,
  GymRecord,
  GymStaffInvitationId,
  GymStaffInvitationRecord,
} from "../src/domain/gym.ts"
import {
  GymUserCredentialRecord,
  GymUserEmailVerificationTokenRecord,
  GymUserId,
  GymUserPasswordResetTokenRecord,
  GymUserRegistrationRecord,
  GymUserSessionId,
  GymUserSessionRecord,
} from "../src/domain/gym-user.ts"
import {
  SystemAdminCredentialRecord,
  SystemAdminId,
  SystemAdminRecord,
  SystemAdminSessionId,
  SystemAdminSessionRecord,
} from "../src/domain/system-admin.ts"
import { GymRepository } from "../src/ports/repositories/gym-repository.ts"
import { GymStaffInvitationRepository } from "../src/ports/repositories/gym-staff-invitation-repository.ts"
import { GymUserRegistrationRepository } from "../src/ports/repositories/gym-user-registration-repository.ts"
import { SystemAdminBootstrapRepository } from "../src/ports/repositories/system-admin-bootstrap-repository.ts"

describe("GymUserRegistrationRepositoryPostgresAdapter", () => {
  it.effect("saves gym user signup records and token digests", () =>
    Effect.gen(function* () {
      const repository = yield* GymUserRegistrationRepository
      const user = new GymUserRegistrationRecord({
        id: GymUserId.make("00000000-0000-0000-0000-000000000001"),
        email: "alex@example.com",
        displayName: "Alex",
        emailVerified: false,
      })
      const credential = new GymUserCredentialRecord({
        userId: user.id,
        passwordHash: "hashed:password",
      })
      const emailVerificationToken =
        new GymUserEmailVerificationTokenRecord({
          token: "digest:gym-user-email-verification-token",
          userId: user.id,
          expiresAtMillis: 1_800_000,
          used: true,
          usedAtMillis: 600_000,
        })
      const passwordResetToken = new GymUserPasswordResetTokenRecord({
        token: "digest:gym-user-password-reset-token",
        userId: user.id,
        expiresAtMillis: 2_400_000,
        used: false,
      })
      const session = new GymUserSessionRecord({
        id: GymUserSessionId.make("00000000-0000-0000-0000-000000000002"),
        userId: user.id,
        tokenDigest: "digest:gym-user-session-token",
        expiresAtMillis: 3_000_000,
        active: true,
      })

      yield* repository.save(user)
      yield* repository.saveCredential(credential)
      yield* repository.saveEmailVerificationToken(emailVerificationToken)
      yield* repository.savePasswordResetToken(passwordResetToken)
      yield* repository.saveSession(session)

      const found = yield* repository.findByEmail(" ALEX@EXAMPLE.COM ")
      const foundCredential = yield* repository.findCredentialByUserId(user.id)
      const foundEmailVerificationToken =
        yield* repository.findEmailVerificationToken(
          "digest:gym-user-email-verification-token"
        )
      const rawEmailVerificationLookup =
        yield* repository.findEmailVerificationToken(
          "gym-user-email-verification-token"
        )
      const foundPasswordResetToken =
        yield* repository.findPasswordResetToken(
          "digest:gym-user-password-reset-token"
        )
      const rawPasswordResetLookup = yield* repository.findPasswordResetToken(
        "gym-user-password-reset-token"
      )
      const foundSession = yield* repository.findSessionByTokenDigest(
        "digest:gym-user-session-token"
      )
      const rawSessionLookup = yield* repository.findSessionByTokenDigest(
        "gym-user-session-token"
      )

      expect(Option.getOrUndefined(found)).toEqual(user)
      expect(Option.getOrUndefined(foundCredential)).toEqual(credential)
      expect(Option.getOrUndefined(foundEmailVerificationToken)).toEqual(
        emailVerificationToken
      )
      expect(Option.isNone(rawEmailVerificationLookup)).toBe(true)
      expect(Option.getOrUndefined(foundPasswordResetToken)).toEqual(
        passwordResetToken
      )
      expect(Option.isNone(rawPasswordResetLookup)).toBe(true)
      expect(Option.getOrUndefined(foundSession)).toEqual(session)
      expect(Option.isNone(rawSessionLookup)).toBe(true)
    }).pipe(Effect.provide(testLayer()))
  )
})

describe("GymRepositoryPostgresAdapter", () => {
  it.effect("saves gyms, creation requests, and active affiliations", () =>
    Effect.gen(function* () {
      const repository = yield* GymRepository
      const gym = new GymRecord({
        id: GymId.make("20000000-0000-0000-0000-000000000001"),
        name: "Downtown Strength",
        status: "active",
      })
      const userId = GymUserId.make("20000000-0000-0000-0000-000000000002")
      const request = new GymCreationRequestRecord({
        id: GymCreationRequestId.make(
          "20000000-0000-0000-0000-000000000003"
        ),
        gymId: gym.id,
        requesterUserId: userId,
        status: "approved",
      })
      const affiliation = new GymAffiliationRecord({
        gymId: gym.id,
        userId,
        role: "Owner",
        status: "active",
      })

      yield* repository.saveGym(gym)
      yield* repository.saveCreationRequest(request)
      yield* repository.saveAffiliation(affiliation)

      const foundGym = yield* repository.findGymById(gym.id)
      const foundRequest = yield* repository.findCreationRequestById(request.id)
      const foundAffiliation = yield* repository.findAffiliation(gym.id, userId)
      const activeAffiliations =
        yield* repository.findActiveAffiliationsByUserId(userId)

      expect(Option.getOrUndefined(foundGym)).toEqual(gym)
      expect(Option.getOrUndefined(foundRequest)).toEqual(request)
      expect(Option.getOrUndefined(foundAffiliation)).toEqual(affiliation)
      expect(activeAffiliations).toEqual([affiliation])
    }).pipe(Effect.provide(gymTestLayer()))
  )
})

describe("GymStaffInvitationRepositoryPostgresAdapter", () => {
  it.effect("saves staff invitations and resolves them by token digest", () =>
    Effect.gen(function* () {
      const repository = yield* GymStaffInvitationRepository
      const invitation = new GymStaffInvitationRecord({
        id: GymStaffInvitationId.make(
          "30000000-0000-0000-0000-000000000001"
        ),
        gymId: GymId.make("30000000-0000-0000-0000-000000000002"),
        invitedEmail: " Staff@Example.COM ",
        invitedByUserId: GymUserId.make(
          "30000000-0000-0000-0000-000000000003"
        ),
        token: "digest:gym-staff-invitation-token",
        expiresAtMillis: 1_800_000,
        status: "pending",
      })

      yield* repository.save(invitation)

      const found = yield* repository.findByToken(
        "digest:gym-staff-invitation-token"
      )
      const rawTokenLookup = yield* repository.findByToken(
        "gym-staff-invitation-token"
      )

      expect(Option.getOrUndefined(found)).toEqual(
        new GymStaffInvitationRecord({
          ...invitation,
          invitedEmail: "staff@example.com",
        })
      )
      expect(Option.isNone(rawTokenLookup)).toBe(true)
    }).pipe(Effect.provide(staffInvitationTestLayer()))
  )
})

describe("SystemAdminBootstrapRepositoryPostgresAdapter", () => {
  it.effect(
    "saves the first admin and resolves sessions by token digest",
    () =>
      Effect.gen(function* () {
        const repository = yield* SystemAdminBootstrapRepository
        const admin = new SystemAdminRecord({
          id: SystemAdminId.make("10000000-0000-0000-0000-000000000001"),
          email: " Admin@Example.COM ",
        })
        const credential = new SystemAdminCredentialRecord({
          adminId: admin.id,
          passwordHash: "hashed:password",
        })
        const session = new SystemAdminSessionRecord({
          id: SystemAdminSessionId.make(
            "10000000-0000-0000-0000-000000000002"
          ),
          adminId: admin.id,
          tokenDigest: "digest:session-token",
          expiresAtMillis: 1_800_000,
          active: true,
        })

        yield* repository.saveFirstAdmin(admin, credential)
        yield* repository.saveSession(session)

        const first = yield* repository.findFirstAdmin
        const foundByEmail = yield* repository.findAdminByEmail(
          "admin@example.com"
        )
        const foundCredential = yield* repository.findCredentialByAdminId(
          admin.id
        )
        const foundSession = yield* repository.findSessionByTokenDigest(
          "digest:session-token"
        )
        const rawTokenLookup = yield* repository.findSessionByTokenDigest(
          "session-token"
        )

        expect(Option.getOrUndefined(first)).toEqual(
          new SystemAdminRecord({
            id: admin.id,
            email: "admin@example.com",
          })
        )
        expect(Option.getOrUndefined(foundByEmail)).toEqual(
          new SystemAdminRecord({
            id: admin.id,
            email: "admin@example.com",
          })
        )
        expect(Option.getOrUndefined(foundCredential)).toEqual(credential)
        expect(Option.getOrUndefined(foundSession)).toEqual(session)
        expect(Option.isNone(rawTokenLookup)).toBe(true)
      }).pipe(Effect.provide(systemAdminTestLayer()))
  )
})

const testLayer = () =>
  GymUserRegistrationRepositoryPostgresAdapter.pipe(
    Layer.provide(
      Layer.succeed(DrizzleDatabase, ({
        db: makeInMemoryDb(),
        sqlClient: {},
        transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
      } as unknown) as DrizzleDatabaseShape)
    )
  )

const makeInMemoryDb = () => {
  const gyms = new Map<string, Record<string, unknown>>()
  const gymCreationRequests = new Map<string, Record<string, unknown>>()
  const gymAffiliations = new Map<string, Record<string, unknown>>()
  const gymUsers = new Map<string, Record<string, unknown>>()
  const gymUserCredentials = new Map<string, Record<string, unknown>>()
  const gymUserEmailVerificationTokens = new Map<
    string,
    Record<string, unknown>
  >()
  const gymUserPasswordResetTokens = new Map<
    string,
    Record<string, unknown>
  >()
  const gymUserSessions = new Map<string, Record<string, unknown>>()
  const systemAdmins = new Map<string, Record<string, unknown>>()
  const systemAdminCredentials = new Map<string, Record<string, unknown>>()
  const systemAdminSessions = new Map<string, Record<string, unknown>>()
  const gymStaffInvitations = new Map<string, Record<string, unknown>>()

  const rowsForTable = (table: { readonly [key: string]: unknown }) => {
    switch (tableKey(table)) {
      case "gyms":
        return gyms
      case "gym_creation_requests":
        return gymCreationRequests
      case "gym_affiliations":
        return gymAffiliations
      case "gym_users":
        return gymUsers
      case "gym_user_credentials":
        return gymUserCredentials
      case "gym_user_email_verification_tokens":
        return gymUserEmailVerificationTokens
      case "gym_user_password_reset_tokens":
        return gymUserPasswordResetTokens
      case "gym_user_sessions":
        return gymUserSessions
      case "system_admins":
        return systemAdmins
      case "system_admin_credentials":
        return systemAdminCredentials
      case "system_admin_sessions":
        return systemAdminSessions
      case "gym_staff_invitations":
        return gymStaffInvitations
      default:
        return new Map<string, Record<string, unknown>>()
    }
  }

  const primaryKeyForTable = (
    table: { readonly [key: string]: unknown },
    values: Record<string, unknown>
  ) => {
    switch (tableKey(table)) {
      case "gym_affiliations":
        return `${String(values.gymId)}:${String(values.userId)}`
      case "gym_user_credentials":
        return String(values.userId)
      case "system_admin_credentials":
        return String(values.adminId)
      default:
        return String(values.id)
    }
  }

  return {
    select: () => ({
      from: (table: { readonly [key: string]: unknown }) => ({
        limit: () =>
          Effect.sync(() => Array.from(rowsForTable(table).values()).slice(0, 1)),
        where: (condition: unknown) => {
          const matchingRows = Effect.sync(() => {
            const [column, value] = conditionParts(condition)
            const rows = Array.from(rowsForTable(table).values())

            return rows.filter((row) => row[column] === value)
          })

          return Object.assign(matchingRows, {
            limit: () => matchingRows.pipe(Effect.map((rows) => rows.slice(0, 1))),
          })
        },
      }),
    }),
    insert: (table: { readonly [key: string]: unknown }) => ({
      values: (values: Record<string, unknown>) => ({
        onConflictDoUpdate: () =>
          Effect.sync(() => {
            assertValidInsertValues(table, values)
            rowsForTable(table).set(primaryKeyForTable(table, values), {
              ...values,
            })
          }),
      }),
    }),
    update: (table: { readonly [key: string]: unknown }) => ({
      set: (values: Record<string, unknown>) => ({
        where: (condition: unknown) =>
          Effect.sync(() => {
            const [column, value] = conditionParts(condition)
            const rows = rowsForTable(table)

            for (const [key, row] of rows) {
              if (row[column] === value) {
                rows.set(key, { ...row, ...values })
              }
            }
          }),
      }),
    }),
  }
}

const tableKey = (table: { readonly [key: string]: unknown }) =>
  String(table[tableNameSymbol(table)])

const assertValidInsertValues = (
  table: { readonly [key: string]: unknown },
  values: Record<string, unknown>
) => {
  const key = tableKey(table)

  if (
    (key === "gym_user_email_verification_tokens" ||
      key === "gym_user_password_reset_tokens") &&
    typeof values.id === "string" &&
    !uuidPattern.test(values.id)
  ) {
    throw new Error(`${key}.id must be a UUID`)
  }
}

const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/u

const tableNameSymbol = (table: object) =>
  Object.getOwnPropertySymbols(table).find(
    (symbol) => symbol.description === "drizzle:Name"
  ) as keyof typeof table

const conditionParts = (condition: unknown): readonly [string, unknown] => {
  const chunks = (condition as { readonly queryChunks: readonly unknown[] })
    .queryChunks
  const column = chunks[1] as { readonly name: string; readonly key?: string }
  const param = chunks[3] as { readonly value: unknown }

  return [column.key ?? snakeToCamel(column.name), param.value]
}

const snakeToCamel = (value: string) =>
  value.replace(/_([a-z])/g, (_, letter: string) => letter.toLocaleUpperCase())

const systemAdminTestLayer = () =>
  SystemAdminBootstrapRepositoryPostgresAdapter.pipe(
    Layer.provide(
      Layer.succeed(DrizzleDatabase, ({
        db: makeInMemoryDb(),
        sqlClient: {},
        transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
      } as unknown) as DrizzleDatabaseShape)
    )
  )

const gymTestLayer = () =>
  GymRepositoryPostgresAdapter.pipe(
    Layer.provide(
      Layer.succeed(DrizzleDatabase, ({
        db: makeInMemoryDb(),
        sqlClient: {},
        transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
      } as unknown) as DrizzleDatabaseShape)
    )
  )

const staffInvitationTestLayer = () =>
  GymStaffInvitationRepositoryPostgresAdapter.pipe(
    Layer.provide(
      Layer.succeed(DrizzleDatabase, ({
        db: makeInMemoryDb(),
        sqlClient: {},
        transaction: <A, E, R>(effect: Effect.Effect<A, E, R>) => effect,
      } as unknown) as DrizzleDatabaseShape)
    )
  )
