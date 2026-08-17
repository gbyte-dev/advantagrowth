"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import "../customer/restaurant/[slug]/restaurant.css";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  description?: string | null;
  food_type?: string;
};

const CART_KEY = "restaurant_cart";

export default function CartPage() {
 const router = useRouter();
const searchParams = useSearchParams();

const slug = searchParams.get("slug");

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // ============================================================
  // LOAD CART
  // ============================================================

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_KEY);

      if (savedCart) {
        const parsedCart = JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      }
    } catch (error) {
      console.error("Failed to load cart:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  // ============================================================
  // SAVE CART
  // ============================================================

  useEffect(() => {
    if (!loaded) return;

    localStorage.setItem(
      CART_KEY,
      JSON.stringify(cartItems)
    );

    // Notify other components
    window.dispatchEvent(new Event("cartUpdated"));
  }, [cartItems, loaded]);

  // ============================================================
  // UPDATE QUANTITY
  // ============================================================

  const updateQuantity = (
    id: number,
    change: number
  ) => {
    setCartItems((current) =>
      current
        .map((item) => {
          if (item.id !== id) {
            return item;
          }

          const newQuantity =
            item.quantity + change;

          return {
            ...item,
            quantity:
              newQuantity < 1
                ? 1
                : newQuantity,
          };
        })
    );
  };

  // ============================================================
  // REMOVE ITEM
  // ============================================================

  const removeItem = (id: number) => {
    setCartItems((current) =>
      current.filter(
        (item) => item.id !== id
      )
    );
  };

  // ============================================================
  // CLEAR CART
  // ============================================================

  const clearCart = () => {
    setCartItems([]);
  };

  // ============================================================
  // TOTALS
  // ============================================================

  const totalItems = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total + item.quantity,
      0
    );
  }, [cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce(
      (total, item) =>
        total +
        Number(item.price) *
          item.quantity,
      0
    );
  }, [cartItems]);

  const deliveryFee =
    subtotal > 0 ? 0 : 0;

  const total =
    subtotal + deliveryFee;

  // ============================================================
  // CHECKOUT
  // ============================================================

  const handleCheckout = () => {
  if (cartItems.length === 0) {
    return;
  }

  if (!slug) {
    alert("Restaurant information is missing.");
    return;
  }

  router.push(
    `/checkout?slug=${encodeURIComponent(slug)}`
  );
};

  // ============================================================
  // LOADING
  // ============================================================

  if (!loaded) {
    return (
      <main className="cart-page">
        <div className="cart-page-loading">
          <div className="loading-spinner"></div>
          <p>Loading your cart...</p>
        </div>
      </main>
    );
  }

  // ============================================================
  // EMPTY CART
  // ============================================================

  if (cartItems.length === 0) {
    return (
      <main className="cart-page">

        <div className="cart-page-container">

          <div className="cart-page-header">
            <span className="cart-page-label">
              YOUR ORDER
            </span>

            <h1>
              Your Cart
            </h1>

            <p>
              Your cart is currently empty.
            </p>
          </div>

          <div className="cart-empty-page">

            <div className="cart-empty-icon">
              <i className="fas fa-shopping-cart"></i>
            </div>

            <h2>
              Your cart is empty
            </h2>

            <p>
              Add some delicious items from
              the menu to get started.
            </p>

            <button
              type="button"
              className="cart-back-menu-btn"
              onClick={() =>
                router.back()
              }
            >
              <i className="fas fa-utensils"></i>
              Back to Menu
            </button>

          </div>

        </div>

      </main>
    );
  }

  // ============================================================
  // CART PAGE
  // ============================================================

  return (
    <main className="cart-page">

      <div className="cart-page-container">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div className="cart-page-header">

          <div>
            <span className="cart-page-label">
              YOUR ORDER
            </span>

            <h1>
              Your Cart
            </h1>

            <p>
              {totalItems}{" "}
              {totalItems === 1
                ? "item"
                : "items"}{" "}
              in your cart
            </p>
          </div>

          <button
            type="button"
            className="cart-continue-btn"
            onClick={() =>
              router.back()
            }
          >
            <i className="fas fa-arrow-left"></i>
            Continue Shopping
          </button>

        </div>


        {/* ======================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="cart-page-grid">

          {/* ====================================================
              LEFT — ITEMS
          ==================================================== */}

          <div className="cart-page-items">

            <div className="cart-page-items-header">

              <h3>
                Order Items
              </h3>

              <button
                type="button"
                className="cart-clear-btn"
                onClick={clearCart}
              >
                <i className="fas fa-trash"></i>
                Clear Cart
              </button>

            </div>


            {cartItems.map((item) => (

              <div
                className="cart-page-item"
                key={item.id}
              >

                {/* IMAGE */}

                <div className="cart-page-item-image">
                  <i className="fas fa-utensils"></i>
                </div>


                {/* DETAILS */}

                <div className="cart-page-item-details">

                  <h4>
                    {item.name}
                  </h4>

                  {item.description && (
                    <p>
                      {item.description}
                    </p>
                  )}

                  {item.food_type && (
                    <span className="cart-page-item-type">
                      {item.food_type}
                    </span>
                  )}

                  <div className="cart-page-item-price">
                    ₹
                    {Number(item.price).toFixed(2)}
                  </div>

                </div>


                {/* QUANTITY */}

                <div className="cart-page-item-actions">

                  <div className="cart-page-quantity">

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          -1
                        )
                      }
                    >
                      −
                    </button>

                    <span>
                      {item.quantity}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(
                          item.id,
                          1
                        )
                      }
                    >
                      +
                    </button>

                  </div>

                  <strong className="cart-page-item-total">
                    ₹
                    {(
                      Number(item.price) *
                      item.quantity
                    ).toFixed(2)}
                  </strong>

                  <button
                    type="button"
                    className="cart-page-remove"
                    onClick={() =>
                      removeItem(item.id)
                    }
                  >
                    <i className="fas fa-trash-alt"></i>
                    Remove
                  </button>

                </div>

              </div>

            ))}

          </div>


          {/* ====================================================
              RIGHT — SUMMARY
          ==================================================== */}

          <aside className="cart-page-summary">

            <div className="cart-summary-card">

              <div className="cart-summary-card-header">

                <span>
                  ORDER SUMMARY
                </span>

                <h3>
                  Checkout
                </h3>

              </div>


              <div className="cart-summary-line">

                <span>
                  Items
                </span>

                <strong>
                  {totalItems}
                </strong>

              </div>


              <div className="cart-summary-line">

                <span>
                  Subtotal
                </span>

                <strong>
                  ₹{subtotal.toFixed(2)}
                </strong>

              </div>


              <div className="cart-summary-line">

                <span>
                  Delivery
                </span>

                <strong className="free-delivery">
                  FREE
                </strong>

              </div>


              <div className="cart-summary-divider"></div>


              <div className="cart-summary-grand-total">

                <span>
                  Total
                </span>

                <strong>
                  ₹{total.toFixed(2)}
                </strong>

              </div>


              <button
                type="button"
                className="cart-checkout-btn"
                onClick={handleCheckout}
              >
                Proceed to Checkout
                <i className="fas fa-arrow-right"></i>
              </button>


              <div className="cart-secure-note">

                <i className="fas fa-lock"></i>

                <span>
                  Secure checkout
                </span>

              </div>

            </div>


            {/* TRUST BOX */}

            <div className="cart-trust-box">

              <div className="cart-trust-item">

                <i className="fas fa-check-circle"></i>

                <span>
                  Freshly prepared
                </span>

              </div>

              <div className="cart-trust-item">

                <i className="fas fa-clock"></i>

                <span>
                  Fast preparation
                </span>

              </div>

              <div className="cart-trust-item">

                <i className="fas fa-shield-alt"></i>

                <span>
                  Secure payment
                </span>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  );
}