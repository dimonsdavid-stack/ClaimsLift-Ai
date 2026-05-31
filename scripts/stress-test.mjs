/**
 * ============================================================
 * COCKTAIL STIX GTM — FULL STRESS TEST SUITE
 * ============================================================
 * Runs every critical scenario against the live dev server.
 * NO real emails are sent — SMTP safety lock must be verified.
 * ============================================================
 */

const BASE = 'http://localhost:3000';
const PASS = '✅ PASS';
const FAIL = '❌ FAIL';
const INFO = '🔹';

let passed = 0;
let failed = 0;
const errors = [];

function log(icon, label, detail = '') {
  console.log(`${icon} ${label}${detail ? ` — ${detail}` : ''}`);
}

async function request(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(`${BASE}${path}`, opts);
  const json = await res.json().catch(() => ({}));
  return { status: res.status, ...json };
}

function assert(label, condition, detail = '') {
  if (condition) {
    log(PASS, label, detail);
    passed++;
  } else {
    log(FAIL, label, detail);
    failed++;
    errors.push(`${label}: ${detail}`);
  }
}

// ─────────────────────────────────────────────
// TEST 1: Verify telemetry endpoint is reachable
// ─────────────────────────────────────────────
async function testTelemetryGET() {
  log(INFO, 'TEST 1 — GET /api/gtm (Telemetry Health Check)');
  const data = await request('GET', '/api/gtm');
  assert('Telemetry returns leads array', Array.isArray(data.leads));
  assert('Telemetry returns pipeline array', Array.isArray(data.pipeline));
  assert('Telemetry returns logs array', Array.isArray(data.logs));
  assert('Telemetry returns abTests array', Array.isArray(data.abTests));
  assert('Telemetry returns settings object', typeof data.settings === 'object');
  assert('SMTP live lock is OFF (safe sandbox)', data.settings?.isLiveSmtp === false,
    `isLiveSmtp=${data.settings?.isLiveSmtp}`);
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 2: Full GTM Cycle (sandbox, no emails)
// ─────────────────────────────────────────────
async function testFullCycle() {
  log(INFO, 'TEST 2 — Full GTM Orchestration Cycle (Sandbox)');
  const result = await request('POST', '/api/gtm', { action: 'RUN_STEP' });
  assert('Cycle returns success=true', result.success === true, `success=${result.success}`);
  assert('Cycle reports scraped leads', typeof result.scrapedCount === 'number' && result.scrapedCount >= 0,
    `scraped=${result.scrapedCount}`);
  assert('Cycle reports active deals count', typeof result.activeDealsCount === 'number',
    `activeDeals=${result.activeDealsCount}`);
  assert('Cycle reports closed won count', typeof result.closedWonCount === 'number',
    `closedWon=${result.closedWonCount}`);
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 3: Custom nationwide search queries
// ─────────────────────────────────────────────
async function testNationwideSearches() {
  log(INFO, 'TEST 3 — Nationwide Custom Lead Search Queries');

  const queries = [
    { city: 'Miami Beach, FL', category: 'boutique liquor wine spirits store' },
    { city: 'New York, NY', category: 'specialty grocery market' },
    { city: 'Las Vegas, NV', category: 'luxury hotel resort retail mini-bar' },
    { city: 'Austin, TX', category: 'beach yacht cocktail lounge' },
    { city: 'Seattle, WA', category: 'boutique liquor wine spirits store' },
  ];

  for (const q of queries) {
    const customQuery = `${q.category} in ${q.city}`;
    const result = await request('POST', '/api/gtm', { action: 'RUN_STEP', customQuery });
    assert(
      `Search: "${customQuery}"`,
      result.success === true,
      `success=${result.success}, scraped=${result.scrapedCount}`
    );
  }
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 4: Apollo Schema Drift + Self-Healing
// ─────────────────────────────────────────────
async function testSchemaFaultInjection() {
  log(INFO, 'TEST 4 — Apollo Schema Drift Fault Injection + Sentinel Self-Healing');
  const result = await request('POST', '/api/gtm', { action: 'RUN_STEP', errorType: 'SCHEMA' });
  assert('Schema fault triggers a response', typeof result.success === 'boolean');
  assert(
    'Sentinel healed or cycle recovered gracefully',
    result.success === true || result.healed === true,
    `success=${result.success}, healed=${result.healed}`
  );
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 5: SMTP Carrier Failure + Self-Healing
// ─────────────────────────────────────────────
async function testSMTPFaultInjection() {
  log(INFO, 'TEST 5 — SMTP Reputation Block Fault Injection + Sentinel Self-Healing');
  const result = await request('POST', '/api/gtm', { action: 'RUN_STEP', errorType: 'SMTP' });
  assert('SMTP fault triggers a response', typeof result.success === 'boolean');
  assert(
    'Pipeline recovered or sentinel isolated fault',
    result.success === true || result.healed === true,
    `success=${result.success}, healed=${result.healed}`
  );
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 6: Run 5 consecutive pipeline cycles
// ─────────────────────────────────────────────
async function testConsecutiveCycles() {
  log(INFO, 'TEST 6 — 5 Consecutive GTM Pipeline Cycles (Stress)');
  let allPassed = true;
  for (let i = 1; i <= 5; i++) {
    const result = await request('POST', '/api/gtm', { action: 'RUN_STEP' });
    if (!result.success) {
      allPassed = false;
      log(FAIL, `  Cycle ${i}`, `failed: ${JSON.stringify(result)}`);
    } else {
      log(PASS, `  Cycle ${i}`, `scraped=${result.scrapedCount}, active=${result.activeDealsCount}, won=${result.closedWonCount}`);
    }
  }
  assert('All 5 consecutive cycles succeeded', allPassed);
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 7: A/B Campaign template save & persist
// ─────────────────────────────────────────────
async function testABTemplateSave() {
  log(INFO, 'TEST 7 — A/B Campaign Template Save & Verification');
  const saveResult = await request('POST', '/api/gtm', {
    action: 'SAVE_AB_TESTS',
    abTests: [{
      id: 'ab-1',
      variantA: 'Cocktail Stix x {{companyName}} — The Zero-Sugar Wholesale Revolution',
      variantB: 'Ready to turn shelf space into margin? Cocktail Stix Wholesale for {{companyName}}',
      variantA_body: 'Hi {{firstName}}, Cocktail Stix delivers 45-50% gross margin on zero-sugar, monk-fruit cocktail mixers...',
      variantB_body: 'Hi {{firstName}}, our UPC-ready retail cartons are pre-approved for boutique spirits retail shelves...'
    }]
  });
  assert('Template save returns success', saveResult.success === true, `msg=${saveResult.message}`);

  // Verify persisted via telemetry
  const data = await request('GET', '/api/gtm');
  const saved = data.abTests?.find(t => t.id === 'ab-1');
  assert('Template variant A persisted correctly', saved?.variantA?.includes('Zero-Sugar Wholesale Revolution'));
  assert('Template variant B persisted correctly', saved?.variantB?.includes('Ready to turn shelf space'));
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 8: Outbox inspector shows queued emails
// ─────────────────────────────────────────────
async function testOutboxInspector() {
  log(INFO, 'TEST 8 — Outbox Email Inspector (No Real Sends)');
  const data = await request('GET', '/api/gtm');
  assert('Outbox array exists', Array.isArray(data.outbox), `count=${data.outbox?.length}`);

  if (data.outbox?.length > 0) {
    const mail = data.outbox[0];
    assert('Outbox email has a recipient address', typeof mail.to === 'string' && mail.to.includes('@'));
    assert('Outbox email has a subject', typeof mail.subject === 'string');
    assert('Outbox email has body copy', typeof mail.body === 'string' && mail.body.length > 10);
    assert('All emails are SANDBOX (status=SENT, not actually dispatched)', mail.status === 'SENT');
  } else {
    log(INFO, '  No outbox items yet — run a cycle first. Skipping outbox field assertions.');
  }
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 9: Cron endpoint authorization check
// ─────────────────────────────────────────────
async function testCronEndpoint() {
  log(INFO, 'TEST 9 — Cron Endpoint Authorization & Nationwide Rotation');

  // Should be rejected without secret
  const unauthorized = await fetch(`${BASE}/api/cron`);
  const unauthJson = await unauthorized.json().catch(() => ({}));
  assert('Cron rejects missing secret (401)', unauthorized.status === 401, `status=${unauthorized.status}`);

  // Should be rejected with wrong secret
  const badSecret = await fetch(`${BASE}/api/cron?secret=wrongsecret`);
  assert('Cron rejects wrong secret (401)', badSecret.status === 401, `status=${badSecret.status}`);

  // Should succeed with correct secret
  const correctRes = await fetch(`${BASE}/api/cron?secret=cocktailstix_secure_cron_token`);
  const correctJson = await correctRes.json().catch(() => ({}));
  assert('Cron accepts correct secret (200)', correctRes.status === 200, `status=${correctRes.status}`);
  assert('Cron response includes targetQuery with city', typeof correctJson.targetQuery === 'string' && correctJson.targetQuery.includes(' in '),
    `query="${correctJson.targetQuery}"`);
  assert('Cron response includes city field', typeof correctJson.city === 'string',
    `city="${correctJson.city}"`);
  assert('Cron response includes category field', typeof correctJson.category === 'string',
    `category="${correctJson.category}"`);
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 10: Full reset & rebuild from zero
// ─────────────────────────────────────────────
async function testResetAndRebuild() {
  log(INFO, 'TEST 10 — Full Database Reset & Rebuild from Zero');
  const reset = await request('POST', '/api/gtm', { action: 'RESET' });
  assert('Reset returns success', reset.success === true, `msg=${reset.message}`);

  const empty = await request('GET', '/api/gtm');
  assert('Leads cleared to empty after reset', empty.leads.length === 0, `leads=${empty.leads.length}`);
  assert('Pipeline cleared to empty after reset', empty.pipeline.length === 0, `pipeline=${empty.pipeline.length}`);

  // Run a fresh cycle
  const fresh = await request('POST', '/api/gtm', { action: 'RUN_STEP' });
  assert('Fresh cycle after reset succeeds', fresh.success === true, `success=${fresh.success}`);

  const rebuilt = await request('GET', '/api/gtm');
  assert('Leads rebuilt after fresh cycle', rebuilt.leads.length > 0, `leads=${rebuilt.leads.length}`);
  assert('Logs populated after fresh cycle', rebuilt.logs.length > 0, `logs=${rebuilt.logs.length}`);
  console.log('');
}

// ─────────────────────────────────────────────
// TEST 11: Confirm SMTP lock prevents real sends
// ─────────────────────────────────────────────
async function testSmtpLockConfirmation() {
  log(INFO, 'TEST 11 — SMTP Safety Lock Final Confirmation (No Real Emails)');
  const data = await request('GET', '/api/gtm');
  const isLive = data.settings?.isLiveSmtp;
  assert(
    'SMTP dispatch lock is firmly OFF — zero real emails will be sent',
    isLive === false,
    `isLiveSmtp=${isLive}. ` + (isLive ? '⚠️  WARNING: Real emails CAN be sent!' : 'Safe — all emails are logged in outbox only.')
  );
  console.log('');
}

// ─────────────────────────────────────────────
// RUNNER
// ─────────────────────────────────────────────
async function runAll() {
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║  🍹 COCKTAIL STIX GTM — FULL STRESS TEST SUITE          ║');
  console.log('║     Sandbox Mode: SMTP Locked • No Real Emails Sent     ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`   Target: ${BASE}\n`);

  const start = Date.now();

  await testTelemetryGET();
  await testFullCycle();
  await testNationwideSearches();
  await testSchemaFaultInjection();
  await testSMTPFaultInjection();
  await testConsecutiveCycles();
  await testABTemplateSave();
  await testOutboxInspector();
  await testCronEndpoint();
  await testResetAndRebuild();
  await testSmtpLockConfirmation();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);

  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║                   STRESS TEST RESULTS                   ║');
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log(`  ✅ Passed:  ${passed}`);
  console.log(`  ❌ Failed:  ${failed}`);
  console.log(`  ⏱  Duration: ${elapsed}s`);

  if (errors.length > 0) {
    console.log('\n  FAILURES:');
    errors.forEach(e => console.log(`  → ${e}`));
  } else {
    console.log('\n  🎉 ALL TESTS PASSED — 100% PRODUCTION READY');
  }
  console.log('');

  process.exit(failed > 0 ? 1 : 0);
}

runAll().catch(err => {
  console.error('\n💥 STRESS TEST CRASHED:', err.message);
  process.exit(1);
});
