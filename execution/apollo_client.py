import os
import requests
import logging
from rate_limit_manager import RateLimitManager

logger = logging.getLogger(__name__)

class ApolloClient:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("APOLLO_API_KEY")
        self.base_url = "https://api.apollo.io/v1"
        # Adjusted for Free Subscription (max 100 searches/mo)
        self.rate_limiter = RateLimitManager({'minute': 10, 'hour': 25, 'day': 50})

    def search_people(self, query: dict) -> list:
        """
        Searches people on Apollo based on ICP query parameters.
        Returns a list of leads.
        """
        if not self.api_key:
            logger.error("Apollo API Key is missing.")
            return []
            
        self.rate_limiter.wait_for_capacity()
        
        url = f"{self.base_url}/mixed_people/search"
        headers = {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache"
        }
        data = {
            "api_key": self.api_key,
            **query
        }
        
        response = requests.post(url, headers=headers, json=data)
        if response.status_code == 200:
            return response.json().get('people', [])
        elif response.status_code == 429:
            logger.warning("Apollo rate limit reached despite manager. Backing off.")
            # Implement exponential backoff here if needed
            return []
        else:
            logger.error(f"Apollo API error: {response.text}")
            return []

if __name__ == "__main__":
    client = ApolloClient("dummy_key")
    print("Apollo client initialized.")
