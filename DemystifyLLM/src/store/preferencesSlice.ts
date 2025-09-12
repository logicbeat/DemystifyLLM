import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { UserPreferences, ControlBarPosition, Theme } from '../types';

const initialState: UserPreferences = {
  controlBarPosition: 'bottom',
  theme: 'light',
  wrapNavigation: false,
};

// Load preferences from localStorage
const loadPreferencesFromStorage = (): UserPreferences => {
  try {
    const stored = localStorage.getItem('presentation-preferences');
    if (stored) {
      return { ...initialState, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load preferences from localStorage:', error);
  }
  return initialState;
};

// Save preferences to localStorage
const savePreferencesToStorage = (preferences: UserPreferences) => {
  try {
    localStorage.setItem('presentation-preferences', JSON.stringify(preferences));
  } catch (error) {
    console.warn('Failed to save preferences to localStorage:', error);
  }
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: loadPreferencesFromStorage(),
  reducers: {
    setControlBarPosition: (state, action: PayloadAction<ControlBarPosition>) => {
      state.controlBarPosition = action.payload;
      savePreferencesToStorage(state);
    },
    setTheme: (state, action: PayloadAction<Theme>) => {
      state.theme = action.payload;
      savePreferencesToStorage(state);
    },
    setWrapNavigation: (state, action: PayloadAction<boolean>) => {
      state.wrapNavigation = action.payload;
      savePreferencesToStorage(state);
    },
    resetPreferences: (state) => {
      Object.assign(state, initialState);
      savePreferencesToStorage(state);
    },
  },
});

export const {
  setControlBarPosition,
  setTheme,
  setWrapNavigation,
  resetPreferences,
} = preferencesSlice.actions;

export default preferencesSlice.reducer;