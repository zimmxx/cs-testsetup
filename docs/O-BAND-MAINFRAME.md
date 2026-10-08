# O-band laser and detector mainframe

The separate builder template **O-band laser and detector mainframe · configured assembly** contains the user-confirmed instrument configuration. Select it under Start from a catalog setup, then Use template. The previous draft is recoverable with Undo. The saved assembly is `public/library/setups/oband-mainframe-assembly.json`; the existing manual 8163B file is preserved.

| Equipment ID | Installation | Recorded information |
| --- | --- | --- |
| `oband-mainframe-8164b` | Mainframe | Keysight 8164B, four compact upper vertical bays numbered 1–4 and one lower horizontal extended TLS bay numbered 0 |
| `oband-laser-81606a` | Slot 0 | Keysight 81606A, 1240–1380 nm user-confirmed range; corresponds to vendor option 113, physical option label not checked |
| `oband-head-interface` | Slot 3 | Keysight 81618A single-head interface, user-confirmed |
| `oband-head-81624b` | External head | Keysight 81624B, connects electrically to the 81618A and receives the measurement fibre output optically |
| `oband-adapter-81000fa` | On detector head | Keysight 81000FA, user-reported FC/PC connection; included in the illustrative head model and available separately in the equipment library |

The Slot 3 plug-in is the **81618A**, not the external 81624B optical head. The template contains the head-to-interface electrical link. No laser-to-detector optical bypass is assumed. Add the actual DUT, fibre output and other optical equipment to complete the measurement path. When dragging an optical connection into the 81624B head, its destination defaults to FC/PC and the 81000FA optical input; the source connector, fibre model and length remain independently editable. These defaults describe the interface and do not certify connector/fibre compatibility.

Slot dropdowns list compatible plug-in instances. The 81606A fits only Slot 0; compact modules fit Slots 1–4. The external head is rejected from mainframe slots. Drop a library module into a bay, or move an installed faceplate between compatible bays. Moving to an occupied compatible slot swaps the modules when both installations are valid; otherwise the replaced module is unmounted. Serial records and signal connections stay with the module. Unmounting retains its separate schematic card. Save/export stores mainframe instance and slot fields along with the rest of the setup.

**Inspect assembly in 3D** focuses the housing. **Explode modules** pulls the 81618A forward and retracts the back-loadable TLS toward the rear while opening the bay cover. The illustration preserves the user-requested front layout; Slot 0's actual insertion is from the rear. Bench coordinates and housing rotation also move the installed modules. View controls do not change saved assignments.

All five new equipment records have local STEP solids under `public/library/references/<equipment-id>/` and GLB copies under `public/library/models/`. The 8164B outer envelope uses the published 426 W × 145 H × 545 D mm specification. Walls, bay offsets, module dimensions, front controls, cable stubs and adapter details are generated illustrative geometry, **not supplier assembly CAD or measured clearances**. Local STEP uploads in Admin can replace these references later.

The new data and script paths are:

- `src/data/obandAssembly.js`: seeded equipment and builder template.
- `scripts/generate-oband-cad.py`: illustrative STEP generation, preserving unrelated equipment.
- `scripts/prepare-oband-library.mjs`: seed catalog/provenance/saved assembly without overwriting existing records.
- `scripts/convert-step.mjs`: local STEP → GLB conversion.

Still to enter: serials/calibration, complete optical path, actual fibres and connector ends, head cable model/length, safe power limits, measurement acquisition parameters and bench positions. The confirmed laser wavelength range is a capability of the laser, not an approved range for an unverified complete optical path.

References: [8164B](https://www.keysight.com/us/en/product/8164B/lightwave-measurement-system.html), [user-provided photo](https://images.cdn-krs.com/upload/2025/04/10/20250410195018-d49944c0.jpg), [mainframe dimensions](https://www.keysight.com/us/en/assets/7018-01037/data-sheets/5988-3924.pdf), [81606A family datasheet supplied by user](https://www.keysight.com/us/en/assets/7018-01659/data-sheets/5989-7321.pdf), [81606A options](https://www.keysight.com/us/en/assets/7018-06524/data-sheets/5992-3735.pdf), [81618A](https://www.keysight.com/us/en/product/81618A/single-optical-head-interface-module.html), [81624B](https://www.keysight.com/us/en/product/81624B/general-purpose-optical-power-head.html), [head interface and adapter guide](https://www.keysight.com/us/en/assets/9018-01715/user-manuals/9018-01715.pdf).
