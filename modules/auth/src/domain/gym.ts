import { Schema } from "effect"

import { GymUserId, GymUserSessionId } from "./gym-user-identity.ts"
import { SystemAdminSessionId } from "./system-admin.ts"

export const GymId = Schema.String.pipe(Schema.brand("GymId"))
export type GymId = typeof GymId.Type

export const GymCreationRequestId = Schema.String.pipe(
  Schema.brand("GymCreationRequestId")
)
export type GymCreationRequestId = typeof GymCreationRequestId.Type

export const GymStaffInvitationId = Schema.String.pipe(
  Schema.brand("GymStaffInvitationId")
)
export type GymStaffInvitationId = typeof GymStaffInvitationId.Type

export const GymStatus = Schema.Literals(["pending", "active", "suspended"])
export type GymStatus = typeof GymStatus.Type

export const GymCreationRequestStatus = Schema.Literals([
  "pending",
  "approved",
])
export type GymCreationRequestStatus = typeof GymCreationRequestStatus.Type

export const GymAffiliationRole = Schema.Literals(["Owner", "Staff", "Member"])
export type GymAffiliationRole = typeof GymAffiliationRole.Type

export const GymAffiliationStatus = Schema.Literals(["active", "left"])
export type GymAffiliationStatus = typeof GymAffiliationStatus.Type

export const GymStaffInvitationStatus = Schema.Literals([
  "pending",
  "accepted",
])
export type GymStaffInvitationStatus = typeof GymStaffInvitationStatus.Type

export class GymRecord extends Schema.Class<GymRecord>("GymRecord")({
  id: GymId,
  name: Schema.String,
  status: GymStatus,
}) {}

export class GymCreationRequestRecord extends Schema.Class<GymCreationRequestRecord>(
  "GymCreationRequestRecord"
)({
  id: GymCreationRequestId,
  gymId: GymId,
  requesterUserId: GymUserId,
  status: GymCreationRequestStatus,
}) {}

export class GymAffiliationRecord extends Schema.Class<GymAffiliationRecord>(
  "GymAffiliationRecord"
)({
  gymId: GymId,
  userId: GymUserId,
  role: GymAffiliationRole,
  status: GymAffiliationStatus,
}) {}

export class GymStaffInvitationRecord extends Schema.Class<GymStaffInvitationRecord>(
  "GymStaffInvitationRecord"
)({
  id: GymStaffInvitationId,
  gymId: GymId,
  invitedEmail: Schema.String,
  invitedByUserId: GymUserId,
  token: Schema.String,
  expiresAtMillis: Schema.Number,
  status: GymStaffInvitationStatus,
}) {}

export class RequestGymCreationInput extends Schema.Class<RequestGymCreationInput>(
  "RequestGymCreationInput"
)({
  sessionId: GymUserSessionId,
  name: Schema.String,
}) {}

export class ApproveGymCreationRequestInput extends Schema.Class<ApproveGymCreationRequestInput>(
  "ApproveGymCreationRequestInput"
)({
  sessionId: SystemAdminSessionId,
  requestId: GymCreationRequestId,
}) {}

export class CurrentGymOwnerAccessInput extends Schema.Class<CurrentGymOwnerAccessInput>(
  "CurrentGymOwnerAccessInput"
)({
  sessionId: GymUserSessionId,
  gymId: GymId,
}) {}

export class JoinGymAsMemberInput extends Schema.Class<JoinGymAsMemberInput>(
  "JoinGymAsMemberInput"
)({
  sessionId: GymUserSessionId,
  gymId: GymId,
}) {}

export class LeaveGymAsMemberInput extends Schema.Class<LeaveGymAsMemberInput>(
  "LeaveGymAsMemberInput"
)({
  sessionId: GymUserSessionId,
  gymId: GymId,
}) {}

export class CreateGymStaffInvitationInput extends Schema.Class<CreateGymStaffInvitationInput>(
  "CreateGymStaffInvitationInput"
)({
  sessionId: GymUserSessionId,
  gymId: GymId,
  email: Schema.String,
}) {}

export class AcceptGymStaffInvitationInput extends Schema.Class<AcceptGymStaffInvitationInput>(
  "AcceptGymStaffInvitationInput"
)({
  sessionId: GymUserSessionId,
  token: Schema.String,
}) {}

export class GymCreationRequested extends Schema.Class<GymCreationRequested>(
  "GymCreationRequested"
)({
  request: GymCreationRequestRecord,
  gym: GymRecord,
}) {}

export class GymCreationRequestApproved extends Schema.Class<GymCreationRequestApproved>(
  "GymCreationRequestApproved"
)({
  request: GymCreationRequestRecord,
  gym: GymRecord,
  ownerAffiliation: GymAffiliationRecord,
}) {}

export class CurrentGymOwnerAccessSuccess extends Schema.Class<CurrentGymOwnerAccessSuccess>(
  "CurrentGymOwnerAccessSuccess"
)({
  gym: GymRecord,
  affiliation: GymAffiliationRecord,
}) {}

export class GymMemberJoined extends Schema.Class<GymMemberJoined>(
  "GymMemberJoined"
)({
  gym: GymRecord,
  affiliation: GymAffiliationRecord,
}) {}

export class GymMemberLeft extends Schema.Class<GymMemberLeft>("GymMemberLeft")({
  gym: GymRecord,
  affiliation: GymAffiliationRecord,
}) {}

export class GymStaffInvitationCreated extends Schema.Class<GymStaffInvitationCreated>(
  "GymStaffInvitationCreated"
)({
  gym: GymRecord,
  invitation: GymStaffInvitationRecord,
}) {}

export class GymStaffInvitationAccepted extends Schema.Class<GymStaffInvitationAccepted>(
  "GymStaffInvitationAccepted"
)({
  gym: GymRecord,
  invitation: GymStaffInvitationRecord,
  affiliation: GymAffiliationRecord,
}) {}
