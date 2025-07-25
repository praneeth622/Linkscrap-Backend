const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfwtvklkxaftgelqmxuv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmd3R2a2xreGFmdGdlbHFteHV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM0MzA3MjUsImV4cCI6MjA2OTAwNjcyNX0.4PkBvGj-03dJm9u1--YA_ACaMHKWa_knW-Te4S2cDOE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function quickSignIn() {
  console.log('🔐 Quick sign-in test...\n');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'praneethdevarasetty31@gmail.com',
      password: 'qwerty@123'
    });

    if (error) {
      console.log('❌ Sign in failed:', error.message);
      
      if (error.message.includes('Email not confirmed')) {
        console.log('\n📧 Email still not confirmed. Please:');
        console.log('1. Check your email for confirmation link, OR');
        console.log('2. Manually confirm in Supabase dashboard, OR');
        console.log('3. Use the admin script with service role key');
      }
      return;
    }

    if (data.session) {
      console.log('🎉 SUCCESS! Sign in worked!');
      console.log('✅ Email has been confirmed');
      console.log('🎫 JWT Token:', data.session.access_token);
      console.log('👤 User ID:', data.user.id);
      console.log('📧 Email:', data.user.email);
      console.log('🕒 Token expires:', new Date(data.session.expires_at * 1000));
      
      // Save token to file
      const fs = require('fs');
      fs.writeFileSync('jwt-token.txt', data.session.access_token);
      console.log('\n💾 Token saved to jwt-token.txt');
      
      // Test the token with your backend
      console.log('\n🧪 Testing token with your backend...');
      
      const axios = require('axios');
      try {
        const response = await axios.get('http://localhost:3001/linkedin/people-search-collect', {
          headers: {
            'Authorization': `Bearer ${data.session.access_token}`
          }
        });
        
        console.log('✅ Backend test successful!');
        console.log('📊 Response:', response.data);
        
        console.log('\n🎯 You can now use this token in:');
        console.log('1. Swagger UI: http://localhost:3001/api-docs');
        console.log('2. API calls with Authorization header');
        console.log('3. Your frontend application');
        
      } catch (apiError) {
        console.log('❌ Backend test failed:', apiError.response?.data || apiError.message);
      }
      
      return data.session.access_token;
    }

  } catch (err) {
    console.error('💥 Unexpected error:', err.message);
  }
}

// Run the test
quickSignIn();
