# Parent Route - 부모를 위한 자녀 동선 관리 앱

## 📱 프로젝트 개요

- **Name**: Parent Route (Phase 1)
- **Goal**: 바쁜 부모님이 자녀의 학원/일정을 한눈에 관리하고 동선을 체크할 수 있는 웹앱
- **Version**: 1.0.0 (Phase 1 MVP)
- **Status**: ✅ 완료 - 배포 가능

## 🌐 공개 URL

- **프리뷰**: https://3000-iyu2p92ll0usy7lymem2c-2b54fc91.sandbox.novita.ai

## ✅ 완료된 기능 (Phase 1)

### 1. 시간표 탭
- [x] 에브리타임 스타일 주간 시간표 (월~금)
- [x] 빈 칸 탭 또는 + 버튼으로 일정 추가
- [x] 일정 CRUD (추가/수정/삭제)
- [x] 자녀별 색상 구분
- [x] 자녀 필터링

### 2. 동선 탭
- [x] 지도 영역 placeholder (다음 버전 예정 표시)
- [x] 오늘 동선 카드 리스트 (시간순 정렬)
- [x] 상태 요약 (예정/진행중/완료)
- [x] 수동 체크인/체크아웃 버튼
- [x] 상태별 카드 스타일 변화
- [x] 요일/자녀 필터링

### 3. 내정보 탭
- [x] 게스트 사용자 카드
- [x] 알림 토글 (UI만)
- [x] 자녀 관리 (추가/수정/삭제)
- [x] 샘플 데이터 불러오기
- [x] 데이터 내보내기 (JSON)
- [x] 데이터 가져오기 (JSON)
- [x] 전체 초기화

### 4. 공통
- [x] 하단 탭 네비게이션 (3탭)
- [x] localStorage 기반 데이터 저장
- [x] 반응형 디자인 (모바일 우선)
- [x] 토스 스타일 UI

## 📋 일정 데이터 구조

```typescript
interface Schedule {
  id: string;
  childId: string;       // 자녀 ID
  day: '월' | '화' | '수' | '목' | '금';
  startTime: string;     // "09:00"
  endTime: string;       // "10:30"
  title: string;         // 일정명
  note?: string;         // 메모
  placeName?: string;    // 장소명
  address?: string;      // 주소
  createdAt: number;
}
```

## 🚫 Phase 1에서 제외된 기능

- GPS 자동 체크인 (Phase 3)
- 지도 API 연동 (Phase 2)
- 로그인/회원가입 (Phase 2+)
- 백엔드/DB 연동 (Phase 2+)
- 지오펜스 설정 (Phase 3)
- 푸시 알림 (Phase 2+)

## 🛠️ 기술 스택

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State**: React Hooks + localStorage
- **Icons**: Heroicons (inline SVG)

## 🚀 실행 방법

### 개발 모드
```bash
cd /home/user/webapp
npm install
npm run dev
```

### 프로덕션 빌드 및 프리뷰
```bash
npm run build
npm run preview -- --host 0.0.0.0 --port 3000
```

### PM2로 실행 (서버 환경)
```bash
npm run build
pm2 start ecosystem.config.cjs
```

## 📁 프로젝트 구조

```
webapp/
├── src/
│   ├── components/      # 공통 컴포넌트
│   │   ├── BottomNav.tsx
│   │   └── Modal.tsx
│   ├── pages/           # 페이지 컴포넌트
│   │   ├── SchedulePage.tsx   # 시간표 탭
│   │   ├── RoutePage.tsx      # 동선 탭
│   │   └── ProfilePage.tsx    # 내정보 탭
│   ├── store/           # 상태 관리
│   │   └── useStore.ts
│   ├── types/           # TypeScript 타입
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.js
├── postcss.config.js
└── ecosystem.config.cjs
```

## 📱 사용 가이드

### 시작하기
1. **내정보 탭**으로 이동
2. **자녀 추가** 버튼 클릭
3. 이름과 학년 입력 후 저장

### 일정 추가하기
1. **시간표 탭**으로 이동
2. 빈 칸을 탭하거나 우측 상단 **+ 버튼** 클릭
3. 자녀, 요일, 시간, 일정명 등 입력 후 저장

### 동선 확인하기
1. **동선 탭**으로 이동
2. 요일 선택 (기본: 오늘)
3. 일정 카드에서 **체크인** → **체크아웃** 버튼으로 상태 관리

### 데이터 백업하기
1. **내정보 탭** → 데이터 내보내기
2. JSON 파일이 다운로드됨
3. 복원: 데이터 가져오기 → JSON 파일 선택

## 📅 업데이트 이력

- **v1.0.0** (2025-01-28): Phase 1 MVP 완료

## 📞 문의

Phase 1 범위 내에서 버그나 개선사항이 있으면 알려주세요.
