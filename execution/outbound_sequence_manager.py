import logging
from email_sender import EmailSender

logger = logging.getLogger(__name__)

class OutboundSequenceManager:
    """
    Manages the sending of outbound sequences based on lead state.
    """
    def __init__(self, email_sender: EmailSender):
        self.email_sender = email_sender
        
    def generate_day1_email(self, lead: dict) -> tuple:
        """
        Generates the initial outreach email (Subject, HTML content).
        """
        first_name = lead.get('first_name', 'there')
        company = lead.get('company_domain', 'your organization')
        
        subject = f"Question about {company}'s denied claims"
        html = f"""
        <p>Hi {first_name},</p>
        <p>I noticed your team is likely handling a high volume of medical claims at {company}. Many practices leave up to 15% of revenue on the table due to unworked CO-16 and CO-29 denials.</p>
        <p>We built an AI platform that instantly finds these underpayments and drafts the appeal letters automatically.</p>
        <p>Are you open to a quick 10-minute demo to see how much we could recover?</p>
        <p>Best,<br>The ClaimLift Team</p>
        <br><br>
        <p style="font-size: 10px; color: gray;">If you'd rather not hear from us again, please <a href="#unsubscribe">unsubscribe</a>.</p>
        """
        return subject, html

    def enroll_and_send(self, lead: dict):
        """
        Enrolls lead in the Day 1 sequence and sends the email if compliant.
        """
        email = lead.get('email')
        if not email:
            logger.error("Lead missing email. Cannot enroll.")
            return False
            
        subject, html = self.generate_day1_email(lead)
        text_content = html.replace('<p>', '').replace('</p>', '\n').replace('<br>', '\n') # Basic strip
        
        success = self.email_sender.send_email(
            to_email=email,
            subject=subject,
            text_content=text_content,
            html_content=html
        )
        if success:
            logger.info(f"Successfully enrolled {email} in Day 1 Sequence.")
            return True
        return False
        
if __name__ == "__main__":
    print("Outbound Sequence Manager initialized.")
