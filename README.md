# GEDIFIX — Geolocation Error Identification in GEDI Data (Google Earth Engine)

GEDIFIX is an **interactive Google Earth Engine application** that identifies potential geolocation errors in NASA’s GEDI (Global Ecosystem Dynamics Investigation) waveform lidar data.  
It compares the terrain elevation derived from GEDI waveform attributes with an external terrain model (SRTM), highlights beams with large elevation differences, and allows users to export results.

You can run this script by copying and pasting the code into the **Earth Engine Code Editor**, or by opening it directly using the link below:

🔗 **Run in Google Earth Engine:**  
https://code.earthengine.google.com/73814ee406ce3581856aae228c63d065

---

## 📌 Overview

GEDIFIX performs the following steps:

- Allows the user to **draw or import a study area polygon**.
- Accepts a **height difference threshold** (in meters).
- Computes the **absolute difference between GEDI terrain elevation and SRTM terrain elevation**.
- Displays areas where height differences **exceed the threshold**.
- Exports **two CSV files**:
  - Beam-level height differences
  - Orbit-level summary statistics

---

## ✨ Features

- ✔ Draw a polygon directly on the map  
- ✔ Import a custom GeoJSON polygon  
- ✔ Visualize GEDI–SRTM elevation differences  
- ✔ Export CSV results (beam and orbit level)  
- ✔ Interactive UI with logos and guided usage

---

## 🧠 Requirements

To run this script you need:

- A **Google Earth Engine account** (free signup at https://earthengine.google.com/)  
- Access to the **Earth Engine Code Editor**  
- No additional libraries — this uses the native GEE JavaScript API

---

## 🚀 How to Use

### 🟦 Option A — Paste into Earth Engine Code Editor

1. Log in to the Earth Engine Code Editor: https://code.earthengine.google.com/  
2. Create a new script.  
3. Copy the entire content of the JavaScript file (gedifix.js).  
4. Paste it into the editor.  
5. Click **Run**.

---

### 🟪 Option B — Open Directly

Use the link below to automatically load the script:

👉 https://code.earthengine.google.com/73814ee406ce3581856aae228c63d065

Once loaded, click **Run** to start.

---

## 🧭 User Workflow

1. **Select study area**
   - Click **Select Area**
   - Draw a polygon on the map  
   - Or click **Import** and paste a GeoJSON

2. **Enter Height Threshold**
   - Type a value (e.g., `10`)

3. **Enter Output File Name**
   - Provide a name (without `.csv`)

4. **Execute**
   - Click **Run**

5. Wait for the task to complete  
   - CSV exports will appear in the **Tasks** panel in Earth Engine

---

## 📂 Output Files

After execution, two tables will be exported to **Google Drive**:

| Output File | Description |
|-------------|-------------|
| `<OutputName>_beam.csv` | Beam-level height differences and metadata |
| `<OutputName>_orbit_stats.csv` | Orbit-level summary statistics |

---

## 🔍 What It Computes

- Filters GEDI 02_A monthly products based on quality flags  
- Uses **SRTM** + **EGM96 geoid** to compute terrain elevation  
- Computes the absolute difference between GEDI **elev_lowestmode** and SRTM  
- Renders:
  - Elevation difference raster
  - Masked points where absolute difference ≥ threshold

---

## 🧾 Script Structure

The script includes:

- 🔹 UI panels and buttons  
- 🔹 Drawing tools for geometry  
- 🔹 Import GeoJSON support  
- 🔹 GEE image and geometry operations:
  - GEDI data filtering
  - Terrain calculation (SRTM + geoid)
  - Height difference computation
  - Visualization
  - Export to Drive

---

## 🖼 Logos & Credits

This tool includes the following logos (hosted in Earth Engine assets):

- GEDIFIX  
- CGAT  
- UPV  

Developed by the research team at **CGAT – Universitat Politècnica de València (UPV)**.

---

## ❓ Troubleshooting

- If the script fails to load the logos, make sure the asset paths exist (logo_cgat, logo_gedifix, logo_upv).  
- If map layers don’t appear, ensure the **study area** is properly drawn.  
- Check the **Tasks** tab in the Code Editor to monitor export status.

---

## 📄 License

This project is released under the **MIT License** — see `LICENSE` for details.

---

## 🙌 Acknowledgements

- **NASA GEDI mission**  
- **Google Earth Engine platform**  
- **CGIAR/SRTM Digital Elevation Model**  
- **EGM96 geoid model**
