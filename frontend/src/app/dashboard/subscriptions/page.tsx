"use client";

import { useCallback, useEffect, useState } from "react";
import api from "@/lib/axios";
import {
  confirmDialog,
  showError,
  showSuccess,
} from "@/lib/feedback";
import {
  openRazorpayCheckout,
} from "@/lib/razorpay";


type SubscriptionPlan = {
  id: number;
  name: string;
  slug: string;
  price: string;
  currency: string;
  interval: "month" | "year";
  interval_count: number;
  is_active: boolean;
  description: string | null;
};

type RestaurantSubscription = {
  id: number;
  restaurant_id: number;
  subscription_id: number;
  status: string;
  starts_at: string | null;
  expires_at: string | null;
  cancelled_at: string | null;
  auto_renew: boolean;
  subscription: SubscriptionPlan;
};

type SubscriptionResponse = {
  success: boolean;
  plans: SubscriptionPlan[];
  current_subscription: RestaurantSubscription | null;
};

function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const responseError = error as {
      response?: {
        data?: {
          message?: string;
        };
      };
    };

    return (
      responseError.response?.data?.message ||
      fallback
    );
  }

  return fallback;
}

function formatPrice(
  price: string,
  currency: string
): string {
  const amount = Number(price);

  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function intervalLabel(
  plan: SubscriptionPlan
): string {
  const interval =
    plan.interval_count === 1
      ? plan.interval
      : `${plan.interval_count} ${plan.interval}s`;

  return `Every ${interval}`;
}

export default function OwnerSubscriptionsPage() {
  const [plans, setPlans] = useState<
    SubscriptionPlan[]
  >([]);

  const [
    currentSubscription,
    setCurrentSubscription,
  ] = useState<RestaurantSubscription | null>(
    null
  );

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    subscribingPlanId,
    setSubscribingPlanId,
  ] = useState<number | null>(null);

  const loadSubscriptions =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<SubscriptionResponse>(
            "/owner/subscriptions"
          );

        setPlans(
          response.data?.plans || []
        );

        setCurrentSubscription(
          response.data
            ?.current_subscription || null
        );
      } catch (requestError) {
        const message = getErrorMessage(
          requestError,
          "Unable to load subscription plans."
        );

        setError(message);
      } finally {
        setLoading(false);
      }
    }, []);

  useEffect(() => {
    loadSubscriptions();
  }, [loadSubscriptions]);

 const handleSubscribe = async (
  plan: SubscriptionPlan
) => {
  const isPaidPlan =
    Number(plan.price) > 0;

  const switchingPlan =
    currentSubscription !== null;

  const confirmed =
    await confirmDialog({
      title: isPaidPlan
        ? "Continue to payment?"
        : switchingPlan
          ? "Switch subscription plan?"
          : "Activate free plan?",

      message: isPaidPlan
        ? switchingPlan
          ? `Complete the payment to switch your current plan to ${plan.name}.`
          : `Complete the payment to activate ${plan.name}.`
        : switchingPlan
          ? `Your current plan will be cancelled and ${plan.name} will become active.`
          : `${plan.name} will become your active subscription plan.`,

      confirmText: isPaidPlan
        ? "Continue to Payment"
        : switchingPlan
          ? "Switch Plan"
          : "Activate Plan",

      cancelText: "Cancel",
    });

  if (!confirmed) {
    return;
  }

  setSubscribingPlanId(plan.id);

  try {
    /*
    |--------------------------------------------------------------------------
    | Free plan activation
    |--------------------------------------------------------------------------
    */

    if (!isPaidPlan) {
      const response = await api.post(
        "/owner/subscriptions/subscribe",
        {
          subscription_id: plan.id,
        }
      );

      const activatedSubscription:
        RestaurantSubscription =
          response.data.data;

      setCurrentSubscription(
        activatedSubscription
      );

      showSuccess(
        response.data.message ||
          "Subscription activated successfully."
      );

      setSubscribingPlanId(null);

      return;
    }

    /*
    |--------------------------------------------------------------------------
    | Create pending Razorpay order
    |--------------------------------------------------------------------------
    */

    const orderResponse =
      await api.post(
        "/owner/subscriptions/payment/order",
        {
          subscription_id: plan.id,
        }
      );

    const order =
      orderResponse.data.data;

    /*
    |--------------------------------------------------------------------------
    | Open Razorpay Checkout
    |--------------------------------------------------------------------------
    */

    const opened =
      await openRazorpayCheckout({
        key: order.key,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: "Advanta Growth",
        description:
          `${plan.name} subscription`,
        prefill: order.prefill,

        handler: async (
          paymentResponse
        ) => {
          try {
            const verifyResponse =
              await api.post(
                "/owner/subscriptions/payment/verify",
                paymentResponse
              );

            const activatedSubscription:
              RestaurantSubscription =
                verifyResponse.data.data
                  .subscription;

            setCurrentSubscription(
              activatedSubscription
            );

            showSuccess(
              verifyResponse.data.message ||
                "Payment successful and subscription activated."
            );
          } catch (
            verificationError
          ) {
            showError(
              getErrorMessage(
                verificationError,
                "Payment was completed but subscription verification failed."
              )
            );
          } finally {
            setSubscribingPlanId(
              null
            );
          }
        },

        onDismiss: () => {
          setSubscribingPlanId(
            null
          );
        },
      });

    if (!opened) {
      showError(
        "Unable to load Razorpay Checkout. Please try again."
      );

      setSubscribingPlanId(null);
    }
  } catch (requestError) {
    showError(
      getErrorMessage(
        requestError,
        isPaidPlan
          ? "Unable to start subscription payment."
          : "Unable to activate subscription."
      )
    );

    setSubscribingPlanId(null);
  }
};

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-emerald-600">
            Billing & subscription
          </p>

          <h1 className="text-3xl font-bold text-slate-900">
            Subscription Plans
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            View your current subscription and
            choose the plan that fits your
            restaurant.
          </p>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <i className="fas fa-spinner fa-spin text-2xl text-emerald-600" />

            <p className="mt-3 text-sm text-slate-600">
              Loading subscription plans...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <i className="fas fa-circle-exclamation mt-1 text-red-600" />

              <div>
                <h2 className="font-semibold text-red-900">
                  Unable to load subscriptions
                </h2>

                <p className="mt-1 text-sm text-red-700">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={loadSubscriptions}
                  className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <i className="fas fa-crown text-amber-500" />

                <h2 className="text-xl font-bold text-slate-900">
                  Current Plan
                </h2>
              </div>

              {currentSubscription ? (
                <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-lg">
                  <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-3">
                        <h3 className="text-2xl font-bold">
                          {
                            currentSubscription
                              .subscription.name
                          }
                        </h3>

                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
                          {
                            currentSubscription.status
                          }
                        </span>
                      </div>

                      <p className="max-w-2xl text-sm leading-6 text-emerald-50">
                        {currentSubscription
                          .subscription.description ||
                          "Your restaurant subscription is currently active."}
                      </p>
                    </div>

                    <div className="min-w-52 rounded-xl bg-white/10 p-4 backdrop-blur">
                      <div className="mb-3">
                        <p className="text-xs uppercase tracking-wide text-emerald-100">
                          Started
                        </p>

                        <p className="mt-1 font-semibold">
                          {formatDate(
                            currentSubscription.starts_at
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs uppercase tracking-wide text-emerald-100">
                          Valid until
                        </p>

                        <p className="mt-1 font-semibold">
                          {formatDate(
                            currentSubscription.expires_at
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center">
                  <i className="fas fa-receipt text-3xl text-slate-300" />

                  <h3 className="mt-3 font-semibold text-slate-900">
                    No active subscription
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Select one of the available
                    plans below.
                  </p>
                </div>
              )}
            </section>

            <section>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-slate-900">
                  Available Plans
                </h2>

                <p className="mt-1 text-sm text-slate-600">
                  Only active plans are shown here.
                </p>
              </div>

              {plans.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
                  <i className="fas fa-box-open text-3xl text-slate-300" />

                  <h3 className="mt-3 font-semibold text-slate-900">
                    No plans available
                  </h3>

                  <p className="mt-1 text-sm text-slate-500">
                    Please check again later.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {plans.map((plan) => {
                    const isCurrent =
                      currentSubscription
                        ?.subscription_id ===
                      plan.id;

                    const isSubmitting =
                      subscribingPlanId ===
                      plan.id;

                    return (
                      <article
                        key={plan.id}
                        className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                          isCurrent
                            ? "border-emerald-400 ring-2 ring-emerald-100"
                            : "border-slate-200"
                        }`}
                      >
                        {isCurrent && (
                          <span className="absolute right-4 top-4 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                            Current Plan
                          </span>
                        )}

                        <div className="mb-5">
                          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <i className="fas fa-gem" />
                          </div>

                          <h3 className="pr-24 text-xl font-bold text-slate-900">
                            {plan.name}
                          </h3>

                          <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                            {plan.description ||
                              "Subscription plan for your restaurant."}
                          </p>
                        </div>

                        <div className="mb-6">
                          <div className="flex items-end gap-2">
                            <span className="text-3xl font-bold text-slate-900">
                              {formatPrice(
                                plan.price,
                                plan.currency
                              )}
                            </span>
                          </div>

                          <p className="mt-1 text-sm text-slate-500">
                            {intervalLabel(plan)}
                          </p>
                        </div>
                        <button
                          type="button"
                          disabled={
                            isCurrent ||
                            subscribingPlanId !== null
                          }
                          onClick={() =>
                            handleSubscribe(plan)
                          }
                          className={`mt-auto w-full rounded-xl px-4 py-3 text-sm font-bold transition ${
                            isCurrent
                              ? "cursor-not-allowed bg-emerald-50 text-emerald-700"
                              : "bg-slate-900 text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                          }`}
                        >
                          {isSubmitting ? (
                            <>
                              <i className="fas fa-spinner fa-spin mr-2" />
                              Activating...
                            </>
                          ) : isCurrent ? (
                            "Active Plan"
                          ) : Number(plan.price) > 0 ? (
                            currentSubscription
                              ? "Pay & Switch Plan"
                              : "Buy Plan"
                          ) : currentSubscription ? (
                            "Switch to Free Plan"
                          ) : (
                            "Activate Free Plan"
                          )}
                        </button>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}