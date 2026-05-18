import logging

logger = logging.getLogger(__name__)

class LeadDeduper:
    def __init__(self):
        # In a real scenario, this would check the DB/CRM directly
        self.seen_emails = set()
        self.seen_domains = set()

    def is_duplicate(self, lead: dict) -> bool:
        email = lead.get("email", "").lower()
        domain = lead.get("company_domain", "").lower()
        
        if not email:
            return True
            
        if email in self.seen_emails:
            logger.info(f"Duplicate lead filtered: {email}")
            return True
            
        # Optional: restrict to one lead per company to avoid spamming
        if domain and domain in self.seen_domains:
            logger.info(f"Domain already targeted: {domain}. Filtering {email}")
            return True
            
        self.seen_emails.add(email)
        if domain:
            self.seen_domains.add(domain)
            
        return False
        
if __name__ == "__main__":
    deduper = LeadDeduper()
    print(deduper.is_duplicate({"email": "test@test.com", "company_domain": "test.com"}))
    print(deduper.is_duplicate({"email": "test2@test.com", "company_domain": "test.com"})) # True due to domain
