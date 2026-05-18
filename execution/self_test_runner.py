import os
import subprocess
import logging
from math_double_check import calculate_roi, calculate_mrr, calculate_recovery_value
from lead_scorer import score_lead

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class SelfTestRunner:
    """
    Self-Audit Agent functionality:
    Runs deterministic tests across the system components.
    """
    def __init__(self):
        self.failed_tests = []

    def test_math_engine(self):
        logger.info("Testing Math Engine...")
        try:
            assert calculate_roi(1000, 1500) == 50.0
            assert calculate_mrr([{'mrr': 1000, 'status': 'active'}, {'mrr': 500, 'status': 'canceled'}]) == 1000.0
            assert calculate_recovery_value(500, 400, 200) == 200.0
            logger.info("Math Engine: PASSED")
        except AssertionError as e:
            logger.error("Math Engine: FAILED")
            self.failed_tests.append("Math Engine")

    def test_lead_scorer(self):
        logger.info("Testing Lead Scorer...")
        try:
            test_lead = {
                'industry': 'Healthcare',
                'company_size': 50,
                'title': 'Director of Revenue Cycle',
                'email_status': 'verified',
                'intent_signal_detected': False
            }
            score = score_lead(test_lead)
            assert 50 <= score <= 100 # Should be at least 25 + 20 + 20 + 5 = 70
            logger.info(f"Lead Scorer: PASSED (Score: {score})")
        except AssertionError as e:
            logger.error("Lead Scorer: FAILED")
            self.failed_tests.append("Lead Scorer")

    def test_environment(self):
        logger.info("Testing Environment Configuration...")
        env_exists = os.path.exists("../.env.example") or os.path.exists(".env.example")
        if env_exists:
            logger.info("Environment Config: PASSED")
        else:
            logger.error("Environment Config: FAILED (missing .env.example)")
            self.failed_tests.append("Environment Config")

    def run_all(self):
        logger.info("Starting ClaimLift Self-Audit...")
        self.test_math_engine()
        self.test_lead_scorer()
        self.test_environment()
        
        if self.failed_tests:
            logger.error(f"Self-Audit Failed. Issues found in: {self.failed_tests}")
            return False
        else:
            logger.info("Self-Audit Passed Successfully. Ready for Launch.")
            return True

if __name__ == "__main__":
    runner = SelfTestRunner()
    runner.run_all()
