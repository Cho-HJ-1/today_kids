// 자녀 정보 타입
export interface Child {
  id: string;
  name: string;
  grade: string; // 예: "초1", "중2" 등
  createdAt: number;
}

// 요일 타입
export type DayOfWeek = '월' | '화' | '수' | '목' | '금';

// 체크인 상태 타입
export type CheckStatus = 'pending' | 'checkedin' | 'checkedout';

// 일정 타입
export interface Schedule {
  id: string;
  childId: string;
  day: DayOfWeek;
  startTime: string; // "09:00" 형식
  endTime: string;   // "10:30" 형식
  title: string;
  note?: string;
  placeName?: string;
  address?: string;
  createdAt: number;
}

// 오늘 체크인 상태 (동선 탭에서 사용)
export interface TodayCheckStatus {
  scheduleId: string;
  date: string; // "2025-01-28" 형식
  status: CheckStatus;
  checkedInAt?: number;
  checkedOutAt?: number;
}

// 전체 앱 데이터
export interface AppData {
  children: Child[];
  schedules: Schedule[];
  todayStatuses: TodayCheckStatus[];
  settings: {
    notificationsEnabled: boolean;
  };
}

// 탭 타입
export type TabType = 'schedule' | 'route' | 'profile';
