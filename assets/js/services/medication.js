const SLOT_IDS = ["dose1", "dose2", "dose3", "dose4"];

export function getMedicationDoses(item) {
  const count = Math.min(4, Math.max(1, Number(item?.doseCount) || 1));
  const configured = Array.isArray(item?.doseSlots) ? item.doseSlots : [];
  return SLOT_IDS.slice(0, count).map((id, index) => {
    const slot = configured[index] || {};
    return { id, label: String(slot.label || ["প্রথম ডোজ", "দ্বিতীয় ডোজ", "তৃতীয় ডোজ", "চতুর্থ ডোজ"][index]), time: String(slot.time || "") };
  });
}

export function setMedicationStatus(state, medicationId, doseId, status, date) {
  const item = state.medication?.items?.find(entry => entry.id === medicationId);
  if (!item || !getMedicationDoses(item).some(dose => dose.id === doseId)) return state;
  const dailyLogs = state.medication.dailyLogs || {};
  const day = dailyLogs[date] || {};
  const medicineLog = day[medicationId] || {};
  const doses = medicineLog.doses || {};
  return {
    ...state,
    medication: {
      ...state.medication,
      dailyLogs: {
        ...dailyLogs,
        [date]: {
          ...day,
          [medicationId]: {
            ...medicineLog,
            doses: { ...doses, [doseId]: { status, updatedAt: new Date().toISOString() } }
          }
        }
      }
    }
  };
}
