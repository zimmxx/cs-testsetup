# Equipment pictures

Every catalog record has a locally stored picture and provenance. These images describe equipment; they do not verify installed options, calibration or a saved setup layout.

## View and maintain

- Equipment library → select an item → Picture. The default remains the 3D model.
- Use Open image to inspect the full-resolution local asset or Download picture to save a copy.
- Vendor / distributor sources link to the original page and asset. Lab photographs link to the supplied presentation or CAD reference.
- Admin → Picture path / Attach picture replaces the photo. Enter the new source, credit, picture type and review note before saving.
- Replacement clears the previous image attribution and checksum, so old provenance is never attributed to a new upload.
- Photos live in `public/library/images/`; record metadata lives in `public/library/equipment.json`. `public/library/images/sources.json` is the acquisition snapshot from this update, not a live Admin database.
- Saving locally updates project files. GitHub Pages receives changes after committing and pushing those files.

## Accuracy and ownership

Exact product, assembly, vendor reference, lab context and user CAD preview are deliberately separate labels. Reference images do not confirm the installed model. Supplier images retain original copyright; no open redistribution licence was verified. Source records retain the download URL, date, dimensions and SHA-256.

**Photo follow-up:** the bespoke vacuum sample stage has a context photo only; the DUT motion stage and bespoke wafer holder still need isolated identifying photographs. The fibre-arm preview is your SolidWorks screenshot. Cameras and generic source/detector/power-supply records still need exact model confirmation.

## Catalog coverage

| Equipment ID | Picture type | Shown / source | Review |
| --- | --- | --- | --- |
| `polarisation` | Vendor reference photo | [Thorlabs](https://www.thorlabs.com/item/FPC562) | FPC562 is shown as a three-paddle controller reference. Confirm the installed part number. |
| `stage` | Vendor reference photo | [Thorlabs](https://www.thorlabs.com/item/MAX313D) | NanoMax family reference only. This does not confirm the chip DUT stage model. The confirmed MAX313D units belong to the fibre arms. |
| `fibre` | User CAD preview | User-provided SolidWorks screenshot, 8 October 2026 | Bespoke arm design shown. Patch cables are recorded separately; this image does not show the complete assembly of arms and fibres. |
| `detector` | Vendor product photo | [Keysight](https://www.keysight.com/us/en/product/81634B/low-polarization-dependence-optical-power-sensor.html) | Vendor product photo; exact installed options and connector adapter require local verification. |
| `camera` | Vendor reference photo | [GT Vision](https://gtvision.co.uk/collections/usb-hdmi-cameras) | GXCAM HiChrome-HR4 is a representative vendor camera. The installed camera model is not confirmed. |
| `electrical` | Vendor reference photo | [Keysight](https://www.keysight.com/us/en/product/E3640A/30w-power-supply-8v-3a-20v-1-5a.html) | E3640A shown as a DC supply reference. The installed DC / AC supply identity is not confirmed; this image does not imply AC capability. |
| `wafer` | Lab photo | [CORNERSTONE, University of Southampton](https://cornerstone.sotonfab.co.uk/wafer-scale-testing-service-wst/) | CORNERSTONE service website photo of the wafer-scale tester; the complete accessory inventory still requires local verification. |
| `band-source` | Vendor reference photo | [Keysight](https://www.keysight.com/us/en/product/N7776C/tunable-laser-source-high-power-lowest-sse-top-line.html) | N7776C shown as a tunable laser reference. This does not establish the source used for O-band, MIR or visible measurements. |
| `band-detector` | Vendor reference photo | [Keysight](https://www.keysight.com/us/en/product/81624B/general-purpose-optical-power-head.html) | 81624B head and interface assembly shown as a reference. This does not establish detectors or wavelength coverage for the other bands. |
| `wst-laser-old` | Vendor product photo | [Keysight](https://www.keysight.com/us/en/product/81940A/compact-tunable-laser-source-continuous-sweep-mode-1520nm-1630nm.html) | Keysight 81940A module. Product picture does not identify the individual lab asset. |
| `wst-mainframe-manual` | Vendor assembly photo | [Keysight](https://www.keysight.com/us/en/product/8163B/lightwave-multimeter.html) | 8163B pictured with plug-in modules. The modules in the supplier image do not define your saved slot assignments. |
| `wst-sensor-old` | Vendor product photo | [Keysight](https://www.keysight.com/us/en/product/81634B/low-polarization-dependence-optical-power-sensor.html) | Keysight 81634B sensor module. Confirm the connector adapter on the lab unit. |
| `wst-polarisation-manual` | Vendor product photo | [Thorlabs](https://www.thorlabs.com/item/FPC562) | Thorlabs FPC562. The lab fibre routing and paddle settings are recorded in the setup. |
| `wst-mating-sleeve-manual` | Vendor product photo | [Thorlabs](https://www.thorlabs.com/item/ADAFCPMB2) | Thorlabs ADAFCPMB2. Match the connector type at both ends of each connection. |
| `wst-fibre-arms-manual` | User CAD preview | User-provided SolidWorks screenshot, 8 October 2026 | Your bespoke fibre arm assembly in SolidWorks. An actual assembled-hardware photograph can replace this preview later. |
| `wst-fibre-pm2-manual` | Vendor product photo | [Thorlabs](https://www.thorlabs.com/item/P3-1550PM-FC-2) | Unmodified 2 m PM patch cable. The connectors shown are the supplier configuration. |
| `wst-fibre-sm-manual` | Vendor product photo | [Thorlabs](https://www.thorlabs.com/item/P3-SMF28Y-FC-5) | Supplier photo shows the unmodified patch cable. In your setup one end is cleaved and mounted at the fibre arm; the cleaved tip is not shown here. |
| `wst-stage-manual` | Lab context photo | CORNERSTONE_TESTING.pptx, slide 9, image13.png | Stage and DUT mounting area from your presentation. The exact DUT motion stage is unconfirmed; this is not the MAX313D fibre-arm stage. |
| `wst-camera-manual` | Vendor reference photo | [GT Vision](https://gtvision.co.uk/collections/usb-hdmi-cameras) | Representative GXCAM HiChrome-HR4 picture. Confirm the installed camera model before treating it as an exact match. |
| `wst-wafer-holder-manual` | Lab context photo | CORNERSTONE_TESTING.pptx, slide 8, image10.JPEG | Wafer mounting area from your presentation. The bespoke 3D-printed holder is not individually identified; an isolated photo is still needed. |
| `wst-chip-holder-manual` | Lab photo | CORNERSTONE_TESTING.pptx, slide 9, image13.png | Copper block visible beneath the chip in your presentation. This holder is separate from the vacuum sample stage. |
| `laser` | Vendor product photo | [Keysight](https://www.keysight.com/us/en/product/81940A/compact-tunable-laser-source-continuous-sweep-mode-1520nm-1630nm.html) | Keysight 81940A compact tunable laser source. |
| `fibre-arm-stage` | Vendor product photo | [Thorlabs](https://www.thorlabs.com/item/MAX313D) | Thorlabs MAX313D. Two instances support the input and output fibre arms, separate from the DUT motion stage. |
| `wst-laser-new` | Vendor product photo | [Keysight](https://www.keysight.com/us/en/product/N7776C/tunable-laser-source-high-power-lowest-sse-top-line.html) | Keysight N7776C. Confirm the fitted wavelength option and individual asset label locally. |
| `wst-head-interface-new` | Vendor assembly photo | [Keysight](https://www.keysight.com/us/en/product/N7749C/optical-head-interface.html) | N7749C interface pictured with 8162-C heads. The vendor assembly photo does not confirm the head count in the lab. |
| `wst-power-head-new` | Vendor assembly photo | [Keysight](https://www.keysight.com/us/en/product/N7749C/optical-head-interface.html) | 8162-C head family pictured with an N7749C interface. Exact head variant remains to be confirmed. |
| `wst-picoammeter` | Vendor product photo | [Tektronix / Keithley](https://www.tek.com/en/products/keithley/low-level-sensitive-and-specialty-instruments/series-6400-picoammeters) | Exact Keithley 6487 pictured in the Tektronix Series 6400 product gallery. |
| `wst-power-supply` | Vendor product photo | [Keysight](https://www.keysight.com/us/en/product/E3640A/30w-power-supply-8v-3a-20v-1-5a.html) | Keysight E3640A 30 W DC power supply. |
| `wst-fibre-pm5-manual` | Vendor product photo | [Thorlabs](https://www.thorlabs.com/item/P3-1550PM-FC-5) | Thorlabs 5 m PM cable. The configured manual measurement path uses the 2 m PM cable; this record remains an inventory alternative. |
| `optical-bench-reference` | Vendor reference photo | [Thorlabs](https://www.thorlabs.com/optical-tables-210-mm-8.3-inch--thick) | Thorlabs Nexus optical table family. Picture is illustrative; the proposed 1800 × 900 mm bench size is not verified by this image. |
| `oband-mainframe-8164b` | Vendor assembly photo | [Keysight](https://www.keysight.com/us/en/product/8164B/lightwave-measurement-system.html) | Keysight 8164B mainframe with modules. Your saved assembly defines slot 0 and slot 3; the vendor photograph is a separate example configuration. |
| `oband-laser-81606a` | Vendor assembly photo | [Keysight](https://www.keysight.com/us/en/product/81606A/81606a-tunable-laser-source-high-power-lowest-sse-top-line.html) | Supplier photograph shows an 81606A installed in an 8164B mainframe. The lab O-band range is 1240–1380 nm; the pictured option is not established. |
| `oband-head-interface` | Vendor assembly photo | [Keysight](https://www.keysight.com/us/en/product/81618A/single-optical-head-interface-module.html) | Vendor picture shows the 81618A interface family with optical heads and modules. The saved setup uses the single interface in slot 3. |
| `oband-head-81624b` | Vendor assembly photo | [Keysight](https://www.keysight.com/us/en/product/81624B/general-purpose-optical-power-head.html) | 81624B external optical head pictured with plug-in interface modules. The head remains external to the 8164B mainframe. |
| `oband-adapter-81000fa` | Distributor product photo | [Artisan Technology Group](https://www.artisantg.com/50503-2/Keysight-81000FA) | Exact Agilent / Keysight 81000FA photograph from Artisan Technology Group; vendor specifications remain linked separately. |
| `chip-vacuum-stage` | Lab context photo | CORNERSTONE_TESTING.pptx, slide 9, image13.png | Context picture of the existing chip bench only. It does NOT depict or verify your bespoke vacuum sample stage. An actual stage photo or CAD preview is still needed; your original SolidWorks part is retained. |
