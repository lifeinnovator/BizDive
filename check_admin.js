
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple parser for .env.local
const envContent = fs.readFileSync('.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length) {
        env[key.trim()] = value.join('=').trim().replace(/"/g, '').replace(/'/g, '');
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Failed to parse .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdmin() {
    console.log('Checking for admin@bizdive.com in profiles table...');
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'admin@bizdive.com')
        .single();

    if (error) {
        console.error('Error fetching admin profile:', error.message);
    } else {
        console.log('Admin profile found:', JSON.stringify(data, null, 2));
    }

    console.log('\nChecking some other profiles...');
    const { data: allProfiles, error: allErr } = await supabase
        .from('profiles')
        .select('email, role, user_name')
        .limit(5);

    if (allErr) {
        console.error('Error fetching profiles:', allErr.message);
    } else {
        console.log('Total profiles found:', allProfiles.length);
        console.log('Sample profiles:', JSON.stringify(allProfiles, null, 2));
    }
}

checkAdmin();
