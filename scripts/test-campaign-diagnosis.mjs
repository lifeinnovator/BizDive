import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { cert, getApps, initializeApp } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { FieldValue, getFirestore } from 'firebase-admin/firestore'

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
const companyId = `test_company_${runId}`
const applicationId = `test_application_${runId}`
const templateId = `test_template_${runId}`
const versionId = `${templateId}_v1`
const campaignId = `test_campaign_${runId}`
const assignmentId = `${campaignId}_${applicationId}`
let recordId = null

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
  const snapshot = await db.collection('audit_logs').where('target_id', '==', assignmentId).get()
  await Promise.all(snapshot.docs.map((document) => document.ref.delete()))
}

try {
  const projects = await db.collection('projects').where('group_id', '!=', null).limit(1).get()
  if (projects.empty) throw new Error('An institution project is required for this test.')
  const project = projects.docs[0]
  const groupId = project.data().group_id
  const now = FieldValue.serverTimestamp()

  await auth.createUser({ uid, email: `${uid}@example.invalid`, displayName: 'Campaign Diagnosis Test' })
  await Promise.all([
    db.collection('profiles').doc(uid).set({ id: uid, email: `${uid}@example.invalid`, user_name: 'Campaign Diagnosis Test', company_name: 'Temporary Test Company', stage: 'P', industry: 'I', role: 'user', group_id: groupId, project_id: project.id, created_at: now, updated_at: now }),
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

  console.log(JSON.stringify({ passed: true, checks: ['campaign snapshot rendering', 'authenticated company membership', 'stable response IDs', 'server-side weighted scoring', 'atomic assignment submission', 'unknown response removal', 'duplicate submission rejection'] }, null, 2))
} finally {
  await Promise.allSettled([
    auth.deleteUser(uid),
    db.collection('profiles').doc(uid).delete(),
    db.collection('companies').doc(companyId).delete(),
    db.collection('company_memberships').doc(`${companyId}_${uid}`).delete(),
    db.collection('project_applications').doc(applicationId).delete(),
    db.collection('project_participations').doc(applicationId).delete(),
    db.collection('diagnosis_assignments').doc(assignmentId).delete(),
    db.collection('diagnosis_campaigns').doc(campaignId).delete(),
    db.collection('diagnosis_template_versions').doc(versionId).delete(),
    db.collection('diagnosis_templates').doc(templateId).delete(),
    recordId ? db.collection('diagnosis_records').doc(recordId).delete() : Promise.resolve(),
    deleteAuditLogs(),
  ])
}
