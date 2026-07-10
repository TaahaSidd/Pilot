import { useState } from 'react';
import { PilotProvider, usePilotContext } from './context/usePilotContext';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { DashboardScreen } from './screens/DashboardScreen';
import { LogsScreen } from './screens/LogsScreen';
import { AutomationScreen } from './screens/AutomationScreen';
import { NotesScreen } from './screens/NotesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { HelpScreen } from './screens/HelpScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { useTheme } from './context/ThemeContext';
import type { CourseSummary } from './api/api';
import { Bell, ChevronRight, Moon, Sun, UserRound } from 'lucide-react';

const pageTitles: Record<string, string> = {
  dashboard: 'Dashboard',
  notifications: 'Updates',
  sessions: 'History',
  notes: 'Notes',
  help: 'Help',
  settings: 'Settings',
  automation: 'Automation Monitor',
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) return 'P';
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();

  return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase();
}

function AppTopBar({
  currentTab,
  setTab,
  openProfileSettings,
}: {
  currentTab: string;
  setTab: (tab: string) => void;
  openProfileSettings: () => void;
}) {
  const { config } = usePilotContext();
  const { unreadCount } = useNotifications();
  const { theme, setTheme } = useTheme();
  const userName = config?.display_name || config?.username || 'Pilot user';
  const title = pageTitles[currentTab] ?? 'Pilot';
  const isDashboard = currentTab === 'dashboard';
  const nextTheme = theme === 'dark' ? 'light' : 'dark';
  const ThemeIcon = theme === 'dark' ? Moon : Sun;

  return (
    <header
      style={{
        height: '56px',
        flex: '0 0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--app-topbar-gutter)',
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <nav
        aria-label="Page breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          minWidth: 0,
        }}
      >
        <button
          type="button"
          onClick={() => setTab('dashboard')}
          disabled={isDashboard}
          style={{
            border: '1px solid transparent',
            backgroundColor: 'transparent',
            color: isDashboard ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontSize: '16px',
            fontWeight: isDashboard ? 700 : 600,
            letterSpacing: 0,
            padding: '6px 8px',
            borderRadius: '7px',
            cursor: isDashboard ? 'default' : 'pointer',
          }}
        >
          Dashboard
        </button>

        {!isDashboard && (
          <>
            <ChevronRight size={15} color="var(--text-muted)" />
            <span
              style={{
                color: 'var(--text-primary)',
                fontSize: '16px',
                fontWeight: 700,
                letterSpacing: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
          </>
        )}
      </nav>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          type="button"
          onClick={() => setTheme(nextTheme)}
          title={`Switch to ${nextTheme} theme`}
          style={{
            width: '34px',
            height: '34px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-subtle)',
            color: 'var(--text-secondary)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <ThemeIcon size={16} />
        </button>

        <button
          type="button"
          onClick={() => setTab('notifications')}
          title="Updates"
          style={{
            position: 'relative',
            width: '34px',
            height: '34px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            backgroundColor: currentTab === 'notifications' ? 'var(--accent-soft)' : 'var(--surface-subtle)',
            color: currentTab === 'notifications' ? 'var(--accent)' : 'var(--text-secondary)',
            display: 'grid',
            placeItems: 'center',
            cursor: 'pointer',
          }}
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-2px',
                minWidth: '16px',
                height: '16px',
                borderRadius: '999px',
                backgroundColor: 'var(--error)',
                color: 'var(--text-on-accent)',
                fontSize: '10px',
                fontWeight: 800,
                lineHeight: '16px',
                padding: '0 4px',
                border: '2px solid var(--surface)',
              }}
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={openProfileSettings}
          title={userName}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '999px',
            border: '1px solid var(--border)',
            backgroundColor: 'var(--surface-subtle)',
            display: 'grid',
            placeItems: 'center',
            padding: 0,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '999px',
              backgroundColor: 'color-mix(in srgb, var(--accent) 18%, var(--surface))',
              color: 'var(--accent)',
              display: 'grid',
              placeItems: 'center',
              border: '1px solid color-mix(in srgb, var(--accent) 28%, var(--border))',
              fontSize: '11px',
              fontWeight: 800,
            }}
          >
            {userName === 'Pilot user' ? <UserRound size={15} /> : getInitials(userName)}
          </div>
        </button>
      </div>
    </header>
  );
}

function AppContent() {
  const [currentTab, setTab] = useState('dashboard');
  const [notesCourseTitle, setNotesCourseTitle] = useState<string | null>(null);
  const [settingsInitialView, setSettingsInitialView] = useState<'identity' | null>(null);

  const {
    status,
    configured,
    statusLoading,
    wsState,
  } = usePilotContext();

  if (statusLoading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
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
    );
  }

  if (!configured) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'var(--background)' }}>
        <OnboardingScreen onComplete={() => { }} />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <Sidebar
        currentTab={currentTab}
        setTab={(tab) => {
          if (tab !== 'notes') {
            setNotesCourseTitle(null);
          }
          if (tab !== 'settings') {
            setSettingsInitialView(null);
          }

          setTab(tab);
        }}
      />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
        <AppTopBar
          currentTab={currentTab}
          setTab={(tab) => {
            if (tab !== 'notes') {
              setNotesCourseTitle(null);
            }
            if (tab !== 'settings') {
              setSettingsInitialView(null);
            }

            setTab(tab);
          }}
          openProfileSettings={() => {
            setNotesCourseTitle(null);
            setSettingsInitialView('identity');
            setTab('settings');
          }}
        />

        <main
          style={{
            flex: 1,
            padding: '28px var(--app-gutter) 32px',
            overflowY: 'auto',
            backgroundColor: 'var(--background)',
          }}
        >
          {currentTab === 'dashboard' && (
            <DashboardScreen
              onOpenCourseNotes={(course: CourseSummary) => {
                setNotesCourseTitle(course.title);
                setTab('notes');
              }}
              onOpenSettings={() => {
                setNotesCourseTitle(null);
                setTab('settings');
              }}
            />
          )}
          {currentTab === 'notifications' && <NotificationsScreen />}
          {currentTab === 'automation' && <AutomationScreen />}
          {currentTab === 'sessions' && (
            <LogsScreen
              onOpenNotes={() => setTab('notes')}
              onResumeStudy={() => setTab('dashboard')}
              onOpenCourse={() => setTab('dashboard')}
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
        </main>

        <StatusBar wsState={wsState} status={status} />
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
