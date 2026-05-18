import logging

logger = logging.getLogger(__name__)

class GTMAgent:
    """
    Agent 3: GTM Agent
    Responsibilities: Lead generation orchestration across tools, scoring, and sequence enrollment.
    """
    def __init__(self, apollo_client, hunter_client, scorer, hubspot_client):
        self.apollo = apollo_client
        self.hunter = hunter_client
        self.scorer = scorer
        self.crm = hubspot_client

    def run_lead_generation_cycle(self, icp_query: dict) -> list:
        """
        Runs a full generation cycle using the waterfall logic (Apollo -> Hunter).
        """
        logger.info("Starting GTM lead generation cycle.")
        
        # 1. Apollo API Primary Source
        leads = []
        try:
            leads = self.apollo.search_people(icp_query)
        except Exception as e:
            logger.error(f"Apollo API failed: {e}")
            
        # 2. Fallback to Hunter if Apollo fails or yields low volume
        if len(leads) < 10:
            logger.info("Low yield from Apollo. Falling back to Hunter for targeted domains.")
            domains_to_target = icp_query.get("domains", [])
            for domain in domains_to_target:
                hunter_data = self.hunter.domain_search(domain)
                emails = hunter_data.get('emails', [])
                for email_info in emails:
                    leads.append({
                        "first_name": email_info.get("first_name"),
                        "last_name": email_info.get("last_name"),
                        "email": email_info.get("value"),
                        "title": email_info.get("position"),
                        "company_domain": domain,
                        "email_status": "verified" if email_info.get("confidence", 0) > 90 else "unknown"
                    })

        # 3. Score and push to CRM
        qualified_leads = []
        for lead in leads:
            score = self.scorer(lead)
            lead["score"] = score
            if score >= 70:
                logger.info(f"Qualified lead found: {lead.get('email')} (Score: {score})")
                self.crm.create_or_update_contact(lead.get('email'), lead)
                qualified_leads.append(lead)
            elif 50 <= score < 70:
                logger.info(f"Nurture lead found: {lead.get('email')} (Score: {score})")
                
        return qualified_leads

if __name__ == "__main__":
    print("GTM Agent structure initialized.")
