import os
import requests
from dotenv import load_dotenv

load_dotenv()

def analyze_guilt(transcript):
    api_key = os.getenv("HACKCLUB_API_KEY")
    server_url = os.getenv("HACKCLUB_SERVER_URL","")
    model = os.getenv("HACKCLUB_MODEL", "qwen/qwen3-32b")
    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are a detective. Analyze the transcript and return a guilt level from 0 (innocent) to 100 (guilty). Only return the number."},
            {"role": "user", "content": transcript}
        ]
    }
    response = requests.post(server_url, headers=headers, json=payload, timeout=30)
    response.raise_for_status()
    result = response.json()
    guilt_level = None
    if "choices" in result and result["choices"]:
        content = result["choices"][0].get("message", {}).get("content", "")
        try:
            guilt_level = int(content.strip())
        except Exception:
            guilt_level = content.strip()
    else:
        guilt_level = result
    return guilt_level
