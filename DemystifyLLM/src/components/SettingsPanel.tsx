import React from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { 
  setControlBarPosition, 
  setTheme, 
  setWrapNavigation, 
  resetPreferences 
} from '../store/preferencesSlice';
import type { ControlBarPosition, Theme } from '../types';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector(state => state.preferences);

  const handlePositionChange = (position: ControlBarPosition) => {
    dispatch(setControlBarPosition(position));
  };

  const handleThemeChange = (theme: Theme) => {
    dispatch(setTheme(theme));
  };

  const handleWrapNavigationChange = (wrap: boolean) => {
    dispatch(setWrapNavigation(wrap));
  };

  const handleReset = () => {
    dispatch(resetPreferences());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Control Bar Position */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-3">
              Control Bar Position
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(['top', 'bottom', 'left', 'right'] as ControlBarPosition[]).map((position) => (
                <button
                  key={position}
                  onClick={() => handlePositionChange(position)}
                  className={`px-3 py-2 text-sm rounded-md border ${
                    preferences.controlBarPosition === position
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {position.charAt(0).toUpperCase() + position.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Theme */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-3">
              Theme
            </legend>
            <div className="flex gap-2">
              {(['light', 'dark'] as Theme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border ${
                    preferences.theme === theme
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Navigation Behavior */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 mb-3">
              Navigation Behavior
            </legend>
            <div className="flex items-center">
              <input
                id="wrap-navigation"
                type="checkbox"
                checked={preferences.wrapNavigation}
                onChange={(e) => handleWrapNavigationChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="wrap-navigation" className="ml-2 text-sm text-gray-700">
                Wrap navigation (go to last slide from first, and vice versa)
              </label>
            </div>
          </fieldset>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-sm text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;