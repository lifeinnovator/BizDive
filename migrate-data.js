
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const DATA_DIR = 'E:\\OneDrive\\Work\\2026_kevin\\기업자가진단 서비스\\BizDive\\BizDiz_DataSet';
const OUTPUT_FILE = 'd:\\Dev\\bizdive-service\\seed_v2.sql';

// Mappings
const STAGE_MAP = {
    '예비창업': 'P',
    '초기창업': 'E',
    '벤처_도약': 'V',
    '중소_중견': 'M'
};

const INDUSTRY_MAP = {
    'IT_SaaS': 'I',
    '제조_소재_하드웨어': 'H',
    '로컬_서비스_F&B': 'L',
    '콘텐츠_지식_IP': 'CT'
};

// File Patterns
const FILES = [
    // 1. Common
    { type: 'common', name: '(BizDive) 7D 공통질문 데이터.xlsx', mapping: null },

    // 2. Stage Specific
    { type: 'stage', name: '(BizDive) 7D 단계별(예비창업) 특화질문 데이터.xlsx', key: '예비창업' },
    { type: 'stage', name: '(BizDive) 7D 단계별(초기창업) 특화질문 데이터.xlsx', key: '초기창업' },
    { type: 'stage', name: '(BizDive) 7D 단계별(벤처_도약) 특화질문 데이터.xlsx', key: '벤처_도약' },
    { type: 'stage', name: '(BizDive) 7D 단계별(중소_중견) 특화질문 데이터.xlsx', key: '중소_중견' },

    // 3. Industry Specific
    { type: 'industry', name: '(BizDive) 7D 영역별(IT_SaaS) 특화질문 데이터.xlsx', key: 'IT_SaaS' },
    { type: 'industry', name: '(BizDive) 7D 영역별(제조_소재_하드웨어) 특화질문 데이터.xlsx', key: '제조_소재_하드웨어' },
    { type: 'industry', name: '(BizDive) 7D 영역별(로컬_서비스_F&B) 특화질문 데이터.xlsx', key: '로컬_서비스_F&B' },
    { type: 'industry', name: '(BizDive) 7D 영역별(콘텐츠_지식_IP) 특화질문 데이터.xlsx', key: '콘텐츠_지식_IP' }, // Check filename if it exists

    // 4. ESG (Stage Dependent)
    { type: 'esg', name: '(BizDive) 7D 단계별(예비창업) ESG_지속가능 질문 데이터.xlsx', key: '예비창업' },
    { type: 'esg', name: '(BizDive) 7D 단계별(초기창업) ESG_지속가능 질문 데이터.xlsx', key: '초기창업' },
    { type: 'esg', name: '(BizDive) 7D 단계별(벤처_도약) ESG_지속가능 질문 데이터.xlsx', key: '벤처_도약' },
    { type: 'esg', name: '(BizDive) 7D 단계별(중소_중견) ESG_지속가능 질문 데이터.xlsx', key: '중소_중견' }
];

let sql = `/* Seed Data for BizDive 2.0 */
-- Enable UUID extension if not exists
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Update Table Schema to have default UUID if not exists (Optional safety)
ALTER TABLE questions ALTER COLUMN id SET DEFAULT gen_random_uuid();

TRUNCATE TABLE questions RESTART IDENTITY CASCADE;

INSERT INTO questions (id, category, dimension, content, score_weight, mapping_code) VALUES
`;

const values = [];

console.log('--- Starting Data Migration ---');

FILES.forEach(fileDef => {
    const filePath = path.join(DATA_DIR, fileDef.name);
    if (!fs.existsSync(filePath)) {
        console.warn(`[WARN] File not found: ${fileDef.name}`);
        return;
    }

    console.log(`Processing: ${fileDef.name}`);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let mappingCode = null;
    if (fileDef.type === 'stage' || fileDef.type === 'esg') mappingCode = STAGE_MAP[fileDef.key];
    if (fileDef.type === 'industry') mappingCode = INDUSTRY_MAP[fileDef.key];

    rows.forEach(row => {
        // Extract D1, D2 etc. from "영역" or "영역 (7-Dimension)"
        // Common: "D1. 시장 기회"
        // Others: "D1"
        let rawDim = row['영역 (7-Dimension)'] || row['영역'];
        if (!rawDim) return;

        let dimension = rawDim.trim().substring(0, 2); // "D1"

        // Handle text
        let content = row['질문 내용 (User Interface)'];
        if (!content) return;
        content = content.replace(/'/g, "''"); // Escape SQL

        // Handle score
        let score = row['배점'] || 1.0;

        // Construct SQL Value
        const mappingVal = mappingCode ? `'${mappingCode}'` : 'NULL';
        values.push(`(gen_random_uuid(), '${fileDef.type}', '${dimension}', '${content}', ${score}, ${mappingVal})`);
    });
});

if (values.length > 0) {
    sql += values.join(",\n") + ";\n";
    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`\nSuccessfully generated ${OUTPUT_FILE} with ${values.length} questions.`);
} else {
    console.error('No data extracted.');
}
