export const emailVerificationTokenTtlMillis = 24 * 60 * 60 * 1000
export const passwordResetTokenTtlMillis = 60 * 60 * 1000
export const gymStaffInvitationTtlMillis = 7 * 24 * 60 * 60 * 1000
export const gymUserSessionTtlMillis = 30 * 24 * 60 * 60 * 1000
export const systemAdminSessionTtlMillis = 12 * 60 * 60 * 1000

export const expiresAtMillis = (now: number, ttlMillis: number) =>
  now + ttlMillis

export const isExpired = (now: number, expiresAt: number) => now >= expiresAt
