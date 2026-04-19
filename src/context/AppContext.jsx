/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';
import { MOCK_PATIENTS, MOCK_PRACTITIONER } from '../data/mockData';
import { createClient, fetchClients, persistClientScore, persistClientSession } from '../services/appData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [practitioner] = useState(MOCK_PRACTITIONER);
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [mqttToken, setMqttToken] = useState(null);
  const [mqttBaseUrl, setMqttBaseUrl] = useState('');
  const [patientsLoading, setPatientsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function loadPatients() {
      setPatientsLoading(true);
      try {
        const data = await fetchClients();
        if (!cancelled && data.length > 0) {
          setPatients(data);
        }
      } catch {
        // Keep mock fallback when backend is not running.
      } finally {
        if (!cancelled) setPatientsLoading(false);
      }
    }

    loadPatients();
    return () => {
      cancelled = true;
    };
  }, []);

  async function addPatient(payload) {
    const created = await createClient(payload);
    setPatients((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    return created;
  }

  async function updatePatientScores(patientId, newScore) {
    try {
      const updated = await persistClientScore(patientId, newScore);
      setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)));
      return;
    } catch {
      setPatients(prev => prev.map(p => {
        if (p.id !== patientId) return p;
        const today = new Date().toISOString().split('T')[0];
        const existing = p.recovery_scores.find(s => s.date === today);
        const scores = existing
          ? p.recovery_scores.map(s => s.date === today ? { ...s, ...newScore } : s)
          : [...p.recovery_scores, { date: today, ...newScore }];
        return { ...p, recovery_scores: scores };
      }));
    }
  }

  async function addPatientSession(patientId, sessionPayload) {
    try {
      const updated = await persistClientSession(patientId, sessionPayload);
      setPatients((prev) => prev.map((p) => (p.id === patientId ? updated : p)));
      return updated;
    } catch {
      setPatients((prev) =>
        prev.map((p) => {
          if (p.id !== patientId) return p;
          const sessions = [...(p.sessions || []), { id: `session-${(p.sessions || []).length + 1}`, ...sessionPayload }];
          return { ...p, sessions };
        })
      );
      return null;
    }
  }

  return (
    <AppContext.Provider
      value={{
        practitioner,
        patients,
        setPatients,
        patientsLoading,
        addPatient,
        addPatientSession,
        mqttToken,
        setMqttToken,
        mqttBaseUrl,
        setMqttBaseUrl,
        updatePatientScores,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
