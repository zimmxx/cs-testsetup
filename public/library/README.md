# Equipment library assets

This folder is copied into the production site and can be committed to cs-testsetup.

- `equipment.json`: overrides and new equipment records. Stable IDs link library records to setups and user-built layouts. Empty records fall back to the documented catalog in `src/data/catalog.js`.
- `images/`: equipment pictures (PNG, JPEG, WebP).
- `models/`: self-contained GLB 2.0 models and conversion metadata with source bounds, units and triangle counts. Use uncompressed geometry/textures; no external decoders are configured.
- `references/`: original CAD, dimension drawings and reference photos. Record sources and licences in Admin. This folder becomes public if the site is published; retain private references outside the repository.

Admin writes records and uploads assets to these folders when opened on localhost. LAN access is read-only. Uploads use unique filenames so replacements retain the previous file.

On GitHub Pages, Admin offers catalog export. Commit the exported equipment.json and associated assets through the repository workflow; a static site cannot directly write repository files.

All 35 records have local STEP/STP and GLB files. Seven are vendor CAD; two generic records use vendor models as unconfirmed references; 26 are generated illustrative geometry. Model type and limitations are visible in Admin and Build setup. Confirmed variants, measured dimensions and the complete bespoke arm assembly are still needed for accurate installation planning. STEP files may be uploaded and converted locally from Admin when the separately installed OpenCascade tool is present.

O-band assembly: `setups/oband-mainframe-assembly.json` uses 8164B Slot 0 for the 81606A and Slot 3 for the confirmed 81618A. The external 81624B head includes an illustrative 81000FA adapter and an independently editable FC/PC optical input. See `docs/O-BAND-MAINFRAME.md` in the project.
