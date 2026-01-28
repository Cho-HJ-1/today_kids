import { useState, useEffect, useCallback } from 'react';
import type { AppData, Child, Schedule, CheckStatus, DayOfWeek } from '../types';

const STORAGE_KEY = 'parent-route-data';

const defaultData: AppData = {
  children: [],
  schedules: [],
  todayStatuses: [],
  settings: {
    notificationsEnabled: true,
  },
};

// localStorage에서 데이터 로드
const loadFromStorage = (): AppData => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load data from storage:', e);
  }
  return defaultData;
};

// localStorage에 데이터 저장
const saveToStorage = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data to storage:', e);
  }
};

// 고유 ID 생성
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// 오늘 날짜 문자열 반환
const getTodayString = (): string => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// 오늘 요일 반환
export const getTodayDayOfWeek = (): DayOfWeek | null => {
  const today = new Date();
  const dayIndex = today.getDay();
  const days: (DayOfWeek | null)[] = [null, '월', '화', '수', '목', '금', null];
  return days[dayIndex];
};

export function useStore() {
  const [data, setData] = useState<AppData>(loadFromStorage);

  // 데이터 변경 시 localStorage에 저장
  useEffect(() => {
    saveToStorage(data);
  }, [data]);

  // 자녀 관련 함수
  const addChild = useCallback((name: string, grade: string) => {
    const newChild: Child = {
      id: generateId(),
      name,
      grade,
      createdAt: Date.now(),
    };
    setData(prev => ({
      ...prev,
      children: [...prev.children, newChild],
    }));
    return newChild;
  }, []);

  const updateChild = useCallback((id: string, updates: Partial<Pick<Child, 'name' | 'grade'>>) => {
    setData(prev => ({
      ...prev,
      children: prev.children.map(child =>
        child.id === id ? { ...child, ...updates } : child
      ),
    }));
  }, []);

  const deleteChild = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      children: prev.children.filter(child => child.id !== id),
      schedules: prev.schedules.filter(schedule => schedule.childId !== id),
      todayStatuses: prev.todayStatuses.filter(status => {
        const schedule = prev.schedules.find(s => s.id === status.scheduleId);
        return schedule?.childId !== id;
      }),
    }));
  }, []);

  // 일정 관련 함수
  const addSchedule = useCallback((scheduleData: Omit<Schedule, 'id' | 'createdAt'>) => {
    const newSchedule: Schedule = {
      ...scheduleData,
      id: generateId(),
      createdAt: Date.now(),
    };
    setData(prev => ({
      ...prev,
      schedules: [...prev.schedules, newSchedule],
    }));
    return newSchedule;
  }, []);

  const updateSchedule = useCallback((id: string, updates: Partial<Omit<Schedule, 'id' | 'createdAt'>>) => {
    setData(prev => ({
      ...prev,
      schedules: prev.schedules.map(schedule =>
        schedule.id === id ? { ...schedule, ...updates } : schedule
      ),
    }));
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      schedules: prev.schedules.filter(schedule => schedule.id !== id),
      todayStatuses: prev.todayStatuses.filter(status => status.scheduleId !== id),
    }));
  }, []);

  // 체크인/체크아웃 관련 함수
  const getScheduleStatus = useCallback((scheduleId: string): CheckStatus => {
    const today = getTodayString();
    const status = data.todayStatuses.find(
      s => s.scheduleId === scheduleId && s.date === today
    );
    return status?.status || 'pending';
  }, [data.todayStatuses]);

  const checkIn = useCallback((scheduleId: string) => {
    const today = getTodayString();
    setData(prev => {
      const existingIndex = prev.todayStatuses.findIndex(
        s => s.scheduleId === scheduleId && s.date === today
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev.todayStatuses];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: 'checkedin',
          checkedInAt: Date.now(),
        };
        return { ...prev, todayStatuses: updated };
      } else {
        return {
          ...prev,
          todayStatuses: [...prev.todayStatuses, {
            scheduleId,
            date: today,
            status: 'checkedin',
            checkedInAt: Date.now(),
          }],
        };
      }
    });
  }, []);

  const checkOut = useCallback((scheduleId: string) => {
    const today = getTodayString();
    setData(prev => {
      const existingIndex = prev.todayStatuses.findIndex(
        s => s.scheduleId === scheduleId && s.date === today
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev.todayStatuses];
        updated[existingIndex] = {
          ...updated[existingIndex],
          status: 'checkedout',
          checkedOutAt: Date.now(),
        };
        return { ...prev, todayStatuses: updated };
      } else {
        return {
          ...prev,
          todayStatuses: [...prev.todayStatuses, {
            scheduleId,
            date: today,
            status: 'checkedout',
            checkedOutAt: Date.now(),
          }],
        };
      }
    });
  }, []);

  const resetStatus = useCallback((scheduleId: string) => {
    const today = getTodayString();
    setData(prev => ({
      ...prev,
      todayStatuses: prev.todayStatuses.filter(
        s => !(s.scheduleId === scheduleId && s.date === today)
      ),
    }));
  }, []);

  // 설정 관련 함수
  const toggleNotifications = useCallback(() => {
    setData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        notificationsEnabled: !prev.settings.notificationsEnabled,
      },
    }));
  }, []);

  // 데이터 관리 함수
  const loadSampleData = useCallback(() => {
    const sampleChild: Child = {
      id: generateId(),
      name: '김민준',
      grade: '초등학교 3학년',
      createdAt: Date.now(),
    };

    const sampleSchedules: Schedule[] = [
      {
        id: generateId(),
        childId: sampleChild.id,
        day: '월',
        startTime: '09:00',
        endTime: '10:30',
        title: '수학 학원',
        placeName: '빛나리 수학학원',
        address: '서울시 강남구 역삼동 123-45',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        childId: sampleChild.id,
        day: '월',
        startTime: '14:00',
        endTime: '15:30',
        title: '피아노 레슨',
        placeName: '도레미 음악학원',
        address: '서울시 강남구 역삼동 456-78',
        note: '새 교재 가져가기',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        childId: sampleChild.id,
        day: '화',
        startTime: '16:00',
        endTime: '17:30',
        title: '태권도',
        placeName: '무한태권도장',
        address: '서울시 강남구 삼성동 111-22',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        childId: sampleChild.id,
        day: '수',
        startTime: '09:00',
        endTime: '10:30',
        title: '수학 학원',
        placeName: '빛나리 수학학원',
        address: '서울시 강남구 역삼동 123-45',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        childId: sampleChild.id,
        day: '수',
        startTime: '15:00',
        endTime: '16:30',
        title: '영어 학원',
        placeName: 'ABC 영어학원',
        address: '서울시 강남구 대치동 789-12',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        childId: sampleChild.id,
        day: '목',
        startTime: '16:00',
        endTime: '17:30',
        title: '태권도',
        placeName: '무한태권도장',
        address: '서울시 강남구 삼성동 111-22',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        childId: sampleChild.id,
        day: '금',
        startTime: '09:00',
        endTime: '10:30',
        title: '수학 학원',
        placeName: '빛나리 수학학원',
        address: '서울시 강남구 역삼동 123-45',
        createdAt: Date.now(),
      },
      {
        id: generateId(),
        childId: sampleChild.id,
        day: '금',
        startTime: '14:00',
        endTime: '15:30',
        title: '피아노 레슨',
        placeName: '도레미 음악학원',
        address: '서울시 강남구 역삼동 456-78',
        createdAt: Date.now(),
      },
    ];

    setData({
      children: [sampleChild],
      schedules: sampleSchedules,
      todayStatuses: [],
      settings: { notificationsEnabled: true },
    });
  }, []);

  const exportData = useCallback(() => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `parent-route-backup-${getTodayString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString) as AppData;
      // 기본적인 유효성 검사
      if (imported.children && imported.schedules && imported.settings) {
        setData(imported);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, []);

  const resetAllData = useCallback(() => {
    setData(defaultData);
  }, []);

  // 특정 요일/자녀의 일정 가져오기 (시간순 정렬)
  const getSchedulesForDayAndChild = useCallback((day: DayOfWeek, childId?: string) => {
    return data.schedules
      .filter(s => s.day === day && (!childId || s.childId === childId))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [data.schedules]);

  // 특정 자녀의 모든 일정 가져오기
  const getSchedulesForChild = useCallback((childId: string) => {
    return data.schedules.filter(s => s.childId === childId);
  }, [data.schedules]);

  return {
    data,
    // 자녀
    addChild,
    updateChild,
    deleteChild,
    // 일정
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedulesForDayAndChild,
    getSchedulesForChild,
    // 체크인/체크아웃
    getScheduleStatus,
    checkIn,
    checkOut,
    resetStatus,
    // 설정
    toggleNotifications,
    // 데이터 관리
    loadSampleData,
    exportData,
    importData,
    resetAllData,
  };
}
