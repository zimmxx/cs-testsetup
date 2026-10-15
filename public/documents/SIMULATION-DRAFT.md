# Simulation_draft — interactive alignment studio

The operator is a textured, skinned human technician adapted from Innerscene's CC0 Harper model (MakeHuman/MPFB assets). It loads from `public/library/people/lab-technician.glb`, with a blue/grey work jacket, dark trousers, black hair, ID badge, gentle procedural breathing and smooth bench reach/wrist gestures. One pose controller keeps relaxed fingers and fixed bone proportions, with damped target/joint transitions and limited wrist twist. The bundled source idle clip is not played over alignment IK. Arm reach preserves the skeleton's segment lengths; targets outside its reach are clamped rather than stretching the mesh. The figure stands in front of the optical table and uses only a slight 7° forward lean toward the controls, standing upright during approach. While changing setups, the bench displays “Loading technician…” until the detailed person is ready. A failed model load shows a retry message; the old basic figure is no longer used. These are illustrative gestures, not validated ergonomics or a PPE procedure. See [model source and licence](../library/people/ATTRIBUTION.md).

Release candidate 0.3.0 prepared 2026-10-15. Open `http://localhost:5174/#page=simulation_draft&setup=wst-optical-manual`. The same page supports optical-chip-testing-v1, wafer-manual-setup-2 and chip-manual-setup4 when their graph has a connected source, two arms and a DUT holder.

This is a visual teaching workspace. It sends **no commands to instruments**, does not modify STEP/GLB, solve native mates, approve a lab procedure or predict measured power. C/O-band propagation is drawn with visible cyan/violet colours and slowly moving packets for explanation; neither the colours nor packet timing represents real IR visibility/transit time.

## Try the demonstration

FPC562 paddle rings are anchored to the actual vendor CAD cover centres and 56 mm loop diameter, including the equipment's displayed scale and orientation. They remain hidden until the matching geometry is loaded; the source CAD is unchanged.

Press **Perfect alignment** in the micrometer controls to put both fibres at **100% input/output alignment** for the current sample position and yaw, using the assumed optimal fibre angle. It stops playback and preserves laser, optical power, polarisation and sample settings. If a rotated sample is too close to the ±2 mm travel limit to align both arms, move it away from the stop first. This action aligns the fibres; it does not remove the teaching model's DUT loss or optimise the paddles. Paddle overlays rotate about the controller's X axis.

Turn on the virtual laser to see moving light pulses in the 3D bench and magnified fibre/PIC views. Input packets travel toward the input grating, through the waveguide and up the output fibre toward the detector. Their brightness follows the illustrative coupled power: poor input alignment dims the waveguide, while poor output alignment dims or removes the output stream and detector indicator. **Light packets** toggles the overlays; **Animate operator / light** pauses their motion. Switching the laser off clears all pulses immediately. Packet timing is symbolic, not the physical speed of light.

1. Choose a setup. Simulation takes a copy of that setup's browser Bench_draft, validated against the equipment library; otherwise it uses the published/template seed. It never writes that draft or publication. Refresh the simulation page after editing its source Bench_draft elsewhere.
2. Press **Play guided demo**. The operator approaches, the virtual source lights, input/output tips move toward the teaching datum, the DUT scans across the coupler and the laser switches off at the end. The sequence lasts 32 simulated seconds; 0.5×/1×/2× and pause/resume are available. Reset restarts at deliberate misalignment.
3. Switch the virtual laser on manually to explore the graph. Only optical links reachable from the selected connected source light. Disconnected sources/detectors and electrical/video/head cables do not glow. Power is attenuated as it enters/crosses/leaves the model DUT; there is no implicit optical switch to an inactive Santec instrument.
4. Select Input fibre, Output fibre or Chip/wafer. Turn the schematic knob by dragging around its circumference, use ± buttons, arrow keys (Shift for 10 steps, Home for zero), sliders in the PIC diagram, or enter a displacement. For both fibre-arm and chip/wafer stages, X is lateral, Y runs along the grating and Z is vertical (surface normal), corrected from user feedback.
5. Use the magnified top view to drag tips in X/Y; the side view shows height offset and angle from the surface normal. The bench motion can be visually magnified 1×–1000×, default 600×. The diagrams and mock PIC/grating are illustrative, not a chip mask or measured geometry.
6. Explore DUT yaw and fibre angle. Chip/wafer carriage and the two fibre-arm stages are independent. Static base/rail CAD is retained; schematic moving carriage/drive/paddle overlays and attached arms/holder animate. Imported STEP files contain geometry, not named working mechanical joints. Mechanical collision/fit and force/preload/backlash are not solved.
7. Turn the three polarisation paddles and watch the example TE signal change. This is an ideal quarter/half/quarter-waveplate calculation, not a calibrated wavelength-dependent model of the installed FPC.

## Record your own animation

- Make an adjustment and press **Add pose**. Each pose retains three-axis offsets, tip/DUT angles, virtual power/laser state, paddles and display settings. Up to 40 named poses are supported. Recall restores a pose with the virtual laser **off**. Play poses interpolates four seconds between poses using the currently selected source, then switches it off at completion.
- **Export sequence** saves a version-1 `<setup>_simulation_draft.json`. **Load animation** accepts only the matching setup, bounded finite values and at most 40 poses. Import leaves the virtual laser off. Simulation browser storage uses the separate `cs-testsetup:v1:simulation_draft:<setup-id>` key; exporting JSON is the portable copy. No GitHub/catalog/project setup save occurs automatically.
- **Record bench video** captures the Three.js canvas as WebM at up to 25 fps, without controls, audio or the separate SVG inset. No screen/camera access is requested. Start recording, run the demo or adjust controls, then Stop & download video. Recording also ends after completed playback or 60 seconds. Browser recording support is required; otherwise use an OS screen recorder. A browser-native recording is not a CAD animation/mate export.
- A hidden/background tab pauses playback and switches the virtual laser off. Reduced-motion preference disables moving operator/packets initially; the checkbox can be changed deliberately. Saved simulation state never resumes with the laser on after a page reload.

## Reference mechanics and chosen limits

The installed-model candidate MAX313D is a manual three-axis NanoMax with differential adjusters, **no piezo actuation**. The [manufacturer's NanoMax reference](https://www.thorlabs.com/catalogpages/Obsolete/2018/MAX341.pdf) describes 4 mm stage coarse travel and 300 µm fine travel. The demonstration uses centred ±2 mm coarse / ±150 µm fine travel, not actual installed zero/end positions. The [DRV3 drive reference](https://www.thorlabs.com/NewGroupPage9_PF.cfm?ObjectGroup_ID=1231) states 500 µm/rev coarse and nominally 50 µm/rev fine, with non-linear fine graduations. The standalone drive's 8 mm travel must not be confused with that NanoMax stage's 4 mm range. These are reference-family values; candidate stages and drive variants still need checking.

Pitch is editable for unknown DUT stages. In the simulator, displacement increment = knob angle / 360 × pitch; a linear nominal teaching approximation, not differential-drive metrology. The selected range clips offsets rather than wrapping. Sample yaw is an optional teaching adjustment ±5°, not an assertion that the actual translation stage contains a rotary bearing. Fibre angle targets can be set explicitly; default 10° is a teaching assumption, including on photo benches with unconfirmed angles.

The [manufacturer's controller reference](https://www.thorlabs.com/Images/PDF/vol18_832.pdf) describes the three-paddle controller concept. The ideal Jones implementation applies QWP/HWP/QWP to a TE input, then projects onto TE. The actual retardance depends on fibre, turns, tension and wavelength and is not inferred from CAD.

Each equipment library record is classified in the expandable **Equipment motion reference**. Sources switch a virtual output, detector readouts follow reachable power, frames/displays/cameras/passive parts remain reference bodies, known arm/DUT supports use teaching carriage controls and unknown hardware has no invented native joint. See the generated `docs/SIMULATION-MOTION-REFERENCE.md` for the per-record matrix. The interface can open each original equipment record and its source/specifications.

## Optical assumptions

- Per-tip overlap is a Gaussian teaching response to relative lateral/longitudinal/height displacement and fibre angle: characteristic scales 5 / 7 / 12 µm and 3°. These values are chosen examples, not measured device mode sizes.
- DUT yaw changes the target locations using an assumed 250 µm coupler separation. The displayed waveguide and gratings are a schematic.
- Intrinsic DUT transmission is fixed at **70%** in this prototype. Thus perfect alignment, TE fraction 1 and virtual input 1 mW produce **700 µW** at a reachable detector. This is a deterministic illustration, not a CORNERSTONE capability or calibrated measurement.
- The virtual wavelength selector changes teaching colour. It does not verify source/head/fibre compatibility, simulate dispersion or change a real laser. No published/inferred band capability is upgraded by selecting it.
- Directed graph propagation is passive and terminates on cycles. Unconnected detector heads report zero. Optical light on the PIC and return fibre depends on graph reachability as well as overlap, not just the source toggle. Recorded electrical/head/video links are separate.

## Source and continuation map

- `src/components/Simulation_draft.jsx`: separate session controls, snapshots/playback, native browser video recording and scoped persistence.
- `src/components/AlignmentDetail.jsx`, `simulation.css`: accessible micrometer dials, top/side PIC views and responsive layout.
- `src/lib/simulation.js`: pure stage classification, bounded knob displacement, ideal polarisation/coupling, directed passive graph, demo poses and validated imports.
- `src/lib/simulationScene.js`: optional layer for the existing ModelScene; operator rig, schematic carriage/handles/paddles, source marker and light packets. Normal Explorer/Builder/Bench rendering remains unchanged when no simulation prop is supplied.
- `tests/simulation.test.js`: independent mechanics/optics/graph/import/scene checks alongside existing setup/CAD tests.

Future improvements need measured stage/drive datums and travel, actual rotation pivots/joint labels, resolved SolidWorks subassemblies, physical fibre-tip endpoints, measured coupling maps/mode dimensions and calibrated loss/polarisation data. Replace schematic overlays only when those relationships are verified. Preserve `_draft` isolation and source CAD. Browser JSON/WebM exports are not pushed to GitHub automatically. This local prototype is not deployed by its creation.

## Bench mounting and dummy samples

NanoMax bases retain their bench poses during alignment. Only the mounted fibre-arm roots move; CAD registration places the named supplied arm foot on the NanoMax top plate instead of the centre of its bounding box. Original CAD and saved bench coordinates remain unchanged. Chip holders show an illustrative PIC chip and wafer holders show an 8-inch / 203.2 mm silicon wafer with a stylised die grid. Samples follow the holder. Geometry and clearances are examples, not confirmed sample specifications, native mates or extra exported STEP parts. Review the repository PROGRESS.md and bugs_improvements_ideas.md before release acceptance.
