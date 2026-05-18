import os
import requests
import logging

logger = logging.getLogger(__name__)

class EmailSender:
    def __init__(self, api_key: str = None):
        self.api_key = api_key or os.getenv("SENDGRID_API_KEY")
        self.base_url = "https://api.sendgrid.com/v3/mail/send"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    def _is_compliant(self, text_content: str, html_content: str) -> bool:
        """
        Compliance guardrail for email sending.
        Checks for unsubscribe link and prevents sending PHI or unsupported guarantees.
        """
        content_lower = text_content.lower() + (html_content.lower() if html_content else "")
        
        # Must have opt-out/unsubscribe
        if "unsubscribe" not in content_lower and "opt-out" not in content_lower:
            logger.error("Compliance block: Missing unsubscribe/opt-out mechanism.")
            return False
            
        # Must not contain unsupported guarantees
        unsupported = ["guaranteed recovery", "100% success", "we guarantee to win"]
        for phrase in unsupported:
            if phrase in content_lower:
                logger.error(f"Compliance block: Contains unsupported guarantee '{phrase}'.")
                return False
                
        # Basic PHI keyword check (dummy check for MVP)
        phi_keywords = ["patient name", "ssn", "medical history", "dob"]
        for phrase in phi_keywords:
            if phrase in content_lower:
                logger.error("Compliance block: Potential PHI detected.")
                return False
                
        return True

    def send_email(self, to_email: str, subject: str, text_content: str, html_content: str = None) -> bool:
        if not self.api_key:
            logger.error("SendGrid API Key is missing.")
            return False
            
        if not self._is_compliant(text_content, html_content):
            return False

        data = {
            "personalizations": [{"to": [{"email": to_email}]}],
            "from": {"email": "hello@claimlift.ai", "name": "ClaimLift.ai"},
            "subject": subject,
            "content": [{"type": "text/plain", "value": text_content}]
        }
        
        if html_content:
            data["content"].append({"type": "text/html", "value": html_content})

        response = requests.post(self.base_url, headers=self.headers, json=data)
        if response.status_code in [200, 202]:
            logger.info(f"Email sent successfully to {to_email}")
            return True
        else:
            logger.error(f"Failed to send email: {response.text}")
            return False

if __name__ == "__main__":
    sender = EmailSender("dummy_key")
    print("Email Sender initialized.")
