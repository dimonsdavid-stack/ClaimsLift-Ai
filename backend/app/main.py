from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import router as api_router

app = FastAPI(
    title="ClaimLift API",
    description="Autonomous AI Revenue Recovery Platform API",
    version="0.1.0"
)

# Allow the Next.js Vercel frontend to hit these endpoints
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production this should be the Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ClaimLift API"}
