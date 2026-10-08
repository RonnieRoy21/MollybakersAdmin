import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useState,
} from "react";

type ToastSeverity = "success" | "error";
type Toast = { message: string; severity: ToastSeverity };
type Notify = (message: string, severity?: ToastSeverity) => void;

const ToastContext = createContext<Notify | null>(null);

export function useToast(): Notify {
  const notify = useContext(ToastContext);
  if (!notify) throw new Error("useToast must be used within ToastProvider.");
  return notify;
}

export default function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<Toast | null>(null);
  const notify: Notify = (message, severity = "success") =>
    setToast({ message, severity });

  return (
    <ToastContext.Provider value={notify}>
      {children}
      <Snackbar
        open={toast !== null}
        autoHideDuration={5000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.severity ?? "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast?.message}
        </Alert>
      </Snackbar>
    </ToastContext.Provider>
  );
}
