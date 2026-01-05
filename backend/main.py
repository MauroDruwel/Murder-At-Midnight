from fastapi import FastAPI, Request
import json
import os

app = FastAPI()

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
	return {"interviews": interviews}

@app.post("/interview")
async def add_interview(request: Request):
	data = await request.json()
	# Expecting: {"name": str, "mp3_path": str, "guilt_level": int}
	interviews = load_interviews()
	interviews.append({
		"name": data.get("name", ""),
		"mp3_path": data.get("mp3_path", ""),
		"guilt_level": int(data.get("guilt_level", 0))
	})
	save_interviews(interviews)
	return {"message": "Interview added", "interview": data}
