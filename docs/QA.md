# Development QA · 30 September 2026

The flow under test was: open the local app → choose a setup → inspect hardware and connections → review the guide → estimate session time → attach or save a reference.

## Environment

- Local server: `http://localhost:5174/`; Vite bound to `0.0.0.0` and reported `http://10.22.40.244:5174/` on this workstation. LAN reachability from a second device was not tested.
- Desktop browser: Codex in-app browser, approximately 1625 × 877 viewport.
- Mobile browser: Codex in-app browser, 390 × 844 viewport override, reset afterwards.
- Export verification: installed Microsoft Edge via bundled Playwright. The in-app browser did not deliver a programmatic download event, so the exported JSON was checked in local Chromium/Edge.

## UI draft workspaces — 8 October 2026

The three new draft workspaces and the removal of the duplicate Illustrative tab were verified with 43 passing tests, a successful production build and desktop/mobile browser checks. See [CHANGELOG_draft.md](../CHANGELOG_draft.md) for scope and evidence, and [README_draft.md](../README_draft.md) for the user workflow. No draft was automatically promoted or deployed.

## Checks

| Check | Result | Evidence |
| --- | --- | --- |
| Page identity and nonblank render | Pass | `CORNERSTONE · Test Setup` title; full explorer present |
| Framework overlay / console | Pass | No Vite overlay or app warnings/errors in browser logs |
| Setup filter and selection | Pass | Wafer selection showed WST; Wafer + MIR showed useful empty state; Clear filters returned 12 records |
| Directory search | Pass | `heater` returned three relevant setup records |
| Setup image and equipment inspection | Pass | Supplied photo opened with presentation slide; hotspot opened specifications in a dialog |
| Signal path | Pass | Optical source, controller, coupling, DUT and detector showed the sequence; camera and computer were separate |
| Guide persistence | Pass | Marking a step showed 1/6 after reload; reset returned to 0/6 |
| Planner recomputation | Pass | Eight chips changed the estimate to 3 h 33 min; stepped acquisition changed it to 4 h 54 min; zero wavelength step blocked the estimate; reset restored 2 h 5 min |
| Calculator unit checks | Pass | Eight pure Node tests cover continuous, stepped, wafer and electrical jobs, invalid inputs, formatting and catalog integrity |
| Attachment storage | Pass | A local text file appeared in the library; it persisted after reload and was removed after QA |
| Saved links | Pass | A setup-specific link persisted after reload and was removed after QA |
| Measurement plan export | Pass | Headless Edge downloaded JSON named `chip-optical-c-measurement-plan.json`; five chips produced 60 devices and a valid result; no page errors |
| Desktop/mobile layout | Pass | Screenshots inspected against the design concept; mobile had no document-wide horizontal overflow. Setup rail and tabs remain swipeable. |
| Production build | Pass | Vite compiled the static site and bundled the font locally |

Temporary QA documents and saved links were removed from browser storage. The final desktop and mobile screenshots are attached to the development conversation, outside the repository.

## Remaining content work

### Build setup and Admin verification — 30 September 2026

Local Edge/Playwright was used after the in-app browser repeatedly timed out during tab navigation and focus emulation. Edge software rendering enabled WebGL for headless tests.

- Native library drag/drop and pointer movement on the canvas passed.
- Mixed optical/electrical paths, independent fibre models and source/destination connectors passed; export and reload retained them.
- JSON import, equipment removal with connected paths, and undo passed.
- Signal view and WebGL scene rendered. A temporary valid GLB uploaded, loaded to completion, and previewed before and after saving.
- Admin edits wrote project JSON and appeared in Equipment library; new records and model references persisted. Temporary edits/assets were restored/removed after QA.
- Cross-origin writes and invalid asset destinations were rejected.
- The 390px layout had no document-wide horizontal overflow. Desktop and mobile screenshots were inspected.
- Eleven Node tests passed, including import validation and per-connection metadata preservation. No page runtime errors were observed.

Detailed instrument geometry still needs actual equipment reference files. The GLB test was a synthetic renderer fixture, not an instrument model.

### Interactive overview and collection workbook

The Build setup overview was checked with a four-instrument draft. A numbered marker showed the shared role/specification inspector; View equipment opened the full library record. Switching back to Illustrative preserved all draft equipment. The Word workbook appeared in Documentation and its download returned HTTP 200. No page runtime errors occurred. Existing eleven Node checks and the production build passed.

Approved SOPs, confirmed instrument identities and calibration records, exact band configurations, a verified WST wiring example and observed task timings are needed before the catalog can be treated as an operational lab record. The app labels these gaps and keeps planner assumptions editable.
