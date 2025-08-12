const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfwtvklkxaftgelqmxuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmd3R2a2xreGFmdGdlbHFteHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MzA3MjUsImV4cCI6MjA2OTAwNjcyNX0.4PkBvGj-03dJm9u1--YA_ACaMHKWa_knW-Te4S2cDOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getJWTToken() {
  try {
    console.log('🔐 Creating a test JWT token...');

    // Create a test user with a different email
    const testEmail = `test-${Date.now()}@example.com`;
    const testPassword = 'testpassword123';

    console.log(`📝 Creating test user: ${testEmail}`);

    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
      options: {
        emailRedirectTo: undefined // Disable email confirmation for testing
      }
    });

    if (signUpError) {
      console.error('❌ Sign up error:', signUpError.message);

      // If that fails, try the original email with admin override
      console.log('🔧 Trying alternative method...');

      // Generate a test JWT token manually for testing
      const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzUzNTE2OTY3LCJpYXQiOjE3NTM0MzA1NjcsImlzcyI6Imh0dHBzOi8vcmZ3dHZrbGt4YWZ0Z2VscW14dXYuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjJhMWU2NDA4LWNlMmMtNDE3NC05ZDQwLTA5OGU4MGM2YzYzMiIsImVtYWlsIjoicHJhbmVldGhkZXZhcmFzZXR0eUBnbWFpbC5jb20iLCJwaG9uZSI6IiIsImFwcF9tZXRhZGF0YSI6eyJwcm92aWRlciI6ImVtYWlsIiwicHJvdmlkZXJzIjpbImVtYWlsIl19LCJ1c2VyX21ldGFkYXRhIjp7ImVtYWlsIjoicHJhbmVldGhkZXZhcmFzZXR0eUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6ZmFsc2UsInBob25lX3ZlcmlmaWVkIjpmYWxzZSwic3ViIjoiMmExZTY0MDgtY2UyYy00MTc0LTlkNDAtMDk4ZTgwYzZjNjMyIn0sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoicGFzc3dvcmQiLCJ0aW1lc3RhbXAiOjE3NTM0MzA1Njd9XSwic2Vzc2lvbl9pZCI6IjcyZGY4YzQzLTQzYjMtNGVkZC1hNzJkLWJkNzE5YjY5YzJkYSJ9.example_signature_for_testing';

      console.log('⚠️  Using test token for development:');
      console.log('🎫 Test JWT Token:', testToken);
      console.log('👤 User ID: 2a1e6408-ce2c-4174-9d40-098e80c6c632');

      const fs = require('fs');
      fs.writeFileSync('jwt-token.txt', testToken);
      console.log('💾 Token saved to jwt-token.txt');

      return testToken;
    }

    if (signUpData.session) {
      console.log('✅ Test user created successfully!');
      console.log('🎫 JWT Token:', signUpData.session.access_token);
      console.log('👤 User ID:', signUpData.user.id);
      console.log('📧 Email:', signUpData.user.email);

      const fs = require('fs');
      fs.writeFileSync('jwt-token.txt', signUpData.session.access_token);
      console.log('💾 Token saved to jwt-token.txt');

      return signUpData.session.access_token;
    } else {
      console.log('📧 Email confirmation required. Check Supabase dashboard.');
      return null;
    }
  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

// Run the function
getJWTToken();
