const axios = require('axios');

// Test your backend with a simple request
async function testBackend() {
  console.log('🧪 Testing backend endpoints...\n');

  const baseURL = 'http://localhost:3001';

  // Test 1: Health check (should work without auth)
  try {
    console.log('1️⃣ Testing health endpoint (no auth required)...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
  } catch (error) {
    console.log('❌ Health check failed:', error.message);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Protected endpoint (should fail without auth)
  try {
    console.log('2️⃣ Testing protected endpoint without auth (should fail)...');
    const response = await axios.get(`${baseURL}/linkedin/people-search-collect`);
    console.log('❌ This should not succeed:', response.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Correctly rejected unauthorized request:', error.response.data);
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 3: Instructions for getting JWT token
  console.log('3️⃣ To test with authentication, you need a JWT token:');
  console.log('');
  console.log('🔗 Go to: https://supabase.com/dashboard/project/rfwtvklkxaftgelqmxuv');
  console.log('📋 Steps:');
  console.log('   1. Go to Authentication → Users');
  console.log('   2. Find your user: praneethdevarasetty@gmail.com');
  console.log('   3. Click on the user');
  console.log('   4. If "Email Confirmed" is false, click to confirm it');
  console.log('   5. Look for "Generate JWT" or copy the access token');
  console.log('   6. Use that token in Swagger UI or API calls');
  console.log('');
  console.log('🎯 Example API call with token:');
  console.log('curl -X GET "http://localhost:3001/linkedin/people-search-collect" \\');
  console.log('  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"');
  console.log('');
  console.log('🌐 Swagger UI: http://localhost:3001/api-docs');
  console.log('   Click "Authorize" button and paste your JWT token');
}

// Run the test
testBackend().catch(console.error);
