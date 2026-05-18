def score_lead(lead_data: dict) -> int:
    """
    Scores a lead from 0-100 based on the criteria in the directives.
    Criteria:
    - ICP match: 0-25
    - Company size / claim volume proxy: 0-20
    - RCM/billing relevance: 0-20
    - Decision-maker seniority: 0-15
    - Pain signal: 0-10
    - Email confidence: 0-5
    - Partner potential: 0-5
    """
    score = 0
    
    # 1. ICP Match (0-25)
    industry = lead_data.get('industry', '').lower()
    if 'healthcare' in industry or 'hospital' in industry or 'medical' in industry:
        score += 25
        
    # 2. Company size (0-20)
    size = lead_data.get('company_size', 0)
    if isinstance(size, int) and size > 10:
        score += min(20, (size // 10) * 5)
        
    # 3. RCM/billing relevance (0-20)
    title = lead_data.get('title', '').lower()
    if any(kw in title for kw in ['rcm', 'revenue cycle', 'billing', 'finance']):
        score += 20
        
    # 4. Seniority (0-15)
    if any(kw in title for kw in ['ceo', 'founder', 'owner', 'partner', 'cfo', 'vp', 'director']):
        score += 15
        
    # 5. Pain signal (0-10)
    # Placeholder for logic extracting pain signals from intent data or custom scraping
    if lead_data.get('intent_signal_detected'):
        score += 10
        
    # 6. Email confidence (0-5)
    email_status = lead_data.get('email_status', '')
    if email_status == 'verified':
        score += 5
        
    # 7. Partner potential (0-5)
    if 'consult' in industry or 'agency' in industry:
        score += 5
        
    return min(100, max(0, score))

if __name__ == "__main__":
    test_lead = {
        'industry': 'Healthcare',
        'company_size': 50,
        'title': 'Director of Revenue Cycle',
        'email_status': 'verified',
        'intent_signal_detected': False
    }
    print(f"Lead Score: {score_lead(test_lead)}")
