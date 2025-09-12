import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { StorageName } from "./index.ts";

interface OnboardingState {
  tourCompleted: boolean;
  completeTour: () => void;
  restartTour: () => void;
}

const useOnboardingStore = create<OnboardingState>()(
  devtools(
    persist(
      immer((set) => ({
        tourCompleted:
          (typeof window !== "undefined" &&
            window?.location?.href?.endsWith("disable-tour")) ??
          false,
        completeTour: () =>
          set((state) => {
            state.tourCompleted = true;
          }),
        restartTour: () =>
          set((state) => {
            state.tourCompleted = false;
          }),
      })),
      {
        name: StorageName.ONBOARDING,
      },
    ),
    { name: "Onboarding Store" },
  ),
);

export const useTourCompleted = () =>
  useOnboardingStore((state) => state.tourCompleted);
export const useCompleteTour = () =>
  useOnboardingStore((state) => state.completeTour);
export const useRestartTour = () =>
  useOnboardingStore((state) => state.restartTour);
