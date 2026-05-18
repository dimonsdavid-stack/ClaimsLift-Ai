def classify_denial(denial_code: str, raw_status: str) -> dict:
    """
    Classifies denial reason based on standard codes.
    Returns categorized intent and priority score logic.
    """
    code = str(denial_code).upper().strip()
    status = str(raw_status).lower().strip()
    
    classification = {
        "category": "Unknown",
        "priority_score": 10,
        "is_appealable": True
    }
    
    # Common CARC Codes (Simplified for MVP)
    if code in ["CO-16", "16"]:
        classification["category"] = "Lacking Information"
        classification["priority_score"] = 80 # Easy to fix
    elif code in ["CO-18", "18"]:
        classification["category"] = "Duplicate Claim"
        classification["priority_score"] = 20 # Rarely yields new revenue
        classification["is_appealable"] = False
    elif code in ["CO-27", "27"]:
        classification["category"] = "Coverage Expired"
        classification["priority_score"] = 30
    elif code in ["CO-29", "29"]:
        classification["category"] = "Timely Filing"
        classification["priority_score"] = 50 # Hard but high value if proven
    elif code in ["CO-97", "97"]:
        classification["category"] = "Bundled Service"
        classification["priority_score"] = 60
        
    if status == "denied" and not code:
        classification["category"] = "Generic Denial"
        classification["priority_score"] = 40
        
    return classification

if __name__ == "__main__":
    print(classify_denial("CO-16", "denied"))
