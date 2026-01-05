from fastapi import FastAPI, Request
from google import genai
import json
import os

app = FastAPI()
client = genai.Client()

DATA_FILE = "interviews.json"

def load_interviews():
	if not os.path.exists(DATA_FILE):
		return []
	with open(DATA_FILE, "r") as f:
		return json.load(f)

def save_interviews(interviews):
	with open(DATA_FILE, "w") as f:
		json.dump(interviews, f)

@app.get("/interviews")
def get_interviews():
	interviews = load_interviews()
	return interviews

@app.post("/interview")
async def add_interview(request: Request):
	data = await request.json()
	# Expecting: {"name": str, "mp3_path": str}
	interviews = load_interviews()
	name = data.get("name", "")
	mp3Path = data.get("mp3_path", "")
	interviews.append({
		"name": name,
		"mp3_path": mp3Path,
		"guilt_level": -1
	})
	save_interviews(interviews)
	mp3File = client.files.upload(file=mp3Path)
	transcript = client.models.generate_content(model='gemini-2.5-flash', contents=["Generate a transcript of the speech.", mp3File])
	print(transcript)
	return {"message": "Interview added", "interview": data}
