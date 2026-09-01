export type RazorpayPaymentResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayPrefill = {
  name?: string;
  email?: string;
  contact?: string;
};

export type RazorpayCheckoutOptions = {
  key: string;
  amount: number;
  currency: string;
  order_id: string;
  name: string;
  description: string;
  prefill?: RazorpayPrefill;
  handler: (
    response: RazorpayPaymentResponse
  ) => void | Promise<void>;
  onDismiss?: () => void;
};

type RazorpayInstance = {
  open: () => void;
};

type RazorpayConstructor = new (
  options: {
    key: string;
    amount: number;
    currency: string;
    order_id: string;
    name: string;
    description: string;
    prefill?: RazorpayPrefill;
    handler: (
      response: RazorpayPaymentResponse
    ) => void | Promise<void>;
    theme: {
      color: string;
    };
    modal: {
      ondismiss: () => void;
    };
  }
) => RazorpayInstance;

declare global {
  interface Window {
    Razorpay?: RazorpayConstructor;
  }
}

let scriptPromise:
  Promise<boolean> | null = null;

export function loadRazorpayCheckout():
  Promise<boolean> {
  if (
    typeof window === "undefined"
  ) {
    return Promise.resolve(false);
  }

  if (window.Razorpay) {
    return Promise.resolve(true);
  }

  if (scriptPromise) {
    return scriptPromise;
  }

  scriptPromise = new Promise(
    (resolve) => {
      const existingScript =
        document.querySelector<HTMLScriptElement>(
          'script[src="https://checkout.razorpay.com/v1/checkout.js"]'
        );

      if (existingScript) {
        existingScript.addEventListener(
          "load",
          () => resolve(true),
          { once: true }
        );

        existingScript.addEventListener(
          "error",
          () => resolve(false),
          { once: true }
        );

        return;
      }

      const script =
        document.createElement("script");

      script.src =
        "https://checkout.razorpay.com/v1/checkout.js";

      script.async = true;

      script.onload = () =>
        resolve(true);

      script.onerror = () =>
        resolve(false);

      document.body.appendChild(
        script
      );
    }
  );

  return scriptPromise;
}

export async function openRazorpayCheckout(
  options: RazorpayCheckoutOptions
): Promise<boolean> {
  const loaded =
    await loadRazorpayCheckout();

  if (
    !loaded ||
    !window.Razorpay
  ) {
    return false;
  }

  const checkout =
    new window.Razorpay({
      key: options.key,
      amount: options.amount,
      currency: options.currency,
      order_id: options.order_id,
      name: options.name,
      description:
        options.description,
      prefill: options.prefill,
      handler: options.handler,
      theme: {
        color: "#059669",
      },
      modal: {
        ondismiss: () => {
          options.onDismiss?.();
        },
      },
    });

  checkout.open();

  return true;
}