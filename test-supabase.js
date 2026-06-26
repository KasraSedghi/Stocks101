/**
 * Quick Supabase Test (JavaScript)
 * Run this from project root: node test-supabase.js
 */

const https = require('https');

function testSupabaseConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
    console.log('   Add to .env.local: NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co\n');
    process.exit(1);
  }
  if (!anonKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
    process.exit(1);
  }
  if (!serviceRoleKey) {
    console.error('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
    process.exit(1);
  }

  console.log('✅ All environment variables found');
  console.log(`   URL: ${url}\n`);

  // Parse URL
  const urlObj = new URL(url);
  const projectId = urlObj.hostname.split('.')[0];

  console.log(`Test 1: Checking Supabase project accessibility...`);
  console.log(`   Project ID: ${projectId}\n`);

  const options = {
    hostname: urlObj.hostname,
    port: 443,
    path: '/rest/v1/',
    method: 'OPTIONS',
    headers: {
      'Authorization': `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
      'apikey': anonKey,
    },
  };

  const req = https.request(options, (res) => {
    console.log(`Test 1 Result: HTTP ${res.statusCode}`);

    if (res.statusCode === 200 || res.statusCode === 204) {
      console.log('✅ Supabase API is accessible\n');

      console.log('Test 2: Checking database connection...');
      const dbOptions = {
        ...options,
        path: '/rest/v1/transactions',
        method: 'GET',
        headers: {
          ...options.headers,
          'Range': '0-0',
        },
      };

      const dbReq = https.request(dbOptions, (dbRes) => {
        if (dbRes.statusCode === 200 || dbRes.statusCode === 206) {
          console.log(`✅ Database accessible (HTTP ${dbRes.statusCode})\n`);
          printSuccess();
        } else if (dbRes.statusCode === 404) {
          console.log('⚠️  Transactions table not found (HTTP 404)');
          console.log('   This is normal if you haven\'t run migrations yet.\n');
          printMigrationsNeeded();
        } else {
          console.log(`❌ Database error (HTTP ${dbRes.statusCode})\n`);
          printTroubleshooting();
        }
      });

      dbReq.on('error', (e) => {
        console.log(`❌ Error: ${e.message}\n`);
        printTroubleshooting();
      });

      dbReq.end();
    } else {
      console.log(`❌ Supabase API error (HTTP ${res.statusCode})\n`);
      printTroubleshooting();
    }
  });

  req.on('error', (e) => {
    console.error(`❌ Connection failed: ${e.message}\n`);
    printTroubleshooting();
  });

  req.end();
}

function printSuccess() {
  console.log('='.repeat(60));
  console.log('✅ SUPABASE CONNECTION TEST PASSED');
  console.log('='.repeat(60));
  console.log('\n✅ Your Supabase setup is working!\n');
  console.log('🚀 Next steps:');
  console.log('   1. npm install (if not done)');
  console.log('   2. Run migrations (copy SQL from migrations/001_init_schema.sql)');
  console.log('   3. npm run dev');
  console.log('   4. Visit http://localhost:3000\n');
}

function printMigrationsNeeded() {
  console.log('='.repeat(60));
  console.log('⚠️  SUPABASE CONFIGURED, MIGRATIONS NEEDED');
  console.log('='.repeat(60));
  console.log('\n🔧 Next steps:');
  console.log('   1. Go to Supabase Dashboard');
  console.log('   2. Open SQL Editor');
  console.log('   3. Create new query');
  console.log('   4. Copy SQL from: migrations/001_init_schema.sql');
  console.log('   5. Run the query');
  console.log('   6. Run: npm run dev\n');
}

function printTroubleshooting() {
  console.log('🔧 Troubleshooting:');
  console.log('   1. Check .env.local is in project root');
  console.log('   2. Verify URL format:');
  console.log('      ✅ https://xxxxx.supabase.co');
  console.log('      ❌ https://xxxxx.supabase.co/rest/v1/');
  console.log('   3. Copy fresh API keys from Supabase dashboard');
  console.log('   4. Check project is active in Supabase\n');
  process.exit(1);
}

// Load .env.local
const fs = require('fs');
const path = require('path');

const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach((line) => {
    const [key, value] = line.split('=');
    if (key && value && !key.startsWith('#')) {
      process.env[key.trim()] = value.trim();
    }
  });
} else {
  console.error('❌ .env.local not found in project root\n');
  process.exit(1);
}

testSupabaseConnection();
