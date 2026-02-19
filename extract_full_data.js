
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const baseDir = String.raw`E:\OneDrive\Work\2026_kevin\기업자가진단 서비스\BizDive\BizDiz_DataSet`;

// 1. Define File Mappings
const FILES = {
    // Common (Applied to all stages as base)
    Common: '(BizDive) 7D 공통질문 데이터.xlsx',

    // Stage Specific (P, E, V, M)
    Stage: {
        P: '(BizDive) 7D 단계별(예비창업) 특화질문 데이터.xlsx',
        E: '(BizDive) 7D 단계별(초기창업) 특화질문 데이터.xlsx',
        V: '(BizDive) 7D 단계별(벤처_도약) 특화질문 데이터.xlsx',
        M: '(BizDive) 7D 단계별(중소_중견) 특화질문 데이터.xlsx'
    },

    // Industry Specific (I, H, L, CT)
    Industry: {
        I: '(BizDive) 7D 영역별(IT_SaaS) 특화질문 데이터.xlsx',
        H: '(BizDive) 7D 영역별(제조_소재_하드웨어) 특화질문 데이터.xlsx',
        L: '(BizDive) 7D 영역별(로컬_서비스_F&B) 특화질문 데이터.xlsx',
        CT: '(BizDive) 7D 영역별(콘텐츠_지식_IP) 특화질문 데이터.xlsx'
    },

    // ESG (Applied per stage)
    ESG: {
        P: '(BizDive) 7D 단계별(예비창업) ESG_지속가능 질문 데이터.xlsx',
        E: '(BizDive) 7D 단계별(초기창업) ESG_지속가능 질문 데이터.xlsx',
        V: '(BizDive) 7D 단계별(벤처_도약) ESG_지속가능 질문 데이터.xlsx',
        M: '(BizDive) 7D 단계별(중소_중견) ESG_지속가능 질문 데이터.xlsx'
    }
};

// 2. Verified Weights (From previous steps)
const WEIGHTS = {
    P: {
        D1: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D2: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D3: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D4: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D5: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D6: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D7: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
    },
    E: {
        D1: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D2: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D3: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D4: { S: [2.0, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D5: { S: [2.0, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D6: { S: [2.0, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D7: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1, 1, 1], E: 1 },
    },
    V: {
        D1: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D2: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D3: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D4: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D5: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D6: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D7: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
    },
    M: {
        D1: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1.5 },
        D2: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
        D3: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1.5 },
        D4: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1.5 },
        D5: { S: [2.0, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1.5 },
        D6: { S: [2.0, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1.5 },
        D7: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1.5 },
    }
};

// 3. Helper to parse Excel
function parseExcel(filename) {
    const filePath = path.join(baseDir, filename);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Structure: [Header, Row1, Row2...]
    // Header check (approximate column indices based on inspection)
    // Col 1: Dimension (D1..D7)
    // Col 2: Content
    // Col 4: Caption

    const results = { D1: [], D2: [], D3: [], D4: [], D5: [], D6: [], D7: [] };

    // Skip header (row 0)
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        if (!row || row.length < 3) continue;

        let dim = row[1]; // "D1", "D1. 시장분석", "D1" etc.
        const content = row[2];
        const caption = row[4];

        if (!dim || !content) continue;

        // Normalize dim (e.g., "D1. 시장분석" -> "D1")
        const dimMatch = dim.match(/(D[1-7])/);
        if (dimMatch) {
            dim = dimMatch[1];
            if (results[dim]) {
                results[dim].push({ content, caption });
            }
        }
    }
    return results;
}

// 4. Main Generation Logic
const STAGES = ['P', 'E', 'V', 'M'];
const DIMS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
const INDS = ['I', 'H', 'L', 'CT'];

const rows = [];
const esc = (s) => (s || '').replace(/'/g, "''");

// Helper to fill missing questions
const fillQuestions = (qs, targetCount, prefix, dim) => {
    const arr = qs ? [...qs] : [];
    while (arr.length < targetCount) {
        arr.push({
            content: `[${prefix}] ${dim} - 문항 내용 보완 필요 (${arr.length + 1})`,
            caption: '추가 질문이 필요합니다.'
        });
    }
    return arr.slice(0, targetCount);
};

// A. Parse Common Questions ONCE
console.log("Parsing Common...");
const commonData = parseExcel(FILES.Common);

const stageDataMap = {};
const industryDataMap = {};
const esgDataMap = {};

// Pre-parse everything to avoid repetitive I/O
STAGES.forEach(s => {
    console.log(`Parsing Stage ${s}...`);
    stageDataMap[s] = parseExcel(FILES.Stage[s]);
    console.log(`Parsing ESG ${s}...`);
    esgDataMap[s] = parseExcel(FILES.ESG[s]);
});

Object.keys(FILES.Industry).forEach(i => {
    console.log(`Parsing Industry ${i}...`);
    industryDataMap[i] = parseExcel(FILES.Industry[i]);
});


// B. Generate SQL Layout
STAGES.forEach(stage => {
    DIMS.forEach(dim => {
        const w = WEIGHTS[stage][dim];

        // 1. Common (Merged to Stage) - Target 3
        const cQs = fillQuestions(commonData[dim], 3, '공통', dim);
        cQs.forEach((q, i) => {
            const weight = (w.C && w.C[i]) ? w.C[i] : 1;
            rows.push(`('stage', '${dim}', '${esc(q.content)}', '${esc(q.caption)}', ${weight}, '${stage}', ${i + 1})`); // Order 1,2,3
        });

        // 2. Stage Specific - Target 3
        const sQs = fillQuestions(stageDataMap[stage][dim], 3, `단계-${stage}`, dim);
        sQs.forEach((q, i) => {
            const weight = (w.S && w.S[i]) ? w.S[i] : 1;
            rows.push(`('stage', '${dim}', '${esc(q.content)}', '${esc(q.caption)}', ${weight}, '${stage}', ${i + 4})`); // Order 4,5,6
        });

        // 3. Industry - Target 3 (Iterate all Inds)
        INDS.forEach(ind => {
            const iQs = fillQuestions(industryDataMap[ind][dim], 3, `산업-${ind}`, dim);
            iQs.forEach((q, i) => {
                const weight = (w.I && w.I[i]) ? w.I[i] : 1;
                // Mapping: P_I, P_H etc.
                rows.push(`('industry', '${dim}', '${esc(q.content)}', '${esc(q.caption)}', ${weight}, '${stage}_${ind}', ${i + 7})`); // Order 7,8,9
            });
        });

        // 4. ESG - Target 1
        const eQs = fillQuestions(esgDataMap[stage][dim], 1, 'ESG', dim);
        eQs.forEach((q, i) => {
            const weight = w.E || 1;
            rows.push(`('esg', '${dim}', '${esc(q.content)}', '${esc(q.caption)}', ${weight}, '${stage}', 10)`); // Order 10
        });
    });
});

// 5. Output SQL
let sql = `/* Seed Data for BizDive 2.0 (Full Extraction with Captions) */
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Add caption column if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='caption') THEN 
        ALTER TABLE questions ADD COLUMN caption TEXT; 
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='questions' AND column_name='display_order') THEN 
        ALTER TABLE questions ADD COLUMN display_order INTEGER DEFAULT 0; 
    END IF;
END $$;

ALTER TABLE questions ALTER COLUMN id SET DEFAULT gen_random_uuid();
TRUNCATE TABLE questions RESTART IDENTITY CASCADE;

INSERT INTO questions (category, dimension, content, caption, score_weight, mapping_code, display_order) VALUES
`;

const finalOutput = sql + rows.join(",\n") + ";";
fs.writeFileSync('d:\\Dev\\bizdive-service\\seed_v3_full.sql', '\uFEFF' + finalOutput, 'utf8');
console.log("Successfully generated seed_v3_full.sql with captions and display_order.");
