import asyncio
from typing import List, Callable, Any
import logging

logger = logging.getLogger(__name__)

class ConsensusEngine:
    """
    Multi-Agent Consensus Engine
    Spawns multiple sub-agents to analyze options and reach consensus.
    """
    def __init__(self, num_agents: int = 10):
        self.num_agents = num_agents

    async def _run_agent(self, agent_func: Callable, context: dict, framing_variation: str) -> Any:
        """
        Runs a single agent with a specific framing variation.
        """
        try:
            # Inject framing variation into context
            agent_context = context.copy()
            agent_context['framing'] = framing_variation
            
            result = await agent_func(agent_context)
            return result
        except Exception as e:
            logger.error(f"Agent failed: {e}")
            return None

    async def reach_consensus(self, agent_func: Callable, context: dict) -> dict:
        """
        Spawns 10 agents, aggregates results, and determines consensus.
        """
        variations = [f"Variation {i}" for i in range(self.num_agents)]
        
        # Run all agents in parallel
        tasks = [
            self._run_agent(agent_func, context, var)
            for var in variations
        ]
        results = await asyncio.gather(*tasks)
        
        # Filter out failed runs
        valid_results = [r for r in results if r is not None]
        
        if not valid_results:
            return {"status": "failed", "consensus": None, "outliers": []}
            
        # Tally results (assuming results are strings or easily hashable)
        tally = {}
        for r in valid_results:
            # Simplify logic for example: convert dict to string if needed
            key = str(r) 
            tally[key] = tally.get(key, 0) + 1
            
        total = len(valid_results)
        consensus_result = None
        outliers = []
        status = "split"
        
        for key, count in tally.items():
            if count >= 7:  # 7+/10 is consensus
                consensus_result = key
                status = "consensus_safe_bet"
            elif count <= 2:
                outliers.append(key)
                
        if not consensus_result and max(tally.values()) >= total // 2:
            status = "judgment_call_required"
            
        return {
            "status": status,
            "consensus": consensus_result,
            "outliers": outliers,
            "raw_tally": tally
        }

if __name__ == "__main__":
    # Test the consensus engine
    async def dummy_agent(context):
        # Fake logic where 80% agree on "Option A"
        import random
        return "Option A" if random.random() > 0.2 else "Option B"
        
    engine = ConsensusEngine(10)
    result = asyncio.run(engine.reach_consensus(dummy_agent, {"data": "test"}))
    print(f"Consensus Result: {result}")
