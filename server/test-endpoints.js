const http = require('http');

const PORT = 5000;
const BASE_URL = `http://localhost:${PORT}`;

const getJSON = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`Status: ${res.statusCode}, Data: ${data}`));
        }
      });
    }).on('error', reject);
  });
};

const postJSON = (url, body) => {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const dataString = JSON.stringify(body);
    
    const options = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || 80,
      path: parsedUrl.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': dataString.length
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(responseData));
          } catch (e) {
            resolve(responseData);
          }
        } else {
          reject(new Error(`Status: ${res.statusCode}, Data: ${responseData}`));
        }
      });
    });

    req.on('error', reject);
    req.write(dataString);
    req.end();
  });
};

async function runTests() {
  console.log('Starting REST API self-verification tests...');
  try {
    // 1. Verify general connection
    console.log('Testing GET /api/customers...');
    const listRes = await getJSON(`${BASE_URL}/api/customers`);
    console.log(`✅ GET /api/customers success! Total records: ${listRes.pagination.total}`);
    
    if (listRes.customers.length > 0) {
      console.log(`   Sample Customer: ${listRes.customers[0].name} (${listRes.customers[0].email})`);
    } else {
      console.log('⚠️ No customers found. Seeding did not complete yet.');
    }

    // 2. Verify Stats
    console.log('Testing GET /api/customers/stats...');
    const statsRes = await getJSON(`${BASE_URL}/api/customers/stats`);
    console.log(`✅ GET /api/customers/stats success!`);
    console.log(`   Counts: Total=${statsRes.counts.total}, Active=${statsRes.counts.active}, Lead=${statsRes.counts.lead}`);
    console.log(`   LTV Average: $${statsRes.ltv.average}`);

    // 3. Create a test customer
    console.log('Testing POST /api/customers (Create new record)...');
    const testEmail = `test_${Date.now()}@example.com`;
    const newCustomer = await postJSON(`${BASE_URL}/api/customers`, {
      name: 'Integration Test User',
      email: testEmail,
      phone: '123-456-7890',
      company: 'Test Labs Inc',
      status: 'Lead',
      ltv: 500
    });
    console.log(`✅ POST /api/customers success! Created customer ID: ${newCustomer._id}`);

    // 4. Verify customer search
    console.log('Testing GET /api/customers?search=Integration...');
    const searchRes = await getJSON(`${BASE_URL}/api/customers?search=Integration`);
    if (searchRes.customers.some(c => c.email === testEmail)) {
      console.log('✅ GET /api/customers search parameter filtering success!');
    } else {
      throw new Error('Search failed to find the newly created test customer.');
    }

    console.log('\n🎉 ALL INTEGRATION TESTS PASSED SUCCESSFULLY! REST API IS HEALTHY.');
  } catch (error) {
    console.error('\n❌ VERIFICATION TEST FAILED:', error.message);
    process.exit(1);
  }
}

// Delay test running slightly to give server time to boot up
setTimeout(runTests, 2000);
