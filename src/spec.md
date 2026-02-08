# Specification

## Summary
**Goal:** Make the existing submissions dashboard visible directly on the public homepage while keeping the admin-protected `/dashboard` route unchanged.

**Planned changes:**
- Render a clearly labeled "dashboard" section on the root route (`/`) that displays the same submissions dashboard UI (heading, stats, filters, and table) currently shown in the protected dashboard view.
- Ensure the homepage-rendered dashboard does not trigger the admin access gate (no AccessDeniedScreen for non-admin or unauthenticated users on `/`).
- Add a visible in-page navigation element at the top of the homepage labeled exactly "dashboard" that scrolls/jumps to the dashboard section.
- Preserve existing admin access control behavior on `/dashboard` (no changes to the current protected route behavior).

**User-visible outcome:** Visiting `/` shows a public "dashboard" section (accessible without Internet Identity), and users can click a "dashboard" link at the top of the homepage to jump directly to it; `/dashboard` remains admin-only.
