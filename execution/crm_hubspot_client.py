import os
import requests
import logging

logger = logging.getLogger(__name__)

class HubSpotCRMClient:
    def __init__(self, access_token: str = None):
        self.access_token = access_token or os.getenv("HUBSPOT_ACCESS_TOKEN")
        self.base_url = "https://api.hubapi.com/crm/v3"
        self.headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json"
        }

    def create_or_update_contact(self, email: str, properties: dict) -> dict:
        """
        Creates a contact or updates if it already exists based on email.
        """
        if not self.access_token:
            logger.error("HubSpot Access Token is missing.")
            return {}

        # First try to search by email to see if it exists
        search_url = f"{self.base_url}/objects/contacts/search"
        search_data = {
            "filterGroups": [{
                "filters": [{
                    "propertyName": "email",
                    "operator": "EQ",
                    "value": email
                }]
            }]
        }
        
        response = requests.post(search_url, headers=self.headers, json=search_data)
        
        if response.status_code == 200:
            results = response.json().get('results', [])
            if results:
                contact_id = results[0]['id']
                # Update existing contact
                update_url = f"{self.base_url}/objects/contacts/{contact_id}"
                update_resp = requests.patch(update_url, headers=self.headers, json={"properties": properties})
                if update_resp.status_code == 200:
                    return update_resp.json()
                else:
                    logger.error(f"Failed to update contact: {update_resp.text}")
                    return {}

        # If not exists, create
        create_url = f"{self.base_url}/objects/contacts"
        properties['email'] = email
        create_resp = requests.post(create_url, headers=self.headers, json={"properties": properties})
        if create_resp.status_code == 201:
            return create_resp.json()
        else:
            logger.error(f"Failed to create contact: {create_resp.text}")
            return {}

if __name__ == "__main__":
    client = HubSpotCRMClient("dummy_token")
    print("HubSpot CRM Client initialized.")
