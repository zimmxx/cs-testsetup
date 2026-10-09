# Version history

Deployment dates below are UTC dates verified against successful GitHub Actions runs. A push, PR creation or merge alone does not prove deployment. Historical 0.1.x release-history labels were assigned retrospectively while the package/UI remained `0.1.0`; version `0.2.0` updates the package and displayed version together. No historical Git tags are implied.

## Unreleased

Future changes belong here.

## 0.2.1 — Vacuum chip sample stage — deployment pending

Prepared for review: **2026-10-09**. Package/sidebar version: **0.2.1**; setup/import schema remains version 1.

- Added the supplied vacuum-stage STEP and SolidWorks sources, checksums/provenance and converted GLB preview. All 44 equipment records now have STEP/GLB assignments.
- Replaced the alternative chip holder in `optical-chip-testing-v1` with `chip-vacuum-stage`, preserving its instance ID, placement, mounting to the separate DUT stage and optical connection endpoints.
- Added a one-time upgrade for older Builder/Bench drafts that preserves user settings, custom labels and alternate holder choices. Updated the evidence manifest and photo-to-setup guide with the user's confirmation.

Validation: **51 tests passed**, production build passed. Browser inspection confirmed the migrated vacuum holder, loaded 3D scene/inspector, preserved 17 items/six paths and separate DUT-stage mounting, with no captured console errors. The existing Three.js bundle-size warning remains.

Deployment: **pending review, merge and successful Pages deployment**. Vacuum plumbing, operating pressure and physical mounting remain unverified.

## 0.2.0 — Photo-derived optical chip setup — deployed 2026-10-09

Prepared for review: **2026-10-09**. Package and sidebar version: **0.2.0**. Setup/import schema remains version 1 for compatibility.

- Added the photo-derived `optical-chip-testing-v1` editable setup, original photos/evidence manifest, eight provisional equipment records with illustrative STEP/GLB previews and a reusable photo-to-setup agent guide. Proposed paths and hardware matches require review; the setup is not automatically published.
- Added shared photo evidence panels and draft-template loading to Builder, Bench_draft and Explorer while preserving existing published snapshots and the manual wafer setup.
- Added a wider initial/reset 3D camera view for elevated shelf equipment, validated local photo-evidence imports and preserved all existing `_draft` workspaces.
- Expanded the local library to 44 equipment records and 43 STEP/GLB assignments. New models are illustrative references with estimated dimensions, not verified vendor CAD.
- Replaced the bespoke arm silhouettes with the user-supplied `Fibrearm_assembly_try3.STEP` assembly for both arm library records; retained STEP, SolidWorks and DWG sources with checksums and earlier revisions. The 3D preview preserves supplied geometry; spring and fibre are explicitly omitted. Received 2026-10-09.

Validation: **50 tests passed**, production build passed; browser checks covered template loading, local draft saving, editing/undo, 3D and source-photo views. The existing Three.js bundle-size warning remains.

Merged commit: [ffe8f8c](https://github.com/zimmxx/cs-testsetup/commit/ffe8f8c36a096c2b0f727bad037a106565723c6b). Deployment verified against the [successful Pages workflow](https://github.com/zimmxx/cs-testsetup/actions/runs/37955228758), completed 2026-10-09 at 15:55:31 UTC.

### Documentation handover — merged 2026-10-09

[PR #1](https://github.com/zimmxx/cs-testsetup/pull/1) was merged on 2026-10-09 and deployed by the [successful documentation workflow](https://github.com/zimmxx/cs-testsetup/actions/runs/37925408220).

- Added this version history with verified deployment dates, commits and workflow evidence.
- Added `CONTEXT.md` to the project source: implementation summary, architecture, confirmed hardware, persistence rules, limitations and continuation checklist.
- Linked both files from the main README and corrected its repository introduction.
- Equipment pictures are already deployed in the release below; this documentation PR does not need to redeploy those changes separately.

## 0.1.1 — Equipment pictures — deployed 2026-10-09

Commit: [de8fb9e](https://github.com/zimmxx/cs-testsetup/commit/de8fb9ec9bec9693bf7b52a6346386a5524890bc). Deployment evidence: [successful build and Pages deployment](https://github.com/zimmxx/cs-testsetup/actions/runs/37920735302).

- Assigned pictures to all 36 equipment records, using 24 shared local assets. Vendor sources are preferred; distributor, lab context and user CAD images retain explicit accuracy labels.
- Recorded original page/asset URLs, credits, retrieval date, dimensions and checksums. Acquisition snapshot: `public/library/images/sources.json`.
- Added full-image viewing, picture downloads and source captions while retaining 3D as the default Equipment library view.
- Added editable picture provenance in Admin and cleared stale source metadata when replacing an image.
- Updated draft equipment previews and the bench inspector to show sourced pictures while preserving existing user edits.
- Added equipment-picture integrity checks. Validation at release: 46 tests passed, production build passed, browser picture/source checks passed.

## 0.1.0 — Initial public release — deployed 2026-10-08

Commit: [bf9b83c](https://github.com/zimmxx/cs-testsetup/commit/bf9b83ce244b6d80976dcd656162eff74ceefb7b). Deployment evidence: [successful initial deployment](https://github.com/zimmxx/cs-testsetup/actions/runs/37821914562).

- Published the React/Vite setup directory, filtered Setup Explorer, equipment library, working guides, document collection and measurement-time planner.
- Included manual wafer optical setup configuration, drag connections, per-end fibre connectors, editable optical bench placement, shared 3D/signal views and explicit publication snapshots.
- Included modular Keysight 8163B and O-band 8164B assemblies with inspectable module installation.
- Stored original STEP/STP and SolidWorks references alongside GLB browser previews and CAD provenance.
- Included local Admin editing and STEP conversion, browser autosave, portable exports and saved project records.
- Preserved Bench_draft, Equipment_draft and Training_draft as separate review workspaces. Removed the duplicate Illustrative tab in favour of Signal path.
- Added GitHub Pages build/test/deploy workflow, relative asset paths, hash navigation and user/source guides. Initial release validation: 43 tests passed and production build passed.

### Same-day static hosting fix — deployed 2026-10-08

Commit: [add78cc](https://github.com/zimmxx/cs-testsetup/commit/add78ccb7770df7863be44e1fd11cd8bae99a8cc). Deployment evidence: [successful deployment](https://github.com/zimmxx/cs-testsetup/actions/runs/37822278372).

- Stopped production builds from requesting the localhost-only library status API on static GitHub Pages. Local editing remains available through the Vite development server.

## Updating this file

1. Describe proposed features/fixes under **Unreleased** during development and PR review.
2. Run relevant checks and review source/CAD provenance before merging. Preserve `_draft` workspaces unless the user asks to remove or promote them.
3. After merging to `main`, verify the **Build and deploy Test Setup** workflow completes successfully and check the public website.
4. Move shipped entries into a release section with its actual deployment date, commit and workflow link. If deployment failed or has not run, retain **pending** rather than inventing a date.
5. When formally bumping application versions, update `package.json`, any displayed version and release tags consistently. Update `CONTEXT.md` with material architecture, storage or unresolved-issue changes.
