export function setMedicationStatus(state, medicationId, status, date) {
  if (!state.medication?.items?.some(item => item.id === medicationId)) return state;
  const dailyLogs = state.medication.dailyLogs || {};
  return {
    ...state,
    medication: {
      ...state.medication,
      dailyLogs: {
        ...dailyLogs,
        [date]: {
          ...(dailyLogs[date] || {}),
          [medicationId]: { status, updatedAt: new Date().toISOString() }
        }
      }
    }
  };
}
