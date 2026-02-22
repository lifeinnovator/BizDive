
const { execSync } = require('child_process');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
const envPath = path.join(process.cwd(), '.env.local');
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const urlMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/);
    const keyMatch = envContent.match(/NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)/);
    if (urlMatch) supabaseUrl = urlMatch[1].trim();
    if (keyMatch) supabaseAnonKey = keyMatch[1].trim();
}

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    cyan: "\x1b[36m"
};

async function checkStatus() {
    console.log(`\n${colors.bright}${colors.cyan}=== BizDive Development Environment Status ===${colors.reset}\n`);

    // 1. Tool Versions
    console.log(`${colors.bright}Checking Tools:${colors.reset}`);
    try {
        const nodeVer = process.version;
        const npmVer = execSync('npm -v').toString().trim();
        const gitVer = execSync('git --version').toString().trim();
        console.log(`  - Node.js: ${colors.green}${nodeVer}${colors.reset}`);
        console.log(`  - npm:     ${colors.green}${npmVer}${colors.reset}`);
        console.log(`  - Git:     ${colors.green}${gitVer}${colors.reset}`);
    } catch (e) {
        console.log(`  - Tools: ${colors.red}Error checking tools${colors.reset}`);
    }

    // 2. Git/GitHub Check
    console.log(`\n${colors.bright}Checking GitHub Connection:${colors.reset}`);
    try {
        const remote = execSync('git remote -v').toString().trim();
        if (remote.includes('github.com')) {
            const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
            console.log(`  - Remote: ${colors.green}Connected to GitHub${colors.reset}`);
            console.log(`  - Branch: ${colors.cyan}${branch}${colors.reset}`);
        } else {
            console.log(`  - Remote: ${colors.yellow}No GitHub remote found${colors.reset}`);
        }
    } catch (e) {
        console.log(`  - Git: ${colors.red}Error checking git status${colors.reset}`);
    }

    // 3. Supabase Check
    console.log(`\n${colors.bright}Checking Supabase Connection:${colors.reset}`);
    if (supabaseUrl && supabaseAnonKey) {
        try {
            const supabase = createClient(supabaseUrl, supabaseAnonKey);
            const { count, error } = await supabase
                .from('questions')
                .select('*', { count: 'exact', head: true });

            if (error) {
                console.log(`  - Status: ${colors.red}Error - ${error.message}${colors.reset}`);
            } else {
                console.log(`  - Status: ${colors.green}Connected!${colors.reset}`);
                console.log(`  - Data:   ${colors.cyan}${count} questions found${colors.reset}`);
            }
        } catch (e) {
            console.log(`  - Supabase: ${colors.red}Connection failed${colors.reset}`);
        }
    } else {
        console.log(`  - Config: ${colors.yellow}Supabase credentials missing in .env.local${colors.reset}`);
    }

    // 4. Local Server Check
    console.log(`\n${colors.bright}Checking Local Server (localhost:3000):${colors.reset}`);
    try {
        // Simple way to check if port 3000 is listening
        const { http } = require('http');
        const isRunning = await new Promise((resolve) => {
            const req = require('http').get('http://localhost:3000', (res) => {
                resolve(true);
            }).on('error', () => {
                resolve(false);
            });
            req.setTimeout(1000, () => {
                req.destroy();
                resolve(false);
            });
        });

        if (isRunning) {
            console.log(`  - Status: ${colors.green}Running${colors.reset}`);
        } else {
            console.log(`  - Status: ${colors.yellow}Not running (run 'npm run dev' to start)${colors.reset}`);
        }
    } catch (e) {
        console.log(`  - Server: ${colors.yellow}Not responding${colors.reset}`);
    }

    console.log(`\n${colors.bright}${colors.cyan}==============================================${colors.reset}\n`);
}

checkStatus();
