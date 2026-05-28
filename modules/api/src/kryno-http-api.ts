import {
  AcceptGymStaffInvitationEndpoint,
  ApproveGymCreationRequestEndpoint,
  BootstrapFirstSystemAdminEndpoint,
  CompleteGymUserPasswordResetEndpoint,
  CreateGymStaffInvitationEndpoint,
  CurrentGymOwnerAccessEndpoint,
  CurrentGymUserSessionEndpoint,
  CurrentSystemAdminSessionEndpoint,
  JoinGymAsMemberEndpoint,
  LeaveGymAsMemberEndpoint,
  LoginGymUserEndpoint,
  LoginSystemAdminEndpoint,
  LogoutGymUserEndpoint,
  LogoutSystemAdminEndpoint,
  RequestGymCreationEndpoint,
  RequestGymUserPasswordResetEndpoint,
  ReserveGymUserEmailEndpoint,
  SignUpGymUserEndpoint,
  VerifyGymUserEmailEndpoint,
} from "@workspace/auth/api/auth-api"
import { HttpApi, HttpApiGroup } from "effect/unstable/httpapi"

import { AuthSessionTransportRequired } from "./auth-authorization.ts"

export const KrynoAuthHttpGroup = HttpApiGroup.make("auth")
  .add(ReserveGymUserEmailEndpoint)
  .add(SignUpGymUserEndpoint)
  .add(VerifyGymUserEmailEndpoint)
  .add(LoginGymUserEndpoint)
  .add(RequestGymUserPasswordResetEndpoint)
  .add(CompleteGymUserPasswordResetEndpoint)
  .add(BootstrapFirstSystemAdminEndpoint)
  .add(LoginSystemAdminEndpoint)
  .add(CurrentGymUserSessionEndpoint.middleware(AuthSessionTransportRequired))
  .add(LogoutGymUserEndpoint.middleware(AuthSessionTransportRequired))
  .add(RequestGymCreationEndpoint.middleware(AuthSessionTransportRequired))
  .add(ApproveGymCreationRequestEndpoint.middleware(AuthSessionTransportRequired))
  .add(CurrentGymOwnerAccessEndpoint.middleware(AuthSessionTransportRequired))
  .add(JoinGymAsMemberEndpoint.middleware(AuthSessionTransportRequired))
  .add(LeaveGymAsMemberEndpoint.middleware(AuthSessionTransportRequired))
  .add(CreateGymStaffInvitationEndpoint.middleware(AuthSessionTransportRequired))
  .add(AcceptGymStaffInvitationEndpoint.middleware(AuthSessionTransportRequired))
  .add(CurrentSystemAdminSessionEndpoint.middleware(AuthSessionTransportRequired))
  .add(LogoutSystemAdminEndpoint.middleware(AuthSessionTransportRequired))
  .prefix("/auth")

export const KrynoHttpApi = HttpApi.make("KrynoHttpApi")
  .add(KrynoAuthHttpGroup)
  .prefix("/api")
