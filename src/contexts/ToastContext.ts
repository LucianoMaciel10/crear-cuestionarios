import { createContext } from "react";

type ToastContextType = {
  showToast: (message: string, type?: "info" | "success" | "warning" | "error") => void;
};

export const ToastContext = createContext<ToastContextType | undefined>(undefined);