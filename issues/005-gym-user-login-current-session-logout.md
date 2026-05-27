## Parent PRD

`issues/prd.md`

## What to build

Complete the gym-side authentication loop. Verified gym-side users should be able to log in, resolve their current session, and log out. Unverified users should be denied authenticated gym-side access.

## Acceptance criteria

- [ ] Gym-side login verifies credentials through a password hashing service port.
- [ ] Successful gym-side login creates a gym-side session separate from admin sessions.
- [ ] Current-session lookup returns the authenticated gym-side user for an active session.
- [ ] Unverified gym-side users cannot receive authenticated app access.
- [ ] Logout invalidates the gym-side session.
- [ ] Behavior tests cover successful login, failed login, unverified denial, current-session lookup, logout, and invalid-session denial.

## Blocked by

- Blocked by `issues/004-gym-user-signup-email-verification.md`

## User stories addressed

- User story 13
- User story 14
- User story 15
- User story 19
- User story 31
- User story 33
- User story 35
- User story 36
- User story 39
- User story 42
- User story 43
