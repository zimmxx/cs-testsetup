# Bugs, improvements and ideas

Reviewed: **15 October 2026**. Candidate: **0.3.0**. This is a shared review list, not an instruction to implement every idea. Confirm scope before larger changes. Browser viewport checks are desktop emulation, not physical-phone hardware tests.

## Walkthrough evidence

| User task | Result |
| --- | --- |
| Open the clean home URL and find a setup | Passed; filters, matching setups and view tabs render |
| Browse Equipment library, switch 3D to Picture and back | Passed; local vendor image loads and model returns |
| Find Simulation_draft and understand how to start | Added an expandable first-use guide; explains demo, alignment, virtual laser and local storage |
| Switch to wafer Setup 2, then chip Setup 4 | Passed; sample label changes and URL scale/band now follows the selected setup |
| Use Perfect alignment and turn on the virtual laser | Both meters reach 100%; six light-flow overlays appear |
| Move input Y by 0.5 µm at 1 mW | Input falls to 99.5%, output remains 100%, virtual detector about 696.438 µW in the example |
| Inspect supplied arm mounting and move all axes | Real-CAD regression confirms the feet meet NanoMax top plates and both stage bases retain their bench transforms |
| Use 390 px and 320 px layouts | No horizontal document overflow; controls and guidance remain reachable |
| Open the built site under the GitHub Pages subpath | Passed at `/cs-testsetup/`; all bench/technician assets load, wafer label and both 100% meters verified; no console warnings/errors |

## Fixed issues

| ID | Issue | Resolution |
| --- | --- | --- |
| B01 | Old cartoon person flashed when changing setups | Removed placeholder geometry; explicit technician loading/error states |
| B02 | Hands changed shape or jumped during playback | One pose owner, relaxed fingers, fixed bone proportions, limited wrist twist and damped targets/joints; actual-rig regression |
| B03 | Fibre and DUT Y/Z axes were reversed | Shared X/Y horizontal, Z vertical mapping across controls, 3D and coupling |
| B04 | Right output tip slanted the same way as the input | Mirrored right tip and optical segment; positive configured angle retained |
| B05 | Paddle rings rotated about the wrong axis and floated between paddle centres | X rotation and actual CAD cover centres/56 mm loop size |
| B06 | Arm bounding-box origin did not put its foot on the NanoMax platform | Register the named supplied base footprint to the actual CAD top plate; stage base is fixed |
| B07 | Setup-change URL retained the previous scale/wavelength | Setup selectors now update the related catalog filters |
| B08 | Video could start while the detailed scene was still loading | Recording guard explains that bench/technician loading must finish |
| B09 | Reset was easy to confuse with perfect alignment | Renamed Reset demo; separate Perfect alignment button and short guidance |
| B10 | Sample badge style depended on first visiting Simulation_draft | Shared model badge styling moved into global styles |

## Remaining limitations and proposals

| ID | Priority / state | Finding or idea | Suggested next action |
| --- | --- | --- | --- |
| I01 | Medium · open | Technician is 8.7 MB and Three.js viewer exceeds the 500 kB chunk warning threshold. Slow-network performance is unmeasured. | Profile real devices/network; consider mesh/texture optimisation and cached source loading before adding another character |
| I02 | Medium · known limitation | Source CAD is not a native articulated SolidWorks assembly. Schematic micrometer handles and paddle overlays illustrate motion; internal stage mechanisms are not solved. | Add verified joint/axis metadata and vendor/source assembly references incrementally |
| I03 | Medium · lab review | Fibre routes end at schematic equipment ports rather than verified cleaved-tip coordinates. Moving geometry is registered more accurately than the port model. | Record actual optical ports and tip offsets; update cable anchors after lab confirmation |
| I04 | Medium · lab review | Sample geometry, chip mask, wafer notch, sample thickness and grid are illustrative. The older generic wafer holder reference is only 180 mm wide, so a 203.2 mm dummy wafer overhangs it. | Confirm holder diameter, clearances, retention and actual chip/wafer dimensions; do not infer mechanical compatibility from this preview |
| I05 | Medium · known limitation | Display mounting corrections and dummy samples are not native mating constraints or new STEP parts. STEP exports follow saved placement records. | Decide whether to persist verified mount frames and include sample parts in CAD export; compare in SolidWorks before claiming parity |
| I06 | Medium · known limitation | Optical coupling, drive pitch/travel and visual magnification are teaching approximations. Large magnification/coarse offsets can visually leave the bench. | Add a model/real-scale toggle, travel envelope overlay and optional collision review after calibration |
| I07 | Low · proposal | Users may expect Save to update the shared GitHub site. Browser persistence is local. | Keep local-storage explanation prominent; consider an explicit export/review/import publishing workflow |
| I08 | Low · proposal | The mannequin may obscure small components at some orbit angles. | Offer opacity/side-position controls; current Lab technician checkbox already hides it |
| I09 | Low · proposal | Guided sequence is fixed; pose playback has four seconds per transition. | Add per-pose duration/easing after users confirm a useful training workflow |
| I10 | Low · known limitation | WebM captures only 3D, excluding the magnified PIC view/readout. | Offer combined teaching-view video or a presentation export if useful |
| I11 | Medium · review | Physical-phone GPU/touch behaviour, Safari WebM support and low-memory sessions have not been verified on actual devices. | Test the published candidate on representative hardware; JSON export remains the portable fallback |
| I12 | Low · proposal | Some setup identities, options, fibre connectors and controller routes remain provisional from photographs. | Add close-up labels and trace routes in the lab; retain Needs verification until confirmed |
| I13 | Low · proposal | Sample examples are view overlays rather than selectable equipment records. | Add an editable sample library if dimensions, die maps or sample inventory become part of the workflow |

No known blocking runtime error remains in the exercised flows. This is ready for review as a documented teaching-interface release, not certification of a real measurement procedure or mechanical installation. Deployment is pending user acceptance and a successful Pages run.
