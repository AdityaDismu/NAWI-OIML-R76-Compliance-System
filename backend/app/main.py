from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.router import router


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    router,
    prefix=settings.api_prefix,
)


@app.get("/")
async def root():
    return {
        "message": "NAWI OIML Test Report System API",
        "status": "running",
    }