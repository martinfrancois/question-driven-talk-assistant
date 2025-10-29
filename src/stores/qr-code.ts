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

const DEFAULT_QR_CODE_SIZE = 100;

const useQrCodeStore = create<QrCodeState>()(
  devtools(
    persist(
      immer((set) => ({
        qrCodeUrl: "",
        qrCodeSize: DEFAULT_QR_CODE_SIZE,
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
