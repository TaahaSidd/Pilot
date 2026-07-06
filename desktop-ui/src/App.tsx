import React, { useState } from 'react';
import { PilotProvider, usePilotContext } from './context/usePilotContext';
import { Sidebar } from './components/layout/Sidebar';
import { StatusBar } from './components/layout/StatusBar';
import { DashboardScreen } from './screens/DashboardScreen';
import { LogsScreen } from './screens/LogsScreen';
import { AutomationScreen } from './screens/AutomationScreen';
import { NotesScreen } from './screens/NotesScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';

function AppContent() {
  const [currentTab, setTab] = useState('dashboard');

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
        Loading Pilot…
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
      <Sidebar currentTab={currentTab} setTab={setTab} />

      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh' }}>
        <StatusBar wsState={wsState} status={status} />

        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', backgroundColor: 'var(--background)' }}>
          {currentTab === 'dashboard' && <DashboardScreen />}
          {currentTab === 'automation' && <AutomationScreen />}
          {currentTab === 'logs' && <LogsScreen />}
          {currentTab === 'notes' && <NotesScreen />}
          {currentTab === 'settings' && <SettingsScreen />}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <PilotProvider>
      <AppContent />
    </PilotProvider>
  );
}

export default App;