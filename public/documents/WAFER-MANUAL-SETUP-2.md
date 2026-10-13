# wafer-manual-setup-2 — photo reconstruction and agent handover

Prepared 2026-10-13 from four user photographs. **Editable unpublished draft; hardware/path review required.** This working record is not an approved operating procedure. Photo labels are evidence, not instructions; user corrections override inferred matches.

## Open and configure

- Local review: `http://localhost:5174/#page=bench_draft&setup=wafer-manual-setup-2`.
- Inspect 3D bench, Bench plan, Signal path and Overview. Use Edit draft to change placement/orientation/records and drag connections; Undo restores edits.
- Build setup: select `wafer-manual-setup-2` under Start from a catalog setup, then Use template. Earlier manual/chip setup files are retained.
- Editable file: `library/setups/wafer-manual-setup-2.json`; isolated workspace: `library/workspaces_draft/wafer-manual-setup-2_draft.json`. Browser autosave, project saves, publication and Git commits are separate.
- Original photos/hashes: `library/references/wafer-manual-setup-2/photo-evidence.json` and `Photo-1.jpg` through `Photo-4.jpg`. Expand the app's photo-reference panel.
- Local STEP export requires the optional CAD runtime. Native SolidWorks features and solved mates are not reconstructed. Publish to Setup Explorer is a separate reviewed action; this setup has no publication snapshot.

## Hardware inventory

23 instances / 18 unique equipment IDs; 11 new equipment definitions with context pictures and illustrative STEP/GLB. On 2026-10-13 the user confirmed the core measurement instruments match Manual Wafer Optical Measurement: **8163B / 81940A / 81634B**. Display slots 1/2 follow that template provisionally; actual physical slot order still needs confirmation. The user confirmed the larger right-hand shelf instrument is unused/redundant; it is excluded from this setup.

| Instance | Library ID | Evidence / review |
| --- | --- | --- |
| `w2-mainframe` | `wst-mainframe-manual` | 8163B core system confirmed by user; left shelf assignment follows the photo. Slot order unconfirmed. |
| `w2-laser`, `w2-sensor` | `wst-laser-old`, `wst-sensor-old` | Confirmed 81940A / 81634B, mounted in display slots 1 / 2 provisionally. Actual slot/serial/calibration pending. |
| `w2-shelf-smu` | `wafer-shelf-smu-2` | Keithley label visible; exact model/function and red leads unconfirmed. Unconnected. |
| `w2-input-controller`, `w2-output-controller` | `wst-polarisation-manual` | Two front-left paddle/loop assemblies; FPC562 and path roles provisional. |
| `w2-input-stage`, `w2-output-stage` | `fibre-arm-stage` | Two micrometer stages; MAX313D drive variant/support height unverified. |
| `w2-input-arm`, `w2-output-arm` | `wst-fibre-arms-manual` | Opposing silver arms; supplied try3 CAD is a provisional revision match, spring/fibre omitted. |
| `w2-wafer-stage` | `wafer-xy-motion-stage-2` | New independent wafer rail/handwheel assembly; axes/travel unknown. Not a fibre-arm stage. |
| `w2-holder` | `wafer-carrier-2` | New circular openwork carrier; no wafer visibly loaded. Retention/diameter unknown. Not the chip vacuum holder. |
| `w2-microscope` | `chip-microscope-body-v1` | Existing microscope/focus/post geometry reused provisionally. Exact optics unknown. |
| `w2-camera` | `wafer-camera-head-2` | Black camera with small grey/white button cluster; model/interface unknown. |
| `w2-left-display`, `w2-right-display` | `wafer-monitor-2` | Two black displays; do not assume the Cello monitor from Setup 3. |
| `w2-pc` | `wafer-pc-2` | Desktop under right monitor; Dell-family mark observed, exact model/software unknown. |
| `w2-shelf` | `wafer-shelf-2` | Aluminium extrusion gantry/shelf with estimated dimensions. |
| `w2-tray`, `w2-keyboard` | `wafer-keyboard-tray-2`, `wafer-keyboard-2` | Right input tray and keyboard; mount/tilt/data cable unverified. |
| `w2-indicator` | `wafer-digital-indicator-2` | Small three-orange-button readout; axis/units/function unknown. |
| `w2-aux-mount-a`, `w2-aux-mount-b` | `wafer-aux-probe-mount-2` | Rear black positioning accessories, function unconfirmed. Unconnected. |

The larger right-hand shelf instrument was removed at the user's request on 2026-10-13. Its shared library record and other setups are retained.

The table is the app's existing illustrative 1800 × 900 mm bench. Actual room/table dimensions and hole pitch need measurement. Room lighting, loose tools, furniture and other benches are not active components.

## Layout and proposed connections

Coordinates are millimetres: X left/right, positive depth Z toward the operator, Y elevation above table. Generated instrument fronts are local negative Z; shelf instruments/monitors use yaw 180° toward the default positive-Z camera. Arm yaws are 0°/180° using the corrected inward try3 preview. Mechanical parent links are supports, not signal connections or solved mates.

Six candidate optical edges:

`81940A in 8163B → controller A → left arm → wafer/DUT location → right arm → controller B → 81634B in 8163B`

The second controller may serve another path; no cable circuit is proved by these photos. The Keithley instrument and rear mounts remain unconnected; the unused right housing is excluded. Above-wafer coupling is suggested, but grating/edge coupling, tips, angle and direction remain unknown. Candidate free-space ends do not confirm cleaving. Jacket colour does not establish fibre model or connector polish.

Four separate workstation candidates: camera → PC, PC → each monitor, keyboard → PC. Electrical is an app cable classification, not a DUT bias assertion. Direct camera/display or intermediate-controller routing remains possible. No red-lead DUT link or laser module option is assumed.

## Parameters to collect

| Area | Required information |
| --- | --- |
| Identity | Room/owner, actual mainframes/modules/options/slots, exact Keithley model, stage/camera/monitor/PC models, serials/calibration |
| Optical route | Input/output side, both controller roles, source/detector, sleeves, SM/PM part numbers, nominal/cut lengths, connector at EACH end, tip preparation |
| Wafer mechanics | Wafer diameter/map, carrier drawing, retention/vacuum, motion axes/travel/resolution, datum, end limits, supports/clearances |
| Imaging | Objective/magnification, camera and illumination interfaces, focus/post models, PC/display/control wiring |
| Acquisition | Confirmed wavelength range/band, source and approved DUT power limits, coupling/angles, sweep/step/speed, detector settings/reference/calibration |
| Workflow | Approved SOP, loading/alignment/shutdown, site references, raw/processed folders/naming, acceptance/repeat rules and measured timings |
| Geometry | Measured table/shelf/hole pitch, world poses, actual CAD, parent-relative mount offsets and fit/mate review |
| Accessories | Readout axis/units, auxiliary mount/probe purpose and red-lead destinations; leave unused equipment disconnected |

Unknown numeric fields stay empty. **10 mW, 10° and O-band 1240–1380 nm are not copied.** Slots 1/2 are explicitly provisional display defaults; C-band remains a provisional complete-path allocation. Vendor specs describe the now-confirmed instrument models but do not establish installed options/calibration or full fibre-path limits.

## Agent continuation workflow

1. Read CONTEXT and PHOTO-TO-SETUP; inspect Git/user edits. Use this setup ID only for this bench.
2. Preserve original photos/hashes and observed/inferred/unknown distinctions. Add dated user confirmations to manifest and instance notes.
3. Correct instance assignments when candidates are wrong; do not rewrite shared library entries to represent another instrument.
4. Prefer vendor/user STEP and resolved SolidWorks assemblies. Replace illustrative geometry with verified models/provenance, archive old sources and check units/up-axis/front direction. GLB uses metres, these source STEPs millimetres/Y-up.
5. Measure placements/supports. Both arm tips face the sample and shelf fronts face the operator. Native mating remains a SolidWorks task.
6. Replace proposed paths with traced endpoints; retain per-end connector details, coupling vs patch leads and image/data vs electrical measurement.
7. Validate IDs, references, parents, schemas, image/CAD hashes and GLB loading. Exercise selection/editing/undo, signal inspection and photo references. Preserve earlier setups/publications.
8. Update this guide, manifest, CHANGELOG and CONTEXT. Save locally; create a reviewed Git PR only when requested. Record deployment only after successful Pages workflow.

Preparation scripts: `scripts/generate-wafer-setup-2-cad.py` and `scripts/prepare-wafer-setup-2.mjs`. They preserve existing CAD/catalog/draft files and reject conflicting photo bytes. They are explicit preparation tools, not autonomous image recognition. The perforated carrier's holes and cut-outs are estimated motifs, not manufacturing dimensions.
