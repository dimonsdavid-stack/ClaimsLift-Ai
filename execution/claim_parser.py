import csv
import json
import logging

logger = logging.getLogger(__name__)

class ClaimParser:
    """
    Ingests and parses basic CSV exports of claims for the MVP.
    (EDI 835/837 support planned for post-MVP).
    """
    def __init__(self):
        pass

    def parse_csv(self, file_path: str) -> list[dict]:
        """
        Parses a CSV file and returns a list of raw claim dictionaries.
        Expected columns: claim_id, payer, patient_ref, service_date, billed_amount, allowed_amount, paid_amount, status, denial_code
        """
        raw_claims = []
        try:
            with open(file_path, mode='r', encoding='utf-8-sig') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Clean keys (remove extra spaces, lower case)
                    cleaned_row = {k.strip().lower().replace(' ', '_'): v.strip() for k, v in row.items() if k}
                    raw_claims.append(cleaned_row)
            return raw_claims
        except Exception as e:
            logger.error(f"Failed to parse CSV: {e}")
            return []

if __name__ == "__main__":
    parser = ClaimParser()
    print("Claim Parser initialized.")
