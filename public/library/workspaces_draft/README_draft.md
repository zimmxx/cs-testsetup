# Saved draft workspaces

These JSON files are separate from the shared catalog, existing builder files and published snapshots. See the root `README_draft.md` for the user guide.

- Bench_draft files: `<setup-id>_draft.json`, with `workspaceName: Bench_draft` and `workspaceRevision: 1`.
- Equipment_draft: `equipment_draft.json`, with `workspaceName: Equipment_draft` and a version 1 equipment array.
- Training_draft: browser-local per setup/source; export sessions from the UI when they should be shared.

Use Load local to review saved files. Save locally writes here through the localhost-only API. Commit reviewed JSON and referenced assets together. Do not commit temporary `.bak`/`.tmp` files. Saving here does not publish a setup or alter the shared catalog.
