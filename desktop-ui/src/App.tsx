import React, { useState } from 'react';
import { usePilot } from './hooks/usePilot';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { DashboardScreen } from './screens/DashboardScreen';
import { LogsScreen } from './screens/LogsScreen';
import { AutomationScreen } from './screens/AutomationScreen';
import { NotesScreen } from './screens/NotesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen'; // Import your new screen

function App() {
  // Check if user is already initialized (defaults to false)
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentTab, setTab] = useState('dashboard');

  const {
    status,
    configured,
    logs,
    wsState,
    awaitingLogin,
    startWorkflow,
    startNotes,
    confirmLogin,
    toggleBrowser,
  } = usePilot();

  // 1. If not initialized, show the Onboarding flow
  if (!isInitialized) {
    return (
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'var(--background)' }}>
        <OnboardingScreen onComplete={() => setIsInitialized(true)} />
      </div>
    );
  }

  // 2. If initialized, show the main application
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <Sidebar currentTab={currentTab} setTab={setTab} />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
        <StatusBar wsState={wsState} status={status} />

        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: 'var(--background)' }}>
          {currentTab === 'dashboard' && (
            <DashboardScreen
              status={status}
              configured={configured}
              logsLength={logs.length}
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

          {currentTab === 'logs' && (
            <LogsScreen />
          )}

          {currentTab === 'notes' && (
            <NotesScreen />
          )}

          {currentTab === 'settings' && (
            <SettingsScreen />
          )}
        </main>
      </div>
    </div>
  );
}

export default App;