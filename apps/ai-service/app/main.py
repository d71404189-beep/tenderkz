from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import probability, recommendations, analysis
from app.core.config import settings
from app.core.logging import setup_logging

setup_logging()

app = FastAPI(
    title="TenderKZ AI Service",
    version="0.1.0",
    description="AI-powered analysis for government procurement in Kazakhstan",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(probability.router, prefix="/ai", tags=["probability"])
app.include_router(recommendations.router, prefix="/ai", tags=["recommendations"])
app.include_router(analysis.router, prefix="/ai", tags=["analysis"])


@app.get("/health")
async def health():
    return {"status": "ok", "service": "tenderkz-ai"}
