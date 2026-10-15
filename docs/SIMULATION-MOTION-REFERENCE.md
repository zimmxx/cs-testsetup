# Simulation motion reference

Prepared 2026-10-15. Classification of all 54 library records for the local teaching prototype. These classifications do not verify photographed model identities, native joints or installed limits. Unknown equipment remains a reference body. The linked specifications belong to library reference models.

See [Simulation guide](../public/documents/SIMULATION-DRAFT.md) for mechanics/optics assumptions and manufacturer sources.

| Equipment ID | Reference model | Representation | Motion | Evidence / limits |
| --- | --- | --- | --- | --- |
| laser | Keysight 81940A | Source | Stationary; virtual laser output on/off | Only connected optical graph edges light. No real device control. |
| polarisation | Thorlabs · manual 3-paddle | Polarisation | Three paddle rotations | Ideal QWP/HWP/QWP model; actual retardance depends on fibre, turns and wavelength. |
| stage | Thorlabs NanoMax · 3-axis | Positioning | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| fibre | Bespoke arms · Thorlabs fibre | Adjustable arm | Follows supporting stage; tip angle set separately | User CAD has no spring/fibre or articulated mates; moving handle overlay is schematic. |
| detector | Keysight 81634B | Detection | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| camera | USB / display camera | Imaging | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| electrical | DC/AC supply · model unconfirmed | Electrical | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer | ficonTEC platform | Automation | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| band-source | Model to be confirmed | Source | Stationary; virtual laser output on/off | Only connected optical graph edges light. No real device control. |
| band-detector | Model to be confirmed | Detection | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wst-laser-old | Keysight 81940A | Source | Stationary; virtual laser output on/off | Only connected optical graph edges light. No real device control. |
| wst-mainframe-manual | Keysight 8163B | Mainframe | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wst-sensor-old | Keysight 81634B | Detection | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wst-polarisation-manual | Thorlabs FPC562 | Polarisation | Three paddle rotations | Ideal QWP/HWP/QWP model; actual retardance depends on fibre, turns and wavelength. |
| wst-mating-sleeve-manual | Thorlabs ADAFCPMB2 | Fibre optics | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wst-fibre-arms-manual | Bespoke · University of Southampton | Adjustable arm | Follows supporting stage; tip angle set separately | User CAD has no spring/fibre or articulated mates; moving handle overlay is schematic. |
| wst-fibre-pm2-manual | Thorlabs P3-1550PM-FC-2 | Fibre optics | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wst-fibre-sm-manual | Thorlabs P3-SMF28Y-FC-5 | Fibre optics | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wst-stage-manual | Model pending | DUT support | Holder translates with the selected DUT carriage; optional teaching yaw | Unknown stages use editable demonstration pitch/travel; no model-specific range or rotary stage asserted. |
| fibre-arm-stage | Thorlabs MAX313D | Differential XYZ | Three translations; base stays fixed, arm/carriage moves | MAX313D / DRV3 reference; fine 300 µm total, nominal 50 µm/rev, coarse stage 4 mm total. Demo pitch is approximate, not metrology. |
| wst-camera-manual | USB / display · exact model pending | Imaging | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wst-wafer-holder-manual | Bespoke · 3D printed | DUT support | Holder translates with the selected DUT carriage; optional teaching yaw | Unknown stages use editable demonstration pitch/travel; no model-specific range or rotary stage asserted. |
| wst-chip-holder-manual | Bespoke · copper block | DUT support | Holder translates with the selected DUT carriage; optional teaching yaw | Unknown stages use editable demonstration pitch/travel; no model-specific range or rotary stage asserted. |
| oband-mainframe-8164b | Keysight 8164B | Mainframe | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| oband-laser-81606a | Keysight 81606A | Source | Stationary; virtual laser output on/off | Only connected optical graph edges light. No real device control. |
| oband-head-interface | Keysight 81618A | Detection | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| oband-head-81624b | Keysight 81624B | Detection | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| oband-adapter-81000fa | Keysight 81000FA | Fibre optics | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip-dut-translation-stage-v1 | Manual multi-axis stage · model unconfirmed | DUT support | Holder translates with the selected DUT carriage; optional teaching yaw | Unknown stages use editable demonstration pitch/travel; no model-specific range or rotary stage asserted. |
| chip-microscope-body-v1 | Microscope / objective / focus mount · models unconfirmed | Imaging | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip-camera-head-v1 | Black camera head · model unconfirmed | Imaging | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip-display-monitor-v1 | Cello display · model unconfirmed | Display | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip-led-illuminator-v1 | Microscope LED illuminator · model unconfirmed | Illumination | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip-illumination-controller-v1 | Hamamatsu Photonics-labelled unit · function unconfirmed | Control | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip-handheld-power-meter-v1 | Orange/black handheld meter · model/function unconfirmed | Accessory | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip-overhead-shelf-v1 | Bench shelf / gantry · dimensions unconfirmed | Mechanical support | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-xy-motion-stage-2 | Photo-observed assembly · exact model unconfirmed | DUT support | Holder translates with the selected DUT carriage; optional teaching yaw | Unknown stages use editable demonstration pitch/travel; no model-specific range or rotary stage asserted. |
| wafer-carrier-2 | Photo-observed assembly · exact model unconfirmed | DUT support | Holder translates with the selected DUT carriage; optional teaching yaw | Unknown stages use editable demonstration pitch/travel; no model-specific range or rotary stage asserted. |
| wafer-camera-head-2 | Photo-observed assembly · exact model unconfirmed | Imaging | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-monitor-2 | Photo-observed assembly · exact model unconfirmed | Display | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-pc-2 | Photo-observed assembly · exact model unconfirmed | Computing | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-shelf-2 | Photo-observed assembly · exact model unconfirmed | Mechanical support | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-keyboard-tray-2 | Photo-observed assembly · exact model unconfirmed | Mechanical support | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-keyboard-2 | Photo-observed assembly · exact model unconfirmed | Accessory | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-digital-indicator-2 | Photo-observed assembly · exact model unconfirmed | Position readout | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-shelf-smu-2 | Photo-observed assembly · exact model unconfirmed | Electrical instrument | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| wafer-aux-probe-mount-2 | Photo-observed assembly · exact model unconfirmed | Positioning | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| santec-tsl570-setup4 | Santec TSL-570 · label observed | Source | Stationary; virtual laser output on/off | Only connected optical graph edges light. No real device control. |
| santec-mpm210-setup4 | Santec MPM-210 family · label candidate | Detection | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip4-upper-display | Hanns.G-family display · model unconfirmed | Display | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip4-lower-display | Black display · model unconfirmed | Display | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip4-pc-tower | Desktop tower · model unconfirmed | Computing | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip4-shelf | Aluminium extrusion gantry · estimated | Mechanical support | Stationary reference / passive path | Display/readout is illustrative. This record has no verified kinematic joint. |
| chip-vacuum-stage | Bespoke vacuum sample stage | DUT support | Holder translates with the selected DUT carriage; optional teaching yaw | Unknown stages use editable demonstration pitch/travel; no model-specific range or rotary stage asserted. |
