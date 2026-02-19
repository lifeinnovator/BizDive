
const fs = require('fs');

// Weights Config
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
        D4: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D5: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D6: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1 },
        D7: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1 },
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
        D5: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1.5 },
        D6: { S: [1.5, 1.5, 1.5], I: [1.5, 1.5, 1.5], C: [1.0, 1.0, 1.0], E: 1.5 },
        D7: { S: [2.0, 2.0, 2.0], I: [1.5, 1.5, 1.5], C: [1.5, 1.5, 1.5], E: 1.5 },
    }
};

const QUESTIONS = {
    Common: {
        D1: ['내 아이디어를 좋아할 사람들이 전국에 몇 명인지 믿을 만한 통계로 계산해봤다.', '목표 시장 진입을 위한 구체적인 일정과 손익분기점(BEP)을 고려한 자금 운용 계획이 있다.', '이미 비슷한 서비스를 하는 사람들이 놓치고 있는 \'고객의 진짜 불만\'이 무엇인지 정확히 안다.'],
        D2: ['내가 겪었거나 오랫동안 관찰해온 경험을 바탕으로, 대표자 본인이 가장 잘 해결할 수 있는 문제인가?', '이 문제가 해결되었을 때, 고객의 삶이 개선되며 우리 사회에 어떤 긍정적인 변화(ESG)를 주는지 설명할 수 있다.', '기존 해결 방식이 고객의 문제를 왜 완벽히 해결하지 못하는지 그 근본적인 한계를 명확히 알고 있다.'],
        D3: ['경쟁사 대비 우리 제품이 가진 확실한 차별점(UVP) 3가지를 1분 안에 설명할 수 있다.', '고객이 우리 서비스를 처음 접하고 결제하기까지의 모든 과정(User Journey)을 그림으로 그릴 수 있다.', '대기업이나 경쟁자가 우리를 쉽게 따라 하지 못하게 막을 \'방어막(특허, 데이터, 영업비밀 등)\'이 있다.'],
        D4: ['대표자인 나는 이 아이템을 끝까지 완수할 수 있는 전문성(전공, 경력)이나 남다른 경험을 보유하고 있다.', '매출, 손익분기점(BEP), 자금 흐름 등 우리 회사의 생존을 결정짓는 핵심 재무 지표를 직접 설명할 수 있다.', '우리 팀에 부족한 역량(개발, 마케팅 등)이 무엇인지 알고, 이를 보완할 채용 계획이나 파트너가 있다.'],
        D5: ['아이디어를 실제 제품으로 구현하기 위해 필요한 핵심 기술과 장비, 공정 리스트를 명확히 알고 있다.', '현재 우리의 개발 단계(TRL)를 객관적으로 정의하고, 다음 단계로 가기 위한 기술적 난제를 파악했다.', '우리가 보유한 기술이나 데이터가 경쟁사보다 우위에 있음을 증명할 객관적 자료(특허, 인증 등)가 있다.'],
        D6: ['고객이 제품을 받고 돈을 지불하는 과정이 복잡하지 않고 직관적인 거래 구조로 설계되어 있다.', '제품 하나를 팔았을 때 남는 이익(공헌이익)이 얼마인지 알며, 팔수록 이익이 커지는 구조인가?', '고객이 한 번 사고 끝나는 것이 아니라, 지속적으로 재구매하거나 구독하게 만들 \'Lock-in 장치\'가 있다.'],
        D7: ['한 번 구매한 고객이 2번째, 3번째 구매로 이어지는 \'재구매 연결고리\'가 제품 내에 심어져 있다.', '신규 고객 유입 대비 \'생존 비율(Retention Rate)\'을 핵심 경쟁력 지표로 관리하고 있다.', '충성 고객이 주변 지인에게 우리 제품을 자발적으로 추천하는 \'바이럴 루프\'가 작동하는가?']
    },
    P: {
        D1: ['불특정 다수가 아니라, 내가 지금 당장 만나서 제안할 수 있는 구체적인 집단이나 장소(거점)가 정해져 있다.', '왜 하필 \'지금\' 이 사업을 해야 하는지, 시장의 변화(법규, 트렌드 등)를 근거로 타이밍을 설명할 수 있다.', '사업 개시 후 1년 안에 달성할 현실적인 목표치(매출, 유저 수)를 산출하고 근거를 가지고 있다.'],
        D2: ['책상 앞 상상이 아니라, 잠재 고객 10명 이상을 직접 인터뷰하여 문제의 심각성을 확인했다.', '고객이 우리 서비스를 가장 절실하게 필요로 하는 상황(Context)과 시점을 구체적으로 묘사할 수 있다.', '고객이 이 문제를 해결하기 위해 현재 쓰고 있는 비용(돈, 시간, 노력)이 얼마나 큰지 파악했다.'],
        D3: ['개발자가 아니더라도 이해할 수 있는 수준의 시각적인 시제품(Mock-up)이나 서비스 흐름도를 그려두었다.', '고객이 익숙한 기존 방식을 버리고 우리 제품으로 갈아탈 만한 강력한 이유(Switching Cost 극복)를 정의했다.', '우리 서비스의 이름과 로고가 고객에게 전달하려는 핵심 메시지와 잘 연결되어 있다.'],
        D4: ['이 아이템을 사업화하는 데 있어 대표자인 내가 가진 \'경험, 인적 네트워크, 보유 자금\'이 핵심 경쟁력이라 확신한다.', '좋은 제품을 넘어, 지속 가능한 기업으로 키우기 위한 \'경영의 3요소(사람, 돈, 시스템)\'를 이해하고 준비하고 있다.', '향후 발생할 다양한 관계(직원, 고객 등)에서 \'계약서 작성\'의 중요성을 알고, 핵심 조항들을 이해하고 있다.'],
        D5: ['직접 개발할지 외주를 줄지 결정했으며, 외주 용역 관리(RFP 작성 등)를 위한 최소한의 지식이나 조력자가 있다.', '제품 출시 전 반드시 획득해야 할 인증(KC 등)이나 법적 허가 사항을 리스트업하고 비용/기간을 파악했다.', '아이디어 보호를 위해 특허 출원, 상표권 등록 등을 진행했거나 구체적인 출원 계획을 가지고 있다.'],
        D6: ['실제 제품이 나오기 전, 고객에게 구매 의향(LOI)이나 사전 예약을 받아 유료화 가능성을 타진해 보았다.', '제품 1개를 만드는 데 들어가는 직접비와 고정비를 추산해보고, 손해 보지 않는 최소 판매량을 알고 있다.', '제품 완성 직후 입점하거나 판매할 수 있는 첫 번째 유통 채널(First Channel)이 확정되어 있다.'],
        D7: ['사업의 성공 여부를 판단할 핵심 지표(KPI) 1~2가지를 설정하고 이를 측정할 방법이 있다.', '제품 출시까지 자금이 얼마나 필요한지 정확히 알며, 자금 소진 후의 \'후속 자금 조달 계획(생존 전략)\'이 있다.', '초기 고객의 불만이나 요구사항을 제품에 즉시 반영하여 개선할 수 있는 상시 소통 채널(VOC)을 설계했다.']
    },
    // ... For brevity I will fill E, V, M, I, H, L, CT with PLACEHOLDERS that you must replace with actual text if I had infinite context.
    // BUT since I read the file, I will try to map them. 
    // Wait, I can't put 200 lines in this tool call.
    // I will use a clever trick: I will read seed_v2.sql in the Node script itself!
    // Yes!
};

const esc = (s) => s.replace(/'/g, "''");

// --- REVISED APPROACH: READ seed_v2.sql TO EXTRACT TEXT ---
const seedFileContent = fs.readFileSync('d:\\Dev\\bizdive-service\\seed_v2.sql', 'utf8');

// Regex to extract questions
// Pattern: (gen_random_uuid(), 'category', 'dimension', 'content', weight, 'mapping_code')
const regex = /\(gen_random_uuid\(\),\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*[0-9.]+,\s*(NULL|'[^']+')\)/g;
let match;
const extracted = { common: {}, stage: {}, industry: {}, esg: {} };

while ((match = regex.exec(seedFileContent)) !== null) {
    const cat = match[1];
    const dim = match[2];
    const content = match[3];
    const mapping = match[4] === 'NULL' ? null : match[4].replace(/'/g, '');

    if (cat === 'common') {
        if (!extracted.common[dim]) extracted.common[dim] = [];
        extracted.common[dim].push(content);
    } else if (cat === 'stage') {
        if (!extracted.stage[mapping]) extracted.stage[mapping] = {};
        if (!extracted.stage[mapping][dim]) extracted.stage[mapping][dim] = [];
        extracted.stage[mapping][dim].push(content);
    } else if (cat === 'industry') {
        if (!extracted.industry[mapping]) extracted.industry[mapping] = {};
        if (!extracted.industry[mapping][dim]) extracted.industry[mapping][dim] = [];
        extracted.industry[mapping][dim].push(content);
    } else if (cat === 'esg') {
        if (!extracted.esg[mapping]) extracted.esg[mapping] = {};
        if (!extracted.esg[mapping][dim]) extracted.esg[mapping][dim] = [];
        extracted.esg[mapping][dim].push(content);
    }
}

// Generate SQL
let sql = `/* Seed Data for BizDive 2.0 (Corrected Weights) */
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER TABLE questions ALTER COLUMN id SET DEFAULT gen_random_uuid();
TRUNCATE TABLE questions RESTART IDENTITY CASCADE;

INSERT INTO questions (category, dimension, content, score_weight, mapping_code) VALUES
`;

const rows = [];
const STAGES = ['P', 'E', 'V', 'M'];
const DIMS = ['D1', 'D2', 'D3', 'D4', 'D5', 'D6', 'D7'];
const INDS = ['I', 'H', 'L', 'CT'];

STAGES.forEach(stage => {
    DIMS.forEach(dim => {
        const w = WEIGHTS[stage][dim];

        // Helper to fill or slice
        const getQuestions = (sourceArr, targetCount, prefix) => {
            const arr = sourceArr ? [...sourceArr] : [];
            // Fill if short
            while (arr.length < targetCount) {
                arr.push(`[${prefix}] ${dim} - 문항 내용 보완 필요 (${arr.length + 1})`);
            }
            // Slice if long
            return arr.slice(0, targetCount);
        };

        // 1. Common (Target: 3) -> Merged to Stage
        const commonQs = getQuestions(extracted.common[dim], 3, '공통');
        commonQs.forEach((txt, i) => {
            const weight = (w.C && w.C[i]) ? w.C[i] : 1;
            rows.push(`('stage', '${dim}', '${esc(txt)}', ${weight}, '${stage}')`);
        });

        // 2. Stage (Target: 3)
        const stageQs = getQuestions(extracted.stage[stage] && extracted.stage[stage][dim], 3, `단계-${stage}`);
        stageQs.forEach((txt, i) => {
            const weight = (w.S && w.S[i]) ? w.S[i] : 1;
            rows.push(`('stage', '${dim}', '${esc(txt)}', ${weight}, '${stage}')`);
        });

        // 3. ESG (Target: 1)
        const esgQs = getQuestions(extracted.esg[stage] && extracted.esg[stage][dim], 1, 'ESG');
        esgQs.forEach((txt, i) => {
            const weight = w.E || 1;
            rows.push(`('esg', '${dim}', '${esc(txt)}', ${weight}, '${stage}')`);
        });

        // 4. Industry (Target: 3 for each industry)
        INDS.forEach(ind => {
            const indQs = getQuestions(extracted.industry[ind] && extracted.industry[ind][dim], 3, `산업-${ind}`);
            indQs.forEach((txt, i) => {
                const weight = (w.I && w.I[i]) ? w.I[i] : 1;
                rows.push(`('industry', '${dim}', '${esc(txt)}', ${weight}, '${stage}_${ind}')`);
            });
        });
    });
});

const finalOutput = sql + rows.join(",\n") + ";";
fs.writeFileSync('d:\\Dev\\bizdive-service\\seed_v2_corrected.sql', '\uFEFF' + finalOutput, 'utf8');
console.log("Successfully generated seed_v2_corrected.sql with UTF-8 BOM.");
