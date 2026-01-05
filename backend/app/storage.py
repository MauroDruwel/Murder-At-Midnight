from __future__ import annotations

import json
import os
import tempfile
from pathlib import Path
from typing import Any, Optional

from .models import Interview, now_iso


class JsonInterviewStore:
    def __init__(self, path: str) -> None:
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def _read_raw(self) -> dict[str, Any]:
        if not self.path.exists():
            return {"version": 1, "interviews": {}}
        try:
            return json.loads(self.path.read_text(encoding="utf-8"))
        except Exception:
            # If the file is corrupted, don't crash the whole server.
            return {"version": 1, "interviews": {}}

    def _atomic_write(self, data: dict[str, Any]) -> None:
        self.path.parent.mkdir(parents=True, exist_ok=True)
        fd, tmp_name = tempfile.mkstemp(prefix=self.path.stem + ".", suffix=".tmp", dir=str(self.path.parent))
        try:
            with os.fdopen(fd, "w", encoding="utf-8") as f:
                json.dump(data, f, ensure_ascii=False, indent=2)
            os.replace(tmp_name, self.path)
        finally:
            try:
                if os.path.exists(tmp_name):
                    os.unlink(tmp_name)
            except Exception:
                pass

    def list(self) -> list[Interview]:
        raw = self._read_raw()
        interviews = raw.get("interviews", {})
        results: list[Interview] = []
        if isinstance(interviews, dict):
            for value in interviews.values():
                try:
                    results.append(Interview.model_validate(value))
                except Exception:
                    continue
        results.sort(key=lambda x: x.updated_at, reverse=True)
        return results

    def get(self, interview_id: str) -> Optional[Interview]:
        raw = self._read_raw()
        interviews = raw.get("interviews", {})
        if not isinstance(interviews, dict):
            return None
        value = interviews.get(interview_id)
        if not value:
            return None
        try:
            return Interview.model_validate(value)
        except Exception:
            return None

    def upsert(self, interview: Interview) -> Interview:
        raw = self._read_raw()
        interviews = raw.get("interviews")
        if not isinstance(interviews, dict):
            interviews = {}
            raw["interviews"] = interviews

        interview.updated_at = now_iso()
        interviews[interview.id] = interview.model_dump()
        self._atomic_write(raw)
        return interview

    def delete(self, interview_id: str) -> bool:
        raw = self._read_raw()
        interviews = raw.get("interviews")
        if not isinstance(interviews, dict):
            return False
        if interview_id not in interviews:
            return False
        del interviews[interview_id]
        self._atomic_write(raw)
        return True
