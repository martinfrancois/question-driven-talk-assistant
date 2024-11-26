import {
  layoutMigrateFromLocalStorage,
  onboardingMigrateFromLocalStorage,
  preferencesMigrateFromLocalStorage,
  qrCodeMigrateFromLocalStorage,
  questionsMigrateFromLocalStorage,
} from "./stores";

// TODO remove from around 03/2025
export function migrateLocalStorage() {
  layoutMigrateFromLocalStorage();
  onboardingMigrateFromLocalStorage();
  preferencesMigrateFromLocalStorage();
  qrCodeMigrateFromLocalStorage();
  questionsMigrateFromLocalStorage();
}
