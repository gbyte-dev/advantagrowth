"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Toaster,
} from "sonner";

type ConfirmState = {
  open: boolean;

  title: string;
  message: string;

  confirmText: string;
  cancelText: string;

  danger: boolean;

  resolve:
    | ((value: boolean) => void)
    | null;
};

const initialState: ConfirmState = {
  open: false,

  title: "Confirm Action",

  message: "",

  confirmText: "Confirm",

  cancelText: "Cancel",

  danger: false,

  resolve: null,
};

export default function GlobalFeedback() {
  const [
    confirmState,
    setConfirmState,
  ] =
    useState<ConfirmState>(
      initialState
    );

  useEffect(() => {
    const handleConfirm = (
      event: Event
    ) => {
      const customEvent =
        event as CustomEvent<{
          title?: string;
          message: string;
          confirmText?: string;
          cancelText?: string;
          danger?: boolean;
          resolve:
            (
              value: boolean
            ) => void;
        }>;

      setConfirmState({
        open: true,

        title:
          customEvent.detail.title ||
          "Confirm Action",

        message:
          customEvent.detail.message,

        confirmText:
          customEvent.detail
            .confirmText ||
          "Confirm",

        cancelText:
          customEvent.detail
            .cancelText ||
          "Cancel",

        danger:
          customEvent.detail.danger ||
          false,

        resolve:
          customEvent.detail.resolve,
      });
    };

    window.addEventListener(
      "advanta-confirm",
      handleConfirm
    );

    return () => {
      window.removeEventListener(
        "advanta-confirm",
        handleConfirm
      );
    };
  }, []);

  const closeWithResult = (
    value: boolean
  ) => {
    confirmState.resolve?.(
      value
    );

    setConfirmState(
      initialState
    );
  };

  useEffect(() => {
    if (!confirmState.open) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeWithResult(
          false
        );
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, [confirmState]);

  return (
    <>
      <Toaster
        position="top-right"
        richColors
        closeButton
        expand
        visibleToasts={5}
      />

      {confirmState.open && (
        <div
          className="global-confirm-overlay"
          onMouseDown={() =>
            closeWithResult(
              false
            )
          }
        >
          <div
            className="global-confirm-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div
              className={`global-confirm-icon ${
                confirmState.danger
                  ? "global-confirm-icon-danger"
                  : ""
              }`}
            >
              <i
                className={
                  confirmState.danger
                    ? "fas fa-triangle-exclamation"
                    : "fas fa-circle-question"
                }
              />
            </div>

            <div className="global-confirm-content">
              <h3>
                {
                  confirmState.title
                }
              </h3>

              <p>
                {
                  confirmState.message
                }
              </p>
            </div>

            <div className="global-confirm-actions">
              <button
                type="button"
                className="global-confirm-cancel"
                onClick={() =>
                  closeWithResult(
                    false
                  )
                }
              >
                {
                  confirmState.cancelText
                }
              </button>

              <button
                type="button"
                className={
                  confirmState.danger
                    ? "global-confirm-danger"
                    : "global-confirm-primary"
                }
                onClick={() =>
                  closeWithResult(
                    true
                  )
                }
              >
                {
                  confirmState.confirmText
                }
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}