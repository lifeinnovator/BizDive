import { adminDb } from '@/lib/firebase-server'

export const PRODUCT_PACKAGES = ['diagnosis', 'diagnosis_plus', 'program_operations'] as const
export type ProductPackage = (typeof PRODUCT_PACKAGES)[number]
export const BILLING_STATUSES = ['trial', 'active', 'past_due', 'suspended', 'cancelled'] as const
export type BillingStatus = (typeof BILLING_STATUSES)[number]
export const PRODUCT_FEATURES = ['diagnosis', 'expert_diagnosis', 'mentoring', 'integrated_company_report', 'program_operations', 'project_reporting'] as const
export type ProductFeature = (typeof PRODUCT_FEATURES)[number]

const entitlements: Record<ProductPackage, readonly ProductFeature[]> = {
  diagnosis: ['diagnosis'],
  diagnosis_plus: ['diagnosis', 'expert_diagnosis', 'mentoring', 'integrated_company_report'],
  program_operations: ['diagnosis', 'expert_diagnosis', 'mentoring', 'integrated_company_report', 'program_operations', 'project_reporting'],
}

export class ProductAccessError extends Error {
  constructor(message: string, public readonly status = 403) {
    super(message)
    this.name = 'ProductAccessError'
  }
}

function isProductPackage(value: unknown): value is ProductPackage {
  return typeof value === 'string' && PRODUCT_PACKAGES.includes(value as ProductPackage)
}

function isBillingStatus(value: unknown): value is BillingStatus {
  return typeof value === 'string' && BILLING_STATUSES.includes(value as BillingStatus)
}

export async function assertProjectFeature(projectId: string, feature: ProductFeature, options: { write?: boolean } = {}) {
  if (!adminDb) throw new ProductAccessError('서비스 권한 정보를 확인할 수 없습니다.', 503)
  const snapshot = await adminDb.collection('project_product_configs').doc(projectId).get()
  const data = snapshot.data()
  // Preserve service for projects created before the Phase 6 product migration.
  const rawPackageCode: unknown = data?.package_code
  const rawBillingStatus: unknown = data?.billing_status
  const packageCode: ProductPackage = isProductPackage(rawPackageCode) ? rawPackageCode : 'program_operations'
  const billingStatus: BillingStatus = isBillingStatus(rawBillingStatus) ? rawBillingStatus : 'active'
  if (!entitlements[packageCode].includes(feature)) throw new ProductAccessError('현재 프로젝트 패키지에서 제공하지 않는 기능입니다.')
  if (options.write && ['suspended', 'cancelled'].includes(billingStatus)) throw new ProductAccessError('계약 상태로 인해 새로운 작업을 등록할 수 없습니다.')
  return { packageCode, billingStatus, legacyDefault: !snapshot.exists }
}
