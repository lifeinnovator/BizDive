
const { getGradeInfo, DIMENSION_KR } = require('./src/data/feedback');

const mockScores = {
    D1: 90, D2: 90, D3: 90, D4: 90, D5: 90, D6: 90, D7: 90
};

console.log("Testing Stage 4 filtering...");
const result = getGradeInfo(95, mockScores, 'IT/SW/SaaS', '도약/벤처');

console.log("Diagnosis:", result.diagnosis);
console.log("Suggestion:", result.suggestion);
console.log("Filtered Terms:", result.terms);

// Expect: Should only include terms present in Diagnosis/Suggestion.
// Note: Stage 4 default terms are ["* Scale-up: ...", "* TAM ...", "* LTV ...", "* AARRR ...", "* Moat ..."]
// My implementation used includes(term.toLowerCase()).
// If the text has "Scale-up", it should keep that term.
