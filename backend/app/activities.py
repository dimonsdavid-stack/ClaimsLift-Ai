from temporalio import activity
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../execution')))
from math_double_check import calculate_mrr
from lead_scorer import score_lead

@activity.defn
async def calculate_mrr_activity(subscriptions: list) -> float:
    return calculate_mrr(subscriptions)

@activity.defn
async def score_lead_activity(lead: dict) -> int:
    return score_lead(lead)
