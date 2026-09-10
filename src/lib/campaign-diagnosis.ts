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
  section_title: string | null
  max_score: number
  rubrics: Array<{ score: number; description: string }>
}

export type CampaignDiagnosisContext = {
  assignmentId: string
  campaignId: string
  projectId: string
  campaignName: string
  roundTitle: string | null
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
  scoringType: 'weighted_boolean_v1' | 'rubric_scale_v1'
}

type BooleanScoringModel = {
  type: 'weighted_boolean_v1'
  normalization: 'percentage'
  true_value: number
  false_value: number
  dimension_weights: Record<string, number>
}

type RubricScoringModel = {
  type: 'rubric_scale_v1'
  normalization: 'percentage'
  section_weights: Record<string, number>
}

type ScoringModel = BooleanScoringModel | RubricScoringModel

export type CampaignScore = {
  totalScore: number
  dimensionScores: Record<string, number>
  dimensionEarnedScores: Record<string, number>
  dimensionMaxScores: Record<string, number>
  normalizedResponses: Record<string, boolean | number>
}

function validScoringModel(value: unknown): value is ScoringModel {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const model = value as Record<string, unknown>
  if (model.type === 'rubric_scale_v1') {
    return model.normalization === 'percentage' && !!model.section_weights && typeof model.section_weights === 'object' && !Array.isArray(model.section_weights)
  }
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
      section_title: typeof question.section_title === 'string' ? question.section_title : null,
      max_score: typeof question.max_score === 'number' && question.max_score > 0 ? question.max_score : 1,
      rubrics: Array.isArray(question.rubrics) ? question.rubrics.flatMap((item) => {
        if (!item || typeof item !== 'object' || Array.isArray(item)) return []
        const rubric = item as Record<string, unknown>
        return typeof rubric.score === 'number' && typeof rubric.description === 'string'
          ? [{ score: rubric.score, description: rubric.description }]
          : []
      }).sort((a, b) => b.score - a.score) : [],
    }]
  }).sort((a, b) => a.display_order - b.display_order)
}

export function scoreCampaignDiagnosis(questionsValue: unknown, scoringModelValue: unknown, responsesValue: unknown): CampaignScore | null {
  const questions = parseCampaignQuestions(questionsValue)
  if (!questions.length || !validScoringModel(scoringModelValue) || !responsesValue || typeof responsesValue !== 'object' || Array.isArray(responsesValue)) return null
  const supplied = responsesValue as Record<string, unknown>
  const normalizedResponses: Record<string, boolean | number> = {}
  const dimensionEarnedScores: Record<string, number> = {}
  const dimensionMaxScores: Record<string, number> = {}

  for (const question of questions) {
    if (scoringModelValue.type === 'rubric_scale_v1') {
      const selected = supplied[question.id]
      if (typeof selected !== 'number' || !question.rubrics.some((rubric) => rubric.score === selected)) return null
      normalizedResponses[question.id] = selected
      dimensionEarnedScores[question.dimension] = (dimensionEarnedScores[question.dimension] || 0) + selected
      dimensionMaxScores[question.dimension] = (dimensionMaxScores[question.dimension] || 0) + question.max_score
      continue
    }
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
    const configuredWeight = scoringModelValue.type === 'rubric_scale_v1'
      ? scoringModelValue.section_weights[dimension]
      : scoringModelValue.dimension_weights[dimension]
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

export type EnterpriseDiagnosisItem = {
  assignmentId: string
  projectId: string
  projectName: string
  diagnosisTitle: string
  round: number
  roundTitle: string | null
  status: 'pending' | 'submitted'
  available: boolean
  closesAt: string | null
  recordId: string | null
  totalScore: number | null
}

type FirestoreEntity = FirebaseFirestore.DocumentData

export async function listEnterpriseDiagnoses(userId: string): Promise<EnterpriseDiagnosisItem[]> {
  if (!adminDb) return []
  const memberships = await adminDb.collection('company_memberships').where('user_id', '==', userId).get()
  const companyIds = [...new Set(memberships.docs.filter((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data().active !== false).map((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data().company_id).filter((value: unknown): value is string => typeof value === 'string'))]
  if (!companyIds.length) return []
  const assignmentSnapshots = await Promise.all(companyIds.map((companyId) => adminDb!.collection('diagnosis_assignments').where('company_id', '==', companyId).get()))
  const assignments = assignmentSnapshots.flatMap((snapshot) => snapshot.docs).filter((document: FirebaseFirestore.QueryDocumentSnapshot) => document.data().assessment_type === 'self')
  if (!assignments.length) return []
  const campaignIds = [...new Set(assignments.map((document) => String(document.data().campaign_id)))]
  const projectIds = [...new Set(assignments.map((document) => String(document.data().project_id)))]
  const recordIds = [...new Set(assignments.map((document) => document.data().diagnosis_record_id).filter((value: unknown): value is string => typeof value === 'string'))]
  const [campaigns, projects, records] = await Promise.all([
    adminDb.getAll(...campaignIds.map((id) => adminDb!.collection('diagnosis_campaigns').doc(id))),
    adminDb.getAll(...projectIds.map((id) => adminDb!.collection('projects').doc(id))),
    recordIds.length ? adminDb.getAll(...recordIds.map((id) => adminDb!.collection('diagnosis_records').doc(id))) : [],
  ])
  const campaignById = new Map<string, FirestoreEntity>(campaigns.filter((document: FirebaseFirestore.DocumentSnapshot) => document.exists).map((document: FirebaseFirestore.DocumentSnapshot): [string, FirestoreEntity] => [document.id, document.data()!]))
  const projectById = new Map<string, FirestoreEntity>(projects.filter((document: FirebaseFirestore.DocumentSnapshot) => document.exists).map((document: FirebaseFirestore.DocumentSnapshot): [string, FirestoreEntity] => [document.id, document.data()!]))
  const recordById = new Map<string, FirestoreEntity>(records.filter((document: FirebaseFirestore.DocumentSnapshot) => document.exists).map((document: FirebaseFirestore.DocumentSnapshot): [string, FirestoreEntity] => [document.id, document.data()!]))
  const now = Date.now()
  return assignments.flatMap((document): EnterpriseDiagnosisItem[] => {
    const assignment = document.data()
    const campaign = campaignById.get(String(assignment.campaign_id))
    const project = projectById.get(String(assignment.project_id))
    if (!campaign || !project) return []
    const recordId = typeof assignment.diagnosis_record_id === 'string' ? assignment.diagnosis_record_id : null
    const record = recordId ? recordById.get(recordId) : null
    const available = campaign.status === 'open' && !(campaign.opens_at?.toMillis?.() > now) && !(campaign.closes_at?.toMillis?.() < now)
    return [{
      assignmentId: document.id,
      projectId: String(assignment.project_id),
      projectName: String(project.name || assignment.project_id),
      diagnosisTitle: String(campaign.diagnosis_title || campaign.name || `${String(project.name || '')} 기업진단`),
      round: Number(campaign.round || 1),
      roundTitle: typeof campaign.round_title === 'string' ? campaign.round_title : null,
      status: assignment.status === 'submitted' ? 'submitted' : 'pending',
      available,
      closesAt: campaign.closes_at?.toDate?.().toISOString?.() || null,
      recordId,
      totalScore: typeof record?.total_score === 'number' ? record.total_score : null,
    }]
  }).sort((a, b) => Number(a.status === 'submitted') - Number(b.status === 'submitted') || b.round - a.round)
}

export async function getCampaignDiagnosisContext(userId: string, projectId: string, requestedRound: number, requestedAssignmentId?: string | null): Promise<CampaignDiagnosisContext | null> {
  if (!adminDb) return null
  const memberships = await adminDb.collection('company_memberships').where('user_id', '==', userId).get()
  const companyIds = new Set(memberships.docs.filter((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data().active !== false).map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data().company_id).filter(Boolean))
  if (!companyIds.size) return null

  const assignments = await adminDb.collection('diagnosis_assignments').where('project_id', '==', projectId).get()
  const candidates = assignments.docs.filter((doc: FirebaseFirestore.QueryDocumentSnapshot) => {
    const data = doc.data()
    return companyIds.has(data.company_id) && data.assessment_type === 'self' && data.status === 'pending' && (!requestedAssignmentId || doc.id === requestedAssignmentId)
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
      campaignName: typeof campaignData.diagnosis_title === 'string' ? campaignData.diagnosis_title : typeof campaignData.name === 'string' ? campaignData.name : '기업진단',
      roundTitle: typeof campaignData.round_title === 'string' ? campaignData.round_title : null,
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
      scoringType: version.data()?.scoring_model?.type === 'rubric_scale_v1' ? 'rubric_scale_v1' : 'weighted_boolean_v1',
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
    campaignName: typeof campaignData.diagnosis_title === 'string' ? campaignData.diagnosis_title : typeof campaignData.name === 'string' ? campaignData.name : '진단위원 진단',
    roundTitle: typeof campaignData.round_title === 'string' ? campaignData.round_title : null,
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
    scoringType: version.data()?.scoring_model?.type === 'rubric_scale_v1' ? 'rubric_scale_v1' : 'weighted_boolean_v1',
  }
}
