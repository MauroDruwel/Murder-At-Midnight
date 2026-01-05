
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from backend.utils.interview_files import load_interviews, save_interviews
from backend.utils.transcript import save_audio_file, generate_transcript
from backend.utils.analyze import analyze_guilt
import os
import re

app = FastAPI()

# Allow frontend dev server to access the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/interviews")
def get_interviews():
    interviews = load_interviews()
    return interviews

@app.post("/interview")
async def add_interview(name: str = Form(...), file: UploadFile = File(...)):
    try:
        content = await file.read()
        if not content:
            return {"error": "Uploaded file is empty."}
        file_path, safe_filename = save_audio_file(name, content)
        print(f"[DEBUG] Saved file to: {file_path}")
    except Exception as e:
        print(f"[ERROR] Failed to save file: {e}")
        return {"error": "Failed to save file."}

    interviews = load_interviews()
    interviews = [iv for iv in interviews if iv.get("name") != name]
    transcript_text = None
    try:
        transcript_text = generate_transcript(file_path)
        print(transcript_text)
    except Exception as e:
        print(f"[ERROR] File upload or transcript failed: {e}")
        return {"error": "File upload or transcript failed."}

    interviews.append({
        "name": name,
        "mp3_path": file_path,
        "guilt_level": -1,
        "transcript": transcript_text
    })
    try:
        save_interviews(interviews)
    except Exception as e:
        print(f"[ERROR] Failed to save interviews.json: {e}")
        return {"error": "Failed to update interviews list."}
    return {"message": "Interview added or updated", "name": name, "mp3_path": safe_filename, "transcript": transcript_text}

# Analyze endpoint using Hack Club AI
@app.post("/analyze")
async def analyze_guilt_endpoint(name: str = Form(...)):
    interviews = load_interviews()
    interview = next((iv for iv in interviews if iv.get("name") == name), None)
    if not interview:
        return {"error": "Interview not found."}
    transcript = interview.get("transcript")
    if not transcript:
        return {"error": "No transcript available for this interview."}
    try:
        guilt_level = analyze_guilt(transcript)
        interview["guilt_level"] = guilt_level
        save_interviews(interviews)
        return {"name": name, "guilt_level": guilt_level}
    except Exception as e:
        print(f"[ERROR] Hack Club AI analyze failed: {e}")
        return {"error": "Guilt analysis failed."}
