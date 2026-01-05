import requests

BASE_URL = "http://localhost:8000"

# 1. Get all interviews
def test_get_interviews():
    r = requests.get(f"{BASE_URL}/interviews")
    print("GET /interviews:", r.json())

# 2. Add or update an interview using an existing MP3 file
def test_add_interview():
    with open("backend/audio/audio.mp3", "rb") as f:
        files = {
            "file": ("audio.mp3", f)
        }
        data = {
            "name": "Test Interview2"
        }
        r = requests.post(f"{BASE_URL}/interview", files=files, data=data)
        print("POST /interview:", r.json())

# 3. Analyze guilt level
def test_analyze_guilt():
    data = {
        "name": "Test Interview2"
    }
    r = requests.post(f"{BASE_URL}/analyze", data=data)
    print("POST /analyze:", r.json())

if __name__ == "__main__":
    #test_get_interviews()
    test_add_interview()
    test_analyze_guilt()
