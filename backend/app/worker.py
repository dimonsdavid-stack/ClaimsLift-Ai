import asyncio
import logging
from temporalio.client import Client
from temporalio.worker import Worker
from activities import calculate_mrr_activity, score_lead_activity

logging.basicConfig(level=logging.INFO)

async def main():
    client = await Client.connect("localhost:7233")
    worker = Worker(
        client,
        task_queue="claimlift-task-queue",
        workflows=[], # Add workflows here
        activities=[calculate_mrr_activity, score_lead_activity],
    )
    logging.info("Starting Temporal Worker...")
    await worker.run()

if __name__ == "__main__":
    asyncio.run(main())
