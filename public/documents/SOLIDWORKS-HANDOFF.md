# Setup CAD: rotate, mount and edit in SolidWorks

## Configure the setup

1. In Build setup, select equipment; in Bench_draft, first choose **Edit draft**.
2. Use **Yaw Y**, **Tilt X** and **Roll Z** to orient it. The 90° turns and **Face opposite · 180°** act on yaw. Angles use right-handed Y-up coordinates and YXZ Euler order.
3. **Mount to component** attaches an item without moving it. Its angles and X/Y/Z offsets become relative to the parent. Moving or tilting the parent then carries the child, including nested mounts.
4. **Align mounting origins** sets the three offsets to zero. These are preview bottom-centre origins, not identified bolt holes or mating faces. Enter measured offsets/angles to refine the fit. **Independent on bench** detaches and preserves the current world pose.
5. Older fibre-arm mounts retain their existing height/yaw convention. Choose **Use rigid mount · keep position** to enable full local offsets and inherited tilt. Mainframe modules use their compatible slots; their orientation follows the housing.
6. Save locally to retain edits in the project, or export the setup JSON. Browser autosave stays on that browser/origin. Changes appear on GitHub Pages after an explicit commit, merge and deployment.

## Download the whole setup

On localhost, choose **Export CAD → Download STEP assembly package**. The ZIP contains:

- `setup.step`: AP214 assembly of separately named equipment instances at their current poses, made from their original STEP BREP sources. Repeated arms/stages are separate instances. A source containing multiple bodies remains complete compound geometry inside its equipment component.
- `placement-manifest.json`: instance IDs, source paths/checksums, geometry provenance, quaternion/translation in millimetres, world poses and mount/slot records.
- `editable-setup.json`: full app layout, signal connections, parameters and guides.
- This guide.

The optional bench is an illustrative 1800 × 900 mm tabletop with legs. Bench holes, mechanical hardware, flexible fibre/cable routes and omitted spring/fibre are not generated. App lines are diagram paths, not physical cable geometry. Estimated/illustrative equipment does not become dimensionally verified through export.

The exporter uses original solid geometry rather than a tessellated GLB conversion. Original supplier/user source files stay unchanged. Preview axis corrections and registration are included in the placement transform so the STEP matches the bench view. The export is re-read with OpenCascade before download. Native source feature trees, materials and parametric mate definitions are not reconstructed.

GitHub Pages has no CAD backend. There, use **Export editable layout JSON**, import it on localhost and generate the STEP package. Website visitors need no CAD installation to view the 3D app.

## Open and mate in SolidWorks

1. Extract the ZIP into a new working directory and keep its JSON records alongside the CAD.
2. Open `setup.step` in SolidWorks. In the STEP import options, retain the assembly structure; do not select the option that ignores assembly structure and creates a multibody part. Check units are millimetres and orientation matches the app.
3. Use the import/3D Interconnect workflow supported by your installed SolidWorks version, then save the assembly as `.SLDASM` and its components as `.SLDPRT`. Imported bodies do not automatically recover the original sketches, feature history or mates.
4. Preserve the instance ID at the start of component names (for example `photo-input-arm`). Float the parts you want to move and add the actual coincident, concentric, distance and angle mates using measured mounting geometry. Run Import Diagnostics where needed. Confirm dimensions, clearance and fit; visual app placements are estimates.
5. Save a native assembly with all referenced parts using **Pack and Go**. Export a fresh **whole assembly STEP** as well, preserving the assembly structure and component names. Supply the new STEP, the native assembly package, and the original placement JSON together with a short list of intentional changes.

The returned STEP can show final component positions and assembly structure. The native package provides the richer mating/design record for SolidWorks. This app does not currently read or solve native `.SLDASM` mates automatically; a later agent can compare the named component placements and update the app's rigid offsets after review. A lone `.SLDASM` may be incomplete without its referenced parts.

Official import guidance: [SOLIDWORKS STEP/IGES/ACIS import](https://help.solidworks.com/2024/english/SolidWorks/sldworks/t_reading_step_iges_acis_sw.htm).

## Optional local exporter installation

Website viewing/building does not require Python. Whole-setup STEP export requires Python 3.12 and the pinned optional runtime in `scripts/requirements-cad.txt`:

```powershell
python -m pip install --target .local/cad-python -r scripts/requirements-cad.txt
python -c "import sys; from pathlib import Path; Path('.local/cad-python/python-path.txt').write_text(sys.executable)"
```

Alternatively set `CS_CAD_PYTHON` to that Python executable. Restart the local dev server after installing. The runtime and machine-specific path are ignored by Git; source exporter scripts, requirements and guides are tracked. The localhost API accepts same-origin loopback requests only and never executes commands supplied in an exported layout.
