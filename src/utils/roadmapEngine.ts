// src/utils/roadmapEngine.ts

import {
  ROADMAP_INDUSTRIES,
  ROADMAP_STAGES,
  ROADMAP_SCORE_LEVELS,
  ROADMAP_PRESCRIPTIONS,
} from '../data/roadmapData';
import { DIMENSION_KR } from '../data/feedback';

export interface DiagnosisScores {
  D1: number;
  D2: number;
  D3: number;
  D4: number;
  D5: number;
  D6: number;
  D7: number;
}

export interface RoadmapResult {
  persona: {
    industry: string;
    stage: string;
    keywords: string[];
    focus: string;
    tone: string;
    coreTask: string;
  };
  strategyLevel: {
    level: string;
    description: string;
  };
  actions: {
    priority: 1 | 2 | 3;
    type: 'bottleneck' | 'strategy' | 'strength';
    title: string;
    description: string;
    dimension?: string;
    score?: number;
  }[];
}

/**
 * Calculates the total score and assigns the strategy level
 */
const getStrategyLevel = (totalScore: number) => {
  return ROADMAP_SCORE_LEVELS.find(
    (level) => totalScore >= level.min && totalScore <= level.max
  ) || ROADMAP_SCORE_LEVELS[0];
};

/**
 * Retrieves the specific prescription for a dimension based on its score
 */
export const getPrescription = (dimensionKey: string, score: number) => {
  const cards = ROADMAP_PRESCRIPTIONS[dimensionKey];
  if (!cards || cards.length === 0) return '해당 지표에 대한 데이터가 부족합니다.';
  
  const card = cards.find((c) => score >= c.min && score <= c.max);
  return card ? card.advice : cards[0].advice;
};

/**
 * Retrieves the Persona Info
 */
const getPersonaInfo = (industryKey: string, stageKey: string) => {
  // Map or fallback industry (Defaulting to 'IT/SW/SaaS' if none match perfectly for now)
  let industryData = ROADMAP_INDUSTRIES[industryKey];
  
  // Try to find a partial match if exact key fails
  if (!industryData) {
      const foundKey = Object.keys(ROADMAP_INDUSTRIES).find(k => industryKey.includes(k) || k.includes(industryKey));
      if (foundKey) industryData = ROADMAP_INDUSTRIES[foundKey];
  }
  if (!industryData) industryData = ROADMAP_INDUSTRIES['IT/SW/SaaS'];

  // Map or fallback stage (Defaulting to '예비창업' if none match)
  let stageData = ROADMAP_STAGES[stageKey];
  if (!stageData) {
    const foundKey = Object.keys(ROADMAP_STAGES).find(k => stageKey.includes(k) || k.includes(stageKey));
    if (foundKey) stageData = ROADMAP_STAGES[foundKey];
  }
  if (!stageData) stageData = ROADMAP_STAGES['예비창업'];

  return {
    industry: industryKey,
    stage: stageKey,
    ...industryData,
    ...stageData,
  };
};

/**
 * Main Engine Function to generate the Growth Roadmap
 */
export const generateGrowthRoadmap = (
  scores: DiagnosisScores,
  totalScore: number,
  industry: string,
  stage: string
): RoadmapResult => {
  // 1. Get Persona
  const persona = getPersonaInfo(industry, stage);

  // 2. Get Strategy Level based on Total Score
  const strategyLevel = getStrategyLevel(totalScore);

  // 3. Calculate Min and Max Dimensions
  const dimensionEntries = Object.entries(scores);
  
  // Sort ascending: [0] will be min, [length-1] will be max
  dimensionEntries.sort(([, scoreA], [, scoreB]) => scoreA - scoreB);
  
  const [minDimKey, minScore] = dimensionEntries[0];
  const [maxDimKey, maxScore] = dimensionEntries[dimensionEntries.length - 1];

  // Action 1: Bottleneck (Weakest point correction)
  const action1 = {
    priority: 1 as const,
    type: 'bottleneck' as const,
    title: `[약점 보완] ${DIMENSION_KR[minDimKey as keyof typeof DIMENSION_KR]} 지표 집중 개선`,
    description: getPrescription(minDimKey, minScore),
    dimension: DIMENSION_KR[minDimKey as keyof typeof DIMENSION_KR],
    score: minScore,
  };

  // Action 2: Stage Level Default Task
  const action2 = {
    priority: 2 as const,
    type: 'strategy' as const,
    title: `[단계별 과제] ${strategyLevel.level} 단계 전략 실행`,
    description: `${persona.tone} 현재 가장 중요한 핵심 과제는 '${persona.coreTask}'에 집중하는 것입니다.`,
  };

  // Action 3: Strength Leverage
  const action3 = {
    priority: 3 as const,
    type: 'strength' as const,
    title: `[강점 활용] ${DIMENSION_KR[maxDimKey as keyof typeof DIMENSION_KR]} 경쟁력 극대화`,
    description: getPrescription(maxDimKey, maxScore),
    dimension: DIMENSION_KR[maxDimKey as keyof typeof DIMENSION_KR],
    score: maxScore,
  };

  return {
    persona,
    strategyLevel,
    actions: [action1, action2, action3],
  };
};
