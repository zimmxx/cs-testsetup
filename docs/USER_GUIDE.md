# Using CORNERSTONE Test Setup

## Build a setup

Open **Build setup**. Drag equipment onto the canvas or use its + button. Repeated equipment becomes separate instances; give each an instance label. Drag cards to arrange them, or use arrow keys and position fields. Templates add documented equipment without assuming connections.

Choose source and destination equipment under **Connect equipment**. Select a path on the canvas or in the connection register. Set Optical or Electrical, name the ports, and for each optical link choose a fibre model or enter a custom vendor/model. Set source and destination connectors independently, including FC/PC and FC/APC. Record length and compatibility notes per cable.

Switch between Setup overview, 3D and Signal path. Setup overview draws your current equipment and connections on an illustrative bench. Select a numbered marker to show the same equipment specifications used in Setup explorer; View equipment opens the full record. Missing models appear as labelled wireframe placeholders in 3D. Drafts autosave in this browser. Export JSON to share or retain them; Import restores a valid file. Undo restores the last change, including removed equipment and its connections.

## Maintain the equipment library

The discreet **Admin** link is at the bottom of the sidebar. Open it through localhost on the development computer to edit project files. Select an existing record or Add equipment, edit specifications, and attach pictures / self-contained GLB models. Save to library updates the app and `public/library/equipment.json`. Record model sources, licences and dimensions alongside the asset.

On LAN or static GitHub Pages, editing is export-based: export the draft catalog and commit it with the corresponding assets. See [MODELS.md](MODELS.md) for detailed-model references and limitations.

1. **Choose the measurement.** In Setup explorer choose Scale, Mode and Wavelength. Select a matching setup on the left. Clear filters to browse everything. Select All bands for purely electrical tests.
2. **Explore the hardware.** In Setup overview choose a numbered component or its labelled button. View equipment opens specifications and source/compatibility notes. Lab photos shows the supplied documentary images.
3. **Follow the connection.** Signal path separates optical/electrical measurement from camera observation and computer control. Select a node to inspect its equipment.
4. **Review the workflow.** How-to guide offers a draft preparation-to-analysis checklist. Mark reviewed steps; progress is retained in this browser. Follow the approved local SOP for actual work. Export checklist creates a text record.
5. **Browse the directory.** Available setups lists documented, service-listed, unverified, planned and in-development work. Search measurements or labs; use Select to open the explorer.
6. **Inspect inventory.** Equipment library searches models, equipment names and labs. Select a row for details, alternatives and manufacturer links. Export catalog saves the current documented inventory as JSON.
7. **Estimate time.** Measurement planner selects a setup and counts chips, waveguides/devices, repeats and conditions. For wafer work also enter chips/sites per wafer. Choose continuous or stepped wavelength acquisition; electrical-only work accepts the total acquisition duration. Adjust all session assumptions to actual experience. Read the breakdown and export the plan.
8. **Collect references.** Documentation provides the presentation and public references. Choose an attachment scope and Attach documents to retain a file locally. Add link records a web resource. Search and setup/type filters help find it later. Download local files before moving to another origin or clearing browser storage.

Default timing values are examples. A setup record describes documentation, not booking or instrument readiness. Use Capabilities & source notes to see gaps and evidence.
