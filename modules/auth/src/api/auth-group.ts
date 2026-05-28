import { HttpApi, HttpApiGroup } from "effect/unstable/httpapi"

import {
  ReserveGymUserEmailEndpoint,
  SignUpGymUserEndpoint,
  VerifyGymUserEmailEndpoint,
} from "./endpoints/gym-user-registration.ts"
import {
  CurrentGymUserSessionEndpoint,
  LoginGymUserEndpoint,
  LogoutGymUserEndpoint,
} from "./endpoints/gym-user-authentication.ts"
import {
  CompleteGymUserPasswordResetEndpoint,
  RequestGymUserPasswordResetEndpoint,
} from "./endpoints/gym-user-password-reset.ts"
import {
  ApproveGymCreationRequestEndpoint,
  CurrentGymOwnerAccessEndpoint,
  JoinGymAsMemberEndpoint,
  LeaveGymAsMemberEndpoint,
  RequestGymCreationEndpoint,
} from "./endpoints/gym-request.ts"
import {
  AcceptGymStaffInvitationEndpoint,
  CreateGymStaffInvitationEndpoint,
} from "./endpoints/gym-staff-invitation.ts"
import {
  CurrentSystemAdminSessionEndpoint,
  LoginSystemAdminEndpoint,
  LogoutSystemAdminEndpoint,
} from "./endpoints/system-admin-authentication.ts"
import { BootstrapFirstSystemAdminEndpoint } from "./endpoints/system-admin-bootstrap.ts"

export const AuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(SignUpGymUserEndpoint)
  .add(VerifyGymUserEmailEndpoint)
  .add(LoginGymUserEndpoint)
  .add(CurrentGymUserSessionEndpoint)
  .add(LogoutGymUserEndpoint)
  .add(RequestGymUserPasswordResetEndpoint)
  .add(CompleteGymUserPasswordResetEndpoint)
  .add(RequestGymCreationEndpoint)
  .add(ApproveGymCreationRequestEndpoint)
  .add(CurrentGymOwnerAccessEndpoint)
  .add(JoinGymAsMemberEndpoint)
  .add(LeaveGymAsMemberEndpoint)
  .add(CreateGymStaffInvitationEndpoint)
  .add(AcceptGymStaffInvitationEndpoint)
  .add(BootstrapFirstSystemAdminEndpoint)
  .add(LoginSystemAdminEndpoint)
  .add(CurrentSystemAdminSessionEndpoint)
  .add(LogoutSystemAdminEndpoint)
  .prefix("/auth")

export const AuthHttpApi = HttpApi.make("AuthApi").add(AuthHttpGroup)
