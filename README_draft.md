# CORNERSTONE UI workspaces — draft user guide

These are separate review pages inside **cs-testsetup**, on the existing local server. Each workspace name ends with `_draft`. They are not separate repositories or deployed apps.

| Workspace | Open locally | Purpose |
| --- | --- | --- |
| Bench_draft | http://localhost:5174/#page=bench_draft | Inspect and refine setup layout, paths, installed records and working guide |
| Equipment_draft | http://localhost:5174/#page=equipment_draft | Review models, pictures, provenance and missing equipment information |
| Training_draft | http://localhost:5174/#page=training_draft | Follow a measurement guide with the relevant equipment in view |

## Start and stop the local app

From the project root:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

On this Windows workstation, `powershell -File scripts/start-local.ps1` finds the bundled pnpm if needed. Leave that terminal running. Open **http://localhost:5174/** in Edge or the in-app browser. Stop the server with Ctrl+C. If a link stops responding, restart this server; a localhost address works only on the computer running it. A LAN address printed by Vite may be used for viewing from another reachable device. File writes require localhost.

Requires Node.js 22.12+ and the pinned pnpm version in `package.json`. No extra plugin or online account is needed for these pages.

## Bench_draft: first review

1. Select **Manual Wafer Optical Measurement**. The workspace starts in **Explore**, with the **3D bench** selected.
2. Click equipment in the scene. The docked inspector shows its model, picture if available, specifications and installed information. **View equipment & documents** opens the complete record and CAD downloads. Keyboard users can open **Equipment & connection shortcuts**.
3. Try the views:
   - **3D bench**: orbit by dragging, zoom with the wheel, reset the camera, show labels or explode mainframe modules. Click a visible cable to inspect it. Selection and traced paths are highlighted.
   - **Bench plan**: view positions in millimetres. The suggested bench is 1800 × 900 mm, with a 25 mm grid. Equipment markers are labels, not measured footprints.
   - **Signal path**: the single equipment-card diagram for inspecting, positioning and connecting equipment.
   - **Overview**: the existing setup overview, using the same draft instances and connections.
4. Toggle **Optical**, **Electrical**, or **Supports** layers in the 3D and diagram views. Supports means equipment with no recorded signal connections. Bench plan shows physical items; Overview uses the current visible signal paths.
5. Select equipment or a connection and enable **Trace selection**. Tracing highlights its connected optical or electrical network, including branches; it is not an instrument simulation.
6. **Focus workspace** expands the editor. **Exit focus** or Escape returns to the normal page.

Illustrative has been removed as a duplicate tab from Build setup, Setup Explorer and Bench_draft. Old Explorer links using `tab=illustrative` open Signal path. Stored coordinates remain intact.

## Edit equipment placement and connections

1. Switch to **Edit draft**. Explore prevents changes to geometry, connection details and installation fields.
2. **Bench plan**: drag a marker or use arrow keys. Snap is 25 mm by default. The inspector also accepts X, depth, height and rotation in degrees. **Lock placement** prevents moving that instance. **Undo** reverses edits.
3. Mounted laser/sensor modules follow their mainframe. Bespoke fibre arms follow their assigned MAX313D stages. Move the parent housing or stage to reposition an assembly. Signal path card positions remain independent of physical bench coordinates.
4. **Signal path**: drag a card to reposition it. Select the connection type, then drag the equipment's **output circle** onto another equipment's **input circle**. Compatible inputs are highlighted during the drag. Optical sources have outputs, detectors have inputs, and recorded DUT/fibre components retain their recorded roles. Use **Installed record & readiness → Recorded signal role** to configure a custom source, detector or DUT/through component. Mechanical supports have no optical ports. Electrical roles still require confirmation against the installed equipment.
5. Select a connection to enter source/destination ports, fibre model, custom description, length, connector at **each end**, and notes. Different ends on a hybrid cable are allowed. Checks flag recorded PC/APC mismatches at a shared sleeve and the recorded FC/PC input on the O-band 81624B/81000FA detector.
6. Zoom the diagrams from 75–200%. Drag empty space to pan. The keyboard alternative is **Connect without dragging**.
7. **Equipment** opens a searchable drawer. Click + to add an instance, or drag a library item into the Signal path diagram. Add a compatible module first, then assign it in **Mainframe slots & module installation**.
8. Fill in the measurement settings and working guide below the editor. Checks use recorded scan ranges and power limits; they cannot infer missing specifications or approve a procedure.

Edit the draft display name under **Setup name & stable ID**. The setup ID remains fixed to keep browser and file saves consistent.

The 8163B and 8164B installation rules and confirmed O-band configuration remain available. The external 81624B is kept outside the mainframe, connected through the 81618A interface.

## Save, reload, review and publish

The status bar distinguishes browser autosave, the local draft file and the current published snapshot.

- **Browser autosave** keeps Bench_draft per setup in this browser/origin. Equipment_draft and Training_draft have their own keys. Existing Build setup data is separate.
- **Save draft locally** writes only into `public/library/workspaces_draft/`. It does not update `public/library/setups/`, the shared catalog or the publication index. An existing draft file gets a `.bak` copy before replacement.
- **Load local** reads the saved repository draft into the current workspace. Bench_draft loading is undoable. Equipment_draft loading replaces the current draft catalog.
- **Export** downloads a portable JSON copy. Bench_draft **Import** validates a version 1 workspace export and requires its setup ID to match the selected setup.
- **Review changes** lists changed equipment, connections, measurement values, guide steps and publication metadata compared with the published snapshot.
- To intentionally release a reviewed bench into normal **Setup Explorer**, expand **Publish to Setup Explorer**, complete its scale, mode, bands, location and description, then choose **Publish to Setup Explorer**. That updates `public/library/published/index.json` locally. This is separate from publishing a GitHub website.

These draft previews have not been promoted automatically. Keep an exported copy before clearing browser storage or changing from localhost to a future GitHub address.

## Equipment_draft

The page starts with a 3D preview. Switch to **Picture** for an equipment image. Missing assets have explicit empty states.

Search by model, name or stable ID; filter by category, missing model, missing picture, illustrative/unverified CAD or incomplete records. The checklist covers model, picture, CAD source, specifications, dimensions, serial/asset number, calibration record and source website. A completed checkbox indicates a field is recorded, not that the equipment is calibrated or approved.

**Edit draft record** changes the isolated catalog copy. Enter specifications one per line as `Label: value and units`. Record dimensions with units, installed options, calibration reference and supplier links. Picture and model paths must point to existing `library/images/` or `library/models/` assets. Save or export this draft catalog for review.

Equipment_draft edits are deliberately limited to this catalog preview: they do not replace the shared library used by Bench_draft or Setup Explorer. After review, apply chosen records through the existing shared **Admin**. **Open shared Admin for asset uploads** goes to that existing editor; its saves affect the shared catalog. It is not an isolated draft upload editor.

Preserve original STEP/STP and SolidWorks sources. GLB is the browser preview format. Native `.SLDASM`/`.SLDPRT` files remain downloadable sources; they do not render directly in the browser. The supplied vacuum chip stage still needs a STEP export. The supplied fibre-arm assembly source is retained, while its current browser geometry remains an illustrative reference.

## Training_draft

Select a setup and a **Published / catalog guide** or the browser's **Bench_draft guide**. Read one step at a time, inspect the highlighted related equipment, then use **Mark reviewed**, **Previous** and **Next**. Add session notes as you go.

Progress and notes restore per setup, source and guide contents. If the guide changes, old completion is not carried over. **Reset session** clears this source's checklist and notes. **Export training session** saves the notes, reviewed steps and guide as JSON. A reset does not alter the setup or equipment catalog.

Guides remain working outlines until the lab approves them. Reviewing a step does not operate hardware or record a measurement result.

## Where the files live

| Data | Repository location |
| --- | --- |
| Manual bench draft | `public/library/workspaces_draft/wst-optical-manual_draft.json` |
| O-band mainframe draft | `public/library/workspaces_draft/oband-mainframe-assembly_draft.json` |
| Equipment catalog draft | `public/library/workspaces_draft/equipment_draft.json` |
| Other saved bench drafts | `public/library/workspaces_draft/<setup-id>_draft.json` |
| Shared equipment catalog | `public/library/equipment.json` |
| Shared GLB previews / images | `public/library/models/` / `public/library/images/` |
| Original CAD and provenance | `public/library/references/` |
| Existing builder files | `public/library/setups/` |
| Published user setups | `public/library/published/index.json` |
| Training sessions | Browser storage, or downloaded `*-training_draft.json` |

New UI files are `src/components/*_draft.jsx`, `src/lib/workspace_draft.js` and `src/workspaces_draft.css`. Shared navigation and the existing 3D viewer have small supporting changes. Tests are in `tests/workspace_draft.test.js`. Temporary conversion tools, build products and draft `.bak`/`.tmp` files are ignored by Git. The production build also removes library recovery copies from its output.

## GitHub integration

The project uses relative asset paths, hash routes and `.github/workflows/deploy-pages.yml`. Source, draft JSON files and assets are maintained together in [zimmxx/cs-testsetup](https://github.com/zimmxx/cs-testsetup). The Pages address is [zimmxx.github.io/cs-testsetup](https://zimmxx.github.io/cs-testsetup/). The three draft pages use the same hash routes as localhost. Supplier-linked CAD and documents retain their original rights and recorded provenance.

```sh
pnpm test
pnpm build
pnpm preview
```

GitHub Pages is static: local write APIs and the local STEP converter are unavailable there. Viewing, browser drafts and JSON export still work. To share updates, save files locally before building/committing, or transfer exported JSON back into the local app. `Equipment_draft` exports retain the isolated catalog structure. The new workspace links keep working under a repository subpath because navigation lives in the hash.

The ignored `.local/cad-tools/` converter is optional for asset import, not needed for existing previews or production builds. Original CAD filenames and supplier hashes are retained; models labelled illustrative must not be treated as precision vendor geometry.

See [CHANGELOG_draft.md](CHANGELOG_draft.md) for implementation and verification notes.
