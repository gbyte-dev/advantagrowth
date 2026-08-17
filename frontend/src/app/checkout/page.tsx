"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import api from "@/lib/axios";
import "../customer/restaurant/[slug]/restaurant.css";


declare global {
    interface Window {
        Razorpay: any;
    }
}

type CartItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    description?: string | null;
};

declare global {
    interface Window {
        Razorpay: new (options: {
            key: string;
            amount: number;
            currency: string;
            name: string;
            description: string;
            order_id: string;
            prefill: {
                name: string;
                email: string;
                contact: string;
            };
            theme: {
                color: string;
            };
            handler: (response: {
                razorpay_payment_id: string;
                razorpay_order_id: string;
                razorpay_signature: string;
            }) => void;
            modal?: {
                ondismiss?: () => void;
            };
        }) => {
            open: () => void;
        };
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const slug = searchParams.get("slug");
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [form, setForm] = useState({
        name: "",
        phone: "",
        email: "",
        address: "",
        specialInstructions: "",
    });

    useEffect(() => {
        try {
            const savedCart =
                localStorage.getItem("restaurant_cart");

            if (!savedCart) {
                router.push("/cart");
                return;
            }

            const parsedCart = JSON.parse(savedCart);

            if (
                !Array.isArray(parsedCart) ||
                parsedCart.length === 0
            ) {
                router.push("/cart");
                return;
            }

            setCartItems(parsedCart);
        } catch (error) {
            console.error("Cart loading error:", error);
            router.push("/cart");
        } finally {
            setLoading(false);
        }
    }, [router]);

    const subtotal = useMemo(() => {
        return cartItems.reduce(
            (sum, item) =>
                sum +
                Number(item.price) *
                Number(item.quantity),
            0
        );
    }, [cartItems]);

    const deliveryCharge = 0;
    const total = subtotal + deliveryCharge;

    const totalItems = useMemo(() => {
        return cartItems.reduce(
            (sum, item) =>
                sum + Number(item.quantity),
            0
        );
    }, [cartItems]);

    const handleChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handlePlaceOrder = async (
        e: React.FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            router.push("/cart");
            return;
        }

        setSubmitting(true);

        try {
            /*
             * =========================================================
             * 1. CREATE ORDER
             * =========================================================
             */

            const restaurantId = Number(
                localStorage.getItem("restaurant_id")
            );

            if (!restaurantId) {
                alert("Restaurant information is missing.");
                return;
            }

            const orderResponse = await api.post(
                "/orders",
                {
                    restaurant_id: restaurantId,

                    customer_name: form.name,
                    customer_phone: form.phone,
                    customer_email: form.email,

                    items: cartItems.map((item) => ({
                        menu_item_id: item.id,
                        quantity: item.quantity,
                    })),

                    special_requests:
                        form.specialInstructions || null,
                }
            );

            const createdOrder =
                orderResponse.data?.order;

            if (!createdOrder?.id) {
                throw new Error(
                    "Order was not created."
                );
            }

            /*
             * =========================================================
             * 2. CREATE RAZORPAY PAYMENT ORDER
             * =========================================================
             */

            const paymentResponse = await api.post(
                `/orders/${createdOrder.id}/payment`
            );

            const payment =
                paymentResponse.data?.payment;

            if (!payment?.razorpay_order_id) {
                throw new Error(
                    "Unable to initialize payment."
                );
            }

            /*
             * =========================================================
             * 3. OPEN RAZORPAY CHECKOUT
             * =========================================================
             */

            if (!window.Razorpay) {
                throw new Error(
                    "Razorpay Checkout failed to load."
                );
            }

            const razorpayOptions = {
                key: payment.key,

                amount: payment.amount,

                currency: payment.currency,

                name: "Restaurant",

                description:
                    `Order ${createdOrder.order_number}`,

                order_id:
                    payment.razorpay_order_id,

                prefill: {
                    name: form.name,
                    email: form.email,
                    contact: form.phone,
                },

                theme: {
                    color: "#e31b23",
                },

                handler: async (response: {
                    razorpay_payment_id: string;
                    razorpay_order_id: string;
                    razorpay_signature: string;
                }) => {

                    try {

                        /*
                         * ===================================================
                         * 4. VERIFY PAYMENT
                         * ===================================================
                         */

                        const verifyResponse =
                            await api.post(
                                `/orders/${createdOrder.id}/payment/verify`,
                                {
                                    razorpay_payment_id:
                                        response.razorpay_payment_id,

                                    razorpay_order_id:
                                        response.razorpay_order_id,

                                    razorpay_signature:
                                        response.razorpay_signature,
                                }
                            );

                        if (
                            verifyResponse.data?.success
                        ) {

                            /*
                             * Clear cart only after
                             * successful payment verification.
                             */

                            localStorage.removeItem(
                                "restaurant_cart"
                            );

                            window.dispatchEvent(
                                new Event("cartUpdated")
                            );

                            /*
                             * Temporary success redirect.
                             * We will build the proper
                             * order confirmation page next.
                             */

                            router.push(
                                `/order-success?order=${createdOrder.id}&slug=${encodeURIComponent(slug)}`
                            );
                        } else {
                            alert(
                                "Payment verification failed."
                            );
                        }

                    } catch (error) {

                        console.error(
                            "Payment verification error:",
                            error
                        );

                        alert(
                            "Payment was received but verification failed. Please contact the restaurant."
                        );
                    }
                },

                modal: {
                    ondismiss: () => {
                        setSubmitting(false);
                    },
                },
            };

            const razorpay =
                new window.Razorpay(
                    razorpayOptions
                );

            razorpay.open();

        } catch (error) {

            console.error(
                "Place order error:",
                error
            );

            alert(
                "Unable to start payment. Please try again."
            );

            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="checkout-page">
                <div className="checkout-loading">
                    <div className="loading-spinner" />
                    <p>Loading checkout...</p>
                </div>
            </main>
        );
    }

    if (cartItems.length === 0) {
        return (
            <main className="checkout-page">
                <div className="checkout-container">
                    <div className="checkout-header">
                        <h1>Your cart is empty</h1>

                        <button
                            type="button"
                            className="checkout-back-btn"
                            onClick={() =>
                                router.push("/cart")
                            }
                        >
                            <i className="fas fa-arrow-left" />
                            Back to Cart
                        </button>
                    </div>
                </div>
            </main>
        );
    }

    return (
        <main className="checkout-page">
            <div className="checkout-container">

                {/* HEADER */}

                <div className="checkout-header">

                    <button
                        type="button"
                        className="checkout-back-btn"
                        onClick={() =>
                            router.push("/cart")
                        }
                    >
                        <i className="fas fa-arrow-left" />
                        Back to Cart
                    </button>

                    <div>
                        <span className="checkout-label">
                            CHECKOUT
                        </span>

                        <h1>
                            Complete Your{" "}
                            <span>Order</span>
                        </h1>

                        <p>
                            Enter your details and review
                            your order before placing it.
                        </p>
                    </div>

                </div>

                <form
                    onSubmit={handlePlaceOrder}
                >
                    <div className="checkout-grid">

                        {/* LEFT */}

                        <div className="checkout-left">

                            {/* CUSTOMER DETAILS */}

                            <section className="checkout-card">

                                <div className="checkout-card-title">

                                    <div className="checkout-icon">
                                        <i className="fas fa-user" />
                                    </div>

                                    <div>
                                        <h2>
                                            Customer Details
                                        </h2>

                                        <p>
                                            Where should we contact you?
                                        </p>
                                    </div>

                                </div>

                                <div className="checkout-form-grid">

                                    <div className="checkout-field">

                                        <label>
                                            Full Name{" "}
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            placeholder="Enter your full name"
                                            required
                                        />

                                    </div>

                                    <div className="checkout-field">

                                        <label>
                                            Phone Number{" "}
                                            <span>*</span>
                                        </label>

                                        <input
                                            type="tel"
                                            name="phone"
                                            value={form.phone}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            required
                                        />

                                    </div>

                                    <div className="checkout-field full">

                                        <label>
                                            Email Address
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={form.email}
                                            onChange={handleChange}
                                            placeholder="you@example.com"
                                        />

                                    </div>

                                </div>

                            </section>

                            {/* ADDRESS */}

                            <section className="checkout-card">

                                <div className="checkout-card-title">

                                    <div className="checkout-icon">
                                        <i className="fas fa-map-marker-alt" />
                                    </div>

                                    <div>
                                        <h2>
                                            Delivery Address
                                        </h2>

                                        <p>
                                            Where should your order be delivered?
                                        </p>
                                    </div>

                                </div>

                                <div className="checkout-field">

                                    <label>
                                        Complete Address{" "}
                                        <span>*</span>
                                    </label>

                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        placeholder="House / Flat No., Street, Area, City..."
                                        rows={4}
                                        required
                                    />

                                </div>

                                <div className="checkout-field">

                                    <label>
                                        Special Instructions
                                    </label>

                                    <textarea
                                        name="specialInstructions"
                                        value={
                                            form.specialInstructions
                                        }
                                        onChange={handleChange}
                                        placeholder="Any special request for your order..."
                                        rows={3}
                                    />

                                </div>

                            </section>

                            {/* PAYMENT */}
                            <section className="checkout-card">

                                <div className="checkout-card-title">
                                    <div className="checkout-icon">
                                        <i className="fas fa-credit-card" />
                                    </div>

                                    <div>
                                        <h2>Payment</h2>
                                        <p>Choose your preferred payment method</p>
                                    </div>
                                </div>

                                <div className="payment-method-card">

                                    <div className="payment-method-left">

                                        <div className="payment-method-icon">
                                            <i className="fas fa-credit-card" />
                                        </div>

                                        <div>
                                            <strong>Online Payment</strong>

                                            <p>
                                                Pay securely using UPI, Card, Net Banking or Wallet
                                            </p>
                                        </div>

                                    </div>

                                    <div className="payment-method-check">
                                        <i className="fas fa-check" />
                                    </div>

                                </div>

                                <div className="payment-security-info">

                                    <i className="fas fa-shield-alt" />

                                    <span>
                                        Secure payment powered by Razorpay
                                    </span>

                                </div>

                            </section>

                        </div>

                        {/* RIGHT */}

                        <aside className="checkout-right">

                            <div className="order-summary-card">

                                <div className="order-summary-header">

                                    <div>

                                        <span>
                                            YOUR ORDER
                                        </span>

                                        <h2>
                                            Order Summary
                                        </h2>

                                    </div>

                                    <div className="order-count">
                                        {totalItems}
                                    </div>

                                </div>

                                {/* ITEMS */}

                                <div className="checkout-items">

                                    {cartItems.map(
                                        (item) => (
                                            <div
                                                className="checkout-item"
                                                key={item.id}
                                            >

                                                <div className="checkout-item-icon">
                                                    <i className="fas fa-utensils" />
                                                </div>

                                                <div className="checkout-item-info">

                                                    <strong>
                                                        {item.name}
                                                    </strong>

                                                    <span>
                                                        ₹
                                                        {Number(
                                                            item.price
                                                        ).toFixed(2)}

                                                        {" × "}

                                                        {item.quantity}
                                                    </span>

                                                </div>

                                                <strong className="checkout-item-total">
                                                    ₹
                                                    {(
                                                        Number(
                                                            item.price
                                                        ) *
                                                        Number(
                                                            item.quantity
                                                        )
                                                    ).toFixed(2)}
                                                </strong>

                                            </div>
                                        )
                                    )}

                                </div>

                                {/* SUMMARY */}

                                <div className="checkout-summary">

                                    <div>
                                        <span>
                                            Subtotal
                                        </span>

                                        <strong>
                                            ₹
                                            {subtotal.toFixed(2)}
                                        </strong>
                                    </div>

                                    <div>
                                        <span>
                                            Delivery
                                        </span>

                                        <strong>
                                            {deliveryCharge ===
                                                0
                                                ? "FREE"
                                                : `₹${deliveryCharge.toFixed(
                                                    2
                                                )}`}
                                        </strong>
                                    </div>

                                    <div className="checkout-divider" />

                                    <div className="checkout-total">

                                        <span>
                                            Total
                                        </span>

                                        <strong>
                                            ₹
                                            {total.toFixed(2)}
                                        </strong>

                                    </div>

                                </div>

                                {/* PLACE ORDER */}

                                <button
                                    type="submit"
                                    className="place-order-btn"
                                    disabled={submitting}
                                >

                                    {submitting ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-lock" />

                                            Place Order

                                            <span>
                                                ₹
                                                {total.toFixed(2)}
                                            </span>
                                        </>
                                    )}

                                </button>

                                <p className="secure-checkout-note">

                                    <i className="fas fa-shield-alt" />

                                    Secure checkout

                                </p>

                            </div>

                        </aside>

                    </div>
                </form>

            </div>
        </main>
    );
}
