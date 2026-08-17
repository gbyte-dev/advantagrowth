"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import api from "@/lib/axios";

type Order = {
  id: number;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  subtotal: string | number;
  delivery_charge: string | number;
  total: string | number;
  status: string;
  payment_status: string;
  payment_method?: string | null;
  items?: {
    id: number;
    item_name: string;
    unit_price: string | number;
    quantity: number;
    total_price: string | number;
  }[];
};

export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order_id");

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!orderId) {
      router.push("/cart");
      return;
    }

    const loadOrder = async () => {
      try {
        const response = await api.get(`/orders/${orderId}`);

        if (response.data?.success && response.data?.order) {
          setOrder(response.data.order);
        } else {
          alert("Unable to load order.");
          router.push("/cart");
        }
      } catch (error) {
        console.error("ORDER LOAD ERROR:", error);

        alert("Unable to load your order.");
        router.push("/cart");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, router]);

  const handlePayment = async () => {
    if (!order) {
      return;
    }

    setProcessing(true);

    try {
      /*
      |--------------------------------------------------------------------------
      | PAYMENT GATEWAY
      |--------------------------------------------------------------------------
      |
      | Real payment gateway will be connected in the next step.
      |
      */

      console.log("PAYMENT START:", {
        order_id: order.id,
        amount: order.total,
      });

      alert(
        "Payment gateway will be connected next."
      );
    } catch (error) {
      console.error(
        "PAYMENT ERROR:",
        error
      );

      alert(
        "Unable to start payment."
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="payment-page">
        <div className="payment-loading">
          <div className="loading-spinner" />
          <p>Loading your order...</p>
        </div>
      </main>
    );
  }

  if (!order) {
    return null;
  }

  return (
    <main className="payment-page">

      <div className="payment-container">

        {/* HEADER */}

        <div className="payment-header">

          <span className="payment-label">
            SECURE CHECKOUT
          </span>

          <h1>
            Complete Your Payment
          </h1>

          <p>
            Your order has been created successfully.
            Complete the payment to confirm your order.
          </p>

        </div>


        <div className="payment-grid">

          {/* LEFT */}

          <div className="payment-left">

            <section className="payment-card">

              <div className="payment-card-header">

                <div className="payment-card-icon">
                  <i className="fas fa-receipt" />
                </div>

                <div>
                  <span>
                    ORDER
                  </span>

                  <h2>
                    Order #{order.id}
                  </h2>
                </div>

              </div>


              <div className="payment-status-box">

                <div className="payment-status-icon">
                  <i className="fas fa-check" />
                </div>

                <div>
                  <strong>
                    Order Created
                  </strong>

                  <p>
                    Your order has been successfully
                    created and is waiting for payment.
                  </p>
                </div>

              </div>

            </section>


            {/* PAYMENT METHOD */}

            <section className="payment-card">

              <div className="payment-card-header">

                <div className="payment-card-icon">
                  <i className="fas fa-credit-card" />
                </div>

                <div>
                  <span>
                    PAYMENT
                  </span>

                  <h2>
                    Choose Payment Method
                  </h2>
                </div>

              </div>


              <button
                type="button"
                className="payment-method-option active"
              >

                <div className="payment-method-icon">
                  <i className="fas fa-wallet" />
                </div>

                <div className="payment-method-info">

                  <strong>
                    Online Payment
                  </strong>

                  <span>
                    UPI, Cards, Net Banking & Wallets
                  </span>

                </div>

                <i className="fas fa-check-circle payment-method-check" />

              </button>


              <div className="payment-secure-box">

                <i className="fas fa-shield-alt" />

                <div>
                  <strong>
                    Secure Payment
                  </strong>

                  <p>
                    Your payment will be processed
                    securely through our payment gateway.
                  </p>
                </div>

              </div>

            </section>

          </div>


          {/* RIGHT */}

          <aside className="payment-right">

            <div className="payment-summary-card">

              <div className="payment-summary-header">

                <span>
                  YOUR ORDER
                </span>

                <h2>
                  Payment Summary
                </h2>

              </div>


              {/* ITEMS */}

              <div className="payment-items">

                {order.items?.map((item) => (

                  <div
                    className="payment-item"
                    key={item.id}
                  >

                    <div>

                      <strong>
                        {item.item_name}
                      </strong>

                      <span>
                        ₹
                        {Number(
                          item.unit_price
                        ).toFixed(2)}
                        {" × "}
                        {item.quantity}
                      </span>

                    </div>

                    <strong>
                      ₹
                      {Number(
                        item.total_price
                      ).toFixed(2)}
                    </strong>

                  </div>

                ))}

              </div>


              {/* TOTAL */}

              <div className="payment-summary-lines">

                <div>
                  <span>
                    Subtotal
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.subtotal
                    ).toFixed(2)}
                  </strong>
                </div>


                <div>
                  <span>
                    Delivery
                  </span>

                  <strong>
                    {Number(
                      order.delivery_charge
                    ) === 0
                      ? "FREE"
                      : `₹${Number(
                          order.delivery_charge
                        ).toFixed(2)}`}
                  </strong>
                </div>


                <div className="payment-divider" />


                <div className="payment-grand-total">

                  <span>
                    Total Payable
                  </span>

                  <strong>
                    ₹
                    {Number(
                      order.total
                    ).toFixed(2)}
                  </strong>

                </div>

              </div>


              {/* PAY BUTTON */}

              <button
                type="button"
                className="pay-now-btn"
                onClick={handlePayment}
                disabled={processing}
              >

                {processing ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-lock" />
                    Pay Now
                    <span>
                      ₹
                      {Number(
                        order.total
                      ).toFixed(2)}
                    </span>
                  </>
                )}

              </button>


              <div className="payment-footer-note">

                <i className="fas fa-shield-alt" />

                <span>
                  Secure & encrypted payment
                </span>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}