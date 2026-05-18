import math

def calculate_roi(investment: float, return_value: float) -> float:
    """Calculates ROI percentage deterministically."""
    if investment <= 0:
        return 0.0
    return round(((return_value - investment) / investment) * 100, 2)

def calculate_mrr(subscriptions: list[dict]) -> float:
    """Calculates Monthly Recurring Revenue deterministically."""
    total_mrr = sum(sub.get('mrr', 0) for sub in subscriptions if sub.get('status') == 'active')
    return round(total_mrr, 2)

def calculate_recovery_value(billed_amount: float, allowed_amount: float, paid_amount: float) -> float:
    """Calculates the estimated recoverable value of a claim deterministically."""
    expected_payment = allowed_amount if allowed_amount > 0 else billed_amount
    underpayment = expected_payment - paid_amount
    return round(max(0.0, underpayment), 2)

if __name__ == "__main__":
    # Test cases
    print(f"ROI: {calculate_roi(1000, 1500)}%")
    print(f"MRR: {calculate_mrr([{'mrr': 1000, 'status': 'active'}, {'mrr': 500, 'status': 'canceled'}])}")
    print(f"Recovery: {calculate_recovery_value(500, 400, 200)}")
