from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import uuid4

class ClaimBase(BaseModel):
    external_claim_id: Optional[str] = None
    payer: str
    patient_ref: Optional[str] = None
    service_date: Optional[str] = None
    billed_amount: float
    allowed_amount: Optional[float] = None
    paid_amount: Optional[float] = None
    denied_amount: Optional[float] = None
    status: str = "pending"
    denial_code: Optional[str] = None
    denial_reason: Optional[str] = None
    priority_score: Optional[float] = None
    estimated_recovery: Optional[float] = None

class ClaimCreate(ClaimBase):
    pass

class ClaimResponse(ClaimBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AppealDraftBase(BaseModel):
    recovery_workflow_id: str
    payer: str
    draft_text: str
    compliance_status: str = "pending_review"

class AppealDraftCreate(AppealDraftBase):
    pass

class AppealDraftResponse(AppealDraftBase):
    id: str
    approved_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AgentRunBase(BaseModel):
    agent_name: str
    directive_name: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    model_name: Optional[str] = None
    model_cost: float = 0.0

class AgentRunCreate(AgentRunBase):
    pass

class AgentRunResponse(AgentRunBase):
    id: str
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True
