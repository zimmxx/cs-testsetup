# UI draft changes — 8 October 2026

Three review workspaces are available on the existing local server: **Bench_draft**, **Equipment_draft** and **Training_draft**. These are separate app pages with isolated draft data, not additional repositories. See [README_draft.md](README_draft.md) for the user guide and file locations.

## Changes

- Bench_draft starts in Explore with a 3D bench, docked inspector, equipment documents, path tracing, optical/electrical/support layers and a focus view.
- Edit draft adds physical bench placement in millimetres, snapping, locking, undo, mounted assembly movement, drag connections with compatible-port highlighting, independent connector details and a keyboard connection alternative.
- Browser autosave, project draft files, published snapshots and JSON exports have distinct status and actions. Review changes shows differences before explicit publication to Setup Explorer.
- Equipment_draft provides 3D-first previews, picture switching, missing-information filters, provenance and readiness checks, and an isolated editable catalog. Applying reviewed catalog changes remains a separate shared Admin action.
- Training_draft presents one guide step at a time with related equipment, reviewed-step progress, session notes, restoration and export. Progress resets when guide contents change.
- Illustrative was removed as a duplicate view from Build setup, Setup Explorer and Bench_draft. Signal path remains the connection diagram. Existing Explorer links with `tab=illustrative` open Signal path; stored coordinates remain intact.
- Equipment dropped onto Signal path retains its signal-coordinate position. Build setup's position fields edit Signal X/Y.
- Git rules preserve CAD assets and exclude temporary files. Production builds exclude library recovery `.bak` and `.tmp` copies. Relative asset paths, hash routing and the existing GitHub Pages workflow remain in place.

## Verification

- **43 automated tests passed**, including draft isolation, local file writes, optical connection roles, connector checks, network cycles, placement and mounts, import/export validation, legacy links and build cleanup.
- **Production build passed.** No library recovery copies were included in the output. The existing lazy 3D bundle size warning remains.
- Browser checks covered the three draft pages, actual 3D model loading, port dragging and undo, path tracing and layers, bench snapping/locks, diagram panning, focus/Escape, O-band module slots and training progress restoration.
- Desktop and 390 × 844 responsive views were inspected. The checked mobile pages had no document-wide horizontal overflow. Final fresh browser checks returned no console warnings or errors.
- The manual bench draft matches the published setup after QA changes were undone. Temporary training progress and notes were reset.

## Review boundaries

No GitHub push or deployment was performed. Draft workspaces were not automatically published into Setup Explorer. Equipment_draft edits do not replace the shared catalog used by other pages.

Bench dimensions and equipment placements are suggested. Readiness means information has been recorded, not that a procedure or instrument is approved. Existing illustrative CAD provenance remains visible. The supplied vacuum chip stage still needs a STEP export, and the native fibre-arm assembly is retained alongside its current illustrative browser preview.
