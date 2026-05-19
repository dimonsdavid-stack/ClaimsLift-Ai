import os
import json
import logging

logging.basicConfig(level=logging.INFO, format='%(message)s')
logger = logging.getLogger(__name__)

def simulate_scenario(name, start_conversion, max_conversion, churn, lead_velocity_multiplier):
    months = 12
    avg_ticket = 1500
    base_lead_capacity = 3000
    llm_cost_per_claim = 0.0015
    claims_per_client_per_mo = 4000
    stripe_fee = 0.029
    base_infra = 150
    
    current_mrr = 0
    active_clients = 0
    total_revenue_ytd = 0
    total_profit_ytd = 0
    
    monthly_data = []
    conversion_rate = start_conversion
    
    for month in range(1, months + 1):
        # Optimization curve
        if month == 3:
            conversion_rate = min(max_conversion, conversion_rate * 1.5)
        if month == 6:
            base_lead_capacity = int(base_lead_capacity * lead_velocity_multiplier)
            churn = max(0.01, churn * 0.8) # Retention agent reduces churn by 20%
            avg_ticket = 1800 # Price increase
        if month == 9:
            conversion_rate = max_conversion
            
        new_clients = int(base_lead_capacity * conversion_rate)
        lost_clients = int(active_clients * churn)
        
        active_clients = max(0, active_clients + new_clients - lost_clients)
        current_mrr = active_clients * avg_ticket
        total_revenue_ytd += current_mrr
        
        stripe_costs = current_mrr * stripe_fee + (active_clients * 0.30)
        llm_costs = active_clients * claims_per_client_per_mo * llm_cost_per_claim
        infra_costs = base_infra + (active_clients * 10)
        
        total_opex = stripe_costs + llm_costs + infra_costs
        net_profit = current_mrr - total_opex
        total_profit_ytd += net_profit
        
        margin = (net_profit / current_mrr * 100) if current_mrr > 0 else 0
        
        monthly_data.append({
            "Month": month,
            "Clients": active_clients,
            "MRR": current_mrr,
            "Profit": net_profit,
            "Margin": margin
        })
        
    return {
        "Name": name,
        "Total_Rev": total_revenue_ytd,
        "Total_Profit": total_profit_ytd,
        "Final_MRR": monthly_data[-1]["MRR"],
        "Final_Margin": monthly_data[-1]["Margin"],
        "Data": monthly_data
    }

def run_3_tier_simulation():
    logger.info("Running 3-Tier Reality-Based 12-Month Projections...")
    
    # Tier 1: Conservative (Most Likely Base)
    # 0.5% cold win rate, caps at 1.0%, 5% churn, 2x lead velocity reinvestment
    base_case = simulate_scenario("Base Case (Most Likely)", 0.005, 0.01, 0.05, 2.0)
    
    # Tier 2: Aggressive (Best Real Outcome)
    # 0.8% cold win rate, caps at 1.8%, 4% churn, 3x lead velocity reinvestment
    best_case = simulate_scenario("Aggressive Case (Best Real)", 0.008, 0.018, 0.04, 3.0)
    
    # Tier 3: Maximum Forecast (Perfect Market Fit)
    # 1.2% cold win rate, caps at 3.0%, 2% churn, 5x lead velocity reinvestment
    max_case = simulate_scenario("Maximum Forecast (Perfect Fit)", 0.012, 0.03, 0.02, 5.0)
    
    generate_markdown_report([base_case, best_case, max_case])

def generate_markdown_report(scenarios):
    filepath = "/Users/davidaknin/Downloads/Antigravityai/claimlift-ai/Y1_3TIER_PROJECTION_REPORT.md"
    
    md = "# ClaimLift AI: 3-Tier 12-Month Financial & Operational Projection\n\n"
    md += "This report outlines three realistic forward-looking projections (Base, Aggressive, Maximum) for the first 12 months of operations. Projections account for agentic optimizations, churn, Stripe fees, and LLM API costs.\n\n"
    
    md += "## Executive Summary (Year 1 Totals)\n\n"
    md += "| Scenario | Y1 Total Revenue | Y1 Total Profit | Final Month 12 MRR | Final Margin |\n"
    md += "| :--- | :--- | :--- | :--- | :--- |\n"
    
    for s in scenarios:
        md += f"| **{s['Name']}** | ${s['Total_Rev']:,.2f} | ${s['Total_Profit']:,.2f} | ${s['Final_MRR']:,.2f} | {s['Final_Margin']:.1f}% |\n"
        
    md += "\n---\n\n"
    
    for s in scenarios:
        md += f"## Scenario: {s['Name']}\n\n"
        md += "| Month | Active Clients | Gross MRR | Net Profit | Profit Margin |\n"
        md += "| :--- | :--- | :--- | :--- | :--- |\n"
        for row in s['Data']:
            md += f"| {row['Month']} | {row['Clients']} | ${row['MRR']:,.2f} | ${row['Profit']:,.2f} | {row['Margin']:.1f}% |\n"
        md += "\n"
        
    md += """
## Agentic Optimization Timeline

* **Month 1-2:** System gathers baseline data at $1,500/mo. Lead velocity is capped at Apollo Free Tier limits.
* **Month 3 (ICP Calibration):** Revenue Command Agent refines targeting. Win rates increase by 50%.
* **Month 6 (Reinvestment & Retention):** Profits are reinvested into API upgrades (SendGrid Pro, Apollo Pro) scaling lead volume heavily. Pricing tests increase base to $1,800/mo. Retention Agent drops churn by 20%.
* **Month 9 (Flywheel):** Brand awareness and case-study loops push win rates to their maximum caps.

> **PDF Generation:** To save this report as a PDF, simply open this markdown file in your IDE or browser and use the 'Print to PDF' function.
"""

    with open(filepath, 'w') as f:
        f.write(md)
        
    logger.info(f"Report generated successfully at: {filepath}")

if __name__ == "__main__":
    run_3_tier_simulation()
