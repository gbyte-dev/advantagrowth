"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import api from "@/lib/axios";

type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

type Payment = {
  id: number;
  provider_order_id: string;
  provider_payment_id: string | null;
  amount: string;
  currency: string;
  status: PaymentStatus;
  payment_method: string | null;
  paid_at: string | null;
  created_at: string;
  restaurant: {
    id: number;
    name: string;
    email: string;
  };
  subscription: {
    id: number;
    name: string;
    slug: string;
  };
  restaurant_subscription: {
    id: number;
    status: string;
    starts_at: string | null;
    expires_at: string | null;
  } | null;
};

type PaymentSummary = {
  status_counts: {
    pending: number;
    paid: number;
    failed: number;
    refunded: number;
  };
  paid_totals_by_currency: {
    currency: string;
    payments_count: number;
    total_amount: string;
  }[];
};

type PaymentApiResponse = {
  success: boolean;
  data: {
    data: Payment[];
    current_page: number;
    last_page: number;
    total: number;
  };
  summary: PaymentSummary;
};

function formatAmount(
  amount: string,
  currency: string
): string {
  try {
    return new Intl.NumberFormat(
      "en",
      {
        style: "currency",
        currency,
      }
    ).format(Number(amount));
  } catch {
    return `${currency} ${amount}`;
  }
}

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(new Date(value));
}

function statusClasses(
  status: PaymentStatus
): string {
  if (status === "paid") {
    return "bg-emerald-100 text-emerald-700";
  }

  if (status === "pending") {
    return "bg-amber-100 text-amber-700";
  }

  if (status === "refunded") {
    return "bg-blue-100 text-blue-700";
  }

  return "bg-red-100 text-red-700";
}

export default function SubscriptionPaymentsPage() {
  const [payments, setPayments] =
    useState<Payment[]>([]);

  const [summary, setSummary] =
    useState<PaymentSummary>({
      status_counts: {
        pending: 0,
        paid: 0,
        failed: 0,
        refunded: 0,
      },
      paid_totals_by_currency: [],
    });

  const [status, setStatus] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [lastPage, setLastPage] =
    useState(1);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const loadPayments = useCallback(
    async (requestedPage: number) => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get<PaymentApiResponse>(
            "/superadmin/subscription-payments",
            {
              params: {
                page: requestedPage,
                per_page: 20,
                status:
                  status || undefined,
              },
            }
          );

        setPayments(
          response.data.data.data
        );

        setSummary(
          response.data.summary
        );

        setPage(
          response.data.data
            .current_page
        );

        setLastPage(
          response.data.data.last_page
        );

        setTotal(
          response.data.data.total
        );
      } catch (requestError) {
        console.error(
          "Payment history error:",
          requestError
        );

        setError(
          "Unable to load subscription payments."
        );
      } finally {
        setLoading(false);
      }
    },
    [status]
  );

  useEffect(() => {
    loadPayments(1);
  }, [loadPayments]);

  const cards = [
    {
      label: "Paid",
      value:
        summary.status_counts.paid,
      icon: "fa-circle-check",
      color:
        "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending",
      value:
        summary.status_counts.pending,
      icon: "fa-clock",
      color:
        "bg-amber-50 text-amber-700",
    },
    {
      label: "Failed",
      value:
        summary.status_counts.failed,
      icon: "fa-circle-xmark",
      color:
        "bg-red-50 text-red-700",
    },
    {
      label: "Refunded",
      value:
        summary.status_counts.refunded,
      icon: "fa-rotate-left",
      color:
        "bg-blue-50 text-blue-700",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-violet-600">
              Subscription billing
            </p>

            <h1 className="text-3xl font-bold text-slate-900">
              Payments
            </h1>

            <p className="mt-2 text-sm text-slate-600">
              View Razorpay subscription
              payments received from
              restaurants.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              loadPayments(page)
            }
            className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-600"
          >
            <i className="fas fa-rotate mr-2" />
            Refresh
          </button>
        </div>

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div
                className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}
              >
                <i
                  className={`fas ${card.icon}`}
                />
              </div>

              <p className="text-sm text-slate-500">
                {card.label}
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-900">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        {summary
          .paid_totals_by_currency
          .length > 0 && (
          <div className="mb-6 flex flex-wrap gap-3">
            {summary
              .paid_totals_by_currency
              .map((item) => (
                <div
                  key={item.currency}
                  className="rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3"
                >
                  <p className="text-xs font-semibold uppercase text-emerald-600">
                    Received in{" "}
                    {item.currency}
                  </p>

                  <p className="mt-1 text-xl font-bold text-emerald-800">
                    {formatAmount(
                      item.total_amount,
                      item.currency
                    )}
                  </p>
                </div>
              ))}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-bold text-slate-900">
                Payment History
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {total} payment records
              </p>
            </div>

            <select
              value={status}
              onChange={(event) =>
                setStatus(
                    event.target.value
                )
                }
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-violet-500"
            >
              <option value="">
                All statuses
              </option>
              <option value="paid">
                Paid
              </option>
              <option value="pending">
                Pending
              </option>
              <option value="failed">
                Failed
              </option>
              <option value="refunded">
                Refunded
              </option>
            </select>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500">
              <i className="fas fa-spinner fa-spin mr-2" />
              Loading payments...
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-600">
              {error}
            </div>
          ) : payments.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              No payments found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-5 py-4">
                      Restaurant
                    </th>
                    <th className="px-5 py-4">
                      Plan
                    </th>
                    <th className="px-5 py-4">
                      Amount
                    </th>
                    <th className="px-5 py-4">
                      Status
                    </th>
                    <th className="px-5 py-4">
                      Method
                    </th>
                    <th className="px-5 py-4">
                      Payment ID
                    </th>
                    <th className="px-5 py-4">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {payments.map(
                    (payment) => (
                      <tr
                        key={payment.id}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-5 py-4">
                          <p className="font-semibold text-slate-900">
                            {
                              payment
                                .restaurant
                                .name
                            }
                          </p>

                          <p className="text-xs text-slate-500">
                            {
                              payment
                                .restaurant
                                .email
                            }
                          </p>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-700">
                          {
                            payment
                              .subscription
                              .name
                          }
                        </td>

                        <td className="px-5 py-4 font-bold text-slate-900">
                          {formatAmount(
                            payment.amount,
                            payment.currency
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${statusClasses(
                              payment.status
                            )}`}
                          >
                            {payment.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm capitalize text-slate-600">
                          {payment.payment_method ||
                            "—"}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs text-slate-500">
                          {payment.provider_payment_id ||
                            payment.provider_order_id}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(
                            payment.paid_at ||
                              payment.created_at
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 p-4">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() =>
                loadPayments(page - 1)
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <span className="text-sm text-slate-500">
              Page {page} of {lastPage}
            </span>

            <button
              type="button"
              disabled={
                page >= lastPage
              }
              onClick={() =>
                loadPayments(page + 1)
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}