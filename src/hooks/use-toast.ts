
import * as React from "react";
import { toast as sonnerToast, type Toast as SonnerToast } from "sonner";

export type ToastProps = SonnerToast & {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
};

const useToast = () => {
  const toast = (props: ToastProps) => {
    sonnerToast(props.title, {
      description: props.description,
      action: props.action
        ? {
            label: props.action.label,
            onClick: props.action.onClick,
          }
        : undefined,
      ...props,
    });
  };

  return { toast };
};

export { useToast, sonnerToast as toast };
