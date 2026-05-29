import { HttpApi, HttpApiGroup } from "effect/unstable/httpapi"

import { AuthSessionTransportRequired } from "./auth-authorization.ts"
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
  .add(CurrentGymUserSessionEndpoint.middleware(AuthSessionTransportRequired))
  .add(LogoutGymUserEndpoint.middleware(AuthSessionTransportRequired))
  .add(RequestGymUserPasswordResetEndpoint)
  .add(CompleteGymUserPasswordResetEndpoint)
  .add(RequestGymCreationEndpoint.middleware(AuthSessionTransportRequired))
  .add(ApproveGymCreationRequestEndpoint.middleware(AuthSessionTransportRequired))
  .add(CurrentGymOwnerAccessEndpoint.middleware(AuthSessionTransportRequired))
  .add(JoinGymAsMemberEndpoint.middleware(AuthSessionTransportRequired))
  .add(LeaveGymAsMemberEndpoint.middleware(AuthSessionTransportRequired))
  .add(CreateGymStaffInvitationEndpoint.middleware(AuthSessionTransportRequired))
  .add(AcceptGymStaffInvitationEndpoint.middleware(AuthSessionTransportRequired))
  .add(BootstrapFirstSystemAdminEndpoint)
  .add(LoginSystemAdminEndpoint)
  .add(CurrentSystemAdminSessionEndpoint.middleware(AuthSessionTransportRequired))
  .add(LogoutSystemAdminEndpoint.middleware(AuthSessionTransportRequired))
  .prefix("/auth")

export const AuthHttpApi = HttpApi.make("AuthApi").add(AuthHttpGroup)
