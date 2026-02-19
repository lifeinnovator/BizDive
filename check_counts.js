
const fs = require('fs');

const seedFileContent = fs.readFileSync('d:\\Dev\\bizdive-service\\seed_v2.sql', 'utf8');

// Regex matches (gen_random_uuid(), 'category', 'dimension', 'content', weight, 'mapping_code')
// Handling variations in whitespace and NULL/quoted mapping code
const regex = /\(gen_random_uuid\(\),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*[0-9.]+,\s*(NULL|'[^']+')\)/g;

let match;
const counts = {
    common: {},
    stage: {},
    industry: {},
    esg: {}
};

let total = 0;

while ((match = regex.exec(seedFileContent)) !== null) {
    const cat = match[1];
    const dim = match[2];
    const mapping = match[4] === 'NULL' ? 'common' : match[4].replace(/'/g, ''); // Use 'common' key for NULL mapping

    // Structure: counts[cat][mapping][dim]
    if (!counts[cat]) counts[cat] = {};
    if (!counts[cat][mapping]) counts[cat][mapping] = {};
    if (!counts[cat][mapping][dim]) counts[cat][mapping][dim] = 0;

    counts[cat][mapping][dim]++;
    total++;
}

console.log(`Total questions found: ${total}`);
console.log(JSON.stringify(counts, null, 2));

// Quick analysis of deficits
const STAGES = ['P', 'E', 'V', 'M'];
const DIMS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
const INDS = ['I', 'H', 'L', 'CT'];

console.log("\n--- DEFICIT REPORT ---");
DIMS.forEach(dim => {
    // Check Common (Target: 3)
    const commonCount = (counts.common['common'] && counts.common['common'][dim]) || 0;
    if (commonCount !== 3) console.log(`[Common] ${dim}: Found ${commonCount} (Expected 3)`);
});

STAGES.forEach(stage => {
    DIMS.forEach(dim => {
        // Check Stage (Target: 3)
        const stageCount = (counts.stage[stage] && counts.stage[stage][dim]) || 0;
        if (stageCount !== 3) console.log(`[Stage ${stage}] ${dim}: Found ${stageCount} (Expected 3)`);

        // Check ESG (Target: 1)
        const esgCount = (counts.esg[stage] && counts.esg[stage][dim]) || 0;
        if (esgCount !== 1) console.log(`[ESG ${stage}] ${dim}: Found ${esgCount} (Expected 1)`);
    });
});

INDS.forEach(ind => {
    DIMS.forEach(dim => {
        // Check Industry (Target: 3)
        const indCount = (counts.industry[ind] && counts.industry[ind][dim]) || 0;
        if (indCount !== 3) console.log(`[Industry ${ind}] ${dim}: Found ${indCount} (Expected 3)`);
    });
});
