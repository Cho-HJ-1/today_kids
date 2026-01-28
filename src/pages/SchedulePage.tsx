import { useState, useMemo } from 'react';
import type { Schedule, DayOfWeek, Child } from '../types';
import { Modal, ConfirmModal } from '../components/Modal';

interface SchedulePageProps {
  children: Child[];
  schedules: Schedule[];
  addSchedule: (schedule: Omit<Schedule, 'id' | 'createdAt'>) => Schedule;
  updateSchedule: (id: string, updates: Partial<Omit<Schedule, 'id' | 'createdAt'>>) => void;
  deleteSchedule: (id: string) => void;
}

const DAYS: DayOfWeek[] = ['월', '화', '수', '목', '금'];
const HOURS = Array.from({ length: 15 }, (_, i) => i + 7); // 7시~21시

// 시간을 분으로 변환
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

// 시간 블록 높이 계산 (1시간 = 60px)
const HOUR_HEIGHT = 60;

export function SchedulePage({ children, schedules, addSchedule, updateSchedule, deleteSchedule }: SchedulePageProps) {
  const [selectedChildId, setSelectedChildId] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ day: DayOfWeek; hour: number } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Schedule | null>(null);

  // 필터링된 일정
  const filteredSchedules = useMemo(() => {
    if (selectedChildId === 'all') return schedules;
    return schedules.filter(s => s.childId === selectedChildId);
  }, [schedules, selectedChildId]);

  // 요일별로 일정 그룹핑
  const schedulesByDay = useMemo(() => {
    const result: Record<DayOfWeek, Schedule[]> = {
      '월': [], '화': [], '수': [], '목': [], '금': []
    };
    filteredSchedules.forEach(schedule => {
      result[schedule.day].push(schedule);
    });
    return result;
  }, [filteredSchedules]);

  // 빈 칸 클릭 시 일정 추가
  const handleCellClick = (day: DayOfWeek, hour: number) => {
    if (children.length === 0) {
      alert('먼저 자녀를 추가해주세요.');
      return;
    }
    setSelectedSlot({ day, hour });
    setEditingSchedule(null);
    setIsModalOpen(true);
  };

  // 일정 블록 클릭 시 수정
  const handleScheduleClick = (schedule: Schedule, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingSchedule(schedule);
    setSelectedSlot(null);
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSchedule(null);
    setSelectedSlot(null);
  };

  // 자녀별 색상
  const getChildColor = (childId: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-emerald-500',
      'bg-amber-500',
      'bg-rose-500',
      'bg-violet-500',
      'bg-cyan-500',
    ];
    const index = children.findIndex(c => c.id === childId);
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-full bg-white">
      {/* Header */}
      <header className="sticky top-0 bg-white border-b border-gray-100 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">주간 시간표</h1>
              <p className="text-sm text-gray-500 mt-0.5">일정을 한눈에 확인하세요</p>
            </div>
            <button
              onClick={() => {
                if (children.length === 0) {
                  alert('먼저 자녀를 추가해주세요.');
                  return;
                }
                setSelectedSlot(null);
                setEditingSchedule(null);
                setIsModalOpen(true);
              }}
              className="w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/30 hover:bg-primary-dark transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {/* 자녀 필터 */}
          {children.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
              <button
                onClick={() => setSelectedChildId('all')}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedChildId === 'all'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                전체
              </button>
              {children.map((child, index) => (
                <button
                  key={child.id}
                  onClick={() => setSelectedChildId(child.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedChildId === child.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    selectedChildId === child.id ? 'bg-white' : getChildColor(child.id).replace('bg-', 'bg-')
                  }`} style={{ backgroundColor: selectedChildId !== child.id ? ['#3b82f6', '#10b981', '#f59e0b', '#f43f5e', '#8b5cf6', '#06b6d4'][index % 6] : undefined }} />
                  {child.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      {/* 시간표 그리드 */}
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          {/* 요일 헤더 */}
          <div className="flex border-b border-gray-200 sticky top-[120px] bg-white z-30">
            <div className="w-14 flex-shrink-0" />
            {DAYS.map(day => (
              <div
                key={day}
                className="flex-1 text-center py-3 text-sm font-medium text-gray-700"
              >
                {day}
              </div>
            ))}
          </div>

          {/* 시간표 본문 */}
          <div className="flex">
            {/* 시간 열 */}
            <div className="w-14 flex-shrink-0">
              {HOURS.map(hour => (
                <div
                  key={hour}
                  className="h-[60px] text-xs text-gray-400 pr-2 text-right pt-0 -mt-2"
                >
                  {hour}:00
                </div>
              ))}
            </div>

            {/* 요일별 열 */}
            <div className="flex-1 flex">
              {DAYS.map(day => (
                <div
                  key={day}
                  className="flex-1 border-l border-gray-100 relative"
                >
                  {/* 시간 그리드 */}
                  {HOURS.map(hour => (
                    <div
                      key={hour}
                      className="h-[60px] border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => handleCellClick(day, hour)}
                    />
                  ))}

                  {/* 일정 블록 */}
                  {schedulesByDay[day].map(schedule => {
                    const startMinutes = timeToMinutes(schedule.startTime);
                    const endMinutes = timeToMinutes(schedule.endTime);
                    const top = ((startMinutes - 7 * 60) / 60) * HOUR_HEIGHT;
                    const height = ((endMinutes - startMinutes) / 60) * HOUR_HEIGHT;
                    const child = children.find(c => c.id === schedule.childId);

                    return (
                      <div
                        key={schedule.id}
                        className={`absolute left-1 right-1 rounded-lg p-2 cursor-pointer overflow-hidden shadow-sm hover:shadow-md transition-shadow ${getChildColor(schedule.childId)}`}
                        style={{ top: `${top}px`, height: `${Math.max(height, 30)}px` }}
                        onClick={(e) => handleScheduleClick(schedule, e)}
                      >
                        <p className="text-xs font-semibold text-white truncate">
                          {schedule.title}
                        </p>
                        {height > 40 && (
                          <p className="text-[10px] text-white/80 truncate mt-0.5">
                            {schedule.startTime} - {schedule.endTime}
                          </p>
                        )}
                        {height > 60 && child && selectedChildId === 'all' && (
                          <p className="text-[10px] text-white/70 truncate mt-0.5">
                            {child.name}
                          </p>
                        )}
                        {height > 80 && schedule.placeName && (
                          <p className="text-[10px] text-white/70 truncate mt-0.5">
                            📍 {schedule.placeName}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 빈 상태 */}
      {children.length === 0 && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center p-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">자녀를 먼저 등록해주세요</p>
            <p className="text-gray-400 text-sm mt-1">내정보 탭에서 자녀를 추가할 수 있어요</p>
          </div>
        </div>
      )}

      {/* 일정 추가/수정 모달 */}
      <ScheduleModal
        isOpen={isModalOpen}
        onClose={closeModal}
        children={children}
        schedule={editingSchedule}
        defaultDay={selectedSlot?.day}
        defaultHour={selectedSlot?.hour}
        onSave={(data) => {
          if (editingSchedule) {
            updateSchedule(editingSchedule.id, data);
          } else {
            addSchedule(data);
          }
          closeModal();
        }}
        onDelete={() => {
          if (editingSchedule) {
            setDeleteConfirm(editingSchedule);
          }
        }}
      />

      {/* 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteSchedule(deleteConfirm.id);
            closeModal();
          }
        }}
        title="일정 삭제"
        message={`'${deleteConfirm?.title}' 일정을 삭제하시겠습니까?`}
        confirmText="삭제"
        danger
      />
    </div>
  );
}

// 일정 추가/수정 모달
interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: Child[];
  schedule: Schedule | null;
  defaultDay?: DayOfWeek;
  defaultHour?: number;
  onSave: (data: Omit<Schedule, 'id' | 'createdAt'>) => void;
  onDelete?: () => void;
}

function ScheduleModal({ 
  isOpen, 
  onClose, 
  children, 
  schedule, 
  defaultDay, 
  defaultHour,
  onSave,
  onDelete 
}: ScheduleModalProps) {
  const [childId, setChildId] = useState(schedule?.childId || children[0]?.id || '');
  const [day, setDay] = useState<DayOfWeek>(schedule?.day || defaultDay || '월');
  const [startTime, setStartTime] = useState(schedule?.startTime || (defaultHour ? `${String(defaultHour).padStart(2, '0')}:00` : '09:00'));
  const [endTime, setEndTime] = useState(schedule?.endTime || (defaultHour ? `${String(defaultHour + 1).padStart(2, '0')}:00` : '10:00'));
  const [title, setTitle] = useState(schedule?.title || '');
  const [note, setNote] = useState(schedule?.note || '');
  const [placeName, setPlaceName] = useState(schedule?.placeName || '');
  const [address, setAddress] = useState(schedule?.address || '');

  // 모달이 열릴 때마다 폼 초기화
  useState(() => {
    if (isOpen) {
      setChildId(schedule?.childId || children[0]?.id || '');
      setDay(schedule?.day || defaultDay || '월');
      setStartTime(schedule?.startTime || (defaultHour ? `${String(defaultHour).padStart(2, '0')}:00` : '09:00'));
      setEndTime(schedule?.endTime || (defaultHour ? `${String(defaultHour + 1).padStart(2, '0')}:00` : '10:00'));
      setTitle(schedule?.title || '');
      setNote(schedule?.note || '');
      setPlaceName(schedule?.placeName || '');
      setAddress(schedule?.address || '');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childId || !title.trim()) {
      alert('자녀와 일정명을 입력해주세요.');
      return;
    }
    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      return;
    }
    onSave({
      childId,
      day,
      startTime,
      endTime,
      title: title.trim(),
      note: note.trim() || undefined,
      placeName: placeName.trim() || undefined,
      address: address.trim() || undefined,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={schedule ? '일정 수정' : '일정 추가'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* 자녀 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">자녀 선택</label>
          <div className="flex gap-2 flex-wrap">
            {children.map(child => (
              <button
                key={child.id}
                type="button"
                onClick={() => setChildId(child.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  childId === child.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        </div>

        {/* 요일 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">요일</label>
          <div className="flex gap-2">
            {DAYS.map(d => (
              <button
                key={d}
                type="button"
                onClick={() => setDay(d)}
                className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${
                  day === d
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* 시간 선택 */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        {/* 일정명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">일정명 *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="예: 수학 학원"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* 장소명 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">장소명</label>
          <input
            type="text"
            value={placeName}
            onChange={(e) => setPlaceName(e.target.value)}
            placeholder="예: 빛나리 수학학원"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* 주소 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">주소</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="예: 서울시 강남구 역삼동 123-45"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          />
        </div>

        {/* 메모 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="추가 메모를 입력하세요"
            rows={3}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        {/* 버튼 */}
        <div className="flex gap-3 pt-2">
          {schedule && onDelete && (
            <button
              type="button"
              onClick={onDelete}
              className="px-4 py-3 text-red-500 font-medium hover:bg-red-50 rounded-xl transition-colors"
            >
              삭제
            </button>
          )}
          <button
            type="submit"
            className="flex-1 py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
          >
            {schedule ? '수정하기' : '추가하기'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
