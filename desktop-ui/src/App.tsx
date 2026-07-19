import { useEffect, useState } from 'react';
import { PilotProvider, usePilotContext } from './context/usePilotContext';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { TitleBar } from './components/layout/TitleBar';
import { DashboardScreen } from './screens/DashboardScreen';
import { LogsScreen } from './screens/LogsScreen';
import { AutomationScreen } from './screens/AutomationScreen';
import { NotesScreen } from './screens/NotesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HelpScreen } from './screens/HelpScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NotificationProvider } from './context/NotificationContext';
import type { CourseSummary } from './api/api';

type NavigationEntry = {
  tab: string;
};

function AppContent() {
  const [currentTab, setTab] = useState('dashboard');
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [navigationHistory, setNavigationHistory] = useState<NavigationEntry[]>([{ tab: 'dashboard' }]);
  const [navigationIndex, setNavigationIndex] = useState(0);
  const [notesCourseTitle, setNotesCourseTitle] = useState<string | null>(null);
  const [settingsInitialView, setSettingsInitialView] = useState<'identity' | null>(null);

  const {
    status,
    configured,
    statusLoading,
    wsState,
  } = usePilotContext();

  const prepareTabState = (tab: string) => {
    if (tab !== 'notes') {
      setNotesCourseTitle(null);
    }
    if (tab !== 'settings') {
      setSettingsInitialView(null);
    }
  };

  const navigateTo = (tab: string) => {
    prepareTabState(tab);
    setTab(tab);
    setNavigationHistory((history) => {
      const trimmed = history.slice(0, navigationIndex + 1);
      const current = trimmed[trimmed.length - 1];

      if (current?.tab === tab) {
        return trimmed;
      }

      return [...trimmed, { tab }];
    });
    setNavigationIndex((index) => {
      const current = navigationHistory[index];
      return current?.tab === tab ? index : index + 1;
    });
  };

  const navigateBack = () => {
    setNavigationIndex((index) => {
      if (index <= 0) return index;

      const nextIndex = index - 1;
      const nextTab = navigationHistory[nextIndex]?.tab;

      if (nextTab) {
        prepareTabState(nextTab);
        setTab(nextTab);
      }

      return nextIndex;
    });
  };

  const navigateForward = () => {
    setNavigationIndex((index) => {
      if (index >= navigationHistory.length - 1) return index;

      const nextIndex = index + 1;
      const nextTab = navigationHistory[nextIndex]?.tab;

      if (nextTab) {
        prepareTabState(nextTab);
        setTab(nextTab);
      }

      return nextIndex;
    });
  };

  const openProfileSettings = () => {
    setNotesCourseTitle(null);
    setSettingsInitialView('identity');
    setTab('settings');
    setNavigationHistory((history) => {
      const trimmed = history.slice(0, navigationIndex + 1);
      const current = trimmed[trimmed.length - 1];

      if (current?.tab === 'settings') {
        return trimmed;
      }

      return [...trimmed, { tab: 'settings' }];
    });
    setNavigationIndex((index) => {
      const current = navigationHistory[index];
      return current?.tab === 'settings' ? index : index + 1;
    });
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!event.altKey) return;

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        navigateBack();
      }

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        navigateForward();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (statusLoading) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
        <TitleBar currentTab="dashboard" setTab={() => { }} />
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'var(--background)',
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}
        >
          Loading Pilot...
        </div>
      </div>
    );
  }

  if (!configured) {
    return (
      <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--background)' }}>
        <TitleBar currentTab="setup" setTab={() => { }} />
        <div style={{ flex: 1, minHeight: 0 }}>
          <OnboardingScreen onComplete={() => { }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100vw', height: '100vh' }}>
      <TitleBar
        currentTab={currentTab}
        setTab={navigateTo}
        openProfileSettings={openProfileSettings}
        canNavigateBack={navigationIndex > 0}
        canNavigateForward={navigationIndex < navigationHistory.length - 1}
        onNavigateBack={navigateBack}
        onNavigateForward={navigateForward}
        sidebarExpanded={sidebarExpanded}
        onToggleSidebar={() => setSidebarExpanded((value) => !value)}
      />

      <div style={{ position: 'relative', display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {sidebarExpanded && (
          <button
            type="button"
            aria-label="Close sidebar"
            onClick={() => setSidebarExpanded(false)}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 30,
              border: 0,
              padding: 0,
              backgroundColor: 'transparent',
              cursor: 'default',
            }}
          />
        )}

        <Sidebar
          currentTab={currentTab}
          setTab={navigateTo}
          expanded={sidebarExpanded}
          onClose={() => setSidebarExpanded(false)}
        />

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, minHeight: 0 }}>
        <main
          style={{
            flex: 1,
            padding: '28px var(--app-gutter) 32px',
            overflowY: 'auto',
            backgroundColor: 'var(--background)',
          }}
        >
          <div key={currentTab} className="pilot-page-transition">
            {currentTab === 'dashboard' && (
              <DashboardScreen
                onOpenCourseNotes={(course: CourseSummary) => {
                  setNotesCourseTitle(course.title);
                  navigateTo('notes');
                }}
                onOpenSettings={() => {
                  setNotesCourseTitle(null);
                  navigateTo('settings');
                }}
              />
            )}
            {currentTab === 'notifications' && <NotificationsScreen />}
            {currentTab === 'automation' && <AutomationScreen />}
            {currentTab === 'sessions' && (
              <LogsScreen
                onOpenNotes={() => navigateTo('notes')}
                onResumeStudy={() => navigateTo('dashboard')}
                onOpenCourse={() => navigateTo('dashboard')}
              />
            )}
            {currentTab === 'notes' && <NotesScreen initialCourseTitle={notesCourseTitle} />}
            {currentTab === 'help' && <HelpScreen />}
            {currentTab === 'settings' && (
              <SettingsScreen
                initialView={settingsInitialView}
                onInitialViewHandled={() => setSettingsInitialView(null)}
              />
            )}
          </div>
        </main>

        <StatusBar wsState={wsState} status={status} />
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <PilotProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </PilotProvider>
  );
}

export default App;
