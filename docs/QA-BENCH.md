# Bench and CAD validation — 8 October 2026

The flow under test is: Build setup → load the manual wafer template or saved project → drag equipment/ports → edit fibres and connector ends → inspect CAD/bench → save/reload/export. Admin testing covers every catalog preview and local STEP conversion.

Browser plugin not available. Validation used bundled Playwright with Edge headless on http://localhost:5174, 1625 × 1100 desktop and 390 × 844 mobile. No browser dependencies were installed. Browser tests used isolated contexts and temporary records; original catalog files were restored and temporary CAD/setup files removed.

- All 30 model previews rendered; all 30 STEP links returned actual ISO-10303-21 files.
- Optical and electrical port drags, live preview, different source/destination connector labels, duplicate rejection and undo passed.
- Escape and release away from an input cancel connection creation.
- STEP upload, local OpenCascade conversion, preview and catalog save passed. Invalid STEP content and cross-origin writes were rejected.
- Project save, reload and JSON export preserved measurement settings, bench coordinates and all eight optical paths.
- Saved manual setup retains 14 instances and 10 distinct equipment records, including separate input/output fibre stages and the unidentified DUT stage.
- 3D labels/reset, equipment selection and CAD reference fields passed. The scene avoids rebuilding when only notes or cable metadata change.
- Mobile has no document overflow, including expanded installed records and the CAD review table. Wide diagrams and tables scroll inside their panels.
- No page errors or console warnings in the full corrected run. Repeated model inspection initially revealed WebGL context exhaustion; explicit context release fixed it, and the full 30-model run was repeated successfully.
- 17 unit/resource checks passed: STEP hashes/headers, nonempty finite GLB geometry, migration preserving user settings/positions, mounted arm positions, invalid imports, connection guards and existing timing calculations.
- Production build passed. Vite reports the existing large Three.js viewer chunk; the viewer is loaded lazily when needed. No build errors.

Evidence: temporary browser screenshots outside source; a shareable bench preview is in outputs/Manual-Wafer-Optical-Bench.png. Detailed equipment assumptions and source links are in EQUIPMENT-CAD-REVIEW.md.

Limits: this was a software/rendering/CAD-import check. SolidWorks installation testing, physical mounting/clearance validation and instrument operation were not performed. Generated reference STEP files are faceted solids, not native SolidWorks feature trees. The actual bespoke arm assembly, camera/optics, DUT stage and measured bench dimensions remain to supply.
Navigation smoke check: Setup explorer, Available setups, Equipment library, Build setup, Measurement planner, Documentation and Admin all rendered meaningful content without page errors or console warnings. Lazy-loaded screens were allowed to finish before checking.
