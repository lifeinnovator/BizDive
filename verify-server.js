
const http = require('http');

const pages = [
    '/',
    '/login',
    '/admin/seed',
    '/onboarding',
    '/diagnosis' // will redirect but should respond
];

function checkPage(path) {
    return new Promise((resolve) => {
        http.get(`http://localhost:3000${path}`, (res) => {
            console.log(`Checking ${path}: Status Code ${res.statusCode}`);
            resolve(res.statusCode);
        }).on('error', (e) => {
            console.error(`Checking ${path}: Error ${e.message}`);
            resolve(null);
        });
    });
}

async function verify() {
    console.log('Starting verification...');
    // Wait for server to potentially start
    await new Promise(r => setTimeout(r, 5000));

    for (const page of pages) {
        await checkPage(page);
    }
}

verify();
