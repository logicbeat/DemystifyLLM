import React, { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import {
  resetPreferences,
  setControlBarPosition,
  setTheme,
  setWrapNavigation,
} from "../store/preferencesSlice";
import type { ControlBarPosition, Theme } from "../types";

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const preferences = useAppSelector((state) => state.preferences);

  const handlePositionChange = useCallback(
    (position: ControlBarPosition) => {
      dispatch(setControlBarPosition(position));
    },
    [dispatch]
  );

  const handleThemeChange = useCallback(
    (theme: Theme) => {
      dispatch(setTheme(theme));
    },
    [dispatch]
  );

  const handleWrapNavigationChange = useCallback(
    (wrap: boolean) => {
      dispatch(setWrapNavigation(wrap));
    },
    [dispatch]
  );

  const handleReset = useCallback(() => {
    dispatch(resetPreferences());
  }, [dispatch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4 transition-colors duration-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 focus:outline-none"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {/* Control Bar Position */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Control Bar Position
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {(["top", "bottom", "left", "right"] as ControlBarPosition[]).map(
                (position) => (
                  <button
                    key={position}
                    onClick={() => handlePositionChange(position)}
                    className={`px-3 py-2 text-sm rounded-md border transition-colors duration-200 ${
                      preferences.controlBarPosition === position
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                    }`}
                  >
                    {position.charAt(0).toUpperCase() + position.slice(1)}
                  </button>
                )
              )}
            </div>
          </fieldset>

          {/* Theme */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Theme
            </legend>
            <div className="flex gap-2">
              {(["light", "dark"] as Theme[]).map((theme) => (
                <button
                  key={theme}
                  onClick={() => handleThemeChange(theme)}
                  className={`flex-1 px-3 py-2 text-sm rounded-md border transition-colors duration-200 ${
                    preferences.theme === theme
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600"
                  }`}
                >
                  {theme.charAt(0).toUpperCase() + theme.slice(1)}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Navigation Behavior */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Navigation Behavior
            </legend>
            <div className="flex items-center">
              <input
                id="wrap-navigation"
                type="checkbox"
                checked={preferences.wrapNavigation}
                onChange={(e) => handleWrapNavigationChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded"
              />
              <label
                htmlFor="wrap-navigation"
                className="ml-2 text-sm text-gray-700 dark:text-gray-300"
              >
                Wrap navigation (go to last slide from first, and vice versa)
              </label>
            </div>
          </fieldset>

          {/* Keyboard Shortcuts Info */}
          <fieldset>
            <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Keyboard Shortcuts
            </legend>
            <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
              <div>← → Arrow keys: Navigate slides</div>
              <div>Home: Go to first slide</div>
              <div>End: Go to last slide</div>
              <div>Esc: Close settings</div>
            </div>
          </fieldset>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t dark:border-gray-700">
            <button
              onClick={handleReset}
              className="flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
            >
              Reset to Defaults
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm text-white bg-blue-600 border border-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(SettingsPanel);
