from __future__ import annotations

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes import build_router
from .storage import JsonInterviewStore


load_dotenv()


def create_app() -> FastAPI:
    app = FastAPI(title="Murder At Midnight Backend")

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    db_path = os.getenv("INTERVIEWS_DB_PATH", "data/interviews.json")
    store = JsonInterviewStore(db_path)

    app.include_router(build_router(store))
    return app


app = create_app()
