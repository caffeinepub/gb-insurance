# Specification

## Summary
**Goal:** Fix admin “not authorized” login issues by adding a safe first-admin creation flow and in-app admin management (list/add/remove admins).

**Planned changes:**
- Backend: Add an idempotent method that lets any authenticated user create the first admin only when no admins exist, and returns a clear no-op/error when an admin already exists.
- Backend: Add admin-only methods to list current admins, add an admin principal, and remove an admin principal, with a safeguard to prevent removing the last remaining admin.
- Frontend: Update `/admin-login` to show a “Create first admin” action when the user is authenticated but not an admin, including loading/success/error states, re-checking admin status, and redirecting to `/dashboard` on success.
- Frontend: Add an admin-only “Admin Management” page within the `/dashboard` area to view admins and add/remove admins via UI controls (Principal input + remove confirmation).

**User-visible outcome:** Users who authenticate can create the first admin when none exist, and admins can manage the admin list from the dashboard; admin login no longer gets stuck with “not authorized” after a reset when no admins are configured.
