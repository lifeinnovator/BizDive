import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, Timestamp, getFirestore } from 'firebase-admin/firestore'

const baseUrl = process.env.BIZDIVE_TEST_URL
const credentialPath = process.env.GOOGLE_APPLICATION_CREDENTIALS
const projectId = process.env.FIREBASE_PROJECT_ID || 'bizdive'
if (!process.argv.includes('--confirm-temporary-data') || !baseUrl || !credentialPath) {
  console.error('BIZDIVE_TEST_URL, GOOGLE_APPLICATION_CREDENTIALS, --confirm-temporary-data are required.')
  process.exit(1)
}

const serviceAccount = JSON.parse(readFileSync(credentialPath, 'utf8'))
if (!getApps().length) initializeApp({ credential: cert(serviceAccount), projectId })
const auth = getAuth()
const db = getFirestore()
const runId = randomUUID()
const uid = `campaign_diagnosis_${runId}`
const expertUid = `campaign_expert_${runId}`
const companyId = `test_company_${runId}`
const applicationId = `test_application_${runId}`
const templateId = `test_template_${runId}`
const versionId = `${templateId}_v1`
const campaignId = `test_campaign_${runId}`
const assignmentId = `${campaignId}_${applicationId}`
const expertCampaignId = `test_expert_campaign_${runId}`
const expertAssignmentId = `${expertCampaignId}_${applicationId}`
let recordId = null
let expertRecordId = null
let engagementId = null
let serviceProjectId = null
let mentoringSessionId = null

async function accessToken() {
  const token = await getApps()[0].options.credential.getAccessToken()
  return token.access_token
}

async function idTokenFor(userId) {
  const headers = { Authorization: `Bearer ${await accessToken()}` }
  const appsResponse = await fetch(`https://firebase.googleapis.com/v1beta1/projects/${projectId}/webApps`, { headers })
  const apps = await appsResponse.json()
  for (const app of apps.apps || []) {
    const configResponse = await fetch(`https://firebase.googleapis.com/v1beta1/${app.name}/config`, { headers })
    const config = await configResponse.json()
    if (!configResponse.ok || config.projectId !== projectId || !config.apiKey) continue
    const customToken = await auth.createCustomToken(userId)
    const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${config.apiKey}`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: customToken, returnSecureToken: true }),
    })
    const result = await response.json()
    if (response.ok) return result.idToken
  }
  throw new Error('Could not exchange the custom token.')
}

async function request(path, options = {}, expected = 200) {
  const response = await fetch(`${baseUrl.replace(/\/$/, '')}${path}`, options)
  const text = await response.text()
  let result = {}
  try { result = JSON.parse(text) } catch { result = { text } }
  if (response.status !== expected) throw new Error(`${options.method || 'GET'} ${path}: expected ${expected}, received ${response.status}`)
  return { response, result }
}

async function deleteAuditLogs() {
  const snapshot = await db.collection('audit_logs').where('target_id', 'in', [assignmentId, expertAssignmentId, ...(engagementId ? [engagementId] : []), ...(mentoringSessionId ? [mentoringSessionId] : [])]).get()
  await Promise.all(snapshot.docs.map((document) => document.ref.delete()))
}

try {
  const projects = await db.collection('projects').where('group_id', '!=', null).limit(1).get()
  if (projects.empty) throw new Error('An institution project is required for this test.')
  const project = projects.docs[0]
  serviceProjectId = project.id
  const groupId = project.data().group_id
  const now = FieldValue.serverTimestamp()

  await Promise.all([
    auth.createUser({ uid, email: `${uid}@example.invalid`, displayName: 'Campaign Diagnosis Test' }),
    auth.createUser({ uid: expertUid, email: `${expertUid}@example.invalid`, displayName: 'Campaign Expert Test' }),
  ])
  await Promise.all([
    db.collection('profiles').doc(uid).set({ id: uid, email: `${uid}@example.invalid`, user_name: 'Campaign Diagnosis Test', company_name: 'Temporary Test Company', stage: 'P', industry: 'I', role: 'user', group_id: groupId, project_id: project.id, created_at: now, updated_at: now }),
    db.collection('profiles').doc(expertUid).set({ id: expertUid, email: `${expertUid}@example.invalid`, user_name: 'Campaign Expert Test', role: 'user', group_id: groupId, project_id: null, created_at: now, updated_at: now }),
    db.collection('mentor_profiles').doc(expertUid).set({ id: expertUid, user_id: expertUid, display_name: 'Campaign Expert Test', headline: 'Temporary market mentor', specialty_codes: ['market_customer'], scope: 'global', group_id: null, active: true, created_at: now, updated_at: now }),
    db.collection('companies').doc(companyId).set({ id: companyId, name: 'Temporary Campaign Diagnosis Company', group_id: groupId, created_at: now, updated_at: now }),
    db.collection('company_memberships').doc(`${companyId}_${uid}`).set({ id: `${companyId}_${uid}`, company_id: companyId, user_id: uid, role: 'member', active: true, created_at: now, updated_at: now }),
    db.collection('project_applications').doc(applicationId).set({ id: applicationId, project_id: project.id, group_id: groupId, company_id: companyId, status: 'approved', created_at: now, updated_at: now }),
    db.collection('project_participations').doc(applicationId).set({ id: applicationId, project_id: project.id, group_id: groupId, company_id: companyId, application_id: applicationId, status: 'active', created_at: now, updated_at: now }),
    db.collection('diagnosis_templates').doc(templateId).set({ id: templateId, name: `Integration Template ${runId}`, scope: 'global', group_id: null, status: 'active', created_at: now, updated_at: now }),
    db.collection('diagnosis_template_versions').doc(versionId).set({
      id: versionId, template_id: templateId, scope: 'global', group_id: null, version: 1, status: 'published',
      scoring_model: { type: 'weighted_boolean_v1', normalization: 'percentage', true_value: 1, false_value: 0, dimension_weights: { D1: 3, D2: 1 } },
      question_count: 2,
      question_snapshots: [
        { question_id: `test_q1_${runId}`, content: `Temporary market question ${runId}`, dimension: 'D1', category: 'common', mapping_code: null, rationale: null, score_weight: 2, display_order: 1 },
        { question_id: `test_q2_${runId}`, content: `Temporary execution question ${runId}`, dimension: 'D2', category: 'common', mapping_code: null, rationale: null, score_weight: 1, display_order: 2 },
      ],
      created_at: now, updated_at: now,
    }),
    db.collection('diagnosis_campaigns').doc(campaignId).set({ id: campaignId, name: `Temporary Campaign ${runId}`, project_id: project.id, group_id: groupId, template_id: templateId, template_version_id: versionId, audience: 'participation', assessment_type: 'self', round: 97, status: 'open', opens_at: null, closes_at: null, created_at: now, updated_at: now }),
    db.collection('diagnosis_assignments').doc(assignmentId).set({ id: assignmentId, project_id: project.id, group_id: groupId, campaign_id: campaignId, template_id: templateId, template_version_id: versionId, assessment_type: 'self', audience: 'participation', company_id: companyId, application_id: applicationId, participation_id: applicationId, status: 'pending', assigned_at: now, submitted_at: null, updated_at: now }),
    db.collection('diagnosis_campaigns').doc(expertCampaignId).set({ id: expertCampaignId, name: `Temporary Expert Campaign ${runId}`, project_id: project.id, group_id: groupId, template_id: templateId, template_version_id: versionId, audience: 'participation', assessment_type: 'expert', round: 97, status: 'open', opens_at: null, closes_at: null, created_at: now, updated_at: now }),
    db.collection('diagnosis_assignments').doc(expertAssignmentId).set({ id: expertAssignmentId, project_id: project.id, group_id: groupId, campaign_id: expertCampaignId, template_id: templateId, template_version_id: versionId, assessment_type: 'expert', audience: 'participation', company_id: companyId, application_id: applicationId, participation_id: applicationId, evaluator_user_id: expertUid, status: 'pending', assigned_at: now, submitted_at: null, updated_at: now }),
  ])

  const idToken = await idTokenFor(uid)
  const login = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken }) })
  const cookie = login.response.headers.get('set-cookie')?.split(';')[0]
  if (!cookie) throw new Error('The session cookie was not issued.')
  const page = await request(`/diagnosis?projectId=${project.id}&round=97`, { headers: { Cookie: cookie } })
  if (!page.result.text?.includes(`Temporary Campaign ${runId}`) || !page.result.text.includes(`Temporary market question ${runId}`)) throw new Error('The campaign snapshot was not rendered.')

  const submission = await request('/api/diagnosis/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie },
    body: JSON.stringify({ assignmentId, responses: { [`test_q1_${runId}`]: true, [`test_q2_${runId}`]: false, ignored_key: true } }),
  })
  recordId = submission.result.recordId
  if (!recordId || submission.result.totalScore !== 75 || submission.result.normalizedResponses.ignored_key !== undefined) throw new Error('Server-side scoring or response normalization failed.')
  const [assignment, record] = await Promise.all([db.collection('diagnosis_assignments').doc(assignmentId).get(), db.collection('diagnosis_records').doc(recordId).get()])
  if (assignment.data()?.status !== 'submitted' || assignment.data()?.diagnosis_record_id !== recordId || record.data()?.template_version_id !== versionId) throw new Error('Atomic result persistence failed.')
  await request('/api/diagnosis/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ assignmentId, responses: {} }),
  }, 409)

  await request('/api/diagnosis/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ assignmentId: expertAssignmentId, responses: {} }),
  }, 403)
  const expertToken = await idTokenFor(expertUid)
  const expertLogin = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: expertToken }) })
  const expertCookie = expertLogin.response.headers.get('set-cookie')?.split(';')[0]
  if (!expertCookie) throw new Error('The expert session cookie was not issued.')
  const expertPage = await request(`/diagnosis/expert?assignmentId=${encodeURIComponent(expertAssignmentId)}`, { headers: { Cookie: expertCookie } })
  if (!expertPage.result.text?.includes(`Temporary Expert Campaign ${runId}`) || !expertPage.result.text.includes('진단위원 진단')) throw new Error('The expert assignment was not rendered.')
  const expertSubmission = await request('/api/diagnosis/submit', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: expertCookie }, body: JSON.stringify({ assignmentId: expertAssignmentId, responses: { [`test_q1_${runId}`]: false, [`test_q2_${runId}`]: true } }),
  })
  expertRecordId = expertSubmission.result.recordId
  const expertRecord = await db.collection('diagnosis_records').doc(expertRecordId).get()
  if (expertSubmission.result.totalScore !== 25 || expertRecord.data()?.assessment_type !== 'expert' || expertRecord.data()?.respondent_user_id !== expertUid) throw new Error('Expert diagnosis persistence failed.')

  await request(`/api/mentoring/recommendations?projectId=${encodeURIComponent(project.id)}`, { headers: { Cookie: expertCookie } }, 403)
  const recommendations = await request(`/api/mentoring/recommendations?projectId=${encodeURIComponent(project.id)}`, { headers: { Cookie: cookie } })
  if (recommendations.result.needs[0]?.code !== 'market_customer' || recommendations.result.mentors[0]?.id !== expertUid) throw new Error('Diagnosis-linked mentor recommendation failed.')
  const mentoringRequest = await request('/api/mentoring/recommendations', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ projectId: project.id, mentorId: expertUid, requestedCodes: ['market_customer'] }),
  }, 201)
  engagementId = mentoringRequest.result.engagement.id
  await request('/api/mentoring/recommendations', {
    method: 'POST', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ projectId: project.id, mentorId: expertUid, requestedCodes: ['market_customer'] }),
  }, 409)
  const engagement = await db.collection('mentoring_engagements').doc(engagementId).get()
  if (engagement.data()?.company_id !== companyId || engagement.data()?.mentor_user_id !== expertUid || engagement.data()?.status !== 'requested') throw new Error('Mentoring engagement persistence failed.')
  mentoringSessionId = `test_mentoring_session_${runId}`
  await Promise.all([
    db.collection('mentoring_engagements').doc(engagementId).update({ status: 'accepted', updated_at: FieldValue.serverTimestamp() }),
    db.collection('mentoring_sessions').doc(mentoringSessionId).set({ id: mentoringSessionId, engagement_id: engagementId, project_id: project.id, group_id: groupId, company_id: companyId, mentor_user_id: expertUid, starts_at: Timestamp.fromDate(new Date('2030-01-10T09:00:00.000Z')), ends_at: Timestamp.fromDate(new Date('2030-01-10T10:00:00.000Z')), mode: 'online', status: 'scheduled', created_at: FieldValue.serverTimestamp(), updated_at: FieldValue.serverTimestamp() }),
  ])
  await request(`/api/mentoring/sessions/${mentoringSessionId}/log`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: cookie }, body: JSON.stringify({ menteeContent: 'Participant note', institutionContent: 'Institution note', menteeVisible: false }) }, 403)
  const mentorWorkspace = await request('/api/mentoring/workspace', { headers: { Cookie: expertCookie } })
  if (!mentorWorkspace.result.sessions.some((session) => session.id === mentoringSessionId && session.viewer_role === 'mentor')) throw new Error('Mentor workspace authorization failed.')
  await request(`/api/mentoring/sessions/${mentoringSessionId}/log`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: expertCookie }, body: JSON.stringify({ menteeContent: 'Participant note', institutionContent: 'Institution note', menteeVisible: false }) })
  const hiddenWorkspace = await request('/api/mentoring/workspace', { headers: { Cookie: cookie } })
  const hiddenLog = hiddenWorkspace.result.sessions.find((session) => session.id === mentoringSessionId)?.log
  if (hiddenLog?.mentee_visible !== false || hiddenLog?.institution_content !== undefined || hiddenLog?.mentee_content !== undefined) throw new Error('Hidden mentee log redaction failed.')
  await request(`/api/mentoring/sessions/${mentoringSessionId}/log`, { method: 'PUT', headers: { 'Content-Type': 'application/json', Cookie: expertCookie }, body: JSON.stringify({ menteeContent: 'Participant note', institutionContent: 'Institution note', menteeVisible: true }) })
  const visibleWorkspace = await request('/api/mentoring/workspace', { headers: { Cookie: cookie } })
  const visibleLog = visibleWorkspace.result.sessions.find((session) => session.id === mentoringSessionId)?.log
  if (visibleLog?.mentee_content !== 'Participant note' || visibleLog?.institution_content !== undefined) throw new Error('Role-separated mentoring log response failed.')

  console.log(JSON.stringify({ passed: true, checks: ['campaign snapshot rendering', 'authenticated company membership', 'stable response IDs', 'server-side weighted scoring', 'atomic assignment submission', 'unknown response removal', 'duplicate submission rejection', 'unassigned expert rejection', 'expert assignment rendering', 'expert diagnosis submission', 'non-participant recommendation rejection', 'diagnosis-linked mentor recommendation', 'mentoring request persistence', 'duplicate mentoring request rejection', 'non-mentor log rejection', 'mentor workspace authorization', 'hidden mentee log redaction', 'role-separated mentoring log response'] }, null, 2))
} finally {
  await Promise.allSettled([
    auth.deleteUser(uid),
    auth.deleteUser(expertUid),
    db.collection('profiles').doc(uid).delete(),
    db.collection('profiles').doc(expertUid).delete(),
    db.collection('mentor_profiles').doc(expertUid).delete(),
    db.collection('companies').doc(companyId).delete(),
    db.collection('company_memberships').doc(`${companyId}_${uid}`).delete(),
    db.collection('project_applications').doc(applicationId).delete(),
    db.collection('project_participations').doc(applicationId).delete(),
    db.collection('diagnosis_assignments').doc(assignmentId).delete(),
    db.collection('diagnosis_assignments').doc(expertAssignmentId).delete(),
    db.collection('diagnosis_campaigns').doc(campaignId).delete(),
    db.collection('diagnosis_campaigns').doc(expertCampaignId).delete(),
    db.collection('diagnosis_template_versions').doc(versionId).delete(),
    db.collection('diagnosis_templates').doc(templateId).delete(),
    recordId ? db.collection('diagnosis_records').doc(recordId).delete() : Promise.resolve(),
    expertRecordId ? db.collection('diagnosis_records').doc(expertRecordId).delete() : Promise.resolve(),
    engagementId ? db.collection('mentoring_engagements').doc(engagementId).delete() : Promise.resolve(),
    mentoringSessionId ? db.collection('mentoring_sessions').doc(mentoringSessionId).delete() : Promise.resolve(),
    mentoringSessionId ? db.collection('mentoring_logs').doc(mentoringSessionId).delete() : Promise.resolve(),
    serviceProjectId ? db.collection('mentoring_engagement_locks').doc(`${serviceProjectId}_${companyId}_${expertUid}`).delete() : Promise.resolve(),
    deleteAuditLogs(),
  ])
}
