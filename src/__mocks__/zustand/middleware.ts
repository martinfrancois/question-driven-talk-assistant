import type { StateCreator, StoreMutatorIdentifier } from "zustand";
import type { PersistOptions, DevtoolsOptions } from "zustand/middleware";
export * from "zustand/middleware";

export const persist = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mss extends [StoreMutatorIdentifier, unknown][] = [],
>(
  creator: StateCreator<T, Mps, Mss>,
  options?: PersistOptions<T>,
): StateCreator<T, Mps, Mss> => {
  void options;
  return creator;
};

export const devtools = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mss extends [StoreMutatorIdentifier, unknown][] = [],
>(
  creator: StateCreator<T, Mps, Mss>,
  options?: DevtoolsOptions,
): StateCreator<T, Mps, Mss> => {
  void options;
  return creator;
};
