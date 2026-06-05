import {
  boolean,
  pgSchema,
  primaryKey,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

export const authSchema = pgSchema("auth")

export const gymStatus = authSchema.enum("gym_status", [
  "pending",
  "active",
  "suspended",
])

export const gymCreationRequestStatus = authSchema.enum(
  "gym_creation_request_status",
  ["pending", "approved"]
)

export const gymAffiliationRole = authSchema.enum("gym_affiliation_role", [
  "Owner",
  "Staff",
  "Member",
])

export const gymAffiliationStatus = authSchema.enum("gym_affiliation_status", [
  "active",
  "left",
])

export const gymStaffInvitationStatus = authSchema.enum(
  "gym_staff_invitation_status",
  ["pending", "accepted"]
)

const id = (name: string) => uuid(name).primaryKey()
const requiredId = (name: string) => uuid(name).notNull()
const requiredText = (name: string) => text(name).notNull()
const timestamptz = (name: string) =>
  timestamp(name, { withTimezone: true }).notNull()

export const gymUsers = authSchema.table(
  "gym_users",
  {
    id: id("id"),
    email: requiredText("email"),
    normalizedEmail: requiredText("normalized_email"),
    displayName: requiredText("display_name"),
    emailVerified: boolean("email_verified").notNull().default(false),
    createdAt: timestamptz("created_at").defaultNow(),
    updatedAt: timestamptz("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("gym_users_normalized_email_unique").on(
      table.normalizedEmail
    ),
  ]
)

export const gymUserCredentials = authSchema.table("gym_user_credentials", {
  userId: requiredId("user_id")
    .references(() => gymUsers.id, { onDelete: "cascade" })
    .primaryKey(),
  passwordHash: requiredText("password_hash"),
  createdAt: timestamptz("created_at").defaultNow(),
  updatedAt: timestamptz("updated_at").defaultNow(),
})

export const gymUserEmailVerificationTokens = authSchema.table(
  "gym_user_email_verification_tokens",
  {
    id: id("id"),
    userId: requiredId("user_id").references(() => gymUsers.id, {
      onDelete: "cascade",
    }),
    tokenDigest: requiredText("token_digest").unique(
      "gym_user_email_verification_tokens_token_digest_unique"
    ),
    expiresAt: timestamptz("expires_at"),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamptz("created_at").defaultNow(),
  }
)

export const gymUserPasswordResetTokens = authSchema.table(
  "gym_user_password_reset_tokens",
  {
    id: id("id"),
    userId: requiredId("user_id").references(() => gymUsers.id, {
      onDelete: "cascade",
    }),
    tokenDigest: requiredText("token_digest").unique(
      "gym_user_password_reset_tokens_token_digest_unique"
    ),
    expiresAt: timestamptz("expires_at"),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamptz("created_at").defaultNow(),
  }
)

export const gymUserSessions = authSchema.table("gym_user_sessions", {
  id: id("id"),
  userId: requiredId("user_id").references(() => gymUsers.id, {
    onDelete: "cascade",
  }),
  tokenDigest: requiredText("token_digest").unique(
    "gym_user_sessions_token_digest_unique"
  ),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamptz("expires_at"),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamptz("created_at").defaultNow(),
})

export const gyms = authSchema.table("gyms", {
  id: id("id"),
  name: requiredText("name"),
  status: gymStatus("status").notNull(),
  createdAt: timestamptz("created_at").defaultNow(),
  updatedAt: timestamptz("updated_at").defaultNow(),
})

export const gymCreationRequests = authSchema.table("gym_creation_requests", {
  id: id("id"),
  gymId: requiredId("gym_id").references(() => gyms.id, {
    onDelete: "cascade",
  }),
  requesterUserId: requiredId("requester_user_id").references(
    () => gymUsers.id,
    { onDelete: "cascade" }
  ),
  status: gymCreationRequestStatus("status").notNull(),
  createdAt: timestamptz("created_at").defaultNow(),
  updatedAt: timestamptz("updated_at").defaultNow(),
})

export const gymAffiliations = authSchema.table(
  "gym_affiliations",
  {
    gymId: requiredId("gym_id").references(() => gyms.id, {
      onDelete: "cascade",
    }),
    userId: requiredId("user_id").references(() => gymUsers.id, {
      onDelete: "cascade",
    }),
    role: gymAffiliationRole("role").notNull(),
    status: gymAffiliationStatus("status").notNull(),
    createdAt: timestamptz("created_at").defaultNow(),
    updatedAt: timestamptz("updated_at").defaultNow(),
  },
  (table) => [
    primaryKey({
      name: "gym_affiliations_gym_id_user_id_pk",
      columns: [table.gymId, table.userId],
    }),
  ]
)

export const gymStaffInvitations = authSchema.table(
  "gym_staff_invitations",
  {
    id: id("id"),
    gymId: requiredId("gym_id").references(() => gyms.id, {
      onDelete: "cascade",
    }),
    invitedEmail: requiredText("invited_email"),
    normalizedInvitedEmail: requiredText("normalized_invited_email"),
    invitedByUserId: requiredId("invited_by_user_id").references(
      () => gymUsers.id,
      { onDelete: "cascade" }
    ),
    tokenDigest: requiredText("token_digest").unique(
      "gym_staff_invitations_token_digest_unique"
    ),
    status: gymStaffInvitationStatus("status").notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    expiresAt: timestamptz("expires_at"),
    createdAt: timestamptz("created_at").defaultNow(),
    updatedAt: timestamptz("updated_at").defaultNow(),
  },
  (table) => [
    unique("gym_staff_invitations_gym_id_normalized_email_unique").on(
      table.gymId,
      table.normalizedInvitedEmail
    ),
  ]
)

export const systemAdmins = authSchema.table(
  "system_admins",
  {
    id: id("id"),
    email: requiredText("email"),
    normalizedEmail: requiredText("normalized_email"),
    createdAt: timestamptz("created_at").defaultNow(),
    updatedAt: timestamptz("updated_at").defaultNow(),
  },
  (table) => [
    uniqueIndex("system_admins_normalized_email_unique").on(
      table.normalizedEmail
    ),
  ]
)

export const systemAdminCredentials = authSchema.table(
  "system_admin_credentials",
  {
    adminId: requiredId("admin_id")
      .references(() => systemAdmins.id, { onDelete: "cascade" })
      .primaryKey(),
    passwordHash: requiredText("password_hash"),
    createdAt: timestamptz("created_at").defaultNow(),
    updatedAt: timestamptz("updated_at").defaultNow(),
  }
)

export const systemAdminSessions = authSchema.table("system_admin_sessions", {
  id: id("id"),
  adminId: requiredId("admin_id").references(() => systemAdmins.id, {
    onDelete: "cascade",
  }),
  tokenDigest: requiredText("token_digest").unique(
    "system_admin_sessions_token_digest_unique"
  ),
  active: boolean("active").notNull().default(true),
  expiresAt: timestamptz("expires_at"),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: timestamptz("created_at").defaultNow(),
})

export const authSchemaContribution = {
  gymAffiliations,
  gymCreationRequests,
  gymStaffInvitations,
  gymUserCredentials,
  gymUserEmailVerificationTokens,
  gymUserPasswordResetTokens,
  gymUserSessions,
  gymUsers,
  gyms,
  systemAdminCredentials,
  systemAdminSessions,
  systemAdmins,
} as const
