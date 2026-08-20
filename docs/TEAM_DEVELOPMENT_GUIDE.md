# BizDive 공동개발 환경 안내

이 문서는 기업용 서비스 [bizdive.kr](https://bizdive.kr)과 기관·운영 서비스 [admin.bizdive.kr](https://admin.bizdive.kr)을 함께 개발하고 배포하기 위한 기준 문서입니다.

## 1. 서비스와 저장소

| 구분 | 기업용 BizDive | BizDive Admin |
|---|---|---|
| 운영 주소 | https://bizdive.kr | https://admin.bizdive.kr |
| GitHub | `lifeinnovator/BizDive` | `lifeinnovator/bizdive-admin` |
| 로컬 폴더 권장명 | `BizDive` | `bizdive-admin` |
| 개발 포트 | 3000 | 3001 |
| 주요 사용자 | 신청기업·참여기업·진단위원·멘토 | 서비스 운영자·기관 관리자·사업 실무자 |
| 주요 기능 | 회원가입, 기업정보, 진단, 보고서, 멘토링 참여 | 기관·사업·사용자·진단·멘토링·성과·문의 관리 |

두 서비스는 별도 Next.js 애플리케이션이지만 동일한 Firebase 프로젝트의 인증과 Firestore 데이터를 사용합니다. 데이터 모델이나 권한 규칙을 변경할 때는 두 저장소의 영향을 함께 검토해야 합니다.

## 2. 계정과 권한 요청

프로젝트 소유자에게 다음 권한을 요청합니다.

1. 두 GitHub 저장소의 Collaborator 권한
2. Vercel `lifeinnovators-projects` 팀과 두 프로젝트 접근 권한
3. Firebase 프로젝트 접근 권한
4. 운영 데이터 변경이 필요한 경우에만 별도의 승인

Firebase 권한은 업무에 필요한 최소 역할로 부여합니다. 서비스 계정 JSON, 개인키, 환경변수 값을 메신저나 저장소로 전달하지 않습니다.

## 3. 개발 도구

- Git
- Node.js 20 LTS
- npm
- Vercel CLI: `npm install -g vercel`
- 선택: Firebase CLI `npm install -g firebase-tools`

Windows PowerShell 예시:

```powershell
New-Item -ItemType Directory -Path C:\Dev\BizDive -Force
Set-Location C:\Dev\BizDive
git clone https://github.com/lifeinnovator/BizDive.git
git clone https://github.com/lifeinnovator/bizdive-admin.git
```

## 4. 의존성과 환경변수

각 저장소에서 잠금 파일을 기준으로 설치합니다.

```powershell
Set-Location C:\Dev\BizDive\BizDive
npm ci

Set-Location C:\Dev\BizDive\bizdive-admin
npm ci
```

Vercel에 로그인한 뒤 각 프로젝트를 연결하고 Development 환경변수를 받습니다.

```powershell
Set-Location C:\Dev\BizDive\BizDive
vercel link --scope lifeinnovators-projects --project bizdive
vercel env pull .env.local --environment=development

Set-Location C:\Dev\BizDive\bizdive-admin
vercel link --scope lifeinnovators-projects --project bizdive-admin
vercel env pull .env.local --environment=development
```

주요 환경변수 범주:

- 두 서비스 공통: `NEXT_PUBLIC_FIREBASE_*`, `FIREBASE_SERVICE_ACCOUNT_KEY`
- 기업용: `NEXT_PUBLIC_SITE_URL`, 메일 발송용 `SMTP_*`
- 관리자용: `NEXT_PUBLIC_BIZDIVE_URL`

`.env.local`, `.vercel`, 서비스 계정 파일은 Git에 커밋하지 않습니다. 개발 환경에 운영용 개인키를 직접 복사하지 말고 Vercel 팀 권한과 환경별 변수를 사용합니다.

## 5. 두 서비스 동시 실행

터미널 1:

```powershell
Set-Location C:\Dev\BizDive\BizDive
npm run dev -- --port 3000
```

터미널 2:

```powershell
Set-Location C:\Dev\BizDive\bizdive-admin
npm run dev -- --port 3001
```

확인 주소:

- 기업용: http://localhost:3000
- 관리자용: http://localhost:3001

관리자 앱의 `NEXT_PUBLIC_BIZDIVE_URL`은 로컬 통합 테스트에서 `http://localhost:3000`으로 지정할 수 있습니다. 운영·Preview 환경값은 임의로 변경하지 않습니다.

## 6. 인증과 역할

대표 역할은 다음과 같습니다.

| 역할 | 의미 |
|---|---|
| `USER` | 기업 사용자 |
| `SVC_OPR` | BizDive 서비스 운영자 |
| `GRP_ADM` | 기관·그룹 관리자 |
| `PRG_OPR` | 사업·프로젝트 운영 실무자 |
| `SUPER_ADM` | 플랫폼 최고 관리자 |

한 사용자가 기업 또는 기관·프로젝트에 소속되는 관계는 역할 문자열만으로 판단하지 않습니다. 조직·프로젝트 멤버십과 Firestore Security Rules를 함께 확인합니다.

## 7. 브랜치와 PR

`main`에 직접 작업하거나 push하지 않습니다.

```powershell
git switch main
git pull --ff-only origin main
git switch -c feature/짧은-작업명
```

권장 순서:

1. 이슈와 영향 범위 확인
2. 작은 커밋으로 구현
3. 로컬 타입·린트·빌드 확인
4. GitHub에 branch push
5. PR 생성
6. GitHub Quality Gate와 Vercel Preview 확인
7. 관련 역할의 실제 사용자 흐름 검증
8. 승인 후 `main` 병합

두 저장소를 함께 수정하면 PR 본문에 서로의 PR 링크와 병합 순서를 기록합니다.

## 8. 로컬 검증

기업용:

```powershell
npm run check
npm run build
```

관리자용:

```powershell
npm run typecheck
npm run lint
npm run build
```

기능별 추가 스크립트는 각 저장소의 `package.json`을 확인합니다. 관리자 저장소의 마이그레이션·백업·Rules 배포 스크립트는 운영 데이터에 영향을 줄 수 있으므로 소유자 승인 없이 실행하지 않습니다.

## 9. 통합 확인 항목

두 앱에 영향을 주는 변경은 아래 순서로 확인합니다.

1. 기업 사용자의 로그인과 로그아웃
2. 기업정보 입력과 수정
3. 프로젝트 진단 링크 접근 권한
4. 진단 저장과 보고서 조회
5. 관리자에서 동일 사용자·기업·진단 데이터 확인
6. 기관 및 프로젝트별 접근 격리
7. 운영자·기관 관리자·사업 운영자별 메뉴와 API 권한
8. 기관 도입 문의 접수와 운영자 처리
9. 모바일·PC 주요 화면
10. 브라우저 콘솔 오류와 API 4xx/5xx

실제 운영 데이터로 테스트 레코드를 만들지 않습니다. Preview 또는 승인된 테스트 계정과 테스트 프로젝트를 사용합니다.

## 10. 데이터와 보안

- Firestore Rules 변경은 두 앱의 읽기·쓰기 경로를 모두 검토합니다.
- 인덱스 변경은 `firestore.indexes.json`에 기록합니다.
- 마이그레이션 전 논리 백업과 복원 검증을 수행합니다.
- 서비스 계정, 세션 쿠키, 사용자 개인정보를 로그에 남기지 않습니다.
- 운영 사용자 역할을 임의 변경하지 않습니다.
- 프로젝트 종료 데이터 보존 정책과 기관별 데이터 격리를 유지합니다.

## 11. 배포

두 서비스 모두 GitHub `main` 병합을 통해 Vercel Production으로 배포됩니다.

- 기능 브랜치: Vercel Preview
- `main`: Production
- 배포 실패 시 추가 커밋으로 수정하며 운영 커밋을 강제로 되돌리지 않습니다.
- 도메인, Function Region, 환경변수 변경은 코드 PR과 별도로 변경 이유와 롤백 값을 기록합니다.

배포 후에는 운영 URL, 주요 API 상태, Vercel Runtime Logs를 확인합니다.

## 12. 장애와 성능 점검

1. Vercel 배포 상태와 Runtime Logs 확인
2. 브라우저 Network·Console 확인
3. 서버 응답시간과 Firebase 호출 구분
4. 공개 페이지가 불필요하게 동적 렌더링되는지 확인
5. Firebase SDK가 공개 랜딩 초기 번들에 포함되는지 확인
6. Lighthouse 모바일 성능 비교

Function Region은 사용자의 위치가 아니라 Firebase 데이터 위치와 가까운 곳을 선택합니다. 데이터 위치를 확인하지 않고 지역을 변경하지 않습니다.

## 13. 작업 시작 체크리스트

- [ ] 두 저장소 접근 가능
- [ ] Vercel Development 환경변수 수신
- [ ] 두 앱 로컬 실행 성공
- [ ] 테스트 계정과 역할 확인
- [ ] `main` 최신화
- [ ] 기능 브랜치 생성
- [ ] 영향받는 데이터 컬렉션과 역할 확인

문서와 실제 설정이 다르면 추측해서 진행하지 말고 프로젝트 소유자와 먼저 확인합니다.

