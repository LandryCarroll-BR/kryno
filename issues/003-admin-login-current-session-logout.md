## Parent PRD

`issues/prd.md`

## What to build

Complete the system-admin authentication loop. Admin users should be able to log in, resolve their current admin session, and log out through admin-specific session contracts.

## Acceptance criteria

- [ ] Admin login verifies credentials through a password hashing service port.
- [ ] Successful admin login creates an admin session that is separate from gym-side sessions.
- [ ] Current-session lookup returns the authenticated admin for an active admin session.
- [ ] Logout invalidates the admin session.
- [ ] Behavior tests cover successful login, failed login, current-session lookup, logout, and invalid-session denial.

## Blocked by

- Blocked by `issues/002-bootstrap-system-admin.md`

## User stories addressed

- User story 3
- User story 4
- User story 5
- User story 9
- User story 33
- User story 35
- User story 36
- User story 39
- User story 42
- User story 43
