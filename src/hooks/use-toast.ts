
import * as React from "react";
import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  [key: string]: any;
};

const useToast = () => {
  const [toasts, setToasts] = React.useState<ToastProps[]>([]);

  const toast = React.useCallback((props: ToastProps) => {
    sonnerToast(props.title as string, {
      description: props.description,
      action: props.action
        ? {
            label: props.action.label,
            onClick: props.action.onClick,
          }
        : undefined,
      ...props,
    });

    setToasts((currentToasts) => [
      ...currentToasts,
      { ...props, id: Math.random().toString() },
    ]);
  }, []);

  return { toast, toasts, dismiss: () => setToasts([]) };
};

export { useToast, sonnerToast as toast };
