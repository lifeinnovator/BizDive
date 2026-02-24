require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const projectId = 'f66c4580-6d51-4212-9a9b-147ca5faedf6';

async function seedCompanies() {
    console.log(`Fetching project ${projectId}...`);
    const { data: project, error: projErr } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

    if (projErr || !project) {
        console.error('Project not found:', projErr);
        return;
    }

    const groupId = project.group_id;
    console.log(`Found project: ${project.name}, Group ID: ${groupId}`);

    // We need random strings for emails to avoid conflicts
    const rand = Math.floor(Math.random() * 10000);
    const dummyCompanies = [
        { email: `testA_${rand}@startup.com`, user_name: '김대표', company_name: '알파 테크놀로지', role: 'company', group_id: groupId, project_id: projectId },
        { email: `testB_${rand}@startup.com`, user_name: '이이사', company_name: '베타 솔루션즈', role: 'company', group_id: groupId, project_id: projectId },
        { email: `testC_${rand}@startup.com`, user_name: '박실장', company_name: '감마 랩스', role: 'company', group_id: groupId, project_id: projectId }
    ];

    for (const comp of dummyCompanies) {
        console.log(`Signing up ${comp.email}...`);
        const { data: authData, error: authErr } = await supabase.auth.signUp({
            email: comp.email,
            password: 'testpassword123',
            options: { data: { user_name: comp.user_name, company_name: comp.company_name } }
        });

        if (authErr) {
            console.error(`Error signing up ${comp.email}:`, authErr);
            continue;
        }

        const userId = authData.user?.id;
        if (!userId) continue;

        // Wait briefly for triggers
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`Updating profile for ${comp.email}...`);
        const { error: updErr } = await supabase
            .from('profiles')
            .update({ role: comp.role, group_id: comp.group_id, project_id: comp.project_id })
            .eq('id', userId);

        if (updErr) {
            console.error(`Error updating profile:`, updErr);
        } else {
            console.log(`Successfully added ${comp.company_name}.`);
        }
    }
}

seedCompanies();
