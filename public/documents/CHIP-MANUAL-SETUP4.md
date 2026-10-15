# chip-manual-setup4 — configuration and agent handover

Created locally 2026-10-13 from three user photos. User corrected the requested name from setup3 to **chip-manual-setup4**; the photographed shelf reads **SETUP 4**. This is an editable unpublished reconstruction, not an approved SOP or measured assembly.

Open `http://localhost:5174/#page=bench_draft&setup=chip-manual-setup4`. In Build setup choose its catalog template and Use template. Existing drafts/publications are retained. Source originals and hashes are under `library/references/chip-manual-setup4/`; saved editable setup and isolated draft use the same ID under `library/setups/` and `library/workspaces_draft/`.

## Evidence and equipment

20 instances, 17 unique equipment IDs; six new records with context pictures and illustrative STEP/GLB. Reused CAD is a provisional match, not proof that another bench's confirmed option/model applies here.

| Instances | Library assignment | Evidence / unknown |
| --- | --- | --- |
| `c4-mainframe` | `oband-mainframe-8164b` | Keysight-family housing, 8164B candidate |
| `c4-laser` | `oband-laser-81606a` | **81606A** model and **1310** label readable, horizontal slot 0 observed; exact wavelength option/range unknown |
| `c4-interface` | `oband-head-interface` | Head cable enters a vertical module; 81618A / slot 3 are provisional references |
| `c4-head` | `oband-head-81624b` | Black cylindrical external head with yellow band on the meter; model/adapter/connector unconfirmed |
| `c4-santec-laser` | `santec-tsl570-setup4` | Santec **TSL-570** label visible; installed option and active use unknown |
| `c4-santec-meter` | `santec-mpm210-setup4` | White modular Santec meter; MPM-210-family label/appearance candidate, suffix/modules/channels unknown |
| `c4-controller` | `wst-polarisation-manual` | Left paddle/loop unit; FPC562 candidate and direction unknown |
| `c4-input-stage`, `c4-output-stage`, `c4-aux-stage` | `fibre-arm-stage` | Two arm stages plus front-right accessory; MAX313D silhouettes provisional, auxiliary function unknown |
| `c4-input-arm`, `c4-output-arm` | `wst-fibre-arms-manual` | Opposing bespoke silver arms; supplied try3 CAD reused provisionally, spring/fibre omitted |
| `c4-holder` | `chip-vacuum-stage` | User confirmed the same supplied vacuum chip holder on 2026-10-13; actual STEP/GLB used. Plumbing/pressure/retention/fit pending. |
| `c4-dut-stage` | `chip-dut-translation-stage-v1` | Separate long front DUT motion assembly; exact model/travel unknown |
| `c4-microscope`, `c4-camera` | `chip-microscope-body-v1`, `wafer-camera-head-2` | Microscope/focus/post and button-control camera reference silhouettes; exact optics/interfaces unknown |
| `c4-upper-display`, `c4-lower-display` | `chip4-upper-display`, `chip4-lower-display` | Light-framed upper and smaller black lower monitors; input assignments unknown |
| `c4-pc`, `c4-shelf` | `chip4-pc-tower`, `chip4-shelf` | Tower behind instruments and aluminium shelf/gantry; dimensions/interfaces estimated |

Manufacturer references: [Santec TSL-570](https://inst.santec.com/products/test-and-measurement/tunablelaser/tsl-570) and [MPM-210 manual](https://www.santec.com/dcms_media/other/instruments_MPM-210-M-E.pdf), checked 2026-10-13. These references describe product families, not this unit's configuration. No vendor CAD is supplied/claimed; new STEP geometry is procedural, dimension estimates remain unverified.

## Paths and mechanical layout

The proposed editable Keysight optical route is `81606A → paddle controller → left arm → DUT → right arm → external head`. The head cable to the plug-in interface is a separate electrical/head link, not DUT bias. User confirmed the **Keysight 81606A / external detector head is the active default** on 2026-10-13. Both Santec instruments remain **unconnected alternatives**. Their presence does not imply simultaneous operation, and no optical switch or splitter is invented.

Three workstation candidates are camera → tower, tower → each monitor. Actual camera/display routing can differ. Blue fibre colour, green boots and the 1310 sticker do not establish cable part numbers, connector polish, optical range or tip preparation. Candidate above-chip free-space coupling remains to confirm. Thin red/black leads are observed but not traced to a measured DUT bias circuit.

Mechanical coordinates use millimetres, X left/right, positive Z toward operator, Y above table; GLB uses metres. Shelf fronts face the positive-Z default camera. Corrected arm previews face inward at yaw 0°/180°. Mainframe slots, rigid shelf supports and camera mount follow their parents; arm and holder stages are separate. These relationships are visual placements, not solved face mates. The table uses the existing illustrative bench, not a second table model.

## Parameters to collect

- Confirmed active system: Keysight; collect installed laser option/range, exact head/interface and slots, MPM suffix/modules/channels, actual port/trigger/control links.
- Fibre path: input/output direction, controller role, sleeve count, each fibre model/SM-PM/length/cut length, connector at EACH end, tip preparation, grating/edge coupling and angles.
- Mechanics: chip holder retention/vacuum/heating, DUT and arm-stage models/axes/travel, auxiliary stage function, measured coordinates/bench dimensions/clearances.
- Imaging: camera/objective/focus/illumination models, microscope magnification, actual PC and monitor interfaces; identify any active illumination or electrical bias before adding links.
- Measurement: serial/calibration/reference, approved power and device limits, scan/readout, chip/device map, SOP, data folders/naming, post-processing and measured timings.

All numeric acquisition settings remain empty. Do not copy 10 mW, 10°, the other bench's 1240–1380 nm confirmation, FC/PC adapter assignment, unconfirmed detector/interface identity as facts. O-band is a provisional filter allocation from the photographed 1310 label. Library specifications refer to reference models; the instance notes describe applicability to this bench.

## Agent continuation

Read CONTEXT and PHOTO-TO-SETUP before editing. Keep this setup separate from optical-chip-testing-v1 and wafer-manual-setup-2. Add dated user confirmations to the evidence manifest and instance records. Change incorrect assignments rather than modifying shared equipment identities. Retain original source files/hashes, provenance and old CAD revisions. Prefer verified vendor/user geometry, validate source units/Y-up/front direction and keep STEP/GLB/provenance consistent. Native SolidWorks mating is performed in SolidWorks; whole local STEP export does not reconstruct native feature history.

Validate schemas/IDs, slot and mount references, independent seeds, picture/CAD hashes and preview loading. Exercise selection, picture/3D toggle, rotation/Undo, path inspection and source-photo panels. Save locally; publication, Git PR and Pages deployment are separate reviewed actions. Do not auto-publish this reconstruction or delete other drafts.

Preparation scripts: `scripts/generate-chip-setup4-cad.py` and `scripts/prepare-chip-setup4.mjs`. Existing files/records are preserved; source-photo byte conflicts are rejected. This is agent-assisted photo reconstruction, not autonomous computer vision.
