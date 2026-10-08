# CORNERSTONE Test Setup

A local JavaScript workspace for finding photonic measurement setups, exploring equipment and connections, collecting documentation, training users and planning measurement time. Prepared for a future repository named **cs-testsetup**.

## Draft UI workspaces

Three separate preview workspaces are available on the same local app: **Bench_draft**, **Equipment_draft**, and **Training_draft**. Start with [Bench_draft](http://localhost:5174/#page=bench_draft). See [README_draft.md](README_draft.md) for the user guide, draft file locations and review workflow. Saving a draft does not change the shared equipment catalog or published setups.

## Run locally

Requires Node.js **22.12+** and pnpm **11.19.0**.

```sh
pnpm install
pnpm dev
```

Open **http://localhost:5174/**. Vite also prints the local network address; the current workstation address is **http://10.22.40.244:5174/**. Network access from other devices depends on their connectivity and the workstation firewall. The IP may change. Port 5174 keeps this app separate from cs-testsuite on port 5173.

On this Windows workstation, `scripts/start-local.ps1` also finds Codex's bundled pnpm when pnpm is not on PATH:

```powershell
powershell -File scripts/start-local.ps1
```

## What is implemented

- Setup explorer with chip/wafer, optical/electrical and wavelength filters; meaningful empty states.
- Twelve setup records: optical chip C/O-band, thermo-optic heaters, heater resistance, PN modulators, fibre arrays, visible, MIR, planned edge coupling, wafer C-band, electrical wafer work in development and planned wafer O-band.
- Interactive equipment layouts with keyboard-accessible hotspots, equipment inspectors and real presentation photos.
- Signal paths for optical, electrical and electro-optic work; control and observation are distinguished from the measured signal.
- Equipment library with specifications, sources, compatibility notes and alternatives; JSON catalog export.
- Build setup with equipment drag/drop, instance labels, draggable signal layouts and port-to-port connections, optical/electrical paths, per-link fibre models and separate connector ends; interactive Setup overview, 3D and Signal path views, autosave, undo and JSON import/export.
- Discreet Admin link at the bottom of the sidebar: edit/add equipment, specification rows, pictures, STEP/STP upload with local conversion, CAD provenance and GLB models. Localhost edits write to `public/library/`; static hosting provides export for repository updates.
- Draft training checklists with browser-local progress and text export.
- Reference library with supplied presentation, service links, manufacturer resources and cs-testsuite handover links.
- Editable Word collection workbook in Documentation covering equipment, detailed models, actual setup records, approved guidelines, test parameters, timing evidence and directory mapping.
- Local document attachments (IndexedDB), saved reference links and setup association. Attachments can be downloaded again. Up to 25 MB per attachment; document/image formats only.
- Measurement planner with chip/wafer counts, devices, repeats, conditions, continuous/stepped acquisition, loading, reference, alignment, overhead, post-processing and buffer assumptions; JSON export.
- Responsive desktop/mobile interface, reduced motion, keyboard navigation, dialog focus management and URL-backed navigation, filters and setup tabs.

This app is a setup directory and planning tool. It does not connect to laboratory instruments, book equipment or execute measurements.

## Content and evidence

The starting catalog combines the supplied `CORNERSTONE_TESTING.pptx` (updated 22 June 2026) with the CORNERSTONE chip and wafer testing service pages and manufacturer information checked on 30 September 2026. See [docs/SOURCES.md](docs/SOURCES.md).

**Documented** means recorded in the presentation, not verified current operational or booking availability. **Service listed** describes a public capability without claiming a complete local inventory. **Needs verification**, **Planned**, and **In development** retain gaps and future work explicitly. MIR is shown in a setup photo but also listed as future work in the presentation; readiness is therefore unconfirmed. O-band WST is a proposed upgrade, not an operational capability.

Equipment serial numbers, quantities, calibration dates, operational status and full local SOPs have not been supplied. The base service catalog does not identify instruments for the automated WST or other bands. Separately, the user confirmed the 81940A, 8163B and 81634B for the manual wafer optical bench. Component families reused in illustrative layouts need configuration verification.

The teaching bench image is generated, explicitly illustrative and not a photograph of CORNERSTONE's equipment. Actual lab photos are extracted from the supplied presentation. Guides are draft outlines, not approved procedures. Default planner timings are editable examples, not measured lab throughput.

## Add or update content

1. Use Admin on localhost to maintain equipment records and assets in `public/library/`. Edit `src/data/catalog.js` for baseline setups, capabilities and guides. Stable IDs connect equipment to setups and documents.
2. Put setup photos in `public/assets/` and add filenames to a setup's `photos`. Update `photoSources` with source slides.
3. Put repository-shared documentation in `public/documents/` and register it in `defaultDocuments` with a relative `path`.
4. Add approved SOP content to `guideSteps`, and update its status when it has been reviewed.
5. Replace illustrative timing defaults in `src/lib/planner.js` with validated timing profiles when measurement data is available.

Browser-attached documents and saved links are local to that browser and **origin**. They do not sync between localhost, the LAN IP and a future GitHub URL. Keep original files; download attachments before clearing storage or changing address. Attachments added in the UI are not included in the repository automatically.

Built setup drafts are also browser/origin-local; export JSON to retain or share them. Admin edits are project files shared with all viewers after reload. File writes require same-origin requests from localhost. LAN viewers can inspect and export. GitHub Pages editing requires exporting and committing library changes, or a separately authenticated backend. Admin is not currently a multiuser permissions system.

See [docs/MODELS.md](docs/MODELS.md) and [public/library/README.md](public/library/README.md). The current library contains 36 records: 35 have browser models and STEP references; the vacuum chip stage retains its original SolidWorks source while its browser conversion is pending. Seven records use vendor CAD; others retain their provenance and review notes. See [docs/EQUIPMENT-CAD-REVIEW.md](docs/EQUIPMENT-CAD-REVIEW.md) for assumptions and sources. Build setup includes a suggested optical bench, editable placement, model review and local project saving. The complete bespoke arm assembly, exact DUT stage/camera and measured bench dimensions remain to confirm.

## Structure

```text
src/
  App.jsx                 App composition and navigation
  components/             Feature screens and reusable controls
  data/catalog.js         Source-backed setup and equipment catalog
  lib/planner.js          Pure timing calculations and validation
  lib/storage.js          Browser persistence, attachments, exports
  lib/urlState.js         Shareable view state and browser history
  styles.css              Design system and responsive layouts
public/
  assets/                 Illustration, setup photos and favicon
  documents/              Supplied presentation / shared documents
docs/                     Design, sources, user guide, handover
tests/                    Timing and catalog integrity checks
.github/workflows/        Prepared GitHub Pages deployment
```

## Validate and build

```sh
pnpm test
pnpm build
pnpm preview
```

The app bundles its font locally and does not require online APIs to load. External reference links require internet access. UI QA is recorded in [docs/QA.md](docs/QA.md).

## GitHub repository and website

Repository: [zimmxx/cs-testsetup](https://github.com/zimmxx/cs-testsetup). Website: [CORNERSTONE Test Setup](https://zimmxx.github.io/cs-testsetup/).

GitHub Pages uses **Settings → Pages → Source → GitHub Actions**. The workflow runs the tests, builds and deploys on pushes to `main` or manual dispatch. Relative Vite assets and hash navigation support the repository subpath. The local development address remains `http://localhost:5174/`; no application code depends on the workstation's LAN IP.

The website includes Bench_draft, Equipment_draft and Training_draft for review. Browser changes belong to that browser/origin; export them to transfer between the website and localhost. Shared file writes and STEP conversion require the local development server. A GitHub Pages deployment does not provide collaborative file saving or an authenticated Admin backend.

## Next content to supply

Build setup is the editing workspace. Use **Review & publish** to check the setup ID and filters, then **Publish to Setup Explorer** to release a separate local snapshot. Explorer shares the builder's overview, 3D and Signal path views; preview movement and connections do not change the published file. The former overview reference is retained as **Setup diagram**. See [published setup workflow](docs/PUBLISHED-SETUPS.md) for storage and native SolidWorks source notes.

Approved measurement SOPs; instrument model/serial/calibration records; confirmed band configurations; WST connection and trigger diagram; actual timing observations; equipment alternatives and inventory quantities; any additional setup photos.
