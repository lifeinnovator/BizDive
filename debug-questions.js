
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://usvjkprpjfpgjvrfqsom.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzdmprcHJwamZwZ2p2cmZxc29tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NzY1NjAsImV4cCI6MjA4NzA1MjU2MH0.jBOnzXoayPfSefDzyOe6cB1a0Jku8BHz-lszjAQf_QM';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function debugData() {
    console.log('--- Debugging Questions Data ---');

    console.log('1. Checking Total Count...');
    const { count, error: countError } = await supabase
        .from('questions')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('Error fetching count:', countError);
    } else {
        console.log('Total Questions:', count);
    }

    console.log('\n2. Checking Categories...');
    const { data: categories, error: catError } = await supabase
        .from('questions')
        .select('category, mapping_code')

    if (catError) {
        console.error('Error fetching categories:', catError);
    } else {
        // Group by category and mapping_code
        const summary = {};
        categories.forEach(item => {
            const key = `${item.category} (${item.mapping_code || 'null'})`;
            summary[key] = (summary[key] || 0) + 1;
        });
        console.table(summary);
    }

    console.log('\n3. fetching sample common questions...');
    const { data: common, error: commonError } = await supabase
        .from('questions')
        .select('*')
        .eq('category', 'common')
        .limit(5);

    if (commonError) {
        console.error('Error fetching common:', commonError);
    } else {
        console.log('Common Questions Sample:', common.length);
        if (common.length > 0) console.log(common[0]);
    }
}

debugData();
