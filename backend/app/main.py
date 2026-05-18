from fastapi import FastAPI

app = FastAPI(
    title="ClaimLift API",
    description="Autonomous AI Revenue Recovery Platform API",
    version="0.1.0"
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "ClaimLift API"}
