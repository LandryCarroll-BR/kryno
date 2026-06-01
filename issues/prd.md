## Problem Statement

The auth module for Kryno's rock climbing application is complete on the backend and is already connected to the core API app and web app, but the frontend only implements a subset of the auth use cases. Gym users can currently sign up, manually verify email, sign in, sign out, and reach a protected app page, but they cannot complete the rest of the gym-user-facing auth workflows from the web application.

This leaves important onboarding and gym affiliation paths unavailable in the product UI. A user cannot request a password reset, complete a password reset, request gym creation, join or leave a gym by ID, accept a staff invitation, or create a staff invitation as an owner. The protected app page also does not yet present the user's active affiliations or provide a functional hub for these common session-based auth actions.

The next wave should prioritize complete functionality over UX polish. The work should use the existing auth API as-is, keep frontend use cases separated in the same spirit as the existing auth feature folders, and avoid expanding backend contracts or adding system-admin UI.

## Solution

Build the remaining gym-user-facing frontend implementations for the existing auth API.

The frontend will add separated use-case implementations for password reset, gym creation requests, member affiliation join/leave, staff invitation creation, and staff invitation acceptance. Each use case should own its own action logic, validation/view model, UI component where needed, and tests. Route modules should stay thin and delegate to those feature-level use cases.

The `/app` page will become a functional gym-user hub. It will continue to load the current gym-user session using the web-owned session cookie, render the current user and active affiliations, and directly render the common session-based forms. Even though these forms appear on `/app`, each form will submit to its own dedicated route action so use cases remain separated.

Token-oriented flows will use standalone pages. Password reset completion and staff invitation acceptance will prefill tokens from query params while keeping token fields visible and editable. Staff invitation acceptance requires a logged-in gym user. If a visitor follows an invitation link without a session, the app redirects them to login with a safe return target.

The implementation should use redirect-based success and error messaging for dedicated action routes. Successful app-form actions redirect back to `/app` with compact status query params. Validation and expected domain failures redirect back to `/app` with compact form/error query params. Password reset request should not reveal whether an email exists; unknown emails should produce the same success confirmation as known emails.

## User Stories

1. As a gym user, I want to request a password reset from the web app, so that I can recover access if I forget my password.
2. As a gym user, I want password reset request confirmation to avoid revealing whether my email exists, so that my account privacy is protected.
3. As a gym user, I want to enter my email on a password reset request page, so that reset instructions can be sent to the right address.
4. As a gym user, I want invalid password reset request input to be shown clearly, so that I can correct mistakes before submission.
5. As a gym user, I want the password reset request form to work without needing to be signed in, so that I can recover access from a signed-out state.
6. As a gym user, I want to open a password reset link with a token in the URL, so that I do not have to manually copy the token.
7. As a gym user, I want the password reset token field to remain editable, so that I can paste or correct a token during development and testing.
8. As a gym user, I want to enter a new password with my reset token, so that I can set a replacement password.
9. As a gym user, I want invalid, expired, already-used, or missing reset tokens to produce useful errors, so that I understand why the reset did not complete.
10. As a gym user, I want to be sent to login after completing a password reset, so that I can sign in with the new password.
11. As a gym user, I want login to show a password-reset-complete status when appropriate, so that I know the password reset succeeded.
12. As a gym user, I want login to honor a safe return target, so that protected invitation or app workflows can resume after authentication.
13. As a security-conscious user, I want login return targets to reject external or protocol-relative URLs, so that my account is not exposed to open redirect attacks.
14. As a visitor attempting a protected dashboard action, I want to be redirected to login with a return target, so that I can authenticate and continue from the app.
15. As a gym user, I want `/app` to show my account identity, so that I can confirm which account is signed in.
16. As a gym user, I want `/app` to show my active affiliations, so that I can see whether I am an Owner, Staff member, or Member for known gym IDs.
17. As a gym user, I want active affiliations to be shown using the data the current API provides, so that the frontend remains aligned with the existing backend contract.
18. As a gym user, I want the dashboard to remain functional even if affiliation display is minimal, so that gym workflows are not blocked by missing gym-name APIs.
19. As a gym user, I want to request creation of a gym by entering a gym name, so that my gym can be added to Kryno.
20. As a gym user, I want a gym creation request success message, so that I know the request was submitted.
21. As a gym user, I want submitted gym requests to be described as pending approval, so that I understand why the gym does not immediately appear in active affiliations.
22. As a gym user, I want invalid gym creation request input to be caught before the API call, so that I can fix the form quickly.
23. As a gym user, I want protected gym creation request actions to use my session cookie rather than a client-supplied session ID, so that auth remains server-controlled.
24. As a gym user, I want to join a gym by manually entering a gym ID, so that I can become a member using the existing API.
25. As a gym user, I want join failures for inactive or invalid affiliations to be shown clearly, so that I know why I cannot join.
26. As a gym user, I want join success to redirect back to the app, so that I can see updated affiliation state after the API reflects it.
27. As a gym user, I want to leave a gym by manually entering a gym ID, so that I can end my member affiliation using the existing API.
28. As a gym user, I want leave failures to be shown clearly when I am not an active member, so that I understand why the action failed.
29. As a gym user, I want leave success to redirect back to the app, so that I can see the updated active affiliations.
30. As a gym owner, I want to create a staff invitation by entering a gym ID and email address, so that I can invite staff using the existing auth API.
31. As a gym owner, I want staff invitation validation errors to be shown clearly, so that I can correct missing gym IDs or invalid email addresses.
32. As a gym owner, I want owner-access failures to be presented as expected form failures, so that I understand that only owners can invite staff.
33. As a gym owner, I want self-assignment failures to be presented as expected form failures, so that I understand why I cannot invite myself as staff.
34. As a gym owner, I want successful staff invitation creation to redirect back to the app with a success message, so that I know the invitation was created.
35. As an invited staff user, I want to open an invitation acceptance page from a token link, so that I can accept staff access.
36. As an invited staff user, I want the invitation token to be prefilled from the URL but editable, so that I can inspect or correct it.
37. As an invited staff user, I want to see a confirmation form before accepting an invitation, so that staff access is not changed unexpectedly.
38. As an invited staff user, I want to be required to log in before accepting an invitation, so that the invitation is applied to the right gym-user account.
39. As an invited staff user without a session, I want the invitation link to send me to login with the invitation URL preserved, so that I can return after signing in.
40. As an invited staff user, I want invalid invitation token failures to be shown clearly, so that I know when an invitation cannot be accepted.
41. As an invited staff user, I want successful invitation acceptance to redirect to `/app`, so that I can see my new Staff affiliation when the session data reflects it.
42. As a gym user, I want all common session-based auth forms visible from `/app`, so that I can perform gym onboarding actions from one functional hub.
43. As a gym user, I want each form on `/app` to submit to its own dedicated route action, so that use cases remain separated even when rendered together.
44. As a developer, I want each frontend use case to have its own feature boundary, so that validation, action behavior, and UI can be tested and maintained independently.
45. As a developer, I want route modules to stay thin, so that product behavior lives in feature use-case modules rather than route glue.
46. As a developer, I want redirect-based success statuses for dedicated action routes, so that refreshes do not duplicate form submissions.
47. As a developer, I want redirect-based error statuses for forms rendered on `/app`, so that separated action routes can report failures back to the rendering page.
48. As a developer, I want field-level validation messages to come from use-case view models, so that each use case owns its own user-facing validation behavior.
49. As a developer, I want expected auth/domain failures to be handled explicitly, so that ordinary user mistakes do not become unhandled errors.
50. As a developer, I want unexpected failures to remain visible to the app error boundary or test harness, so that real defects are not hidden.
51. As a developer, I want tests to cover externally observable action behavior, so that refactors do not break user workflows.
52. As a developer, I want tests to follow the style of existing auth action tests, so that the frontend auth suite remains consistent.
53. As a developer, I want the implementation to use the existing auth API only, so that this frontend wave does not create backend scope creep.
54. As a developer, I want system-admin screens excluded from this wave, so that gym-user functionality can be completed first.
55. As a developer, I want the frontend to avoid gym search or gym-name assumptions, so that it does not depend on API contracts that do not exist yet.
56. As a developer, I want manual gym ID fields for this wave, so that join, leave, and invitation workflows can be functional immediately.
57. As a developer, I want no dedicated current-owner-access screen, so that the UI does not expose an artificial workflow.
58. As a developer, I want owner-only failures to be handled through staff invitation creation, so that authorization behavior is surfaced where it matters.
59. As a product owner, I want this wave to prioritize functionality over polish, so that the full gym-user auth surface becomes usable quickly.
60. As a product owner, I want UX polish to remain a later pass, so that the implementation does not over-invest in design before the workflows are proven.

## Implementation Decisions

- Use the existing auth API only; do not add or modify backend endpoints for this wave.
- Focus on gym-user-facing auth use cases.
- Exclude system-admin frontend flows, including bootstrap, login, current session, logout, and gym request approval.
- Keep gym approval outside the web UI for now; requested gyms remain pending until approved outside this frontend wave.
- Do not build a dedicated frontend use case for current owner access. Owner authorization failures should be handled in owner-only workflows such as staff invitation creation.
- Do not build a pre-signup email reservation screen. Signup remains the practical user path for account creation.
- Keep frontend use cases separated as much as possible, matching the existing auth feature style.
- Each use case should own its action logic, validation/view-model logic, and form/component where applicable.
- Route modules should stay thin and delegate to feature-level use cases.
- `/app` should remain the protected gym-user hub and should load the current gym-user session from the web-owned session cookie.
- `/app` should render current account information and active affiliations.
- Active affiliations should be displayed using only available API data: gym ID, user ID, role, and status.
- Because the existing API does not provide gym search, listing, or names in session data, manual gym ID fields are acceptable for this wave.
- `/app` should render common session-based forms directly: request gym creation, join gym, leave gym, and create staff invitation.
- Even when forms render on `/app`, each form should submit to its own dedicated route action.
- Dedicated route actions should redirect back to `/app` after success using compact status query params.
- Dedicated route actions rendered from `/app` should redirect back to `/app` with compact form/error query params for validation and expected domain failures.
- Password reset request should be available to signed-out users.
- Password reset request should not reveal account existence. Unknown-email responses should be treated as the same successful confirmation as known-email responses.
- Password reset completion should be available through a standalone route.
- Password reset completion should prefill the token from query params while keeping the token field visible and editable.
- Password reset completion should redirect to login after success, using a password-reset-complete status.
- Login should honor a safe `redirectTo` query param after successful authentication.
- Safe login redirects should only allow same-app absolute paths beginning with `/`.
- Login redirect handling should reject empty values, external URLs, and protocol-relative paths.
- Staff invitation acceptance should require an authenticated gym-user session.
- Staff invitation acceptance should preserve the invitation URL through login when a visitor is not authenticated.
- Staff invitation acceptance should use a confirmation form rather than auto-submitting.
- Staff invitation acceptance should prefill the token from query params while keeping the token field visible and editable.
- Use redirect-after-post behavior for successful mutations to avoid duplicate submissions on refresh.
- Keep UI minimal and functional. Do not redesign the app or invest in extensive UX polish in this wave.

## Testing Decisions

- Tests should focus on external behavior rather than implementation details.
- Action tests should verify validation behavior, dependency calls, redirects, cookies where relevant, and expected domain-error handling.
- Tests should follow the prior art of existing gym-user signup, login, logout, and manual email verification action tests.
- Test view-model validation through action behavior where practical, and directly only when the view model exposes behavior that is not otherwise covered.
- Test password reset request behavior, including invalid input, normalized email input, success confirmation, unknown-email privacy behavior, and unexpected failure handling.
- Test password reset completion behavior, including invalid input, successful redirect to login, invalid token, expired token, already-used token, user-not-found responses, and unexpected failure handling.
- Test login return-target behavior, including allowed app-relative paths and fallback behavior for unsafe redirects.
- Test protected action behavior without a session cookie, including redirect to login with an appropriate return target.
- Test gym creation request action behavior, including validation, session-cookie usage, success redirect, unverified/session-invalid failures, and unexpected failures.
- Test member join action behavior, including validation, session-cookie usage, success redirect, inactive gym failures, affiliation conflict failures, unverified/session-invalid failures, and unexpected failures.
- Test member leave action behavior, including validation, session-cookie usage, success redirect, affiliation conflict failures, unverified/session-invalid failures, and unexpected failures.
- Test staff invitation creation action behavior, including validation, session-cookie usage, success redirect, owner-access failures, inactive gym failures, self-assignment failures, unverified/session-invalid failures, and unexpected failures.
- Test staff invitation acceptance behavior, including missing session redirects, token-prefill route behavior where applicable, validation, success redirect, invalid token failures, inactive gym failures, self-assignment failures, unverified/session-invalid failures, and unexpected failures.
- Test `/app` loader behavior continues to redirect unauthenticated users to login and expected invalid sessions to login.
- Test `/app` renders or maps status and error query params into user-facing messages at the page boundary.
- Run the web test suite and typecheck after implementation.

## Out of Scope

- Backend API changes.
- Gym search, gym listing, or gym name display beyond the fields returned by the existing auth API.
- System-admin frontend flows.
- System-admin gym request approval UI.
- A dedicated current-owner-access frontend screen.
- A pre-signup email reservation screen.
- Automatic login after password reset completion.
- Auto-submitting staff invitation acceptance.
- Full UX polish, visual redesign, marketing content, or a new design system.
- Rich gym dashboards or gym management pages beyond the functional auth use-case forms.

## Further Notes

The primary architectural preference for this wave is separation of frontend use cases. `/app` may compose several use-case forms, but ownership of behavior should remain in the individual feature modules and dedicated route actions.

The current auth API constrains the UI in a few visible ways. Manual gym ID entry is acceptable for now because there is no gym discovery endpoint. Active affiliations can be shown by role and gym ID because the current session response does not include gym names. These limitations should be treated as honest functional placeholders, not as UX ideals.

There was a brief implementation start before this PRD request, but implementation should pause until this PRD is reviewed and accepted.
