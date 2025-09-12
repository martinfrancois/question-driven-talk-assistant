import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { StorageName } from "./index.ts";

interface LayoutState {
  title: string;
  footer: string;
  setTitle: (title: string) => void;
  setFooter: (footer: string) => void;
}

const useLayoutStore = create<LayoutState>()(
  devtools(
    persist(
      immer((set) => ({
        title: "Ask me anything",
        footer: "François Martin | www.fmartin.ch",
        setTitle: (title) =>
          set((state) => {
            state.title = title;
          }),
        setFooter: (footer) =>
          set((state) => {
            state.footer = footer;
          }),
      })),
      {
        name: StorageName.LAYOUT,
      },
    ),
    { name: "Layout Store" },
  ),
);

export const useTitle = () => useLayoutStore((state) => state.title);
export const useSetTitle = () => useLayoutStore((state) => state.setTitle);

export const useFooter = () => useLayoutStore((state) => state.footer);
export const useSetFooter = () => useLayoutStore((state) => state.setFooter);
