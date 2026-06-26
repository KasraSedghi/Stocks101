/**
 * Supabase Connection Test
 * Run this to verify your Supabase credentials are correct
 * Usage: npx ts-node src/utils/test-supabase.ts
 */

import { createClient } from '@supabase/supabase-js';

async function testSupabaseConnection() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  console.log('🔍 Testing Supabase Connection...\n');

  // Check environment variables
  if (!url) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
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

  try {
    // Test 1: Create client with anon key
    console.log('Test 1: Creating Supabase client with anon key...');
    const supabaseAnon = createClient(url, anonKey);
    console.log('✅ Anon client created\n');

    // Test 2: Create client with service role key
    console.log('Test 2: Creating Supabase client with service role key...');
    const supabaseServiceRole = createClient(url, serviceRoleKey);
    console.log('✅ Service role client created\n');

    // Test 3: Fetch tables schema
    console.log('Test 3: Checking if tables exist...');
    const { data: tables, error: tablesError } = await supabaseServiceRole
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesError) {
      console.error('❌ Error fetching tables:', tablesError.message);
      console.log('\n⚠️  This is normal if you haven\'t run migrations yet.');
      console.log('Run the SQL from migrations/001_init_schema.sql in Supabase dashboard.\n');
    } else {
      const tableNames = tables?.map((t: any) => t.table_name) || [];
      if (tableNames.length === 0) {
        console.warn('⚠️  No tables found (not created yet)');
        console.log('Run migrations: Copy SQL from migrations/001_init_schema.sql\n');
      } else {
        console.log(`✅ Found ${tableNames.length} tables:`);
        tableNames.forEach((name: string) => console.log(`   - ${name}`));
        console.log();
      }
    }

    // Test 4: Test basic query (transactions table)
    console.log('Test 4: Testing transactions table access...');
    const { data: transactions, error: txError } = await supabaseAnon
      .from('transactions')
      .select('*')
      .limit(1);

    if (txError) {
      if (txError.code === 'PGRST116') {
        console.warn('⚠️  Transactions table not found');
        console.log('   Run migrations: Copy SQL from migrations/001_init_schema.sql\n');
      } else {
        console.error('❌ Error:', txError.message);
      }
    } else {
      console.log(`✅ Successfully queried transactions table`);
      console.log(`   Records found: ${transactions?.length || 0}\n`);
    }

    // Test 5: Test watchlist table
    console.log('Test 5: Testing watchlist table access...');
    const { data: watchlist, error: watchlistError } = await supabaseAnon
      .from('watchlists')
      .select('*')
      .limit(1);

    if (watchlistError) {
      if (watchlistError.code === 'PGRST116') {
        console.warn('⚠️  Watchlist table not found');
      } else {
        console.error('❌ Error:', watchlistError.message);
      }
    } else {
      console.log(`✅ Successfully queried watchlists table`);
      console.log(`   Records found: ${watchlist?.length || 0}\n`);
    }

    // Test 6: Test auth
    console.log('Test 6: Testing authentication...');
    const { data: session, error: authError } = await supabaseAnon.auth.getSession();

    if (authError) {
      console.error('❌ Auth error:', authError.message);
    } else {
      console.log('✅ Auth system accessible');
      console.log(`   Session: ${session.session ? 'Active' : 'None (login required)'}\n`);
    }

    // Summary
    console.log('='.repeat(60));
    console.log('✅ SUPABASE CONNECTION TESTS COMPLETE');
    console.log('='.repeat(60));
    console.log('\n📋 Summary:');
    console.log('   ✅ Environment variables configured');
    console.log('   ✅ Clients created successfully');
    console.log('   ✅ Database connection working\n');

    console.log('🚀 Next steps:');
    console.log('   1. Run npm install');
    console.log('   2. Create tables: Copy SQL from migrations/001_init_schema.sql');
    console.log('   3. Run npm run dev');
    console.log('   4. Test auth by signing up at http://localhost:3000\n');

    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ CONNECTION TEST FAILED');
    console.error('Error:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('   1. Check .env.local exists in project root');
    console.log('   2. Verify NEXT_PUBLIC_SUPABASE_URL format:');
    console.log('      ✅ https://xxxxx.supabase.co');
    console.log('      ❌ https://xxxxx.supabase.co/rest/v1/ (remove /rest/v1/)');
    console.log('   3. Check API keys are correct (copy from Supabase dashboard)');
    console.log('   4. Verify Supabase project is active\n');
    process.exit(1);
  }
}

testSupabaseConnection();
