# 🚀 AI Material Take-Off (MTO) Generator

## Pathnovo Full-Stack AI Engineer Assessment

---

# 📌 Project Overview

The AI Material Take-Off (MTO) Generator is an AI-powered web application that automatically extracts piping components from engineering isometric drawings and generates a structured Material Take-Off (MTO).

The application enables users to upload a piping isometric drawing (PDF or image), processes the drawing using Google Gemini AI through a FastAPI backend, and displays the generated Material Take-Off in an interactive dashboard with CSV export functionality.

The primary objective of this project is to demonstrate an end-to-end AI pipeline rather than perfect engineering extraction accuracy.

---

# 🎯 Problem Statement

Preparing Material Take-Offs manually from piping isometric drawings is repetitive, time-consuming, and susceptible to human error. Engineers must identify piping components, estimate quantities, and prepare procurement lists before fabrication can begin.

This project automates that workflow using Artificial Intelligence, reducing manual effort while providing a structured engineering output suitable for further review.

---

# 📖 Domain Knowledge

## What is a Piping Isometric Drawing?

A piping isometric drawing is a two-dimensional engineering representation of a three-dimensional piping system.

It typically contains:

- Pipe routing
- Pipe sizes
- Elbows
- Tees
- Reducers
- Flanges
- Valves
- Supports
- Weld locations
- Bill of Materials
- Engineering dimensions

These drawings are widely used in:

- Oil & Gas
- Petrochemical
- Chemical
- Pharmaceutical
- Power Generation

---

## What is a Material Take-Off (MTO)?

A Material Take-Off is a structured list of all materials required to fabricate and install a piping system.

Typical components include:

- Pipe
- Elbows
- Tees
- Reducers
- Flanges
- Gate Valves
- Globe Valves
- Ball Valves
- Butterfly Valves
- Bolt Sets
- Gaskets
- Pipe Supports
- Instruments

The generated MTO assists procurement, fabrication planning, inventory management, and project estimation.

---

# ✨ Features

- Upload piping isometric drawings (PDF/Image)
- AI-powered Material Take-Off generation
- Automatic piping component extraction
- Responsive dashboard
- CSV export
- FastAPI backend
- Next.js frontend
- Google Gemini AI integration
- Mock Mode support (works without API key)

---

# 🏗 System Architecture

```
                User
                  │
                  ▼
        Next.js Frontend
                  │
          Upload Drawing
                  │
                  ▼
          FastAPI Backend
                  │
                  ▼
        Google Gemini AI
                  │
        Structured JSON Output
                  │
                  ▼
     Material Take-Off Dashboard
                  │
                  ▼
             CSV Export
```

---

# 🤖 AI Pipeline

1. User uploads an isometric drawing.
2. FastAPI stores the uploaded file temporarily.
3. The drawing is sent to Google Gemini AI.
4. Gemini identifies visible piping components.
5. The AI response is converted into structured JSON.
6. The frontend displays the Material Take-Off.
7. Users can export the generated MTO as CSV.

---

# 🛠 Technology Stack

## Frontend

- Next.js
- React
- TypeScript

## Backend

- FastAPI
- Python

## AI

- Google Gemini 2.5 Flash

## Supporting Libraries

- python-dotenv
- CORS Middleware

---

# 📂 Folder Structure

```
ai-material-takeoff-generator/

│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env (local only)
│
├── frontend/
│   ├── app/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── README.md
└── .gitignore
```

---

# ⚙️ Installation

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs on:

```
http://127.0.0.1:8000
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```
http://localhost:3000
```

---

# 🔑 Environment Variable

Create a `.env` file inside the backend folder.

```
GEMINI_API_KEY=YOUR_API_KEY
```

The `.env` file is intentionally excluded from version control.

---

# 🧪 Mock Mode

As required by the assessment, the application supports execution without an API key.

When no `GEMINI_API_KEY` is available, the backend automatically switches to **Mock Mode**, returning a predefined sample Material Take-Off. This ensures the application remains functional even without external AI services.

---

# 📊 Sample Output

| Component | Specification | Quantity |
|-----------|--------------|---------:|
| Pipe | 2 inch | 40 |
| Elbow 90° | 2 inch | 18 |
| Gate Valve | 2 inch | 6 |
| Flange | 2 inch | 12 |
| Gasket | 2 inch | 12 |

---

# 📥 Export

Generated Material Take-Off reports can be exported as CSV for further engineering workflows.

---

# 🧠 Design Decisions

- FastAPI was selected for its lightweight and high-performance REST API capabilities.
- Next.js was chosen to build a responsive and interactive frontend.
- Google Gemini 2.5 Flash was used because it supports multimodal understanding of PDFs and images.
- The backend converts AI responses into structured JSON before sending them to the frontend.
- CSV export was implemented because it is a widely accepted engineering data exchange format.

---

# ⚖️ Trade-offs

- The project prioritizes a complete end-to-end AI workflow over perfect extraction accuracy.
- Quantities are estimated when drawings contain incomplete or unclear dimensions.
- OCR was not implemented separately because Gemini provides multimodal document understanding.
- Advanced engineering attributes (Schedule, Material Grade, Pressure Class) are extracted only when clearly visible.

---

# 📌 Assumptions

- Each uploaded file contains one piping isometric drawing.
- Drawings are reasonably legible.
- AI estimates values when dimensions are unclear.
- Mock Mode is used when no API key is configured.
- CSV output is intended for review and may require engineering validation before procurement.

---

# ⚠️ Known Limitations

- AI output quality depends on drawing clarity.
- Handwritten annotations may reduce extraction accuracy.
- Extremely complex drawings may require manual verification.
- Some engineering metadata may not be available if not present in the drawing.

---

# 🚀 Future Enhancements

- Excel export
- PDF report generation
- OCR enhancement
- Confidence score for detected components
- Multi-sheet isometric processing
- Automatic BOM generation
- Engineering specification extraction (Schedule, Material, Pressure Class)

---

# 👩‍💻 Author

**Srilakshmi**

B.Tech (Hons.) – Data Science & Engineering

Developed as part of the **Pathnovo Full-Stack AI Engineer Internship Assessment**.

---

# 📄 License

This project was developed exclusively for the Pathnovo Full-Stack AI Engineer Internship Assessment and educational purposes.
