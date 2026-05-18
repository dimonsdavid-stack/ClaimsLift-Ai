import os
import requests
import logging
from rate_limit_manager import RateLimitManager

logger = logging.getLogger(__name__)

class HunterClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("HUNTER_API_KEY")
        self.base_url = "https://api.hunter.io/v2"
        self.rate_limiter = RateLimitManager({'minute': 15, 'hour': 250}) # Example free limits

    def domain_search(self, domain: str) -> dict:
        """
        Searches for email addresses associated with a domain.
        """
        if not self.api_key:
            logger.error("Hunter API Key is missing.")
            return {}
            
        self.rate_limiter.wait_for_capacity()
        
        url = f"{self.base_url}/domain-search"
        params = {
            "domain": domain,
            "api_key": self.api_key
        }
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json().get('data', {})
        elif response.status_code == 429:
            logger.warning("Hunter rate limit reached. Backing off.")
            return {}
        else:
            logger.error(f"Hunter API error: {response.text}")
            return {}
            
    def email_verifier(self, email: str) -> str:
        """
        Verifies an email address.
        """
        if not self.api_key:
            return "unknown"
            
        self.rate_limiter.wait_for_capacity()
        
        url = f"{self.base_url}/email-verifier"
        params = {
            "email": email,
            "api_key": self.api_key
        }
        
        response = requests.get(url, params=params)
        if response.status_code == 200:
            return response.json().get('data', {}).get('status', 'unknown')
        return "unknown"

if __name__ == "__main__":
    client = HunterClient("dummy_key")
    print("Hunter client initialized.")
