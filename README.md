📊 GEDIFIX — Geolocation Error Identification in GEDI Data (Google Earth Engine)

GEDIFIX is an interactive Google Earth Engine application that identifies potential geolocation errors in NASA’s GEDI (Global Ecosystem Dynamics Investigation) waveform lidar data. It compares the terrain elevation derived from GEDI waveform attributes with an external terrain model (SRTM), highlights beams with large elevation differences, and allows users to export results.

You can run it by copying and pasting the code into the Earth Engine Code Editor, or simply by visiting the preloaded link:

🔗 Run in Google Earth Engine: https://code.earthengine.google.com/73814ee406ce3581856aae228c63d065

📌 Overview

GEDIFIX performs the following:

Allows the user to draw or import a study area polygon.

Accepts a height difference threshold (meters).

Computes the absolute difference between GEDI terrain elevation and SRTM terrain elevation.

Displays areas where height differences exceed the threshold.

Exports two CSVs:

Beam-level height differences

Orbit-level summary statistics

✨ Features

✔ Draw a polygon directly on the map
✔ Import custom GeoJSON polygon
✔ Visualize GEDI–SRTM differences
✔ Export CSV results (beam and orbit level)
✔ Interactive UI with logo branding and guidance

🧠 Requirements

To run this script, you need:

A Google Earth Engine account (free signup at https://earthengine.google.com/
)

The Earth Engine Code Editor

No additional libraries — all native GEE JavaScript API

🚀 How to Use
🟦 Option A — Paste into Earth Engine Code Editor

Log in to the Earth Engine Code Editor: https://code.earthengine.google.com/

Create a new script.

Copy the entire content of the JavaScript file (GEDIFIX code).

Paste it into the editor.

Click Run.

🟪 Option B — Open Directly

Use this link to open the script automatically:

👉 https://code.earthengine.google.com/73814ee406ce3581856aae228c63d065

Once loaded, click Run to start.

🧭 User Workflow

Select study area

Click Select Area

Draw a polygon on the map

Or click Import and paste GeoJSON

Set Height Threshold

Enter a number in meters

Example: 10

Set Output Filename

Provide a name (without .csv)

Execute

Click Run

Wait for the task to complete.

Two CSV exports will be available in your Earth Engine Tasks panel.

📂 Output Files

When the process finishes, two tables will be exported to Google Drive:

Output	Description
<OutputName>_beam.csv	Beam-level height differences and metadata
<OutputName>_orbit_stats.csv	Summary stats per orbit of GEDI
🔍 What It Computes

Filters GEDI 02_A monthly products based on quality flags

Uses SRTM + EGM96 to compute ellipsoidal terrain

Computes the absolute difference between GEDI elev_lowestmode and SRTM

Maps:

Elevation difference raster

Masked points where abs difference ≥ threshold

🧾 Script Structure Summarized

The script includes:

🔹 UI Panels & Buttons
🔹 Drawing Tools for geometry
🔹 Function to import GeoJSON
🔹 GEE operations:

GEDI filtering

SRTM elevation

Height difference calculation

Masking and visualization

Export to Drive

🖼 Logos & Credits

This tool includes logos for:

GEDIFIX

CGAT

UPV

Developed by the research team CGAT from the UPV.

❓ Troubleshooting

If the script fails to load icons, check that the assets (logo_cgat, logo_gedifix, logo_upv) exist in your Earth Engine assets.

If map layers don’t appear, ensure your study area is properly drawn.

Check the Tasks tab in Code Editor for Export status.


📄 License

This repository is released under the MIT License — see LICENSE for details.

🙌 Acknowledgements

NASA GEDI mission

Google Earth Engine

CGIAR/SRTM

EGM96 geoid model
