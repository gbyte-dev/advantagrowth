"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();

  const orderId = searchParams.get("order");
  const slug = searchParams.get("slug");

  return (
    <main className="order-success-page">

      <div className="order-success-card">

        <div className="order-success-icon">
          <i className="fas fa-check"></i>
        </div>

        <span className="order-success-label">
          ORDER CONFIRMED
        </span>

        <h1>
          Thank You!
        </h1>

        <p>
          Your order has been placed successfully.
        </p>

        {orderId && (
          <div className="order-success-number">
            <span>Order ID</span>

            <strong>
              #{orderId}
            </strong>
          </div>
        )}

        <p className="order-success-note">
          Your order is now being prepared by the restaurant.
        </p>

        {slug ? (
          <Link
            href={`/customer/restaurant/${encodeURIComponent(slug)}`}
            className="order-success-home-btn"
          >
            <i className="fas fa-utensils"></i>
            Back to Restaurant
          </Link>
        ) : (
          <Link
            href="/"
            className="order-success-home-btn"
          >
            <i className="fas fa-home"></i>
            Back to Home
          </Link>
        )}

      </div>

    </main>
  );
}