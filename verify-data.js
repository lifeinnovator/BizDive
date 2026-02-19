
const { createClient } = require('@supabase/supabase-js');

// Updated credentials for new project
const supabaseUrl = 'https://usvjkprpjfpgjvrfqsom.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdmprcHJwamZwZ2p2cmZxc29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzY1NjAsImV4cCI6MjA4NzA1MjU2MH0.jBOnzXoayPfSefDzyOe6cB1a0Jku8BHz-lszjAQf_QM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function verifyData() {
    console.log('Verifying Questions Table...');

    const { count, error } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('Error:', error.message);
    } else {
        console.log(`✅ Success! Found ${count} questions in the database.`);
    }
}

verifyData();
