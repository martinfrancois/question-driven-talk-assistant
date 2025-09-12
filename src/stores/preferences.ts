import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { StorageName } from "./index.ts";

interface PreferencesState {
  fontSize: number;
  darkMode: boolean;
  timeFormat24h: boolean;
  increaseFontSize: () => void;
  decreaseFontSize: () => void;
  toggleDarkMode: () => void;
  toggleTimeFormat: () => void;
}

const usePreferencesStore = create<PreferencesState>()(
  devtools(
    persist(
      immer((set) => ({
        fontSize: 34,
        darkMode: false,
        timeFormat24h: true,
        increaseFontSize: () =>
          set((state) => {
            state.fontSize += 2;
          }),
        decreaseFontSize: () =>
          set((state) => {
            state.fontSize = Math.max(12, state.fontSize - 2);
          }),
        toggleDarkMode: () =>
          set((state) => {
            state.darkMode = !state.darkMode;
          }),
        toggleTimeFormat: () =>
          set((state) => {
            state.timeFormat24h = !state.timeFormat24h;
          }),
      })),
      {
        name: StorageName.PREFERENCES, // Name of the storage (localStorage key)
      },
    ),
    { name: "Preferences Store" },
  ),
);

export const useFontSize = () => usePreferencesStore((state) => state.fontSize);
export const useIncreaseFontSize = () =>
  usePreferencesStore((state) => state.increaseFontSize);
export const useDecreaseFontSize = () =>
  usePreferencesStore((state) => state.decreaseFontSize);

export const useDarkMode = () => usePreferencesStore((state) => state.darkMode);
export const useToggleDarkMode = () =>
  usePreferencesStore((state) => state.toggleDarkMode);

export const useTimeFormat24h = () =>
  usePreferencesStore((state) => state.timeFormat24h);
export const useToggleTimeFormat = () =>
  usePreferencesStore((state) => state.toggleTimeFormat);
