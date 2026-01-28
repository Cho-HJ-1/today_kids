import { useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { SchedulePage } from './pages/SchedulePage';
import { RoutePage } from './pages/RoutePage';
import { ProfilePage } from './pages/ProfilePage';
import { useStore } from './store/useStore';
import type { TabType } from './types';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('schedule');
  const store = useStore();

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* 페이지 콘텐츠 */}
      <main className="max-w-lg mx-auto min-h-screen">
        {activeTab === 'schedule' && (
          <SchedulePage
            children={store.data.children}
            schedules={store.data.schedules}
            addSchedule={store.addSchedule}
            updateSchedule={store.updateSchedule}
            deleteSchedule={store.deleteSchedule}
          />
        )}
        {activeTab === 'route' && (
          <RoutePage
            children={store.data.children}
            schedules={store.data.schedules}
            getScheduleStatus={store.getScheduleStatus}
            checkIn={store.checkIn}
            checkOut={store.checkOut}
            resetStatus={store.resetStatus}
          />
        )}
        {activeTab === 'profile' && (
          <ProfilePage
            data={store.data}
            children={store.data.children}
            addChild={store.addChild}
            updateChild={store.updateChild}
            deleteChild={store.deleteChild}
            toggleNotifications={store.toggleNotifications}
            loadSampleData={store.loadSampleData}
            exportData={store.exportData}
            importData={store.importData}
            resetAllData={store.resetAllData}
          />
        )}
      </main>

      {/* 하단 네비게이션 */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
