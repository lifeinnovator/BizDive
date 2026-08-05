import { adminDb } from '@/lib/firebase-server'

export type CampaignQuestion = {
  id: string
  content: string
  dimension: string
  category: string | null
  mapping_code: string | null
  rationale: string | null
  caption: string | null
  score_weight: number
  display_order: number
}

export type CampaignDiagnosisContext = {
  assignmentId: string
  campaignId: string
  projectId: string
  campaignName: string
  assessmentType: 'self' | 'expert'
  templateId: string
  templateVersionId: string
  companyId: string
  companyName: string
  applicationId: string | null
  participationId: string | null
  stageId: string | null
  round: number
  questions: CampaignQuestion[]
}

type ScoringModel = {
  type: 'weighted_boolean_v1'
  normalization: 'percentage'
  true_value: number
  false_value: number
  dimension_weights: Record<string, number>
}

export type CampaignScore = {
  totalScore: number
  dimensionScores: Record<string, number>
  dimensionEarnedScores: Record<string, number>
  dimensionMaxScores: Record<string, number>
  normalizedResponses: Record<string, boolean>
}

function validScoringModel(value: unknown): value is ScoringModel {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const model = value as Record<string, unknown>
  return model.type === 'weighted_boolean_v1'
    && model.normalization === 'percentage'
    && typeof model.true_value === 'number'
    && typeof model.false_value === 'number'
    && !!model.dimension_weights
    && typeof model.dimension_weights === 'object'
    && !Array.isArray(model.dimension_weights)
}

export function parseCampaignQuestions(value: unknown): CampaignQuestion[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item, index) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) return []
    const question = item as Record<string, unknown>
    if (typeof question.question_id !== 'string' || typeof question.content !== 'string' || typeof question.dimension !== 'string') return []
    return [{
      id: question.question_id,
      content: question.content,
      dimension: question.dimension,
      category: typeof question.category === 'string' ? question.category : null,
      mapping_code: typeof question.mapping_code === 'string' ? question.mapping_code : null,
      rationale: typeof question.rationale === 'string' ? question.rationale : null,
      caption: null,
      score_weight: typeof question.score_weight === 'number' && question.score_weight > 0 ? question.score_weight : 1,
      display_order: typeof question.display_order === 'number' ? question.display_order : index + 1,
    }]
  }).sort((a, b) => a.display_order - b.display_order)
}

export function scoreCampaignDiagnosis(questionsValue: unknown, scoringModelValue: unknown, responsesValue: unknown): CampaignScore | null {
  const questions = parseCampaignQuestions(questionsValue)
  if (!questions.length || !validScoringModel(scoringModelValue) || !responsesValue || typeof responsesValue !== 'object' || Array.isArray(responsesValue)) return null
  const supplied = responsesValue as Record<string, unknown>
  const normalizedResponses: Record<string, boolean> = {}
  const dimensionEarnedScores: Record<string, number> = {}
  const dimensionMaxScores: Record<string, number> = {}

  for (const question of questions) {
    const checked = supplied[question.id] === true
    normalizedResponses[question.id] = checked
    const value = checked ? scoringModelValue.true_value : scoringModelValue.false_value
    const maxValue = Math.max(scoringModelValue.true_value, scoringModelValue.false_value, 1)
    dimensionEarnedScores[question.dimension] = (dimensionEarnedScores[question.dimension] || 0) + question.score_weight * value
    dimensionMaxScores[question.dimension] = (dimensionMaxScores[question.dimension] || 0) + question.score_weight * maxValue
  }

  const dimensionScores = Object.fromEntries(Object.keys(dimensionMaxScores).map((dimension) => {
    const maximum = dimensionMaxScores[dimension]
    const percentage = maximum > 0 ? (dimensionEarnedScores[dimension] / maximum) * 100 : 0
    return [dimension, Math.round(percentage * 10) / 10]
  }))
  let weightedTotal = 0
  let weightTotal = 0
  for (const [dimension, percentage] of Object.entries(dimensionScores)) {
    const configuredWeight = scoringModelValue.dimension_weights[dimension]
    const weight = typeof configuredWeight === 'number' && configuredWeight >= 0 ? configuredWeight : 1
    weightedTotal += percentage * weight
    weightTotal += weight
  }
  return {
    totalScore: weightTotal > 0 ? Math.round((weightedTotal / weightTotal) * 10) / 10 : 0,
    dimensionScores,
    dimensionEarnedScores,
    dimensionMaxScores,
    normalizedResponses,
  }
}

export async function getCampaignDiagnosisContext(userId: string, projectId: string, requestedRound: number): Promise<CampaignDiagnosisContext | null> {
  if (!adminDb) return null
  const memberships = await adminDb.collection('company_memberships').where('user_id', '==', userId).get()
  const companyIds = new Set(memberships.docs.filter((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data().active !== false).map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data().company_id).filter(Boolean))
  if (!companyIds.size) return null

  const assignments = await adminDb.collection('diagnosis_assignments').where('project_id', '==', projectId).get()
  const candidates = assignments.docs.filter((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const data = doc.data()
    return companyIds.has(data.company_id) && data.assessment_type === 'self' && data.status === 'pending'
  })
  for (const assignment of candidates) {
    const data = assignment.data()
    const [campaign, version] = await Promise.all([
      adminDb.collection('diagnosis_campaigns').doc(data.campaign_id).get(),
      adminDb.collection('diagnosis_template_versions').doc(data.template_version_id).get(),
    ])
    if (!campaign.exists || !version.exists) continue
    const campaignData = campaign.data()!
    if (campaignData.status !== 'open' || Number(campaignData.round) !== requestedRound || version.data()?.status !== 'published') continue
    const now = Date.now()
    if (campaignData.opens_at?.toMillis?.() > now || campaignData.closes_at?.toMillis?.() < now) continue
    const questions = parseCampaignQuestions(version.data()?.question_snapshots)
    if (!questions.length) continue
    const company = await adminDb.collection('companies').doc(data.company_id).get()
    return {
      assignmentId: assignment.id,
      campaignId: data.campaign_id,
      projectId,
      campaignName: typeof campaignData.name === 'string' ? campaignData.name : '프로젝트 진단',
      assessmentType: 'self',
      templateId: data.template_id,
      templateVersionId: data.template_version_id,
      companyId: data.company_id,
      companyName: String(company.data()?.name || data.company_id),
      applicationId: data.application_id ?? null,
      participationId: data.participation_id ?? null,
      stageId: data.stage_id ?? null,
      round: Number(campaignData.round),
      questions,
    }
  }
  return null
}

export async function getExpertDiagnosisContext(userId: string, assignmentId: string): Promise<CampaignDiagnosisContext | null> {
  if (!adminDb || !assignmentId) return null
  const assignment = await adminDb.collection('diagnosis_assignments').doc(assignmentId).get()
  if (!assignment.exists) return null
  const data = assignment.data()!
  if (data.assessment_type !== 'expert' || data.evaluator_user_id !== userId || data.status !== 'pending') return null
  const [campaign, version, company] = await Promise.all([
    adminDb.collection('diagnosis_campaigns').doc(data.campaign_id).get(),
    adminDb.collection('diagnosis_template_versions').doc(data.template_version_id).get(),
    adminDb.collection('companies').doc(data.company_id).get(),
  ])
  if (!campaign.exists || !version.exists || !company.exists) return null
  const campaignData = campaign.data()!
  const now = Date.now()
  if (campaignData.status !== 'open' || version.data()?.status !== 'published' || campaignData.opens_at?.toMillis?.() > now || campaignData.closes_at?.toMillis?.() < now) return null
  const questions = parseCampaignQuestions(version.data()?.question_snapshots)
  if (!questions.length) return null
  return {
    assignmentId,
    campaignId: data.campaign_id,
    projectId: data.project_id,
    campaignName: typeof campaignData.name === 'string' ? campaignData.name : '진단위원 진단',
    assessmentType: 'expert',
    templateId: data.template_id,
    templateVersionId: data.template_version_id,
    companyId: data.company_id,
    companyName: String(company.data()?.name || data.company_id),
    applicationId: data.application_id ?? null,
    participationId: data.participation_id ?? null,
    stageId: data.stage_id ?? null,
    round: Number(campaignData.round),
    questions,
  }
}
