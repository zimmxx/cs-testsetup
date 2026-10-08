# Published setup views

Build setup and Setup Explorer use the same SetupView, SetupGraph, BuildOverview and ModelScene components.

## Working flow

1. Arrange the equipment, slots, diagram and signal-path positions in Build setup.
2. Save to project folder to retain an editable setup JSON in `public/library/setups/`.
3. Expand **Publish to Setup Explorer**, check the setup ID, scale, mode, bands and location, then publish.
4. Open Setup Explorer and select the published setup with the matching filters.

The publication stores a separate snapshot in `public/library/published/index.json`, including nodes, instance configuration, mainframe slots, connection records, bench coordinates, signal-path positions, measurement settings and working guide. A previous index is backed up to `.bak`. Browser draft edits and saved draft changes do not update this snapshot until another publish.

Explorer allows temporary movement and preview connections. Reset view restores the snapshot; switching setup or reloading clears temporary changes. These actions never save to the project or change the Builder draft. Mainframe installation is inspectable and read-only in Explorer.

Setup diagram preserves the previous reference diagram/photo interface. Equipment and How-to guide remain; published guide steps replace the generic outline when supplied. Catalog entries without a published layout use the shared equipment preview and assume no connection topology. A catalog setup publication preserves its existing diagram, photos and source notes.

Static hosting reads the published JSON and local models directly. Publishing and CAD conversion require the local Vite server. Publication denotes visibility in the app, not validation or approval of an operating procedure.

## New SolidWorks sources received 8 October 2026

- `public/library/references/wst-fibre-arms-manual/Fibrearm_assembly_try2.SLDASM`: the user's fibre-arm assembly; the picture tab shows the supplied SolidWorks screenshot. Its existing STEP/GLB preview is still illustrative.
- `public/library/references/chip-vacuum-stage/Vacuum-Sample-Stage.SLDPRT`: the user's vacuum chip sample stage. Equipment ID **chip-vacuum-stage** is separate from **wst-stage-manual**, as confirmed by the user. Browser preview is pending.

Native CAD is retained and downloadable in Equipment library and Admin. The installed browser converter reads STEP/STP, not native SolidWorks files. Export each resolved part/assembly as STEP in SolidWorks to create its browser GLB. For an assembly, resolve the referenced component files first; a standalone SLDASM may not contain them. No dimensional or assembly-fit check has been performed on these native sources.
