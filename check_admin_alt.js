
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

const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
// Testing a different project ref that appeared in CLI list correctly this time
const altRef = 'ehxsxxnjvrkngcxy';
const altUrl = `https://${altRef}.supabase.co`;

console.log(`Testing ALT URL: ${altUrl}`);

const supabase = createClient(altUrl, supabaseKey);

async function checkAdmin() {
    console.log('Checking for admin@bizdive.com in profiles table on ALT project...');
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', 'admin@bizdive.com')
        .single();

    if (error) {
        console.error('Error fetching admin profile:', error.message);
    } else {
        console.log('Admin profile found on ALT PROJECT:', JSON.stringify(data, null, 2));
    }

    const { data: allProfiles, error: allErr } = await supabase
        .from('profiles')
        .select('email, role, user_name')
        .limit(5);

    if (allErr) {
        console.error('Error fetching profiles:', allErr.message);
    } else {
        console.log('Total profiles found on ALT project:', allProfiles.length);
        console.log('Sample profiles:', JSON.stringify(allProfiles, null, 2));
    }
}

checkAdmin();
