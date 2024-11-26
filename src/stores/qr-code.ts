import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import { StorageName } from "./index.ts";

interface QrCodeState {
  qrCodeUrl: string;
  qrCodeSize: number;
  setQrCodeUrl: (url: string) => void;
  setQrCodeSize: (size: number) => void;
}

const useQrCodeStore = create<QrCodeState>()(
  devtools(
    persist(
      immer((set) => ({
        qrCodeUrl: "",
        qrCodeSize: 100,
        setQrCodeUrl: (url) =>
          set((state) => {
            state.qrCodeUrl = url;
          }),
        setQrCodeSize: (size) =>
          set((state) => {
            state.qrCodeSize = size;
          }),
      })),
      {
        name: StorageName.QR_CODE,
      },
    ),
    { name: "QR Code Store" },
  ),
);

export const useQrCodeUrl = () => useQrCodeStore((state) => state.qrCodeUrl);
export const useSetQrCodeUrl = () =>
  useQrCodeStore((state) => state.setQrCodeUrl);

export const useQrCodeSize = () => useQrCodeStore((state) => state.qrCodeSize);
export const useSetQrCodeSize = () =>
  useQrCodeStore((state) => state.setQrCodeSize);

// TODO remove from around 03/2025
export function qrCodeMigrateFromLocalStorage() {
  // Migrate qrCodeUrl
  const qrCodeUrl = localStorage.getItem("qrCodeURL");
  if (qrCodeUrl !== null) {
    useQrCodeStore.setState({ qrCodeUrl });
    localStorage.removeItem("qrCodeURL");
  }

  // Migrate qrCodeSize
  const qrCodeSize = localStorage.getItem("qrCodeSize");
  if (qrCodeSize !== null) {
    useQrCodeStore.setState({ qrCodeSize: parseFloat(qrCodeSize) });
    localStorage.removeItem("qrCodeSize");
  }
}
