import { describe, expect, it } from "@effect/vitest"
import { getTableUniqueName } from "drizzle-orm/table"

import * as Auth from "../src/index.ts"
import {
  authSchemaContribution,
  gymUserEmailVerificationTokens,
  gymUserPasswordResetTokens,
  gymUserSessions,
  gymUsers,
  systemAdmins,
} from "../src/schema.ts"

describe("@workspace/auth/schema", () => {
  it("exposes auth-owned tables only through the schema subpath", () => {
    expect(Auth).not.toHaveProperty("authSchemaContribution")
    expect(Object.keys(authSchemaContribution).sort()).toEqual([
      "gymAffiliations",
      "gymCreationRequests",
      "gymStaffInvitations",
      "gymUserCredentials",
      "gymUserEmailVerificationTokens",
      "gymUserPasswordResetTokens",
      "gymUserSessions",
      "gymUsers",
      "gyms",
      "systemAdminCredentials",
      "systemAdminSessions",
      "systemAdmins",
    ])
  })

  it("uses the module-owned auth Postgres schema", () => {
    expect(getTableUniqueName(gymUsers)).toBe("auth.gym_users")
    expect(getTableUniqueName(systemAdmins)).toBe("auth.system_admins")
  })

  it("stores auth timestamps as timestamptz", () => {
    expect(gymUsers.createdAt.getSQLType()).toBe("timestamp with time zone")
    expect(gymUsers.updatedAt.getSQLType()).toBe("timestamp with time zone")
    expect(gymUserSessions.createdAt.getSQLType()).toBe(
      "timestamp with time zone"
    )
  })

  it("models key uniqueness and status invariants in column shapes", () => {
    expect(gymUsers.normalizedEmail.notNull).toBe(true)
    expect(gymUsers.email.notNull).toBe(true)
    expect(gymUserSessions.tokenDigest.notNull).toBe(true)
    expect(gymUserEmailVerificationTokens.tokenDigest.notNull).toBe(true)
    expect(gymUserPasswordResetTokens.expiresAt.notNull).toBe(true)
  })
})
