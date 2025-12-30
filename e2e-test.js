const assert = require('assert');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

async function runTests() {
  console.log('Starting End-to-End Tests...\n');

  try {
    // 1. Health Check
    console.log('Test 1: Health Check');
    const healthRes = await fetch(`${BASE_URL}/api/healthz`);
    assert.strictEqual(healthRes.status, 200, 'Health check status should be 200');
    const healthData = await healthRes.json();
    assert.strictEqual(healthData.ok, true, 'Health check response should be { ok: true }');
    console.log('PASS\n');

    // 2. Create Paste
    console.log('Test 2: Create Paste');
    const createRes = await fetch(`${BASE_URL}/api/pastes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Hello World' }),
    });
    assert.strictEqual(createRes.status, 200, 'Create paste status should be 200');
    const createData = await createRes.json();
    assert.ok(createData.id, 'Response should have an id');
    assert.ok(createData.url, 'Response should have a url');
    const pasteId = createData.id;
    console.log(`Created paste with ID: ${pasteId}`);
    console.log('PASS\n');

    // 3. Get Paste (API)
    console.log('Test 3: Get Paste (API)');
    const getApiRes = await fetch(`${BASE_URL}/api/pastes/${pasteId}`);
    assert.strictEqual(getApiRes.status, 200, 'Get paste API status should be 200');
    const getApiData = await getApiRes.json();
    assert.strictEqual(getApiData.content, 'Hello World', 'Content should match');
    console.log('PASS\n');

    // 4. Get Paste (HTML)
    // Note: The requirement says /p/:id but implementation uses /pastes/:id
    // We will test what the API returned as the URL first.
    console.log('Test 4: Get Paste (HTML)');
    // Extract path from returned URL
    const urlPath = new URL(createData.url).pathname; 
    console.log(`Fetching HTML from: ${urlPath}`);
    const getHtmlRes = await fetch(`${BASE_URL}${urlPath}`);
    assert.strictEqual(getHtmlRes.status, 200, 'Get paste HTML status should be 200');
    const htmlText = await getHtmlRes.text();
    assert.ok(htmlText.includes('Hello World'), 'HTML should contain paste content');
    console.log('PASS\n');

    // 5. View Limits
    console.log('Test 5: View Limits');
    const limitRes = await fetch(`${BASE_URL}/api/pastes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Limited View', max_views: 2 }),
    });
    const limitData = await limitRes.json();
    const limitId = limitData.id;
    
    // Fetch 1
    const fetch1 = await fetch(`${BASE_URL}/api/pastes/${limitId}`);
    assert.strictEqual(fetch1.status, 200, 'First fetch should succeed');
    const data1 = await fetch1.json();
    assert.strictEqual(data1.remaining_views, 1, 'Should have 1 remaining view');

    // Fetch 2
    const fetch2 = await fetch(`${BASE_URL}/api/pastes/${limitId}`);
    assert.strictEqual(fetch2.status, 200, 'Second fetch should succeed');
    const data2 = await fetch2.json();
    assert.strictEqual(data2.remaining_views, 0, 'Should have 0 remaining views');

    // Fetch 3 (Should fail)
    const fetch3 = await fetch(`${BASE_URL}/api/pastes/${limitId}`);
    assert.strictEqual(fetch3.status, 404, 'Third fetch should be 404');
    console.log('PASS\n');

    // 6. TTL
    console.log('Test 6: TTL');
    const ttlRes = await fetch(`${BASE_URL}/api/pastes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'TTL Paste', ttl_seconds: 60 }),
    });
    const ttlData = await ttlRes.json();
    const ttlId = ttlData.id;

    // Fetch immediately (Success)
    const ttlFetch1 = await fetch(`${BASE_URL}/api/pastes/${ttlId}`);
    assert.strictEqual(ttlFetch1.status, 200, 'Immediate fetch should succeed');
    const ttlFetchData = await ttlFetch1.json();
    assert.ok(ttlFetchData.expires_at, 'Response should include expires_at');

    // Fetch with future time (Fail)
    const futureTime = Date.now() + 61000; // 61 seconds later
    const ttlFetch2 = await fetch(`${BASE_URL}/api/pastes/${ttlId}`, {
      headers: { 'x-test-now-ms': futureTime.toString() }
    });
    assert.strictEqual(ttlFetch2.status, 404, 'Future fetch should be 404');
    console.log('PASS\n');

    // 7. Combined Constraints
    console.log('Test 7: Combined Constraints');
    const combinedRes = await fetch(`${BASE_URL}/api/pastes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: 'Combined', ttl_seconds: 60, max_views: 2 }),
    });
    const combinedData = await combinedRes.json();
    const combinedId = combinedData.id;

    // Trigger max views first
    await fetch(`${BASE_URL}/api/pastes/${combinedId}`); // 1
    await fetch(`${BASE_URL}/api/pastes/${combinedId}`); // 2
    const combinedFetch3 = await fetch(`${BASE_URL}/api/pastes/${combinedId}`); // 3 -> 404
    assert.strictEqual(combinedFetch3.status, 404, 'Should be 404 after max views');
    
    // Create another for TTL check
    const combinedRes2 = await fetch(`${BASE_URL}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Combined 2', ttl_seconds: 60, max_views: 10 }),
      });
    const combinedId2 = (await combinedRes2.json()).id;
    
    // Trigger TTL
    const combinedFetchTTL = await fetch(`${BASE_URL}/api/pastes/${combinedId2}`, {
        headers: { 'x-test-now-ms': (Date.now() + 61000).toString() }
    });
    assert.strictEqual(combinedFetchTTL.status, 404, 'Should be 404 after TTL even if views remain');
    console.log('PASS\n');

    // 8. Error Handling
    console.log('Test 8: Error Handling');
    // Invalid Input
    const invalidRes = await fetch(`${BASE_URL}/api/pastes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: '' }), // Empty content
    });
    assert.notStrictEqual(invalidRes.status, 200, 'Should not be 200 for empty content');
    
    // Non-existent ID
    const notFoundRes = await fetch(`${BASE_URL}/api/pastes/nonexistent-id`);
    assert.strictEqual(notFoundRes.status, 404, 'Should be 404 for non-existent ID (API)');

    const notFoundHtmlRes = await fetch(`${BASE_URL}/p/nonexistent-id`);
    assert.strictEqual(notFoundHtmlRes.status, 404, 'Should be 404 for non-existent ID (HTML)');
    console.log('PASS\n');

    console.log('ALL TESTS PASSED!');

  } catch (error) {
    console.error('TEST FAILED:', error.message);
    if (error.response) {
        console.error('Response status:', error.response.status);
    }
    process.exit(1);
  }
}

runTests();
