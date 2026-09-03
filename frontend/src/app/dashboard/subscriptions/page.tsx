"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
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

  const plansTrackRef =
    useRef<HTMLDivElement | null>(null);

  const [plansScrollable, setPlansScrollable] =
    useState(false);

  const updatePlansScrollable =
    useCallback(() => {
      const el = plansTrackRef.current;

      if (!el) {
        return;
      }

      setPlansScrollable(
        el.scrollWidth - el.clientWidth > 4
      );
    }, []);

  const scrollPlans = (direction: 1 | -1) => {
    const el = plansTrackRef.current;

    if (!el) {
      return;
    }

    el.scrollBy({
      left:
        direction * el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

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

  useEffect(() => {
    updatePlansScrollable();

    window.addEventListener(
      "resize",
      updatePlansScrollable
    );

    return () => {
      window.removeEventListener(
        "resize",
        updatePlansScrollable
      );
    };
  }, [plans, loading, error, updatePlansScrollable]);

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

      window.dispatchEvent(
      new CustomEvent(
        "subscriptionUpdated",
        {
          detail: {
            active: true,
          },
        }
      )
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
            window.dispatchEvent(
            new CustomEvent(
              "subscriptionUpdated",
              {
                detail: {
                  active: true,
                },
              }
            )
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
    <div className="dashboard-page subscriptions-page">
      <div className="dashboard-container">
        <div className="subscriptions-header">
          <div>
            <h1>Subscription Plans</h1>

            <p>
              View your current subscription and
              choose the plan that fits your
              restaurant.
            </p>
          </div>
        </div>

        {loading && (
          <div className="subs-state-card">
            <i className="fas fa-spinner fa-spin" />

            <p>Loading subscription plans...</p>
          </div>
        )}

        {!loading && error && (
          <div className="subs-error-card">
            <i className="fas fa-circle-exclamation" />

            <div>
              <h2>Unable to load subscriptions</h2>

              <p>{error}</p>

              <button
                type="button"
                onClick={loadSubscriptions}
                className="subs-retry-btn"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="subs-section">
              <div className="subs-section-head">
                <h2>
                  <i className="fas fa-crown" />
                  Current Plan
                </h2>
              </div>

              {currentSubscription ? (
                <div className="current-plan-card">
                  <div className="current-plan-main">
                    <div className="current-plan-badge-row">
                      <span className="current-plan-icon">
                        <i className="fas fa-gem" />
                      </span>

                      <div>
                        <h3>
                          {
                            currentSubscription
                              .subscription.name
                          }
                        </h3>

                        <span className="current-plan-status">
                          {currentSubscription.status}
                        </span>
                      </div>
                    </div>

                    <p className="current-plan-desc">
                      {currentSubscription
                        .subscription.description ||
                        "Your restaurant subscription is currently active."}
                    </p>

                    <div className="current-plan-price">
                      <span className="amount">
                        {formatPrice(
                          currentSubscription
                            .subscription.price,
                          currentSubscription
                            .subscription.currency
                        )}
                      </span>

                      <span className="interval">
                        {intervalLabel(
                          currentSubscription.subscription
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="current-plan-meta">
                    <div className="current-plan-meta-item">
                      <span className="label">
                        <i className="fas fa-calendar-check" />
                        Started
                      </span>

                      <span className="value">
                        {formatDate(
                          currentSubscription.starts_at
                        )}
                      </span>
                    </div>

                    <div className="current-plan-meta-item">
                      <span className="label">
                        <i className="fas fa-hourglass-half" />
                        Valid until
                      </span>

                      <span className="value">
                        {formatDate(
                          currentSubscription.expires_at
                        )}
                      </span>
                    </div>

                    <div className="current-plan-meta-item">
                      <span className="label">
                        <i className="fas fa-rotate" />
                        Auto renew
                      </span>

                      <span className="value">
                        {currentSubscription.auto_renew
                          ? "On"
                          : "Off"}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="subs-empty-card">
                  <i className="fas fa-receipt" />

                  <h3>No active subscription</h3>

                  <p>
                    Select one of the available plans
                    below.
                  </p>
                </div>
              )}
            </section>

            <section className="subs-section">
              <div className="subs-section-head">
                <h2>
                  <i className="fas fa-layer-group" />
                  Available Plans
                </h2>

                <p>Only active plans are shown here.</p>
              </div>

              {plans.length === 0 ? (
                <div className="subs-empty-card">
                  <i className="fas fa-box-open" />

                  <h3>No plans available</h3>

                  <p>Please check again later.</p>
                </div>
              ) : (
                <div
                  className="plan-carousel"
                  data-scrollable={plansScrollable}
                >
                  <button
                    type="button"
                    className="plan-carousel-nav plan-carousel-prev"
                    onClick={() => scrollPlans(-1)}
                    aria-label="Previous plans"
                  >
                    <i className="fas fa-chevron-left" />
                  </button>

                  <div
                    className="plan-track"
                    ref={plansTrackRef}
                  >
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
                        className={`plan-card ${
                          isCurrent
                            ? "plan-card-current"
                            : ""
                        }`}
                      >
                        {isCurrent && (
                          <span className="plan-card-tag">
                            Current Plan
                          </span>
                        )}

                        <div className="plan-card-icon">
                          <i className="fas fa-gem" />
                        </div>

                        <h3 className="plan-card-name">
                          {plan.name}
                        </h3>

                        <p className="plan-card-desc">
                          {plan.description ||
                            "Subscription plan for your restaurant."}
                        </p>

                        <div className="plan-card-price">
                          <span className="amount">
                            {formatPrice(
                              plan.price,
                              plan.currency
                            )}
                          </span>

                          <span className="interval">
                            {intervalLabel(plan)}
                          </span>
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
                          className={`plan-card-btn ${
                            isCurrent
                              ? "plan-card-btn-current"
                              : ""
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

                  <button
                    type="button"
                    className="plan-carousel-nav plan-carousel-next"
                    onClick={() => scrollPlans(1)}
                    aria-label="Next plans"
                  >
                    <i className="fas fa-chevron-right" />
                  </button>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}