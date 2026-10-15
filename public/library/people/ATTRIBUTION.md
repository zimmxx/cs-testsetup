# Lab technician character

Original: **Idle standing — Harper 3D Person, Animated**, Innerscene, adapted from MakeHuman/MPFB CC0 body, rig and skin assets.

- Author/source: https://www.innerscene.com/tools/library/3d-parts/idle-standing-harper-3d-person-animated-ba9bc23f
- Download: https://www.innerscene.com/api/library/idle-standing-harper-3d-person-animated-ba9bc23f/download
- License: **CC0-1.0 / public domain**, as explicitly stated on the asset page and in the original character metadata. Use, modification and redistribution are permitted, including commercial use.
- CC0 dedication: https://creativecommons.org/publicdomain/zero/1.0/
- MakeHuman asset licensing: https://static.makehumancommunity.org/about/license.html
- Retrieved: **2026-10-15**.

Local asset: `lab-technician.glb`, self-contained glTF 2.0 with embedded textures, skin and authored idle clip. Adaptations: embedded textures resized to at most 1024 px; held briefcase instance removed. Runtime adds a blue/grey technician jacket and dark trousers using vertex colours, black hair, an ID badge and bench-reaching poses with constrained arm lengths. The procedural reach, gentle breathing, wrist turn, walking and head gestures are application code; the source provides the anatomical mesh, textures, skeleton, relaxed finger pose and bundled idle loop. The source idle clip is retained in the asset but not played over the alignment poses, to avoid competing control of hand joints. This is a generic virtual technician, not a portrait or a certified work/PPE procedure. It does not claim wavelength-rated eye protection or ESD compliance.

Reproduce the local optimized asset using `scripts/prepare-technician.py` and the downloaded source at `.local/technician-source.glb`. The unmodified 18.8 MB source is not required at runtime. No model CDN, account, browser plugin or paid subscription is needed.

Three.js provides the renderer and GLTFLoader, not a blanket license for all example models. Other assets must be checked individually. Soldier/Mixamo examples were not selected; a static lab-coat figure was also unsuitable for articulated hand movement.

The old procedural placeholder figure has been removed. Setup changes show the detailed character only when ready; failed downloads do not substitute another person.
