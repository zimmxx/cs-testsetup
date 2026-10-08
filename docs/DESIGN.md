# Interface and implementation design

## Direction

White content surfaces, cool grey workspace, navy navigation, restrained violet interaction accent and a yellow wafer motif. Inter is bundled locally. Fine borders, 6–9 px control radii and clear typography connect the screens. The primary design concept is [design-concept.png](design-concept.png).

The desktop workspace combines a filter bar, matching-setup rail and a single setup panel. Tabs own the interactive arrangement, signal path, equipment list and guide. Supporting screens retain the same navigation and typography. Mobile moves setup results into a horizontal list and stacks the content; component buttons provide a readable alternative to small visual hotspots.

## Visualization contract

The analytical job is **system composition and flow**. Artifact families: schematic equipment layout, directed connection sequence, and a session-time composition bar. Primary route: framework-owned SVG/DOM. Fallback: directly labelled ordered list and equipment buttons. Three-dimensional appearance in the bench illustration is a teaching cue, not geometric measurement data.

- React owns all state and DOM/SVG geometry. No D3 library is needed for the small fixed schematics.
- One equipment canvas or signal diagram is rendered per selected setup. Six optical-path nodes and up to seven component shortcuts keep DOM cost small.
- Neutral grey represents context; violet identifies selection and focus; yellow represents the optical connection; mauve represents electrical drive. Dashed outlines denote control/observation.
- Hotspots and the signal view are keyboard- and tap-accessible; essential specs appear in the inspector without requiring hover.
- A separate real-photo view keeps documentary evidence distinct from generated illustration.
- Mobile signal paths stack into a vertical sequence; labels are reflowed rather than scaling a desktop diagram down.
- Planner widths encode each activity's fraction of unbuffered session time. Exact durations are also visible in the breakdown. Buffer is shown separately, not disguised as measured uncertainty.
- `prefers-reduced-motion` disables transitions; every state remains valid as a still.

## State and persistence

Hash parameters encode page, filters, selected setup, tab and search; browser navigation restores them. Training progress and planner inputs use versioned localStorage keys. Local documents and links use IndexedDB with transaction-completion checks. UI exports produce user-downloadable files. There is no server, account or secret required.

## Deliberate limits

No live instrument control, bookings, approved operating procedure, AI integration or 3D service is claimed. The presentation photos and source notes provide a sound starting interface before operational records arrive. Additional plugins are not needed for this first build.
