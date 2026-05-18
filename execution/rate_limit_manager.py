import time
import logging
from datetime import datetime, timedelta

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class RateLimitManager:
    def __init__(self, limits: dict):
        """
        limits format: {'minute': 50, 'hour': 1000, 'day': 10000}
        """
        self.limits = limits
        self.usage = {'minute': 0, 'hour': 0, 'day': 0}
        self.windows = {
            'minute': datetime.now(),
            'hour': datetime.now(),
            'day': datetime.now()
        }

    def _reset_windows_if_needed(self):
        now = datetime.now()
        if now - self.windows['minute'] > timedelta(minutes=1):
            self.usage['minute'] = 0
            self.windows['minute'] = now
        if now - self.windows['hour'] > timedelta(hours=1):
            self.usage['hour'] = 0
            self.windows['hour'] = now
        if now - self.windows['day'] > timedelta(days=1):
            self.usage['day'] = 0
            self.windows['day'] = now

    def can_make_request(self) -> bool:
        self._reset_windows_if_needed()
        for window, limit in self.limits.items():
            if self.usage[window] >= limit:
                logger.warning(f"Rate limit exceeded for window: {window}")
                return False
        return True

    def record_request(self):
        self._reset_windows_if_needed()
        for window in self.usage.keys():
            self.usage[window] += 1

    def wait_for_capacity(self):
        while not self.can_make_request():
            logger.info("Waiting for rate limit capacity...")
            time.sleep(10)
        self.record_request()

if __name__ == "__main__":
    # Example for Apollo free API limits
    apollo_limits = {'minute': 50, 'hour': 1000}
    manager = RateLimitManager(apollo_limits)
    if manager.can_make_request():
        manager.record_request()
        print("Request recorded.")
