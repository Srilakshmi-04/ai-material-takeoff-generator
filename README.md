# 🚀 AI Material Take-Off Generator

An AI-powered web application that automatically generates a Material Take-Off (MTO) from piping isometric drawings using Google Gemini AI.

## 📌 Project Overview

The AI Material Take-Off Generator helps engineers automate the extraction of piping components from isometric drawings. Instead of manually counting components, users upload a PDF or image, and the AI generates a structured Material Take-Off report.

## ✨ Features

- 📄 Upload PDF or image isometric drawings
- 🤖 AI-powered component detection using Google Gemini AI
- 📊 Automatic Material Take-Off generation
- 📋 Displays components in a clean dashboard
- 📥 Download results as CSV
- ⚡ FastAPI backend
- 🎨 Modern Next.js frontend
- 🌙 Responsive dark-themed UI

## 🛠 Tech Stack

### Frontend
- Next.js
- React
- TypeScript

### Backend
- FastAPI
- Python

### AI
- Google Gemini 2.5 Flash API

### Other
- CSV Export
- REST API
- CORS
- dotenv

## 📂 Project Structure

```
isometric-mto/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   └── .env
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

## ⚙ Installation

### Clone Repository

```bash
git clone <your-repository-url>
cd isometric-mto
```

### Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate
```

Install dependencies

```bash
pip install -r requirements.txt
```

Create a `.env` file

```
GEMINI_API_KEY=YOUR_API_KEY
```

Run backend

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend

npm install

npm run dev
```

Open

```
http://localhost:3000
```

## 🚀 Workflow

1. Upload a piping isometric drawing.
2. Backend sends the drawing to Google Gemini AI.
3. AI detects piping components.
4. Material Take-Off is generated.
5. Results are displayed.
6. Download the report as CSV.

## 📊 Sample Output

| Component | Specification | Unit | Quantity |
|-----------|--------------|------|---------|
| Pipe | 2 inch | Meters | 60 |
| Elbow | 2 inch | Nos | 20 |
| Tee | 2 inch | Nos | 12 |
| Gate Valve | 2 inch | Nos | 6 |

## 🔮 Future Enhancements

- PDF Export
- Excel Export
- Confidence Score
- OCR Improvements
- Support for more engineering drawing formats

## 👩‍💻 Author

**Srilakshmi**

Built as an AI Engineering Internship Project.

---

⭐ If you found this project useful, please consider giving it a star.
