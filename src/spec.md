# Specification

## Summary
**Goal:** Make the user-provided hero image (image-3.png) render on the Home page and ensure it is correctly preloaded.

**Planned changes:**
- Add the user-uploaded image (image-3.png) to `frontend/public/assets/generated/` as a static asset with a stable `/assets/generated/` URL.
- Update the Home page hero banner component to render this exact image path so it displays on the deployed site without triggering any fallback/onError behavior.
- Update `frontend/index.html` to preload the same hero image asset (replacing the current preload reference to `/assets/generated/image-2.png`).

**User-visible outcome:** The Home page hero banner reliably shows the provided GB Insurance vehicle montage image on first load, with no broken-image behavior and faster first paint due to correct preloading.
