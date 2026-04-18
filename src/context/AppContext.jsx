/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from 'react';
import { MOCK_PATIENTS, MOCK_PRACTITIONER } from '../data/mockData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [practitioner] = useState(MOCK_PRACTITIONER);
  const [patients, setPatients] = useState(MOCK_PATIENTS);
  const [mqttToken, setMqttToken] = useState(null);
  const [mqttBaseUrl, setMqttBaseUrl] = useState('');

  function updatePatientScores(patientId, newScore) {
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

  return (
    <AppContext.Provider value={{ practitioner, patients, setPatients, mqttToken, setMqttToken, mqttBaseUrl, setMqttBaseUrl, updatePatientScores }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
