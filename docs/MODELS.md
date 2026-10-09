# Detailed equipment models

The user selected detailed models based on photos, dimensions or vendor CAD on 30 September 2026. Uploading, previewing, selecting and arranging GLB equipment models is implemented. Accurate instrument geometry remains dependent on reference files.

## Difficulty and inputs

Vendor CAD is the most direct starting point: confirm the exact variant, convert it to a polygon mesh, simplify unseen geometry, add materials and export GLB. Photo-only modelling requires manual reconstruction, measured dimensions and multiple views. Fibre ports, connector orientation and moving arms need additional detail. A single bench photograph cannot establish hidden geometry or all dimensions.

For each model, collect the manufacturer/part number, front/side/rear/top photos, dimension drawings or measurements, vendor CAD if available, and a port list. Prioritise the chip stage, laser/mainframe, detector, polarisation controller and fibre arms. Record source and licence in Admin.

## Asset workflow

1. Store source references in `public/library/references/`, or privately outside the repository if they should not be published.
2. Build or convert geometry in a CAD/modelling tool. Preserve the source version and equipment variant. Export self-contained GLB 2.0 without Draco/Meshopt/KTX2 compression.
3. Open Admin through `http://localhost:5174/#page=admin`. Select or add the equipment, attach its picture and GLB, and record physical dimensions, source and verification notes.
4. Orbit and zoom to inspect the model. Save equipment to link the asset into the library.
5. Add it in Build setup. The overview, 3D and signal views share nodes and connection records.

The setup scene uses GLB metre units on an illustrative 1800 × 900 mm optical bench. Single-equipment previews normalise the size for inspection. Bench X/depth, height and rotation are editable in the instance inspector; diagram Layout X/Y are independent. Arms follow their support stage instance. Vendor geometry retains its converted proportions, while generated references use estimated dimensions. This is not a clearance calculation, an assembled mechanical design or an approved installation. Paths connect equipment positions; port names and connector ends remain metadata rather than CAD port snapping.

The viewer uses [Three.js GLTFLoader](https://threejs.org/docs/pages/GLTFLoader.html) and OrbitControls. Compressed models need additional decoders, so the current workflow uses self-contained, uncompressed GLB.

## First converted model: Thorlabs FPC562

On 7 October 2026, the user supplied `FPC562-Step.step` and identified it as FPC562. Original CAD and provenance are retained in `public/library/references/fpc562/`. The browser copy is `public/library/models/fpc562.glb`, linked to `wst-polarisation-manual`. The generic controller also uses it as an explicitly unconfirmed visual reference.

Conversion uses the standalone `scripts/convert-step.mjs` with [occt-import-js](https://github.com/kovacsv/occt-import-js) 0.0.23, installed separately as a local tool. Example: `node scripts/convert-step.mjs input.step output.glb /path/to/occt-import-js`. The converter is not bundled into the website.

This assembly has 34 meshes and 182,484 triangles. Source axes are preserved. Millimetres are converted to metres in the GLB. CAD bounding extents are X 317.5 mm, Y 92.583 mm, Z 31.4198 mm; these are not measurements of the installed device. Neutral material is used when the source has no colours. Mesh and conversion metadata are stored next to the GLB. Original CAD and vendor redistribution permissions should be reviewed before public publication. The source CAD is a static assembly; paddle actuation is not implemented.

## Equipment CAD coverage — 8 October 2026

All 30 library records have local STEP/STP references and validated GLB geometry. See `docs/EQUIPMENT-CAD-REVIEW.md` for the source and limitation of every assignment. Vendor models include FPC562, MAX313D, ADAFCPMB2, P3-1550PM-FC-2, P3-SMF28Y-FC-5, P3-1550PM-FC-5 and Keithley 6487. Generic controller/stage records borrow vendor models as **unconfirmed references**. Remaining geometry is clearly marked **Illustrative reference**.

Generated STEP references are closed planar faceted BREPs. They import as solid reference geometry; they are not native SolidWorks feature trees or editable vendor parametric assemblies. `scripts/generate-reference-cad.py` writes the geometry; `scripts/prepare-reference-library.py` seeds missing library references. The library preparation tool preserves records with an existing STEP assignment unless explicitly run with --refresh. These are maintenance tools, not automatic startup tasks: back up equipment.json before regenerating, and preserve subsequently supplied CAD.

The 81940A reference uses the supplier’s 819xxA family photograph and its published 32 × 75 × 335 mm body envelope. Vents, connectors and extraction latch are approximate. The 8163B and E3640A use published enclosure envelopes with approximate front details. The N7776C, N7749C and 8162-C head are provisional shapes; the head variant is unknown.

### Update with a new STEP

1. Open Admin on localhost, select the equipment and choose the source up-axis. Use Y-up to retain axes or Z-up to rotate source Z to viewer Y.
2. Attach STEP/STP and convert. Source CAD is retained under `public/library/references/<equipment-id>/`; the browser GLB and conversion metadata go under `public/library/models/`. Nothing is sent to an external converter.
3. Inspect orientation, units, mounting surfaces and detail in the preview. Record the original vendor/source and CAD accuracy. Uploaded files are labelled **User-provided CAD** until reviewed.
4. Save to library. The uploaded files are not linked to the catalog until this save.

Conversion runs only on the local development server when the separately installed `.local/cad-tools/package` tool is present. A static GitHub deployment can display and download existing assets, but cannot run the local conversion or write project files. Fallback: convert in SolidWorks/another local tool to GLB and attach the GLB.

The original bespoke arm parts and Inventor drawings are preserved. Both arm records (`wst-fibre-arms-manual` and `fibre`) now display the user-supplied `Fibrearm_assembly_try3.STEP` export received 9 October 2026, converted to `public/library/models/fibre-arm-try3-inward.glb`. Y remains the up-axis; the preview has a 180° yaw correction because the source tip points along -X while the existing bench layout expects +X. This makes opposing arm tips face the DUT without changing instance rotations or source CAD. The prior uncorrected GLB is archived. Its 11 mesh parts have a CAD bounding box of approximately 165.6 × 87.8 × 32.0 mm. The spring and fibre are omitted as confirmed by the user; fit and travel remain unverified. The STEP, SLDASM and auxiliary DWG originals, hashes and provenance are stored under `public/library/references/wst-fibre-arms-manual/`; try2 and earlier illustrative sources remain archived. Native SLDASM editing may require referenced SLDPRT files. The Picture tab retains the earlier try2 screenshot with an explicit label. Vendor cable CAD depicts uncut reference geometry, not the cleaved tips or the full installed cable route.

## Vacuum chip sample stage

The vacuum chip sample stage (`chip-vacuum-stage`) now has a user-supplied STEP/GLB preview. STEP and SLDPRT originals received 9 October 2026 are in `public/library/references/chip-vacuum-stage/` with checksums and `vacuum-stage.provenance.json`. Source Y-up is retained; CAD X/Y/Z bounds are 85 × 25.5 × 64 mm. It is the user-confirmed holder in `optical-chip-testing-v1`, mounted on the separate DUT translation stage; its stable instance ID and optical endpoints are unchanged. Vacuum fittings, pressure, retention and fit require confirmation. The current Picture tab is an explicitly labelled bench context image, not an isolated photograph of this part.

## O-band assembly references

The 8164B, 81606A, 81618A, external 81624B and 81000FA are separate library records with illustrative STEP and GLB models. Slot 0 is horizontal and back-loadable; Slots 1–4 are vertical compact bays. The head is external and links electrically to the confirmed Slot 3 interface. See [O-band assembly](O-BAND-MAINFRAME.md) for paths, confirmed data and remaining model limitations.

## Whole-setup export and orientation — 9 October 2026

Builder and Bench_draft now support yaw, tilt and roll plus parent-relative rigid mounting. Whole-setup STEP export on localhost places the original BREP sources at the same registered world poses as the viewer, including preview-axis corrections. Source subassemblies are complete compounds within each named equipment component; repeated equipment remains separate instances. A JSON manifest retains IDs, source paths/hashes and app mounting relationships. Import the STEP as an assembly in SolidWorks, save native parts/assembly, and add actual mechanical mates there. Feature history and mate constraints are not reconstructed from STEP. See [SolidWorks handoff](../public/documents/SOLIDWORKS-HANDOFF.md) for install/import/return steps and static Pages limitations.
