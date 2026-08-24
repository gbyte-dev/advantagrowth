import { toast } from "sonner";

export const showSuccess = (
  message: string
) => {
  toast.success(message, {
    duration: 3500,
  });
};

export const showError = (
  message: string
) => {
  toast.error(message, {
    duration: 4500,
  });
};

export const showInfo = (
  message: string
) => {
  toast.info(message, {
    duration: 3500,
  });
};

export const showWarning = (
  message: string
) => {
  toast.warning(message, {
    duration: 4000,
  });
};

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

export const confirmDialog = (
  options: ConfirmOptions
): Promise<boolean> => {
  return new Promise(
    (resolve) => {
      window.dispatchEvent(
        new CustomEvent(
          "advanta-confirm",
          {
            detail: {
              ...options,
              resolve,
            },
          }
        )
      );
    }
  );
};