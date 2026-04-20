from fastapi import FastAPI, UploadFile, File
from PyPDF2 import PdfReader
import os

app = FastAPI()

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def extract_text(file_path):
    reader = PdfReader(file_path)
    text = ""

    for page in reader.pages:
        text += page.extract_text() or ""

    return text


@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    file_path = f"{UPLOAD_FOLDER}/{file.filename}"

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    text = extract_text(file_path)

    return {
        "filename": file.filename,
        "text_preview": text[:500]   # just preview
    }