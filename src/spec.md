# Specification

## Summary
**Goal:** Fix the “Reset Admin Credentials” flow so it works reliably on the deployed site, with clear authentication gating, error handling, and consistent admin verification/redirect behavior.

**Planned changes:**
- Make frontend backend-actor initialization resilient on the live network even when an admin token is missing/empty; surface actor init failures as a clear error state with a retry action on the Admin Login page.
- Require an authenticated Internet Identity session before attempting admin password reset; guide/trigger sign-in when the user tries to reset while unauthenticated, then proceed after authentication succeeds.
- Improve reset-password error handling to categorize and display traps/unauthorized/timeouts/unreachable-backend issues, avoid “no response” outcomes, and prevent redirects to `/dashboard` unless admin verification returns true.
- Harden backend `resetAdminPassword` to explicitly reject anonymous callers with a clear English error, and return consistent errors for invalid input (e.g., reset code/password validation).
- Add a short manual regression checklist to verify Admin Login → Reset Admin Credentials → admin verification behaves the same locally and on deployed networks, including how to use `healthCheck` and expected UI states when backend is unreachable.

**User-visible outcome:** On the live deployment, users can reliably reset admin credentials only after signing in with Internet Identity, see clear actionable errors (with retry where relevant), and reach the admin dashboard only when admin verification succeeds.
