import { 
    ROADMAP_INDUSTRIES, 
    ROADMAP_STAGES, 
    ROADMAP_PRESCRIPTIONS 
} from './roadmapData';
import { getPrescription } from '../utils/roadmapEngine';

export const DIMENSION_KR: Record<string, string> = {
    D1: "시장 기회",
    D2: "문제 정의",
    D3: "해결 가치",
    D4: "실행 역량",
    D5: "기술/구현",
    D6: "비즈니스 모델",
    D7: "성장 전략"
};

export const ITEMIZED_DIMENSION_KR: Record<string, string> = {
    D1: "시장 기회",
    D2: "문제 정의",
    D3: "해결 가치",
    D4: "실행 역량",
    D5: "기술/구현",
    D6: "비즈니스 모델",
    D7: "성장 전략"
};

export const FEEDBACK_DB: Record<string, { low: string; mid: string; high: string }> = {
    D1: {
        low: "타겟 시장의 정의가 모호하여 자원이 분산되고 있습니다. 유효 시장(SOM)을 좁게 재설정하고 고객의 실질적인 유효 수요를 데이터로 검증하는 데 집중하십시오.",
        mid: "기초적인 시장성은 확인되었으나, 경쟁 우위를 점하기 위한 차별화가 요구됩니다. 인접 시장 확장 가능성을 고려한 전략적 포지셔닝을 재점검해 보세요.",
        high: "명확한 시장 기회를 포착하여 초기 진입에 성공했습니다. 이제 경쟁사의 추격을 저지할 수 있는 독점적 진입 장벽(Moat) 강화와 시장 지배력 확대에 주력하십시오."
    },
    D2: {
        low: "고객의 페인 포인트(Pain Point)에 대한 심층적 이해가 부족하여 가치 제안이 약합니다. 현장 인터뷰와 관찰을 통해 고객의 숨겨진 니즈를 재발굴해야 합니다.",
        mid: "문제 정의는 타당하나 수익 모델과의 연계성이 느슨합니다. 고객이 기꺼이 지불할 수 있는 가치 지점(Willingness to Pay)을 정교하게 분석하여 BM을 고도화하세요.",
        high: "시장의 고통을 정확히 해결하는 가치 모델을 구축했습니다. 이를 바탕으로 고객 경험을 디지털 전환하고 운영 효율성을 높여 비즈니스 영속성을 확보하십시오."
    },
    D3: {
        low: "단순 기능 나열 위주의 마케팅으로 브랜드 메시지가 희석되어 있습니다. 우리만이 제공할 수 있는 독보적 가치 제안(UVP)을 중심으로 커뮤니케이션을 재설계하십시오.",
        mid: "기본적인 영업 채널은 구축되었으나 고객 획득 비용(CAC) 최적화가 필요합니다. 데이터 기반의 퍼널 분석을 통해 이탈 구간을 개선하고 마케팅 효율을 극대화하세요.",
        high: "강력한 팬덤과 브랜드 신뢰도를 확보했습니다. 이제는 고객 생애 가치(LTV)를 높이기 위한 리텐션 전략과 바이럴 루프(Viral Loop) 구축으로 확산 속도를 높이십시오."
    },
    D4: {
        low: "실행 주체의 역량과 비전 공유가 미흡하여 성장의 병목이 발생하고 있습니다. 핵심 인재 영입과 함께 조직의 정체성을 재정립하는 내부 브랜딩이 시급합니다.",
        mid: "조직 기틀은 잡혔으나 직무 분장(R&R)과 의사결정 체계의 효율성이 낮습니다. 업무 표준화(SOP) 도입을 통해 운영 품질의 균일성을 확보하고 성과 관리 체계를 구축하십시오.",
        high: "안정적인 조직 문화를 바탕으로 고도의 전문성을 확보했습니다. 이제는 자율 책임 경영 시스템을 강화하고 차세대 리더십 육성을 통해 조직의 지속 가능성을 높이십시오."
    },
    D5: {
        low: "기술적 가설의 현실성이 낮고 시장 요구사항과의 간극이 큽니다. 모든 부가 기능을 제거하고 핵심 성과 지표를 증명할 수 있는 MVP 구현에 모든 에너지를 쏟으십시오.",
        mid: "높은 수준의 기술적 안정성을 확보했습니다. 이제는 제품의 지능화를 꾀하고, 독자적인 기술 IP를 자산화하여 경쟁사와의 격차를 벌리는 데 주력하십시오.",
        high: "산업 전체의 기술 패러다임을 혁신하는 리더로 도약하십시오. 지속적인 R&D 투자를 통해 기술 자체가 기업의 철학이자 경쟁력이 되는 압도적 경영을 실천하십시오."
    },
    D6: {
        low: "수익 창출 구조의 불확실성이 높아 재무적 건전성이 우려됩니다. 자원 소진율을 최소화하고, 최소한의 생존이 가능한 수익 경로를 즉시 발굴하여 런웨이를 확보하십시오.",
        mid: "재생산 가능한 건전한 수익 모델을 완성했습니다. 이제 수익 모델 다각화를 통해 고객 생애 가치를 극대화하고, 인접 수익원을 적극 개발하여 수익력을 강화하십시오.",
        high: "영속 가능한 경제 생태계를 구축하여 자생적인 현금 증폭 시스템을 확보하십시오. 글로벌 인프라를 활용한 수익 파이프라인을 완성하고 재무적 리더십을 발휘하십시오."
    },
    D7: {
        low: "지표 관리가 미흡하거나 시장 피드백 수용이 경직된 상태입니다. 고객 이탈 방지에 사활을 걸고, 비즈니스의 기초 체력을 영점에서부터 재건하는 데 집중하십시오.",
        mid: "공격적인 스케일업 가속도가 붙은 시기입니다. 체계적인 지표 추적 시스템을 가동하여 위기를 선제적으로 포착하고, 시장 장악력을 빠르게 확대하는 전략을 실행하십시오.",
        high: "문화가 된 브랜드로서 시대를 앞서가는 시대정신을 제시하십시오. 광고 없이도 성장이 영속되는 무결점 엔진을 완성하고 산업 생태계의 동반 성장을 이끄십시오."
    }
};

export const getGradeInfo = (score: number, dimensionScores?: Record<string, number>, stageKey: string = 'P', industryKey: string = 'I') => {
    const industryData = ROADMAP_INDUSTRIES[industryKey as keyof typeof ROADMAP_INDUSTRIES] || { focus: '비즈니스 성장', keywords: [] };
    const stageData = ROADMAP_STAGES[stageKey as keyof typeof ROADMAP_STAGES] || { coreTask: '시장 안착', tone: '중립적' };

    const grades = [
        {
            min: 90,
            max: 1000,
            name: "S 등급 (최우수)",
            desc: "비즈니스의 모든 차원에서 압도적인 경쟁력을 갖춘 상태",
            diag: `귀사의 비즈니스는 견고한 제품-시장 적합성(PMF)과 경제적 해자를 구축하여 산업 전체의 패러다임을 주도하는 독보적인 상태입니다. 최적화된 유닛 이코노믹스를 바탕으로 글로벌 시장 장악과 카테고리 킬러로서의 지위를 확립해야 할 최적의 시기입니다.`,
            sugg: `보유하신 원천 기술과 인프라를 자산화하여 경쟁자가 추격할 수 없는 강력한 에코시스템을 구축하는 데 경영 자원을 집중하십시오. 현재의 높은 자본 효율성을 바탕으로 공격적인 시장 확장이나 전략적 M&A를 통해 기업 가치를 극대화할 타이밍입니다.`,
            terms: ["* PMF (Product-Market Fit): 제품이 시장의 강력한 수요를 충족시키는 최적의 상태", "* Unit Economics: 고객 1명을 유치할 때 발생하는 공헌 이익 분석 구조", "* Moat (경제적 해자): 경쟁자가 넘볼 수 없는 기업만의 독점적 경쟁 우위", "* LTV (Life Time Value): 고객 1명이 평생 동안 기업에 가져다주는 총 경제적 가치", "* AARRR: 유치, 활성화, 리텐션, 수익, 추천으로 이어지는 스타트업 성장 프레임워크"]
        }
,
        {
            min: 80,
            max: 89.9,
            name: "A 등급 (우수)",
            desc: "핵심 역량이 탄탄하며 성장을 위한 기반이 잘 갖춰진 상태",
            diag: `핵심 가설의 증명을 마치고 본격적인 성장 궤도 진입을 앞둔 긍정적인 상태로, 팀의 실행력과 제품 경쟁력이 조화로운 균형을 이루고 있습니다. 지표가 우상향하는 시점이므로 시스템적 확장성(Scalability) 문제를 선제적으로 점검하여 성장의 병목을 예방해야 합니다.`,
            sugg: `생존 지향적 관점에서 탈피하여 그로스 해킹 실험을 통해 검증된 마케킹 채널에 자원을 투입하고 시장 지배력을 키우는 데 집중하십시오. 대표 개인의 직관보다는 데이터와 업무 표준(SOP)에 기반한 전문 경영 시스템을 구축하여 기업 가치를 한 단계 높여야 합니다.`,
            terms: ["* Chasm (캐즘): 혁신 제품이 대중화되기 전 겪는 일시적 수요 정체 상태", "* Growth Hacking: 데이터 분석을 통해 저비용으로 폭발적 성장을 이끄는 기법", "* SOP (표준운용절차): 체계적 운영을 위해 매뉴얼화된 업무 처리 방식", "* Scalability (확장성): 비즈니스 모델이나 시스템이 품질 저하 없이 규모를 키울 수 있는 능력", "* CAC (Customer Acquisition Cost): 고객 1명을 획득하기 위해 투입되는 총 마케팅 비용"]
        }
,
        {
            min: 70,
            max: 79.9,
            name: "B 등급 (보통)",
            desc: "기본 기틀은 잡혀 있으나 독보적인 차별화 포인트 보완이 필요한 상태",
            diag: `기초적인 비즈니스 체계는 확보했으나 경쟁 우위를 점할 수 있는 독보적 가치 제안(UVP)을 더욱 날카롭게 다듬어야 할 단계입니다. 보편적 수요에만 의존하기보다 비즈니스의 본질적인 차별화 포인트를 재정립하여 체질을 건강하게 개선할 필요가 있습니다.`,
            sugg: `고객의 잠재적 니즈를 관통하는 브랜딩을 통해 가치 제안의 농도를 높이고, 리텐션이 높게 발생하는 거점 시장(Beachhead Market)에 집중하십시오. 제품 경험(UX) 고도화와 함께 유닛 이코노믹스를 재점검하여 지속 가능한 수익 구조로의 전환을 준비하시길 권고합니다.`,
            terms: ["* UVP (Unique Value Proposition): 우리만이 줄 수 있는 독보적 가치 제안", "* Beachhead Market: 본격적 확장을 위해 먼저 점령해야 하는 거점 시장", "* Retention (잔존율): 서비스 이용 후 이탈하지 않고 다시 이용하는 고객의 비율", "* UX (User Experience): 사용자가 제품이나 서비스를 이용하며 느끼는 총체적 경험", "* Unit Economics: 고객 1명을 유치할 때 발생하는 공헌 이익 분석 구조"]
        }
,
        {
            min: 60,
            max: 69.9,
            name: "C 등급 (미흡)",
            desc: "비즈니스 가설에 대한 추가 검증과 주요 결핍 영역 보완이 긴급한 상태",
            diag: `현재 비즈니스는 초기 가설과 시장 실재 간의 간극을 좁히기 위한 과감한 전략적 변곡점이 필요한 상태입니다. 자원 소진 속도(Burn Rate)를 고려할 때, 운영 방식을 유지하기보다 비즈니스의 핵심 가치를 재구조화하는 유연성이 요구됩니다.`,
            sugg: `비용 투입을 최소화하고 고객의 본질적 결핍을 해결하는 최소 기능 제품(MVP) 단계로 돌아가 시장성을 영점에서부터 다시 확인하십시오. 데이터가 가리키는 방향을 수용하여 피벗(Pivot) 가능성을 열어두고, 생존 가능성을 증명하는 매출 확보에 모든 역량을 집중해야 합니다.`,
            terms: ["* Pivot (피벗): 시장 반응에 따라 사업의 방향을 유연하게 전환하는 것", "* Burn Rate: 수입보다 지출이 많을 때 매월 소진되는 현금의 양", "* MVP (Minimum Viable Product): 가설 검증을 위한 최소 기능 제품", "* UVP (Unique Value Proposition): 우리만이 줄 수 있는 독보적 가치 제안", "* CJM (Customer Journey Map): 고객이 제품을 경험하는 전체 여정의 지도"]
        }
,
        {
            min: 0,
            max: 59.9,
            name: "D 등급 (보완 시급)",
            desc: "비즈니스 모델의 근본적인 재설계와 기초 역량 강화가 절대적으로 필요한 상태",
            diag: `지속 가능한 성장을 위해 비즈니스 모델 전반을 재검토하고 전략적 방향을 근본적으로 재수립해야 하는 엄중한 시점입니다. 현재의 지표는 운영상의 미숙함을 넘어 비즈니스 매커니즘 자체에 대한 파괴적 혁신과 재정비가 필수적임을 시사하고 있습니다.`,
            sugg: `확장적 운영을 지양하고 '누가 우리의 가치를 인정하는 고객인가'라는 본원적 질문에 대한 해답을 찾는 것에 모든 에너지를 집중하십시오. 시장 중심의 'Problem-Solution Fit' 관점에서 가설을 재검증하고 전문가의 조언을 수용하며 경영 환경을 전면 쇄신해야 합니다.`,
            terms: ["* Pain Point: 고객이 느끼는 고통이나 해결되지 않은 문제점", "* Problem-Solution Fit: 해결책이 실제 고객의 문제를 푸는 데 적합한 상태", "* Runway: 기업이 수익 없이 현재 보유한 현금만으로 버틸 수 있는 기간", "* SOM (Serviceable Obtainable Market): 초기 단계에서 즉각적으로 공략 가능한 유효 시장", "* BM (Business Model): 비즈니스의 가치 창출 및 수익 확보 매커니즘"]
        }
    ];

    const grade = grades.find(g => score >= g.min && score <= g.max) || grades[grades.length - 1];
    
    let diagnosis = grade.diag;
    let suggestion = grade.sugg;

    if (dimensionScores) {
        const sorted = Object.entries(dimensionScores).sort(([, a], [, b]) => b - a);
        const bottomDim = sorted[sorted.length - 1];
        const bottomAdvice = getPrescription(bottomDim[0], bottomDim[1]);

        diagnosis += ` 특히 '${industryKey}' 산업의 특성상 ${industryData.focus}를 위해 ${ITEMIZED_DIMENSION_KR[bottomDim[0]]} 지표에 대한 '${bottomAdvice}' 전략 이행이 향후 시장 점유율 확대의 결정적 변수가 될 것입니다.`;
        suggestion += ` 현재 '${stageKey}' 단계의 핵심 과제인 '${stageData.coreTask}' 달성을 위해 ${ITEMIZED_DIMENSION_KR[bottomDim[0]]} 영역을 우선 보강하여 스케일업을 위한 체력을 확보하시길 제안합니다.`;
    }

    // Filter terms based on their presence in diagnosis or suggestion
    const filteredTerms = grade.terms.filter(term => {
        // term is like "* PMF (Product-Market Fit): ..."
        // We want to extract "PMF" and "Product-Market Fit" and check if they exist in diagnosis or suggestion
        const termContent = term.replace(/^\*\s*/, '');
        const parts = termContent.split(':');
        if (parts.length < 1) return false;
        
        const termNameWithBrackets = parts[0].trim(); // "PMF (Product-Market Fit)"
        const mainTerm = termNameWithBrackets.split('(')[0].trim(); // "PMF"
        const subTermMatch = termNameWithBrackets.match(/\(([^)]+)\)/);
        const subTerm = subTermMatch ? subTermMatch[1].trim() : ''; // "Product-Market Fit"

        const fullText = (diagnosis + suggestion).toLowerCase();
        return (mainTerm && fullText.includes(mainTerm.toLowerCase())) || 
               (subTerm && fullText.includes(subTerm.toLowerCase()));
    });

    return {
        stageName: grade.name,
        shortDesc: grade.desc,
        diagnosis,
        suggestion,
        terms: filteredTerms
    };
};

export const STAGE_LABELS: Record<string, string> = {
    P: '예비창업', E: '초기창업', V: '도약/벤처', M: '중소/중견'
};

export const INDUSTRY_LABELS: Record<string, string> = {
    I: 'IT/SW/SaaS', H: '제조/하드웨어', L: '로컬/서비스/F&B', CT: '콘텐츠/IP/지식'
};

export const STAGE_UNIT_SCORES: Record<string, Record<string, number>> = {
    P: { D1: 2.0, D2: 2.5, D3: 1.5, D4: 1.0, D5: 1.0, D6: 1.0, D7: 1.0 },
    E: { D1: 1.5, D2: 1.5, D3: 2.5, D4: 1.5, D5: 1.0, D6: 1.0, D7: 1.5 },
    V: { D1: 1.0, D2: 1.0, D3: 1.5, D4: 2.0, D5: 1.5, D6: 1.5, D7: 2.5 },
    M: { D1: 1.0, D2: 1.0, D3: 1.0, D4: 1.5, D5: 2.5, D6: 2.0, D7: 1.0 }
};

export const STAGE_MAX_SCORES: Record<string, Record<string, number>> = {
    P: { D1: 20.0, D2: 25.0, D3: 15.0, D4: 10.0, D5: 10.0, D6: 10.0, D7: 10.0 },
    E: { D1: 15.0, D2: 15.0, D3: 25.0, D4: 15.0, D5: 10.0, D6: 10.0, D7: 15.0 },
    V: { D1: 10.0, D2: 10.0, D3: 15.0, D4: 20.0, D5: 15.0, D6: 15.0, D7: 25.0 },
    M: { D1: 10.0, D2: 10.0, D3: 10.0, D4: 15.0, D5: 25.0, D6: 20.0, D7: 10.0 }
};
