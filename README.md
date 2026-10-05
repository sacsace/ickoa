# ICKOA — 재인도 첸나이 한인회 웹 플랫폼

남인도 한인사회의 디지털 허브를 위한 **Next.js 풀스택** 커뮤니티 플랫폼입니다.

## 실행

```bash
npm install
npm run db:setup    # DB 생성 + 시드 데이터
npm run dev
```

- 사이트: http://localhost:3700
- Health Check: http://localhost:3700/api/health

### 테스트 계정

| 역할 | 로그인 | Password |
|------|--------|----------|
| Root Admin (관리자 페이지) | 아이디 `root` | admin123 |
| Member (일반 로그인) | member@ickoa.org | member1234 |

## 기술 스택

| 영역 | 기술 |
|------|------|
| Framework | Next.js 16 (App Router) |
| UI | React 19, TypeScript, Tailwind CSS, Framer Motion |
| Database | SQLite (개발) / PostgreSQL (운영, docker-compose 제공) |
| ORM | Prisma 6 |
| Auth | Auth.js — Email, Google, Kakao, Naver |
| Storage | AWS S3 (미설정 시 로컬 `/public/uploads`) |
| Maps | Google Maps API (`NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`) |
| Push | Firebase Admin SDK (환경변수 설정 시) |

## 프로젝트 구조

```
src/
├── app/                  # 페이지 + API Routes
│   ├── admin/            # CMS (뉴스, 행사, 회원, 신고, QR 체크인)
│   ├── api/              # REST API
│   ├── community/        # 게시판 CRUD
│   ├── business/         # 기업 디렉토리 + 지도
│   ├── events/           # 행사 + QR 참가
│   └── ...
├── actions/              # Server Actions
├── components/
├── lib/                  # prisma, auth, s3, firebase
└── prisma/               # 스키마 + 시드
```

## 구현 현황

### 완료
- [x] Prisma DB 스키마 (User, News, Business, Post, Event, Club, Guide 등)
- [x] Auth.js 인증 (Email + Google/Kakao/Naver OAuth)
- [x] API Routes + Server Actions CRUD
- [x] 커뮤니티 (게시판, 댓글, 좋아요, 신고)
- [x] 행사 등록/참가/QR 체크인
- [x] 관리자 CMS (Super/Content/Community/Event Admin)
- [x] Google Maps 연동 (API Key 설정 시)
- [x] AWS S3 파일 업로드 (미설정 시 로컬 저장)
- [x] Firebase 푸시 알림 (환경변수 설정 시)
- [x] 한/영 i18n, 다크모드, SEO

## 환경 변수

`.env.example` 참고. OAuth/Maps/S3/Firebase는 선택 사항입니다.

```bash
cp .env.example .env
```

## PostgreSQL (운영)

```bash
docker compose up -d
# schema.prisma provider를 postgresql로 변경 후
# DATABASE_URL="postgresql://ickoa:ickoa@localhost:5432/ickoa"
npm run db:setup
```

## 관리자 권한

| 역할 | 권한 |
|------|------|
| SUPER_ADMIN | 전체 시스템 |
| CONTENT_ADMIN | 뉴스, 배너, 가이드 |
| COMMUNITY_ADMIN | 게시글, 신고 |
| EVENT_ADMIN | 행사, QR 체크인 |

Admin: http://localhost:3700/admin (관리자 로그인 필요)
