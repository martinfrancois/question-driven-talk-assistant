import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { StorageName } from "./index.ts";

interface OnboardingState {
  tourCompleted: boolean;
  completeTour: () => void;
  restartTour: () => void;
}

// Links ending in "disable-tour" open the app without the guided tour.
export const isTourDisabledByUrl = (href: string | undefined): boolean =>
  href?.endsWith("disable-tour") ?? false;

const useOnboardingStore = create<OnboardingState>()(
  devtools(
    persist(
      immer((set) => ({
        tourCompleted: isTourDisabledByUrl(
          typeof window === "undefined" ? undefined : window.location.href,
        ),
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
