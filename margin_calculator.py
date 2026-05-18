import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')

def calculate_margins():
    logging.info("========== CLAIMLIFT AI: MAX REVENUE PROFIT MARGIN PROJECTION ==========\n")
    
    # Revenue Assumptions (From Hyper-Scale Sprint)
    target_mrr = 105000
    avg_ticket = 1500
    active_clients = target_mrr / avg_ticket
    
    logging.info(f"GROSS MONTHLY REVENUE: ${target_mrr:,.2f}")
    logging.info(f"ACTIVE CLIENTS: {int(active_clients)}")
    
    # Stripe Fees (2.9% + $0.30 per transaction)
    stripe_percentage_fee = target_mrr * 0.029
    stripe_fixed_fee = active_clients * 0.30
    total_stripe_fees = stripe_percentage_fee + stripe_fixed_fee
    
    net_revenue = target_mrr - total_stripe_fees
    logging.info(f"NET REVENUE (After Stripe): ${net_revenue:,.2f}\n")
    
    # Operating Expenses (Monthly)
    # Infrastructure
    infra_cost = 150.00 # Render, Vercel, Supabase, SendGrid
    
    # LLM Token Costs (OpenAI / Anthropic)
    # Assume 5,000 claims processed per client per month
    claims_per_client = 5000
    total_claims = active_clients * claims_per_client
    # Cost per claim (GPT-4o-mini or Claude 3 Haiku: ~1000 input, 300 output tokens)
    # Blended cost ~ $0.0015 per claim
    llm_cost_per_claim = 0.0015
    total_llm_cost = total_claims * llm_cost_per_claim
    
    # Zero overhead for Apollo/Hunter due to Free Tier restriction
    data_cost = 0.00 
    
    total_opex = infra_cost + total_llm_cost + data_cost
    
    logging.info(f"--- EXPENSES ---")
    logging.info(f"Stripe Payment Processing: ${total_stripe_fees:,.2f}")
    logging.info(f"Cloud Infrastructure (Render/Vercel/DB): ${infra_cost:,.2f}")
    logging.info(f"LLM Token Costs (Processing {total_claims:,.0f} claims): ${total_llm_cost:,.2f}")
    logging.info(f"Data Providers (Apollo Free Tier): ${data_cost:,.2f}")
    logging.info(f"TOTAL MONTHLY EXPENSES: ${total_opex + total_stripe_fees:,.2f}\n")
    
    # Margins
    net_profit = target_mrr - (total_stripe_fees + total_opex)
    profit_margin = (net_profit / target_mrr) * 100
    
    logging.info(f"========== PROFITABILITY SNAPSHOT ==========")
    logging.info(f"MONTHLY NET PROFIT: ${net_profit:,.2f}")
    logging.info(f"PROFIT MARGIN: {profit_margin:.2f}%")
    logging.info("============================================")

if __name__ == "__main__":
    calculate_margins()
