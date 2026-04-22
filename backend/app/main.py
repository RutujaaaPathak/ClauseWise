from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
import os
from datetime import datetime

app = FastAPI()

# ✅ Enable CORS (VERY IMPORTANT for frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# ✅ Temporary in-memory storage
documents_db = []


def extract_text(file_path):
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text


# 🚀 Upload API (UPDATED)
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    text = extract_text(file_path)

    # ✅ Dummy analysis (replace later with AI)
    doc = {
        "id": len(documents_db) + 1,
        "name": file.filename,
        "type": "Unknown",
        "score": 50,
        "risk": "Processing",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "text_preview": text[:200]
    }

    documents_db.append(doc)

    return doc


# 🚀 Documents API (for your table UI)
@app.get("/documents")
def get_documents():
    return documents_db