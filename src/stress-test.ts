import { GTMOrchestrator } from './core/orchestrator';

async function runStressTest() {
  console.log("Starting full GTM Orchestrator stress test...");
  const cycles = 5;

  for (let i = 1; i <= cycles; i++) {
    console.log(`\n===================`);
    console.log(`Running Cycle ${i}/${cycles}`);
    console.log(`===================`);
    try {
      await GTMOrchestrator.executeFullGTMStep(undefined, undefined);
      console.log(`Cycle ${i} completed successfully.`);
    } catch (error) {
      console.error(`Cycle ${i} failed:`, error);
    }
    
    // Add a small delay between cycles to avoid rate limits if any real API is called
    await new Promise(resolve => setTimeout(resolve, 2000));
  }

  console.log("\nStress test completed!");
}

runStressTest().catch(console.error);
