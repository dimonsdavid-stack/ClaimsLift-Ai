import logging

logger = logging.getLogger(__name__)

class ClaimNormalizer:
    """
    Normalizes raw claim dictionaries into standard schema fields.
    """
    def __init__(self):
        pass

    def _safe_float(self, value) -> float:
        try:
            return float(str(value).replace('$', '').replace(',', ''))
        except (ValueError, TypeError):
            return 0.0

    def normalize(self, raw_claim: dict, tenant_id: str) -> dict:
        """
        Maps generic CSV headers to database schema.
        """
        normalized = {
            "tenant_id": tenant_id,
            "external_claim_id": raw_claim.get("claim_id") or raw_claim.get("id", ""),
            "payer": raw_claim.get("payer", "Unknown Payer"),
            "patient_ref": raw_claim.get("patient_ref", ""),
            "service_date": raw_claim.get("service_date"),
            "billed_amount": self._safe_float(raw_claim.get("billed_amount")),
            "allowed_amount": self._safe_float(raw_claim.get("allowed_amount")),
            "paid_amount": self._safe_float(raw_claim.get("paid_amount")),
            "status": raw_claim.get("status", "unknown").lower(),
            "denial_code": raw_claim.get("denial_code", ""),
            "raw_payload": raw_claim
        }
        
        # Calculate denied amount if explicit status
        if normalized["status"] in ["denied", "rejected"]:
            normalized["denied_amount"] = normalized["billed_amount"] - normalized["paid_amount"]
        else:
            normalized["denied_amount"] = 0.0
            
        return normalized

if __name__ == "__main__":
    normalizer = ClaimNormalizer()
    print("Claim Normalizer initialized.")
