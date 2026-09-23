# Vidhyut Saathi Stock Allocation & Barcode Engine

Professional barcode generation, stock allocation, and label management system built for **Vidhyut Saathi**.

---

## 🌟 Key Features

1. **3-Way Label Generation Modes:**
   - **Sequential Mode:** Bulk generation of sequential barcode labels fitted on 12" × 18" sheets (55 cards/sheet).
   - **Excel Import Mode:** Drag-and-drop `.xlsx`, `.xls`, or `.csv` files to import custom serial numbers while preserving leading zeros (e.g. `0020231501`).
   - **Single Label Generator:** Real-time generation of individual 2" × 1.5" (144 × 108 pt) barcode labels with a quick `+1 Next` button and direct 1-click browser printing for thermal sticker printers.

2. **Pixel-Perfect 2" × 1.5" Card Artwork:**
   - Exact physical card dimensions (4:3 aspect ratio, 2" × 1.5" / 144 × 108 pt).
   - Embedded high-res master artwork with Hindi typography, MRP ₹3,498/-, 10-year lifespan, and 3-year warranty stamps.
   - Code 128 barcode symbology with crisp human-readable serial numbers.

3. **12" × 18" Sheet Plate Rendering:**
   - Precise 5 × 11 layout (55 cards per sheet).
   - Dynamic cut marks and corner borders.
   - Vector-sharp rendering via PDFKit and canvas.

4. **Saved Batches & Stock Management:**
   - History of all generated batches with one-click PDF re-download.
   - Batch deletion to free disk space and clean up database records.
   - Barcode Scanner & Stock Verification tool.

---

## 🛠️ Tech Stack

- **Frontend:** React (Vite), Lucide Icons, Canvas / HTML5, Tailwind / Custom CSS
- **Backend:** Node.js, Express, PDFKit, bwip-js, XLSX
- **Database:** MongoDB Atlas / Local MongoDB fallback / DataStore cache

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env if necessary with your MongoDB URI
node server.js
```
The backend server runs on `http://localhost:5000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend client runs on `http://localhost:5173`.

---

## 📄 License
Private & Proprietary - Vidhyut Saathi / empvs04
