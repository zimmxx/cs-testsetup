# Configure the manual wafer optical setup

Open http://localhost:5174/#page=builder on the development computer.

1. Select **Manual wafer optical measurement · configured path**, then **Use template**. Existing browser work can be restored with Undo.
2. Select a numbered item in **Setup overview**. Edit the instance label and **Installed equipment record**. Add serial numbers, exact models, specification URLs, calibration and asset references.
3. Switch to **Illustrative**, choose Optical fibre or Electrical cable above the canvas, and drag a right output port to a different equipment’s left input port. A live preview follows the pointer. Escape or release away from an input cancels. Select a line to edit the two connector ends, fibre model, ports and actual cut length independently. Duplicate same-type paths are rejected; an electrical and optical path can coexist. The collapsed dropdown form provides keyboard access.
4. Expand **Measurement settings & working guide** sections. Enter the actual settings, device IDs, folders, references, quality criteria and measured timing. Unknown values are blank. The default guide is a draft sequence to adapt to the approved local SOP.
5. Click **Save to project folder**. The configuration, all instance records, connections and working guide are saved together in `public/library/setups/wst-optical-manual.json`. A subsequent save retains the previous file as `.json.bak`. **Load saved setup** reopens it. Unsaved edits remain a browser draft.
6. **Export setup** downloads a portable JSON copy; **Import** restores it. Both include measurement settings and guide. Admin separately maintains shared equipment specifications and uploads photos, GLB models and locally converted STEP/STP CAD. Instance asset references are documentation and do not themselves upload a file or replace the shared library model.

## Starting data

User-reported 5 October 2026: Lab 2077, Keysight 81940A laser in 8163B mainframe, 81634B power sensor, FPC562 controller, grating coupling through cleaved P3-SMF28Y-FC-5 fibres on adjustable bespoke arms, usual 10° from wafer normal and laser setpoint 10 mW. Detector mainframe, measurement wavelengths, limits, calibration, exact stage/camera, active holder and cut lengths still need confirmation.

Input: laser → P3-1550PM-FC-2 → ADAFCPMB2 → FPC562 → ADAFCPMB2 → P3-SMF28Y-FC-5 → cleaved input tip → grating.

Output: grating → cleaved output tip → P3-SMF28Y-FC-5 → ADAFCPMB2 → P3-1550PM-FC-2 → 81634B sensor.

The wafer holder is provisional until the active mounting assembly is confirmed. Every library record now has a STEP reference and GLB. Vendor CAD and generated illustrative references are labelled separately in the model review register and Admin. This is a configuration workspace, not an instrument-control application or an approved operating procedure.

Excel remains a separate collection source. It is not automatically synchronised with the interface. Reviewed updates can be transferred later without overwriting the original workbook.

## Fibre-arm stages versus DUT motion

The user clarified that Thorlabs MAX313D (3-axis NanoMax, differential drives, no piezos) supports the bespoke fibre arms. Equipment ID `fibre-arm-stage` has two instances: `input-fibre-stage` and `output-fibre-stage`. The arm records reference these stage instance IDs in their mounting records. These are mechanical supports, not additional optical signal links.

`wst-stage-manual` now denotes the separate **DUT motion stage**. Its manufacturer/model remains unconfirmed and is no longer labelled NanoMax. Existing saved/manual browser drafts receive this one-time correction while retaining user-entered settings, connections, name and positions. The previous saved file is backed up locally in `.local/cad-tools/setup-before-max313d.json`.

MAX313D source CAD is retained under `public/library/references/max313d/`; the interactive model is `public/library/models/max313d.glb`. Its Z-up CAD coordinates are rotated to the viewer's Y-up convention. Physical mounting positions, bespoke-arm geometry and port coordinates remain to collect; illustrative placement is not a dimensioned mechanical assembly.

## Bench layout and review

**Arrange on bench** applies a suggested diagram and physical presentation arrangement. Undo restores your prior layout. Existing drafts receive missing bench-coordinate defaults while keeping their edited diagram positions and settings.

The scene presents the two MAX313D stages with their arm instances around the wafer/DUT, the controller and instruments nearby, and a camera above the alignment area. Select an instance to set Bench X/depth (mm), height (mm) and rotation (degrees). An arm follows its mounted stage position. Layout X/Y only move its diagram card. This placement remains illustrative until the actual table, stage, mounts, camera and assembled arms are supplied.

In 3D, orbit/zoom, show equipment labels or reset the view. The **CAD & model review** register lists every installed equipment reference with source notes and a STEP download for SolidWorks.

Next information to collect: exact DUT motion stage; camera and objective model; actual bench size and hole pitch. Complete arm assembly will replace the provisional arm when supplied. Approved wavelength/power limits, calibration, acquisition settings and the SOP remain user-configured.

## 8163B mainframe and installed modules

The user confirmed that the 8163B houses both the 81940A tunable laser source and the 81634B optical power sensor. Keysight's [configuration guide](https://assets-us-01.kc-usercontent.com/ecb176a6-5a2e-0000-8943-84491e5fc8d1/51ec46ca-f076-4ba1-8d3b-f4d830bae301/Keysight%20816x%20Series%20Lightwave%20Solution%20Platform%20Configuration%20Guide.pdf) lists two compact slots and compatibility with both modules.

**Mainframe slots** appears above the builder canvas. Slot 1 initially contains the laser; Slot 2 contains the sensor. This order is a suggested default, not an observed bench assignment. Choose an existing instance from either slot's dropdown, drag a library module into a bay, or drag an installed faceplate to the other bay. Moving an installed module into an occupied slot swaps the instances. A library drop reuses an existing matching instance; if none exists, it adds one. Incompatible equipment is rejected.

Choose **Empty / unmount** or **Unmount module** in the inspector to detach a module. The instance and its optical connections remain in the diagram. Undo restores the previous installation. Removing the housing detaches its modules. Diagram cards remain separate so each laser/sensor path and record can still be edited.

**Inspect assembly in 3D** focuses the mainframe. Modules follow its bench coordinates, elevation and rotation. **Explode modules** pulls the modules forward and hides the bay top cover; **Assemble modules** restores the installed view. These are viewing controls and do not alter saved mounting information. The STEP/GLB shell now has two open bays; offsets, clearances and panel details are illustrative, not vendor assembly CAD.

Installation is stored per module in `configuration.mainframeId` (housing instance ID) and `configuration.mainframeSlot` (`"1"` or `"2"`). Save/export retains these fields along with all signal paths and serial records. The manual measurement's laser slot, sensor slot and sensor mainframe fields follow this installation and are read-only in the measurement section. Use the slot controls to change them.

Older manual drafts receive this one-time housing assignment while keeping name, layout, records and optical connections. Recorded valid slot numbers take precedence over defaults. The prior saved setup is preserved at `.local/cad-tools/setup-before-mainframe-slots.json`. No physical installation or hardware control is performed by the app.
