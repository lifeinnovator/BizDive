
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://usvjkprpjfpgjvrfqsom.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdmprcHJwamZwZ2p2cmZxc29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzY1NjAsImV4cCI6MjA4NzA1MjU2MH0.jBOnzXoayPfSefDzyOe6cB1a0Jku8BHz-lszjAQf_QM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function seedData() {
    console.log('--- Seeding Single Question ---');

    const question = {
        category: 'common',
        dimension: 'D1',
        content: "Test Question 1",
        score_weight: 1.0,
        mapping_code: null
    };

    const { data, error } = await supabase
        .from('questions')
        .insert([question])
        .select();

    if (error) {
        console.error('Error inserting:', error);
    } else {
        console.log('Successfully seeded:', data);
    }
}

seedData();
