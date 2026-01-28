import { useState, useRef } from 'react';
import type { Child, AppData } from '../types';
import { Modal, ConfirmModal } from '../components/Modal';

interface ProfilePageProps {
  data: AppData;
  children: Child[];
  addChild: (name: string, grade: string) => Child;
  updateChild: (id: string, updates: Partial<Pick<Child, 'name' | 'grade'>>) => void;
  deleteChild: (id: string) => void;
  toggleNotifications: () => void;
  loadSampleData: () => void;
  exportData: () => void;
  importData: (jsonString: string) => boolean;
  resetAllData: () => void;
}

export function ProfilePage({ 
  data,
  children, 
  addChild, 
  updateChild, 
  deleteChild,
  toggleNotifications,
  loadSampleData,
  exportData,
  importData,
  resetAllData 
}: ProfilePageProps) {
  const [isChildModalOpen, setIsChildModalOpen] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Child | null>(null);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [sampleConfirm, setSampleConfirm] = useState(false);
  const [importSuccess, setImportSuccess] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddChild = () => {
    setEditingChild(null);
    setIsChildModalOpen(true);
  };

  const handleEditChild = (child: Child) => {
    setEditingChild(child);
    setIsChildModalOpen(true);
  };

  const closeChildModal = () => {
    setIsChildModalOpen(false);
    setEditingChild(null);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importData(content);
      setImportSuccess(success);
      setTimeout(() => setImportSuccess(null), 3000);
    };
    reader.readAsText(file);
    
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="min-h-full bg-gray-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-gray-100">
        <div className="px-4 py-4">
          <h1 className="text-xl font-bold text-gray-900">내 정보</h1>
          <p className="text-sm text-gray-500 mt-0.5">설정 및 데이터 관리</p>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* 사용자 카드 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">게스트 사용자</h2>
              <p className="text-sm text-gray-500">로그인 없이 로컬에서 사용 중</p>
            </div>
          </div>

          {/* 알림 설정 */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">알림 설정</p>
                  <p className="text-sm text-gray-500">다음 버전에서 푸시 알림 지원 예정</p>
                </div>
              </div>
              <button 
                onClick={toggleNotifications}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  data.settings.notificationsEnabled ? 'bg-primary' : 'bg-gray-300'
                }`}
              >
                <span 
                  className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    data.settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 자녀 관리 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">자녀 관리</h3>
              <p className="text-sm text-gray-500 mt-0.5">등록된 자녀: {children.length}명</p>
            </div>
            <button
              onClick={handleAddChild}
              className="w-9 h-9 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary-dark transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          {children.length > 0 ? (
            <div className="divide-y divide-gray-100">
              {children.map((child, index) => (
                <div key={child.id} className="px-5 py-4 flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                    ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-violet-500'][index % 5]
                  }`}>
                    {child.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{child.name}</p>
                    <p className="text-sm text-gray-500">{child.grade}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditChild(child)}
                      className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(child)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-5 py-8 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-gray-500">등록된 자녀가 없습니다</p>
              <button
                onClick={handleAddChild}
                className="mt-3 text-primary font-medium text-sm"
              >
                + 자녀 추가하기
              </button>
            </div>
          )}
        </div>

        {/* 데이터 관리 */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900">데이터 관리</h3>
            <p className="text-sm text-gray-500 mt-0.5">데이터 백업 및 복원</p>
          </div>

          <div className="divide-y divide-gray-100">
            {/* 샘플 데이터 */}
            <button
              onClick={() => setSampleConfirm(true)}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">샘플 데이터 넣기</p>
                <p className="text-sm text-gray-500">테스트용 데이터를 불러옵니다</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 내보내기 */}
            <button
              onClick={exportData}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">데이터 내보내기</p>
                <p className="text-sm text-gray-500">JSON 파일로 백업합니다</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* 가져오기 */}
            <button
              onClick={handleImportClick}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900">데이터 가져오기</p>
                <p className="text-sm text-gray-500">JSON 파일에서 복원합니다</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* 전체 초기화 */}
            <button
              onClick={() => setResetConfirm(true)}
              className="w-full px-5 py-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="font-medium text-red-600">전체 초기화</p>
                <p className="text-sm text-gray-500">모든 데이터를 삭제합니다</p>
              </div>
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* 버전 정보 */}
        <div className="text-center py-4">
          <p className="text-sm text-gray-400">Parent Route v1.0.0 (Phase 1)</p>
          <p className="text-xs text-gray-300 mt-1">로컬 전용 · 로그인 불필요</p>
        </div>
      </div>

      {/* Import 성공/실패 토스트 */}
      {importSuccess !== null && (
        <div className={`fixed bottom-24 left-4 right-4 p-4 rounded-2xl shadow-lg z-50 ${
          importSuccess ? 'bg-green-500' : 'bg-red-500'
        } text-white font-medium text-center`}>
          {importSuccess ? '데이터를 성공적으로 가져왔습니다!' : '데이터 형식이 올바르지 않습니다.'}
        </div>
      )}

      {/* 자녀 추가/수정 모달 */}
      <ChildModal
        isOpen={isChildModalOpen}
        onClose={closeChildModal}
        child={editingChild}
        onSave={(name, grade) => {
          if (editingChild) {
            updateChild(editingChild.id, { name, grade });
          } else {
            addChild(name, grade);
          }
          closeChildModal();
        }}
      />

      {/* 자녀 삭제 확인 모달 */}
      <ConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            deleteChild(deleteConfirm.id);
          }
        }}
        title="자녀 삭제"
        message={`'${deleteConfirm?.name}'를 삭제하시겠습니까?\n관련된 모든 일정도 함께 삭제됩니다.`}
        confirmText="삭제"
        danger
      />

      {/* 전체 초기화 확인 모달 */}
      <ConfirmModal
        isOpen={resetConfirm}
        onClose={() => setResetConfirm(false)}
        onConfirm={resetAllData}
        title="전체 초기화"
        message="모든 데이터가 삭제됩니다. 계속하시겠습니까?"
        confirmText="초기화"
        danger
      />

      {/* 샘플 데이터 확인 모달 */}
      <ConfirmModal
        isOpen={sampleConfirm}
        onClose={() => setSampleConfirm(false)}
        onConfirm={loadSampleData}
        title="샘플 데이터 불러오기"
        message="기존 데이터가 샘플 데이터로 대체됩니다. 계속하시겠습니까?"
        confirmText="불러오기"
      />
    </div>
  );
}

// 자녀 추가/수정 모달
interface ChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  child: Child | null;
  onSave: (name: string, grade: string) => void;
}

function ChildModal({ isOpen, onClose, child, onSave }: ChildModalProps) {
  const [name, setName] = useState(child?.name || '');
  const [grade, setGrade] = useState(child?.grade || '');

  // 모달이 열릴 때 폼 초기화
  useState(() => {
    if (isOpen) {
      setName(child?.name || '');
      setGrade(child?.grade || '');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !grade.trim()) {
      alert('이름과 학년을 입력해주세요.');
      return;
    }
    onSave(name.trim(), grade.trim());
  };

  const grades = [
    '유치원', 
    '초등학교 1학년', '초등학교 2학년', '초등학교 3학년', 
    '초등학교 4학년', '초등학교 5학년', '초등학교 6학년',
    '중학교 1학년', '중학교 2학년', '중학교 3학년',
    '고등학교 1학년', '고등학교 2학년', '고등학교 3학년',
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={child ? '자녀 정보 수정' : '자녀 추가'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">이름</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="자녀 이름을 입력하세요"
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">학년</label>
          <select
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors appearance-none"
          >
            <option value="">학년을 선택하세요</option>
            {grades.map(g => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary-dark transition-colors"
        >
          {child ? '수정하기' : '추가하기'}
        </button>
      </form>
    </Modal>
  );
}
