
export const FEEDBACK_DB: Record<string, { low: string; mid: string; high: string }> = {
    D1: {
        low: "타겟 시장이 불분명합니다. SOM(유효 시장)을 좁히고 명확히 정의하세요.",
        mid: "시장의 존재는 확인했습니다. 이제 그 시장의 구매력을 데이터로 증명할 때입니다.",
        high: "시장 기회를 포착했습니다. 경쟁사가 넘볼 수 없는 진입 장벽(Moat) 구축에 집중하세요."
    },
    D2: {
        low: "고객의 고통(Pain Point) 이해가 부족합니다. 책상 밖으로 나가 고객 인터뷰를 다시 하세요.",
        mid: "문제는 정의했으나 시급성이 약합니다. 고객이 돈을 낼 만큼 아픈 문제인지 검증하세요.",
        high: "문제를 정확히 꿰뚫었습니다. 이 통찰을 마케팅 메시지로 전환하여 고객을 설득하세요."
    },
    D3: {
        low: "차별성이 없습니다. 기능 나열을 멈추고 우리만의 '한 방(UVP)'을 다시 설계하세요.",
        mid: "경쟁력은 있으나 압도적이지 않습니다. '기능'이 아닌 고객이 얻을 '혜택'을 강조하세요.",
        high: "매력적인 가치 제안입니다. 기술 특허나 브랜드 팬덤으로 이 가치를 방어하세요."
    },
    D4: {
        low: "실행 역량이 부족합니다. 아이디어보다 중요한 건 사람입니다. 동료 영입이 시급합니다.",
        mid: "팀 세팅은 되었습니다. R&R과 의사결정 체계를 정비하여 속도를 높이세요.",
        high: "최적의 팀입니다. 팀원 동기부여와 향후 스케일업을 위한 채용 파이프라인을 준비하세요."
    },
    D5: {
        low: "구현 능력이 우려됩니다. 외주 의존도를 낮추고 내부 기술 통제권을 확보하세요.",
        mid: "만들 수는 있으나 안정성이 부족합니다. 기술 부채(Tech Debt)를 점검하고 확장성을 고려하세요.",
        high: "탁월한 기술력입니다. 기술을 자산화(IP)하여 기업 가치를 높이고 격차를 벌리세요."
    },
    D6: {
        low: "수익 모델이 없습니다. 무료 봉사가 아닙니다. 당장 가격 정책(Pricing)을 수립하세요.",
        mid: "수익 구조는 있습니다. 이제 LTV(고객가치)가 CAC(획득비용)보다 높은지 계산해보세요.",
        high: "건전한 수익 모델입니다. 추가 수익을 위한 Upselling/Cross-selling 전략을 짜보세요."
    },
    D7: {
        low: "검증된 것이 없습니다. 완벽주의를 버리고 MVP를 출시하여 시장 반응을 보세요.",
        mid: "초기 반응은 있습니다. 이것이 '반짝 인기'가 되지 않도록 재구매율(Retention)을 잡으세요.",
        high: "PMF를 찾았습니다. 공격적인 마케팅과 투자 유치로 시장을 장악할 때입니다."
    }
};

export const DIMENSION_KR: Record<string, string> = {
    D1: '시장 기회',
    D2: '문제 정의',
    D3: '해결 가치',
    D4: '실행 역량',
    D5: '기술/구현',
    D6: '비즈니스 모델',
    D7: '성장 전략'
}

export const ITEMIZED_DIMENSION_KR: Record<string, string> = {
    D1: '시장 기회',
    D2: '문제 정의',
    D3: '해결 가치',
    D4: '실행 역량',
    D5: '기술/구현',
    D6: '비즈니스 모델',
    D7: '성장 전략'
}

export const getStageInfo = (score: number, dimensionScores?: Record<string, number>) => {
    // 1. Stage 기본 정보 정의
    const stages = [
        {
            min: 0,
            max: 39,
            name: "Stage 1. 아이디어 탐색기",
            desc: "비즈니스 기회 발견 및 가설 수립 단계",
            diag: "현재 비즈니스의 기초 체력이 약한 상태입니다. 아이디어는 있으나 이것이 시장에서 통할지에 대한 객관적인 증거가 부족합니다.",
            sugg: "책상 밖으로 나가십시오. 사무실에서 기획을 다듬는 것보다 잠재 고객을 직접 만나 그들의 불편함을 듣는 필드 리서치가 더 시급합니다.",
            terms: ["* 필드 리서치: 현장에서 직접 고객을 관찰하거나 인터뷰하여 데이터를 수집하는 조사 방법", "* Pain Point: 고객이 겪는 미충족 욕구 또는 통증점"]
        },
        {
            min: 40,
            max: 64,
            name: "Stage 2. 솔루션 구체화기",
            desc: "가치 제안 정의 및 비즈니스 모델 설계 단계",
            diag: "시장 기회는 포착했으나 이를 뒷받침할 구체적인 전략과 밸런스를 맞추는 과정이 필요합니다.",
            sugg: "비즈니스 모델의 경제성 검증에 집중하십시오. Unit Economics를 계산하여 고객 한 명을 유치할 때마다 이익이 남는 구조인지 점검해야 합니다.",
            terms: ["* UVP (Unique Value Proposition): 고객이 경쟁사 대신 우리를 선택해야 하는 독보적인 가치 제안", "* Unit Economics: 제품 1단위를 판매할 때 발생하는 매출과 비용의 경제성 분석 (LTV vs CAC)"]
        },
        {
            min: 65,
            max: 84,
            name: "Stage 3. 시장 진입기 (PMF)",
            desc: "MVP 출시 및 시장 검증, 초기 성장 단계",
            diag: "제품 출시 후 초기 반응을 확인하는 단계입니다. 유의미한 트랙션이 발생하고 있으나 폭발적인 성장을 위한 내실 다지기가 필요합니다.",
            sugg: "본격적인 마케팅 전에 PMF를 달성했는지 지표로 확인하십시오. 신규 유입도 중요하지만 재구매율(Retention)을 잡는 것이 핵심입니다.",
            terms: ["* PMF: 제품이 시장의 강력한 수요를 충족시키는 최적화 상태", "* J-Curve: 스타트업의 초기 죽음의 계곡을 지나 급격하게 성장하는 그래프 곡선"]
        },
        {
            min: 85,
            max: 1000,
            name: "Stage 4. 도약 및 확장기 (Scale-up)",
            desc: "비즈니스 모델 검증 완료 및 고속 성장 단계",
            diag: "비즈니스 모델 검증이 완료되었고 성장할 준비가 되었습니다. 시스템과 자본을 바탕으로 시장 점유율을 공격적으로 확대해야 할 때입니다.",
            sugg: "대규모 투자 유치를 통해 스케일업을 도모하십시오. 조직 비대화에 따른 비효율을 막기 위한 시스템 구축과 글로벌 진출 등 TAM 확장이 과제입니다.",
            terms: ["* Scale-up: 기술, 제품, 서비스 등의 규모를 확대하여 폭발적인 성장을 도모하는 것", "* TAM (Total Addressable Market): 제품이나 서비스가 도달할 수 있는 전체 시장 규모"]
        }
    ];

    const stage = stages.find(s => score >= s.min && score <= s.max) || stages[0];
    let diagnosis = stage.diag;
    let suggestion = stage.sugg;

    // 2. 차원별 점수가 있을 경우 동적 멘트 생성 (근본적 해결)
    if (dimensionScores) {
        const sortedScores = Object.entries(dimensionScores)
            .sort(([, a], [, b]) => b - a);

        const topDim = sortedScores[0];
        const bottomDim = sortedScores[sortedScores.length - 1];

        // 강점 반영
        if (topDim[1] >= 85) {
            diagnosis += ` 특히 ${DIMENSION_KR[topDim[0]]} 분야에서 매우 탁월한 역량(${topDim[1].toFixed(1)}점)을 보여주고 계신 점이 팀의 강력한 엔진이 되고 있습니다.`;
        } else if (topDim[1] >= 70) {
            diagnosis += ` 특히 ${DIMENSION_KR[topDim[0]]} 분야가 현재 가장 큰 경쟁력으로 파악됩니다.`;
        }

        // 약점 반영 및 Suggestion 보완
        if (bottomDim[1] < 50) {
            const bottomName = DIMENSION_KR[bottomDim[0]];
            diagnosis += ` 반면, 상대적으로 지표가 낮은 ${bottomName} 부분은 비즈니스 모델의 완성도를 위해 보완이 시급합니다.`;
            
            // 핵심적 약점에 따른 제언 보강
            if (bottomDim[0] === 'D4') {
                suggestion = `현재 팀 빌딩과 조직 체계(조직/인사)를 정비하는 것이 무엇보다 중요합니다. 핵심 팀원을 보강하여 실행력을 높이십시오. ` + suggestion;
            } else if (bottomDim[0] === 'D1' || bottomDim[0] === 'D2') {
                suggestion = `우리만의 '한 방(차별점)'을 날카롭게 다듬고, 초기 거점 시장을 좁혀서 집중 공략하는 전략이 필요합니다. ` + suggestion;
            } else {
                suggestion = `${bottomName} 분야의 취약점을 극복하는 데 우선순위를 두십시오. ` + suggestion;
            }
        }

        // 특정 모순 해결: 강점이 있는 영역에 대해 부정적 제언이 나가지 않도록 수정
        if (dimensionScores['D4'] >= 80) {
            suggestion = suggestion.replace(/핵심 팀원을 보강하여 실행력을 높이십시오\.?\s?/, "");
            suggestion = suggestion.replace(/실행 전략과 팀 역량이 부족해 보입니다\.?\s?/, "");
        }
        if (dimensionScores['D1'] >= 80 || dimensionScores['D2'] >= 80) {
            suggestion = suggestion.replace(/우리만의 '한 방'을 날카롭게 다듬고, 초기 거점 시장을 좁혀서 집중 공략하는 전략이 필요합니다\.?\s?/, "");
        }
    }

    return {
        stageName: stage.name,
        shortDesc: stage.desc,
        diagnosis,
        suggestion,
        terms: stage.terms
    };
};

export const STAGE_LABELS: Record<string, string> = {
    P: '예비창업', E: '초기창업(3년이하)', V: '성장기(3-7년)', M: '중소/중견'
}

export const INDUSTRY_LABELS: Record<string, string> = {
    I: 'IT/SaaS', H: '제조/소재/HW', L: '서비스/F&B/로컬', CT: '콘텐츠/IP/지식서비스'
}

export const STAGE_UNIT_SCORES: Record<string, Record<string, number>> = {
    P: { D1: 2.0, D2: 2.5, D3: 1.5, D4: 1.0, D5: 1.0, D6: 1.0, D7: 1.0 },
    E: { D1: 1.5, D2: 1.5, D3: 2.5, D4: 1.5, D5: 1.0, D6: 1.0, D7: 1.5 },
    V: { D1: 1.0, D2: 1.0, D3: 1.5, D4: 2.0, D5: 1.5, D6: 1.5, D7: 2.5 },
    M: { D1: 1.0, D2: 1.0, D3: 1.0, D4: 1.5, D5: 2.5, D6: 2.0, D7: 1.0 }
}

export const STAGE_MAX_SCORES: Record<string, Record<string, number>> = {
    P: { D1: 20.0, D2: 25.0, D3: 15.0, D4: 10.0, D5: 10.0, D6: 10.0, D7: 10.0 },
    E: { D1: 15.0, D2: 15.0, D3: 25.0, D4: 15.0, D5: 10.0, D6: 10.0, D7: 15.0 },
    V: { D1: 10.0, D2: 10.0, D3: 15.0, D4: 20.0, D5: 15.0, D6: 15.0, D7: 25.0 },
    M: { D1: 10.0, D2: 10.0, D3: 10.0, D4: 15.0, D5: 25.0, D6: 20.0, D7: 10.0 }
}
