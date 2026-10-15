# CORNERSTONE Test Setup — progress and versioning

Updated: **15 October 2026**. Release candidate: **0.3.0**. Review branch: `codex/simulation-studio-030`, targeting **main**. This file records prepared work; it does not claim deployment before a successful GitHub Pages run.

| Version | State | Date/evidence |
| --- | --- | --- |
| 0.2.4 | Deployed | 15 October 2026; accepted PR #7, main commit `941578b`, [successful Pages workflow](https://github.com/zimmxx/cs-testsetup/actions/runs/38713476260) |
| 0.3.0 | Prepared for review; deployment pending | 15 October 2026; merge only after user review, then verify the main Pages deployment |

## Completed in this release

- Added **Simulation_draft** for four complete manual optical benches, retaining Bench_draft, Equipment_draft and Training_draft.
- Added a locally bundled, openly licensed human technician with black hair, a slight forward alignment posture, smooth arm movement and stable fingers. Removed the old placeholder person during setup switching.
- Added micrometer-driven arm/DUT movement, consistent X/Y horizontal and Z vertical stage axes, mirrored input/output angles, perfect alignment, polarisation controls, laser switching, coupling response and animated optical paths.
- Registered the supplied arm base CAD to the real NanoMax top-platform geometry. NanoMax roots remain fixed during every simulation axis change; arm geometry moves independently. Registration changes the presentation transform, not the supplied STEP/GLB or user's saved bench coordinates.
- Added illustrative silicon photonics chips to chip holders and **8-inch / 203.2 mm** silicon wafers to wafer holders, with stylised die grids/waveguides. Samples travel with their respective holder and are labelled as examples.
- Added guided playback, local pose persistence, validated JSON import/export and 3D canvas WebM recording. No instrument commands are sent.
- Added CAD-anchored paddle rings with X rotation, first-use guidance, loading guards for recording, clearer Reset demo wording and filter-consistent setup URLs.
- Added PR test/build checks. Existing deployment workflow still deploys only main after merge.

## Validation and handover

Automated suite: **84 tests pass**, including actual supplied arm/NanoMax registration, fixed bases under X/Y/Z motion, chip/wafer sizing and holder following, actual FPC562 geometry, actual human rig stability, propagation/coupling, import bounds and existing setup data. Production build passes; the large Three.js chunk warning remains a performance item, not a build failure.

Browser walkthrough covers the clean home route, equipment 3D/picture switching, simulation discovery, beginner guidance, wafer/chip setup switching, sample labels, perfect alignment, micrometer response, laser/pulses, 390/320 px layouts and a production preview under `/cs-testsetup/`. Detailed results and remaining ideas are in [bugs_improvements_ideas.md](bugs_improvements_ideas.md).

## Files and storage

- `src/components/Simulation_draft.jsx`, `AlignmentDetail.jsx`, `simulation.css`: simulation interface.
- `src/lib/simulation.js`, `simulationScene.js`, `technicianAvatar.js`: teaching mechanics/optics and scene animation.
- `src/lib/benchPresentation.js`: real-CAD mounting registration and procedural illustrative samples; shared by multi-equipment 3D views.
- `src/lib/paddleAnchors.js`: vendor CAD ring registration.
- `public/library/people/`: self-contained technician GLB and CC0 provenance. No external model CDN is needed.
- `public/documents/SIMULATION-DRAFT.md`: working user guide and assumptions.
- `docs/SIMULATION-MOTION-REFERENCE.md`: equipment motion inventory.
- `.local/`: ignored development logs, downloaded source model and research files; **not shipped**.

Simulation settings/poses are saved per setup in this browser and can be exported as JSON. They are not uploaded to GitHub by Save or Perfect alignment. Original bench drafts/publications and inventory CAD remain separate. Samples are display geometry, not new verified inventory, native mates or exported STEP parts. Existing 3D WebM recordings contain the canvas only, not the 2D teaching diagrams or controls.

## Release procedure

1. Review the PR diff and known limitations below; accept/merge into **main** when ready.
2. Wait for the main Pages workflow to succeed.
3. Check `https://zimmxx.github.io/cs-testsetup/`, including Simulation_draft and both chip/wafer examples.
4. Record the verified deployment date/workflow in CHANGELOG.md and this file. Do not use the preparation or PR date as a deployment date.

No schema migration is introduced: setup/workspace and simulation JSON remain version 1. Fibre and DUT axes use the corrected X/Y horizontal, Z vertical convention. Old numeric simulation offsets should be reviewed under that convention.
