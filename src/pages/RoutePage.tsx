import { useState, useMemo } from 'react';
import type { Schedule, DayOfWeek, Child, CheckStatus } from '../types';
import { getTodayDayOfWeek } from '../store/useStore';

interface RoutePageProps {
  children: Child[];
  schedules: Schedule[];
  getScheduleStatus: (scheduleId: string) => CheckStatus;
  checkIn: (scheduleId: string) => void;
  checkOut: (scheduleId: string) => void;
  resetStatus: (scheduleId: string) => void;
}

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금'];

export function RoutePage({ 
  children, 
  schedules, 
  getScheduleStatus, 
  checkIn, 
  checkOut,
  resetStatus 
}: RoutePageProps) {
  const todayDayOfWeek = getTodayDayOfWeek();
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayOfWeek || '월');
  const [selectedChildId, setSelectedChildId] = useState<string>('all');

  // 선택된 요일/자녀의 일정 (시간순 정렬)
  const todaySchedules = useMemo(() => {
    return schedules
      .filter(s => s.day === selectedDay && (selectedChildId === 'all' || s.childId === selectedChildId))
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, selectedDay, selectedChildId]);

  // 상태 요약
  const statusSummary = useMemo(() => {
    const total = todaySchedules.length;
    const checkedIn = todaySchedules.filter(s => getScheduleStatus(s.id) === 'checkedin').length;
    const checkedOut = todaySchedules.filter(s => getScheduleStatus(s.id) === 'checkedout').length;
    const pending = total - checkedIn - checkedOut;
    return { total, checkedIn, checkedOut, pending };
  }, [todaySchedules, getScheduleStatus]);

  // 상태별 텍스트와 스타일
  const getStatusInfo = (status: CheckStatus) => {
    switch (status) {
      case 'pending':
        return { text: '예정', className: 'status-pending', bgClass: 'bg-gray-50', borderClass: 'border-gray-200' };
      case 'checkedin':
        return { text: '체크인', className: 'status-checkedin', bgClass: 'bg-blue-50', borderClass: 'border-blue-200' };
      case 'checkedout':
        return { text: '완료', className: 'status-checkedout', bgClass: 'bg-green-50', borderClass: 'border-green-200' };
    }
  };

  // 자녀 이름 가져오기
  const getChildName = (childId: string) => {
    return children.find(c => c.id === childId)?.name || '알 수 없음';
  };

  return (
    <div className="min-h-full bg-gray-50 pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">오늘 동선</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {todayDayOfWeek === selectedDay ? '오늘' : `${selectedDay}요일`} 일정을 확인하세요
          </p>
          
          {/* 요일 선택 */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1">
            {DAYS.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedDay === day
                    ? 'bg-primary text-white'
                    : day === todayDayOfWeek
                    ? 'bg-primary/10 text-primary'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {day}
                {day === todayDayOfWeek && selectedDay !== day && (
                  <span className="ml-1 text-[10px]">오늘</span>
                )}
              </button>
            ))}
          </div>

          {/* 자녀 필터 */}
          {children.length > 1 && (
            <div className="flex gap-2 mt-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setSelectedChildId('all')}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selectedChildId === 'all'
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {children.map(child => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    selectedChildId === child.id
                      ? 'bg-gray-800 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* 지도 placeholder */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center mb-3">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">지도 영역</p>
            <p className="text-gray-400 text-sm mt-1">다음 버전에서 지도 연동 예정</p>
          </div>
        </div>

        {/* 상태 요약 카드 */}
        {todaySchedules.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-500 mb-3">현재 상태 요약</h3>
            <div className="flex gap-4">
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-gray-400">{statusSummary.pending}</div>
                <div className="text-xs text-gray-400 mt-1">예정</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-blue-500">{statusSummary.checkedIn}</div>
                <div className="text-xs text-blue-500 mt-1">진행중</div>
              </div>
              <div className="flex-1 text-center">
                <div className="text-2xl font-bold text-green-500">{statusSummary.checkedOut}</div>
                <div className="text-xs text-green-500 mt-1">완료</div>
              </div>
            </div>
            
            {/* 프로그레스 바 */}
            <div className="mt-4 h-2 bg-gray-100 rounded-full overflow-hidden flex">
              {statusSummary.checkedOut > 0 && (
                <div 
                  className="bg-green-500 h-full transition-all" 
                  style={{ width: `${(statusSummary.checkedOut / statusSummary.total) * 100}%` }}
                />
              )}
              {statusSummary.checkedIn > 0 && (
                <div 
                  className="bg-blue-500 h-full transition-all" 
                  style={{ width: `${(statusSummary.checkedIn / statusSummary.total) * 100}%` }}
                />
              )}
            </div>
          </div>
        )}

        {/* 동선 리스트 */}
        {todaySchedules.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-500 px-1">
              {selectedDay}요일 일정 ({todaySchedules.length}개)
            </h3>
            {todaySchedules.map((schedule, index) => {
              const status = getScheduleStatus(schedule.id);
              const statusInfo = getStatusInfo(status);
              
              return (
                <div
                  key={schedule.id}
                  className={`bg-white rounded-2xl border ${statusInfo.borderClass} p-4 card-hover transition-all ${statusInfo.bgClass}`}
                >
                  <div className="flex items-start gap-3">
                    {/* 순서 번호 */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      status === 'checkedout' ? 'bg-green-500 text-white' :
                      status === 'checkedin' ? 'bg-blue-500 text-white' :
                      'bg-gray-200 text-gray-600'
                    }`}>
                      {status === 'checkedout' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </div>

                    {/* 일정 정보 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusInfo.className}`}>
                          {statusInfo.text}
                        </span>
                        {selectedChildId === 'all' && children.length > 1 && (
                          <span className="text-xs text-gray-400">
                            {getChildName(schedule.childId)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 truncate">{schedule.title}</h4>
                      <p className="text-sm text-gray-500 mt-0.5">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                      {schedule.placeName && (
                        <p className="text-sm text-gray-400 mt-1 truncate">
                          📍 {schedule.placeName}
                        </p>
                      )}
                      {schedule.note && (
                        <p className="text-sm text-gray-400 mt-1 truncate">
                          📝 {schedule.note}
                        </p>
                      )}
                    </div>

                    {/* 액션 버튼 */}
                    <div className="flex flex-col gap-2">
                      {status === 'pending' && (
                        <button
                          onClick={() => checkIn(schedule.id)}
                          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-xl hover:bg-primary-dark transition-colors"
                        >
                          체크인
                        </button>
                      )}
                      {status === 'checkedin' && (
                        <button
                          onClick={() => checkOut(schedule.id)}
                          className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-xl hover:bg-green-600 transition-colors"
                        >
                          체크아웃
                        </button>
                      )}
                      {status !== 'pending' && (
                        <button
                          onClick={() => resetStatus(schedule.id)}
                          className="px-3 py-1.5 text-gray-400 text-xs font-medium hover:text-gray-600 transition-colors"
                        >
                          초기화
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">
              {children.length === 0 
                ? '먼저 자녀를 등록해주세요' 
                : `${selectedDay}요일에 등록된 일정이 없습니다`}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {children.length === 0 
                ? '내정보 탭에서 자녀를 추가할 수 있어요'
                : '시간표 탭에서 일정을 추가해보세요'}
            </p>
          </div>
        )}

        {/* GPS 안내 */}
        <div className="bg-blue-50 rounded-2xl border border-blue-100 p-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-medium text-blue-800">Phase 1 안내</h4>
              <p className="text-sm text-blue-600 mt-1">
                현재 버전에서는 수동으로 체크인/체크아웃을 합니다.
                <br />
                다음 버전에서 GPS 자동 체크인 기능이 추가될 예정입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
