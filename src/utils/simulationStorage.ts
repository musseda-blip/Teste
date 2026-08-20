import { AssessmentStep, SavedSimulation, DEFAULT_ASSESSMENT_STEPS, DEFAULT_SAVED_SIMULATIONS } from '../types/simulation';
import { calculateEngine } from './taxEngine';
import { SensitivityParams, YearPeriod, EconomicSegment } from '../types/tax';

const STORAGE_KEY_SIMULATIONS = 'tax_reform_simulations';
const STORAGE_KEY_ASSESSMENT = 'tax_reform_assessment';

export const getStoredSimulations = (): SavedSimulation[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SIMULATIONS);
    if (!raw) return DEFAULT_SAVED_SIMULATIONS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_SAVED_SIMULATIONS;
  }
};

export const saveSimulationToStorage = (sim: SavedSimulation): SavedSimulation[] => {
  const list = getStoredSimulations();
  const existingIdx = list.findIndex((s) => s.id === sim.id);
  let updated: SavedSimulation[];
  if (existingIdx >= 0) {
    updated = list.map((s) => (s.id === sim.id ? sim : s));
  } else {
    updated = [sim, ...list];
  }
  localStorage.setItem(STORAGE_KEY_SIMULATIONS, JSON.stringify(updated));
  return updated;
};

export const deleteSimulationFromStorage = (id: string): SavedSimulation[] => {
  const list = getStoredSimulations();
  const updated = list.filter((s) => s.id !== id);
  localStorage.setItem(STORAGE_KEY_SIMULATIONS, JSON.stringify(updated));
  return updated;
};

export const getStoredAssessmentSteps = (): AssessmentStep[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ASSESSMENT);
    if (!raw) return DEFAULT_ASSESSMENT_STEPS;
    return JSON.parse(raw);
  } catch {
    return DEFAULT_ASSESSMENT_STEPS;
  }
};

export const saveAssessmentStepsToStorage = (steps: AssessmentStep[]) => {
  localStorage.setItem(STORAGE_KEY_ASSESSMENT, JSON.stringify(steps));
};
