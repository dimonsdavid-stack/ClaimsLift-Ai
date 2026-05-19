from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime
from uuid import uuid4

from app.models.schemas import (
    ClaimCreate, ClaimResponse, 
    AppealDraftCreate, AppealDraftResponse, 
    AgentRunCreate, AgentRunResponse
)

router = APIRouter()

# In-memory storage for demonstration (simulating the Drizzle ORM pgTable connection)
_claims = []
_appeal_drafts = []
_agent_runs = []

@router.get("/claims", response_model=List[ClaimResponse])
async def list_claims(limit: int = 100, offset: int = 0):
    return _claims[offset:offset+limit]

@router.post("/claims", response_model=ClaimResponse, status_code=201)
async def create_claim(claim: ClaimCreate):
    new_claim = ClaimResponse(
        id=str(uuid4()),
        **claim.model_dump(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    _claims.append(new_claim)
    return new_claim

@router.get("/appeal-drafts", response_model=List[AppealDraftResponse])
async def list_appeal_drafts():
    return _appeal_drafts

@router.post("/appeal-drafts", response_model=AppealDraftResponse, status_code=201)
async def create_appeal_draft(draft: AppealDraftCreate):
    new_draft = AppealDraftResponse(
        id=str(uuid4()),
        **draft.model_dump(),
        created_at=datetime.utcnow()
    )
    _appeal_drafts.append(new_draft)
    return new_draft

@router.post("/appeal-drafts/{draft_id}/approve", response_model=AppealDraftResponse)
async def approve_appeal_draft(draft_id: str):
    for draft in _appeal_drafts:
        if draft.id == draft_id:
            draft.compliance_status = "approved"
            draft.approved_at = datetime.utcnow()
            return draft
    raise HTTPException(status_code=404, detail="Draft not found")

@router.get("/agent-runs", response_model=List[AgentRunResponse])
async def list_agent_runs(limit: int = 50):
    return _agent_runs[:limit]

@router.post("/agent-runs", response_model=AgentRunResponse, status_code=201)
async def create_agent_run(run: AgentRunCreate):
    new_run = AgentRunResponse(
        id=str(uuid4()),
        **run.model_dump(),
        created_at=datetime.utcnow()
    )
    _agent_runs.append(new_run)
    return new_run
