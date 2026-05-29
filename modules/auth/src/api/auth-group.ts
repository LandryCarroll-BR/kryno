import { HttpApi, HttpApiGroup } from "effect/unstable/httpapi"

import { AuthHttpAuthorization } from "./auth-authorization.ts"
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

const { gymUser, systemAdmin } = AuthHttpAuthorization

export const AuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(SignUpGymUserEndpoint)
  .add(VerifyGymUserEmailEndpoint)
  .add(LoginGymUserEndpoint)
  .add(CurrentGymUserSessionEndpoint.middleware(gymUser))
  .add(LogoutGymUserEndpoint.middleware(gymUser))
  .add(RequestGymUserPasswordResetEndpoint)
  .add(CompleteGymUserPasswordResetEndpoint)
  .add(RequestGymCreationEndpoint.middleware(gymUser))
  .add(ApproveGymCreationRequestEndpoint.middleware(systemAdmin))
  .add(CurrentGymOwnerAccessEndpoint.middleware(gymUser))
  .add(JoinGymAsMemberEndpoint.middleware(gymUser))
  .add(LeaveGymAsMemberEndpoint.middleware(gymUser))
  .add(CreateGymStaffInvitationEndpoint.middleware(gymUser))
  .add(AcceptGymStaffInvitationEndpoint.middleware(gymUser))
  .add(BootstrapFirstSystemAdminEndpoint)
  .add(LoginSystemAdminEndpoint)
  .add(CurrentSystemAdminSessionEndpoint.middleware(systemAdmin))
  .add(LogoutSystemAdminEndpoint.middleware(systemAdmin))
  .prefix("/auth")

export const AuthHttpApi = HttpApi.make("AuthApi").add(AuthHttpGroup)
