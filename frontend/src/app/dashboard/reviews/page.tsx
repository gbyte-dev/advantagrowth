"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type Customer = {
  id: number;
  name?: string;
};

type Review = {
  id: number;
  rating: number;
  review: string | null;
  is_visible: boolean;
  customer?: Customer;
  created_at: string;
};

export default function ReviewsPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") setSidebarCollapsed(true);

    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    loadReviews();
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener);
  }, []);

  const loadReviews = async () => {
    try {
      setRefreshing(true);
      const res = await api.get("/auth/reviews", authHeader());
      setReviews(res.data.reviews || []);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to load reviews.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const toggleVisibility = async (id: number) => {
    try {
      const res = await api.patch(
          `/auth/reviews/${id}/visibility`,
          {},
          authHeader()
        );
      setReviews((current) =>
        current.map((item) =>
          item.id === id ? { ...item, is_visible: res.data.is_visible } : item
        )
      );
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to update review.");
    }
  };

  const deleteReview = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this review?")) return;
    try {
      await api.delete(`/auth/reviews/${id}`, authHeader());
      setReviews((current) => current.filter((item) => item.id !== id));
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Unable to delete review.");
    }
  };

  const getCustomerName = (review: Review) => review.customer?.name || "Customer";

  const getStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => i < rating);
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((total, item) => total + item.rating, 0) / reviews.length).toFixed(1)
      : "0.0";

  const visibleReviews = reviews.filter((item) => item.is_visible).length;
  const hiddenReviews = reviews.filter((item) => !item.is_visible).length;

  return (
    <div className="owner-layout">
      <main className={`owner-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : "sidebar-expanded-main"}`}>
        <div className="dashboard-page">
          <div className="dashboard-container">
            {/* Page Header */}
            <div className="dashboard-welcome">
              <div className="welcome-content">
                <div className="welcome-left">
                  <div className="page-badge">
                    <i className="fas fa-star"></i>
                    <span>Reviews & Ratings</span>
                  </div>
                  <h1>Rating & Reviews</h1>
                  <p>Manage customer feedback and restaurant ratings</p>
                </div>
                <button className="secondary-btn" onClick={loadReviews} disabled={refreshing}>
                  <i className={`fas fa-sync-alt ${refreshing ? "fa-spin" : ""}`}></i>
                  {refreshing ? "Refreshing..." : "Refresh"}
                </button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="stats-row">
              <div className="stat-item">
                <div className="stat-icon stat-icon-yellow">
                  <i className="fas fa-star"></i>
                </div>
                <div className="stat-info">
                  <h3>{averageRating}</h3>
                  <p>Average Rating</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon stat-icon-blue">
                  <i className="fas fa-comments"></i>
                </div>
                <div className="stat-info">
                  <h3>{reviews.length}</h3>
                  <p>Total Reviews</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon stat-icon-green">
                  <i className="fas fa-eye"></i>
                </div>
                <div className="stat-info">
                  <h3>{visibleReviews}</h3>
                  <p>Visible</p>
                </div>
              </div>
              <div className="stat-item">
                <div className="stat-icon stat-icon-red">
                  <i className="fas fa-eye-slash"></i>
                </div>
                <div className="stat-info">
                  <h3>{hiddenReviews}</h3>
                  <p>Hidden</p>
                </div>
              </div>
            </div>

            {/* Reviews Table */}
            <div className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2>Customer Reviews</h2>
                  <p>Reviews submitted by your restaurant customers</p>
                </div>
                <span className="item-count-badge">{reviews.length} Total</span>
              </div>

              {loading ? (
                <div className="loading-state">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton skeleton-item-lg"></div>
                  ))}
                </div>
              ) : reviews.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">
                    <i className="fas fa-star"></i>
                  </div>
                  <h3>No Reviews Yet</h3>
                  <p>Customer reviews will appear here once they submit feedback.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="menu-table">
                    <thead>
                      <tr>
                        <th>Customer</th>
                        <th>Rating</th>
                        <th>Review</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reviews.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <div className="item-name-cell">
                              <span className="item-name">{getCustomerName(item)}</span>
                            </div>
                          </td>
                          <td>
                            <div className="rating-stars-display">
                              {getStars(item.rating).map((filled, i) => (
                                <i
                                  key={i}
                                  className={`fas fa-star ${filled ? "star-filled" : "star-empty"}`}
                                ></i>
                              ))}
                              <span className="rating-number-text">{item.rating}/5</span>
                            </div>
                          </td>
                          <td>
                            <p className="review-text-cell">
                              {item.review || "No written review."}
                            </p>
                          </td>
                          <td>
                            <span className={`status-toggle ${item.is_visible ? "status-active" : "status-inactive"}`}>
                              <span className={`status-dot-sm ${item.is_visible ? "dot-available" : "dot-unavailable"}`}></span>
                              {item.is_visible ? "Visible" : "Hidden"}
                            </span>
                          </td>
                          <td>
                            <span className="review-date">
                              {new Date(item.created_at).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          </td>
                          <td>
                            <div className="action-btns">
                              <button
                                className={`icon-btn ${item.is_visible ? "delete-icon-btn" : "edit-icon-btn"}`}
                                onClick={() => toggleVisibility(item.id)}
                                title={item.is_visible ? "Hide review" : "Show review"}
                              >
                                <i className={`fas fa-${item.is_visible ? "eye-slash" : "eye"}`}></i>
                              </button>
                              <button
                                className="icon-btn delete-icon-btn"
                                onClick={() => deleteReview(item.id)}
                                title="Delete review"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}