
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

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfiles() {
    console.log(`Checking profiles on ${supabaseUrl}...`);
    const { data, error, count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

    if (error) {
        console.error('Error fetching profiles:', error.message);
    } else {
        console.log('Total profiles found:', count);
        console.log('Sample profiles:', JSON.stringify(data.slice(0, 10), null, 2));
    }
}

checkProfiles();
