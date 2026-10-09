# CORNERSTONE Test Setup — development handover

Last updated: **2026-10-09**. This file is part of the project source and should travel with the repository. It records the state at this documentation change; a future session must verify Git status, open PRs and deployments before acting. Historical documents describe the state on their own dates and may contain superseded counts or tabs.

## Start here

- Repository: <https://github.com/zimmxx/cs-testsetup>
- Public app: <https://zimmxx.github.io/cs-testsetup/>
- Local app: <http://localhost:5174/>
- Main editing page: `#page=builder`; equipment: `#page=equipment`; draft bench: `#page=bench_draft`.
- Local project root on the original workstation: `C:\Users\ahs2u23\OneDrive - University of Southampton\Documents\ChatGPT\CORNERSTONE TESTING SETUP APP`.
- Latest verified deployed commit at this handover: `de8fb9e` (equipment pictures), deployed **2026-10-09**. See [CHANGELOG.md](CHANGELOG.md) for exact commits and workflow evidence.
- This handover/version-history change is proposed on `codex/equipment-pictures-review`, targeting `main`. User requested an open PR to accept personally; do not assume this change is merged or deployed. Check GitHub for its current state.
- An earlier comparison branch, `codex/equipment-pictures-review-base`, points to `add78cc`. It was created before documentation was added, has no unique feature work and is not the intended PR target.

## Product objective and user preferences

Provide a practical directory of CORNERSTONE measurement setups, equipment capabilities, documentation and training, with an editable setup builder and measurement-time estimates. The immediate priority is a complete, useful **Manual Wafer Optical Measurement** setup. Automated measurement development is deferred.

The user prefers detailed CAD based on vendor models or real dimensions/photos, browser previews with **3D first** and a Picture toggle, drag-to-connect optical/electrical paths, and small batches of two or three questions when collecting missing information. They use **SolidWorks**, not AutoCAD. Keep all three `_draft` workspaces for later review; do not automatically promote or remove them. Shared setup editing belongs in Build setup; Setup Explorer shows published layouts. Keep the reference **Setup diagram**, **Equipment** and **How-to guide** in Explorer. Keep one connection diagram, **Signal path**; Illustrative was removed because it duplicated it.

This app documents and plans work. It does not operate instruments, run acquisition, simulate optics, approve SOPs or provide bookings. A reference picture/model is not evidence of the installed model or operational readiness.

## Implemented features

1. **Setup Explorer:** scale (Chip/Wafer), mode (Optical/Electrical), wavelength bands, search/status and setup selection; meaningful empty states and URL-backed navigation. Twelve baseline setup records plus published layouts. Capabilities/readiness have source/status notes.
2. **Build setup:** searchable equipment library, drag/drop instances, instance-specific records, drag optical/electrical connections, independent source/destination connector types, fibre model/length/notes, signal coordinates, physical bench coordinates, undo, autosave and validated JSON import/export. Overview, 3D and Signal path share setup data.
3. **Optical bench:** suggested 1800 × 900 mm table, editable X/depth/elevation/rotation, suggested Arrange on bench action and parent-mounted assemblies. Physical coordinates and diagram coordinates are independent. Suggested placement is not verified mechanical design.
4. **Mainframes:** compatible module bays, slot installation, swap/unmount, mounted movement and exploded inspection for the 8163B and 8164B. Modules retain their own records and connections.
5. **Publication:** editable project setup files and a separate published snapshot. Explicit Publish to Setup Explorer updates the snapshot. Explorer uses shared builder renderers and permits temporary inspection/movement without changing the published files.
6. **Equipment library/Admin:** 36 records, specification/source/alternative notes, 3D-first previews, picture toggle, image downloads/source captions, CAD downloads and accuracy labels. Local Admin can add/edit records, upload pictures/GLB and convert STEP/STP with the separately installed local converter.
7. **Documentation/training:** supplied presentation, Word collection workbook, reference links, browser-attached documents, setup associations, draft how-to outlines and training progress.
8. **Measurement planner:** chip/wafer/device/repeat/condition counts, continuous or stepped acquisition, loading/reference/alignment/movement/post-processing/buffer assumptions, validation and JSON export. Timing defaults are examples awaiting measured evidence.
9. **UI:** responsive layout, keyboard controls, focus-managed dialogs, reduced motion, hash navigation and locally bundled fonts.
10. **Review workspaces:** Bench_draft (Explore/Edit, docked inspector, focus mode, physical plan with snapping/locks, layers, trace network, review differences); Equipment_draft (isolated editable catalog, provenance/missing-information checks); Training_draft (one guide step at a time, related equipment, progress/notes/export). They are pages in the same app, not separate Git repositories.
11. **Equipment pictures:** all 36 records have pictures, using 24 local assets. There are 28 vendor assignments, one distributor assignment, two lab-photo assignments, three lab-context assignments and two user-CAD-preview assignments. Some images are shared. Metadata and UI distinguish exact products, assemblies and unconfirmed references.
12. **GitHub Pages:** public static deployment with tests/build on `main`, relative paths and repository-subpath-compatible routing. Local development remains a separate writable environment.

## Confirmed manual wafer optical setup

Stable setup ID: **`wst-optical-manual`**. User-reported usual settings: **10 mW laser output** and **10° input/output fibre angle from wafer normal**, coupling from above to **grating couplers**. These are recorded defaults, not approved limits or proof of power reaching the DUT.

Input path:

`Keysight 81940A → P3-1550PM-FC-2 → ADAFCPMB2 sleeve → FPC562 polarisation controller → ADAFCPMB2 sleeve → P3-SMF28Y-FC-5 (cleaved at input fibre arm) → DUT input grating`

Output path:

`DUT output grating → cleaved P3-SMF28Y-FC-5 at output fibre arm → ADAFCPMB2 sleeve → P3-1550PM-FC-2 → Keysight 81634B power sensor`

The **SM P3-SMF28Y-FC-5 is cleaved**, not the PM cable. Controller input/output leads belong to the same FPC562 fibre assembly; they are not two independent patch cables. Grating coupling is free-space and has no mating connector. Installed instrument ports, controller lead options and actual cut lengths still need confirmation.

| Equipment ID | Meaning / confirmed distinction |
| --- | --- |
| `wst-laser-old` | Keysight 81940A tunable laser; product range 1520–1630 nm |
| `wst-mainframe-manual` | Keysight 8163B housing the laser and sensor; default slot 1 laser / slot 2 sensor is suggested, actual order unconfirmed |
| `wst-sensor-old` | Keysight 81634B optical power sensor |
| `wst-polarisation-manual` | Thorlabs FPC562, three paddles, 56 mm loop |
| `wst-mating-sleeve-manual` | Thorlabs ADAFCPMB2; multiple sleeve instances |
| `wst-fibre-pm2-manual` | P3-1550PM-FC-2, nominal 2 m PM cable |
| `wst-fibre-sm-manual` | P3-SMF28Y-FC-5, nominal 5 m SM cable, one end cleaved for each arm |
| `wst-fibre-pm5-manual` | P3-1550PM-FC-5 retained as an inventory alternative, not the configured cleaved fibre |
| `fibre-arm-stage` | Thorlabs MAX313D, differential drives, no piezos; two instances support input/output fibre arms |
| `wst-fibre-arms-manual` | Bespoke Southampton adjustable-angle arms; real assembly source retained, preview still illustrative |
| `wst-stage-manual` | Separate DUT motion stage; exact model remains unknown; do not replace it with MAX313D |
| `wst-camera-manual` | Camera/optics awaiting exact identity; GT Vision picture is representative |
| `wst-wafer-holder-manual` | Bespoke 3D-printed wafer holder; dimensions/isolated photo pending |
| `wst-chip-holder-manual` | Bespoke copper chip block |
| `chip-vacuum-stage` | User-supplied vacuum sample stage; separate chip holder/stage, not a replacement for `wst-stage-manual` |

Measurement/installed fields cover instrument model/options/serial/calibration, scan settings, detector range/averaging/reference, polarisation, coupling angles, coordinates/mounts/environment, approved limits, data folders/naming/post-processing, SOP/reviewer and measured timings. Most of these remain for the user to configure.

## O-band assembly

Stable setup ID: **`oband-mainframe-assembly`**; this is an instrument assembly, not yet a complete DUT measurement path.

- `oband-mainframe-8164b`: **O-band laser and detector mainframe**, Keysight 8164B, four vertical compact bays (1–4) and one horizontal extended bay (0).
- `oband-laser-81606a`: Keysight 81606A installed in **slot 0**; user confirmed **1240–1380 nm**. Documentation maps that range to option 113, but the physical option label still needs checking.
- `oband-head-interface`: user-confirmed **81618A single optical head interface**, **slot 3**.
- `oband-head-81624b`: external detector head connected electrically to the 81618A, receiving output fibre via **81000FA FC/PC** (`oband-adapter-81000fa`). Do not render the 81624B head as a plug-in mainframe module.
- Full fibre path, cable details, calibration and approved O-band conditions remain pending. Do not reuse C-band PM cable assumptions without verification.

The broader inventory also includes Keysight N7776C, N7749C/8162-C, Keithley 6487 and Keysight E3640A; installed variants and readiness need lab verification.

## Project structure and source of truth

```text
README.md / README_draft.md       Main and draft user guides
CONTEXT.md                        This handover
CHANGELOG.md / CHANGELOG_draft.md  Deployment history / historical draft change notes
package.json / pnpm-lock.yaml     Runtime versions and reproducible dependencies
vite.config.js                   React, local API plugin, relative base, build cleanup
src/
  App.jsx / main.jsx              App composition / entry
  styles.css / builder.css        Shared styles / builder
  workspaces_draft.css            Draft UI styles
  components/
    Builder.jsx / Explorer.jsx    Editor / published user-facing views
    SetupView.jsx                 Shared views and inspectors
    SetupGraph.jsx / BuildOverview.jsx / ModelScene.jsx
    PublishedSetupView.jsx / PublishSetup.jsx
    Equipment.jsx / EquipmentPicture.jsx / Admin.jsx
    MainframeSlots.jsx / MeasurementSettings.jsx / ModelRegister.jsx
    Bench_draft.jsx / BenchPlan_draft.jsx / Graph_draft.jsx
    Equipment_draft.jsx / Training_draft.jsx
    Documents.jsx / Guide.jsx / Planner.jsx / Shell.jsx / UI.jsx
  data/
    catalog.js                    Baseline setups, guides, equipment and references
    manualSetup.js                Confirmed manual defaults and field schema
    obandAssembly.js              O-band records and assembly defaults
  lib/
    setupBuilder.js / benchLayout.js / mainframeAssembly.js
    publishedSetups.js / workspace_draft.js
    library.js / equipmentPictures.js
    storage.js / planner.js / urlState.js
public/
  assets/                        Setup photos, illustration and favicon
  documents/                     Supplied PPTX and Word collection workbooks
  library/
    equipment.json               Shared editable catalog overrides
    images/                      Local pictures and sources.json acquisition snapshot
    models/                      GLB browser previews and .metadata.json
    references/<record>/         Original STEP/STP, SolidWorks, drawings, provenance
    setups/                      Saved editable setup JSON
    published/index.json         Explicit published layout snapshots
    workspaces_draft/             Saved isolated bench/catalog draft JSON
docs/                            User guide, sources, QA, CAD/picture/setup documentation
scripts/
  start-local.ps1                Windows launcher with bundled-pnpm fallback
  library-server.js              Vite local file API and STEP conversion integration
  convert-step.mjs               STEP/STP to GLB conversion utility
  generate-*-cad.py / prepare-*   CAD maintenance tools; inspect before rerunning
  create_collection_workbook.py / add_wafer_workbook_example.py
tests/                           Node tests for calculations, setup/storage/CAD integrity
outputs/
  cornerstone-collection-20261001/CORNERSTONE_Setup_Collection.xlsx
                                 Equipment/setup collection spreadsheet
.github/workflows/deploy-pages.yml
                                 Tests, static build, deployment on main
.local/                          Ignored workstation tools/recovery/runtime files
```

Catalog code seeds baseline equipment; `public/library/equipment.json` overlays records by stable ID at load. Do not edit a baseline and assume it replaces an existing library override. Setup defaults, saved editable JSON, published snapshots and isolated drafts are different stores. Equipment ID identifies a catalog record; node ID identifies an installed instance. Connections and module mounts reference **instance IDs**. Preserve IDs, schema version and existing edits when migrating data.

`public/` assets use app-relative paths (e.g. `library/models/fpc562.glb`) and `import.meta.env.BASE_URL`. Do not store workstation absolute paths or root-only asset URLs in portable records. Documentation root files are repository handover files; they are not automatically app Document-library entries. `sources.json` is an acquisition snapshot; subsequent Admin picture edits live in equipment.json.

## Persistence and publication rules

| Action / store | Where it saves | Shared on GitHub automatically? |
| --- | --- | --- |
| Builder/bench draft autosave, preferences, training notes/progress | Browser localStorage, namespaced by app/version and origin | No |
| UI document attachments | Browser IndexedDB; up to 25 MB per supported attachment | No |
| Admin save/upload on localhost | Shared `public/library/` files | Only after commit/push and deployment |
| Save editable setup locally | `public/library/setups/<id>.json` | Only after commit/push and deployment |
| Save draft locally | `public/library/workspaces_draft/<id>_draft.json` | Only after commit/push and deployment |
| Publish to Setup Explorer locally | Separate `public/library/published/index.json` snapshot | Only after commit/push and deployment |
| Explorer movement/connection inspection | Temporary preview | No; does not mutate publication |
| Equipment_draft edits | Isolated catalog preview/file | Shared Admin must apply reviewed records separately |
| Static Pages edits/exports | Browser storage or downloaded JSON | No authenticated repository-writing backend |

Localhost, LAN IP and GitHub Pages are separate origins; browser state does not sync among them or between users. Export before switching address or clearing storage. Keep original attached documents outside browser storage. Same-origin localhost requests are required for project-file writes; LAN viewers can inspect/export. Admin is currently a local maintenance screen, not multiuser authentication or access control.

Recovery `.bak`/`.tmp` files are ignored and excluded from production builds. Do not commit node_modules, dist, `.local`, logs or credentials. Native CAD and converted previews are intentional repository assets.

## CAD generation, conversion and rendering

- **Three.js** with GLTFLoader and OrbitControls renders self-contained GLB in the browser. Viewers do not install SolidWorks, CAD converters or browser plugins. WebGL support is required.
- Original CAD is primarily **STEP/STP**; user **SLDPRT/SLDASM** sources are retained separately. They are not interchangeable formats, and native SolidWorks files do not render directly.
- `scripts/convert-step.mjs` uses **occt-import-js 0.0.23 / OpenCascade**, installed separately under `.local/cad-tools/package` on this workstation. Source millimetres become GLB metres; metadata retains bounds, triangle counts and conversion settings. Z-up can be rotated to viewer Y-up.
- The local converter is not a runtime dependency shipped by pnpm install or GitHub Pages. Check `/api/library/status` for local conversion availability. A fresh checkout must provision the tool or use an external STEP-to-GLB workflow. Preserve source files if conversion fails.
- Seven records have vendor CAD assignments: FPC562, MAX313D, ADAFCPMB2, the three named patch cables and Keithley 6487. Generic records may borrow these as explicitly unconfirmed visual references.
- Other equipment uses generated **illustrative faceted STEP BREPs**, written by project Python utilities from supplier envelopes/photos or estimated geometry. These were not built as SolidWorks feature trees; front details, ports, mounting and fit remain approximate.
- Current coverage: **36 equipment records, 35 GLB previews/STEP references, one native-only vacuum stage awaiting conversion**. Historical CAD docs mentioning 30 records predate O-band and vacuum-stage additions.
- User fibre assembly: `public/library/references/wst-fibre-arms-manual/Fibrearm_assembly_try2.SLDASM`. Obtain resolved component files or a complete STEP assembly export; current arm browser model remains illustrative.
- User chip stage: `public/library/references/chip-vacuum-stage/Vacuum-Sample-Stage.SLDPRT`. Obtain STEP export to replace the missing preview.
- Earlier fibre-arm parts/Inventor `.idw` drawings are retained under `references/fibre-arm/`. A drawing alone is insufficient to reconstruct an exact SLDPRT; the user will assemble/provide real parts later.
- Existing viewer uses uncompressed GLB; Draco/Meshopt/KTX2 decoders and articulated paddle/fibre-arm motion are not implemented. Source licences/credits are retained; supplier image redistribution licences were not independently confirmed.

Do not run preparation/generation utilities blindly: some refresh catalog metadata or overwrite generated assets. Inspect scripts, back up user files and preserve vendor/native CAD assignments. Never relabel illustrative references as verified CAD.

## Running, testing and deployment

Requires **Node 22.12+** and **pnpm 11.19.0**. React 19, Vite 7, Three.js and Lucide are used; no external service is required for basic viewing.

```sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
pnpm preview
```

Dev runs on **5174**, strict port, host `0.0.0.0`; preview is **4173**. cs-testsuite is a different project and website; do not push these changes there. On Windows, `powershell -File scripts/start-local.ps1` finds bundled pnpm if it is absent from PATH. Keep the server process running. A previous LAN IP in README is not guaranteed current; inspect Vite/network state before giving it to the user. Firewall/other-device reachability is not verified.

Original workstation bundled runtimes, if needed:

- Node: `C:/Users/ahs2u23/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe`
- Python: `C:/Users/ahs2u23/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe`

Latest application validation (equipment-picture release): **46 tests passed**, production build passed, all 36 rendered pictures loaded, source captions/links checked and 24 public picture assets returned HTTP 200. Existing draft UI checks covered desktop/mobile, dragging/undo, layers/tracing, snapping/locks, module slots and training restoration. No runtime browser errors were observed in those checks. Documentation-only handover work does not imply a new full browser QA run.

`.github/workflows/deploy-pages.yml` runs tests/build on pushes to **main** or manual dispatch, then deploys `dist` via GitHub Actions. It currently has **no pull_request trigger**. Pages source is **GitHub Actions**. `base: './'` and hash routing support `/cs-testsetup/`. Production skips localhost API status checks (fix `add78cc`); do not reintroduce static-host `/api` requests.

## Outstanding bugs, limitations and content gaps

No unresolved functional runtime bug was observed in the latest checked flows. This is a tested snapshot, not a guarantee for every browser or new user action. Known follow-ups:

1. **Missing accurate CAD:** vacuum-stage preview is pending; actual resolved arm STEP assembly is pending. Mainframe/model fit, instrument front details and bench placements are illustrative. 3D cables terminate at equipment positions, not dimensionally precise CAD connector ports.
2. **Unconfirmed equipment/content:** exact DUT motion stage, camera/objective, wafer holder dimensions/photos, instrument connector options, serials, calibration, inventory quantities, physical slot order and cut cable lengths remain incomplete.
3. **Pictures:** vacuum stage currently has a context image that does not depict its actual geometry; stage/wafer holder need isolated photos. Generic instruments/cameras retain reference labels. New images must replace attribution/checksums correctly.
4. **O-band:** complete measurement path and validated fibre/connector choices are missing. User's 1240–1380 nm confirmation does not prove every cable and detector setting supports that path.
5. **Guides/planner:** local SOPs, approved limits/acceptance, data workflow and measured timing profiles still need user/lab review. No automation or cs-testsuite API integration is implemented.
6. **Hosting/persistence:** static Pages cannot write shared files or convert STEP; browser edits do not sync to GitHub or other users. Local maintenance has no authenticated multiuser backend.
7. **Performance:** a lazy 3D bundle size warning remains; vendor geometry can be heavy (FPC562 ~182k triangles). Optimisation/LOD should preserve geometry and metadata and be justified by measured performance.
8. **Network availability:** localhost stops when its server stops; LAN access from another device is unverified. Keep restart instructions available rather than treating a URL as permanently running hosting.
9. **Documentation age:** older CAD/QA/draft logs still mention the removed Illustrative view, 30 records, or pre-deployment status. Treat them as historical evidence; this handover and current source explain the latest state. Main README explains current coverage.

## Next session checklist

1. Read this file, README, CHANGELOG and relevant feature docs. Inspect `git status`, branch, remotes and the open documentation PR. Do not discard user changes, merge the PR or force-push main without user instruction.
2. Finish user review of this PR; after merge, verify the successful Pages run and record the actual deployment date in CHANGELOG. Equipment pictures are already live on main, not awaiting this PR.
3. Restart/check localhost if requested (`scripts/start-local.ps1`); verify HTTP and browser render before reporting availability.
4. Continue the manual wafer setup first. Ask for two or three specific missing details at a time, beginning with vacuum stage STEP and resolved fibre-arm assembly STEP, then DUT stage/camera identity and photos.
5. Import supplied CAD locally, inspect orientation/scale, retain originals and accurate source notes, save the matching stable equipment records, and verify both builder and Explorer views. Do not replace the separate DUT motion stage with the fibre-arm stage or vacuum holder.
6. Let the user configure parameters/records through UI or the Excel collection workbook. Spreadsheet edits are not automatically imported into the catalog; deliberate mapping/validation is required before changing project JSON.
7. Confirm physical dimensions/slots/ports, complete the guide and timing evidence, and review changes before explicitly publishing the setup snapshot. Keep drafts until the user chooses their future.
8. For code changes, run meaningful relevant tests, build and targeted browser checks; preserve browser/user data during QA. Push a `codex/` branch and create a reviewable PR when requested. For docs-only changes, check paths, links, facts and Git diff.
9. Keep CONTEXT and CHANGELOG accurate as storage, schema, decisions or unresolved issues change. If collaborative saving is later requested, design an authenticated backend explicitly; static Pages alone cannot provide it.

## Detailed references

- [Draft workspace guide](README_draft.md) and [historical draft changes](CHANGELOG_draft.md)
- [General user guide](docs/USER_GUIDE.md)
- [Manual wafer setup](docs/MANUAL-WAFER-SETUP.md)
- [O-band mainframe](docs/O-BAND-MAINFRAME.md)
- [Published setup workflow](docs/PUBLISHED-SETUPS.md)
- [Models/conversion](docs/MODELS.md) and [CAD assumptions](docs/EQUIPMENT-CAD-REVIEW.md)
- [Equipment pictures](docs/EQUIPMENT-PICTURES.md)
- [Sources](docs/SOURCES.md), [QA](docs/QA.md) and [bench QA](docs/QA-BENCH.md)
