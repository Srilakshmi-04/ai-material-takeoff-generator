from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
import os
import shutil
import json

load_dotenv()

app = FastAPI(title="AI Material Take-Off Generator")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


@app.get("/")
def home():
    return {"status": "Backend Running Successfully 🚀"}


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    prompt = """
You are a Senior Piping Design Engineer with expertise in Material Take-Off (MTO).

Analyze the uploaded piping isometric drawing.

The drawing may be:
- Hand-marked
- Scanned
- Rotated
- Low quality
- Partially visible
- Generated from any CAD software

Your task is to identify ALL visible piping components and estimate the Material Take-Off.

Carefully inspect the entire drawing for components including, but not limited to:

• Pipe
• Elbow (45°, 90°)
• Tee (Equal / Reducing)
• Reducer (Concentric / Eccentric)
• Flange
• Gasket
• Bolt Set
• Gate Valve
• Globe Valve
• Ball Valve
• Butterfly Valve
• Check Valve
• Plug Valve
• Instrument
• Pipe Support
• Strainer
• Spectacle Blind
• Vent
• Drain
• Union
• Cap
• Coupling
• Expansion Joint
• Olets
• Any other visible piping component

Determine the ACTUAL pipe sizes shown in the drawing.

Do NOT assume every pipe is 2 inch.

Estimate quantities only when dimensions are unclear.

If a value cannot be determined exactly, provide the best engineering estimate.

Return ONLY valid JSON.

JSON format:

[
  {
    "component": "Pipe",
    "specification": "6 inch",
    "unit": "Meters",
    "quantity": 120
  }
]

Rules:

- Return JSON only.
- Do not use Markdown.
- Do not wrap JSON inside ``` blocks.
- Do not explain anything.
- Include every visible component.
- If a component appears multiple times, combine the quantities.
- Ensure the JSON is valid and parseable.
"""
    uploaded_file = client.files.upload(file=file_path)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        config={
            "temperature": 0.2
        },
        contents=[
            uploaded_file,
            prompt
        ]
    )

    text = response.text
    text = text.replace("```json", "")
    text = text.replace("```", "")
    text = text.strip()

    try:
        mto = json.loads(text)
    except Exception:
        mto = []

    return {
    "mto": mto
}

@app.get("/test-gemini")
def test_gemini():
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents="Say hello in one sentence."
    )

    return {"response": response.text}