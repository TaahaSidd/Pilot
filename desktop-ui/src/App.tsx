import React, { useState } from 'react';
import { usePilot } from './hooks/usePilot';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { DashboardScreen } from './screens/DashboardScreen';
import { LogsScreen } from './screens/LogsScreen';
import { AutomationScreen } from './screens/AutomationScreen';
import { NotesScreen } from './screens/NotesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';

function App() {
  const [currentTab, setTab] = useState('dashboard');

  const {
    status,
    statusError,
    configured,
    statusLoading,
    logs,
    wsState,
    awaitingLogin,
    courses,
    modulesCompletedThisRun,
    startWorkflow,
    startNotes,
    confirmLogin,
    toggleBrowser,
  } = usePilot();

  // 0. While the first /status poll hasn't landed yet, render a
  // neutral loading state — NOT the onboarding screen. Without this,
  // every reload would briefly flash onboarding for already-configured
  // users, since `configured` starts at its initial value of false
  // until the real response arrives.
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
        Loading Pilot…
      </div>
    );
  }

  // 1. `configured` comes from the backend's real, on-disk config
  // (GET /status -> is_configured()) — this is the durable source of
  // truth. There is no separate "isInitialized" flag anymore: that
  // was in-memory React state that reset to false on every reload,
  // which is exactly why onboarding kept reappearing for existing
  // users. Trust the backend, don't shadow it with local state.
  if (!configured) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'var(--background)' }}>
        <OnboardingScreen
          onComplete={() => {
            // No local flag to flip — usePilot's next status poll
            // (within STATUS_POLL_INTERVAL_MS) will see configured:
            // true from the backend and this gate will open on its
            // own. Nothing to do here.
          }}
        />
      </div>
    );
  }

  // 2. Configured — show the main application
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <Sidebar currentTab={currentTab} setTab={setTab} />
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
        <StatusBar wsState={wsState} status={status} />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: 'var(--background)' }}>
          {currentTab === 'dashboard' && (
            <DashboardScreen
              status={status}
              statusError={statusError}
              configured={configured}
              courses={courses}
              modulesCompletedThisRun={modulesCompletedThisRun}
              logs={logs}
              awaitingLogin={awaitingLogin}
              startWorkflow={startWorkflow}
              startNotes={startNotes}
              confirmLogin={confirmLogin}
              toggleBrowser={toggleBrowser}
            />
          )}
          {currentTab === 'automation' && (
            <AutomationScreen liveLogs={logs} status={status} />
          )}
          {currentTab === 'logs' && <LogsScreen />}
          {currentTab === 'notes' && <NotesScreen />}
          {currentTab === 'settings' && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}

export default App;