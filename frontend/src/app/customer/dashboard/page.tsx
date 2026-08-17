"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import AuthGuard from "@/components/AuthGuard";
import api from "@/lib/axios";

type Restaurant = {
  id: number;
  name: string;
  slug: string;
  address?: string;
  phone?: string;
  cuisine?: string;
  rating?: number;
  image?: string;
};

export default function CustomerDashboard() {
  const router = useRouter();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadRestaurants = async () => {
      try {
        const res = await api.get("/restaurants");
        setRestaurants(res.data.restaurants || []);
      } catch (error) {
        console.error("Failed to load restaurants:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    restaurant.cuisine?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const quickActions = [
    { icon: "fa-utensils", label: "Browse Menu", link: "#", color: "blue" },
    { icon: "fa-calendar-check", label: "My Reservations", link: "#", color: "green" },
    { icon: "fa-history", label: "Order History", link: "#", color: "purple" },
    { icon: "fa-heart", label: "Favorites", link: "#", color: "red" },
  ];

  return (
    <AuthGuard allowedRoles={["customer"]}>
      <div className="dashboard-page">
        <div className="dashboard-container">
          {/* Welcome Section */}
          <div className="dashboard-welcome">
            <div className="welcome-content">
              <div>
                <h1>Welcome Back!</h1>
                <p>Discover restaurants and explore their menus</p>
              </div>
              <div className="welcome-illustration">
                <i className="fas fa-utensils"></i>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {/* <div className="quick-actions-grid">
            {quickActions.map((action, index) => (
              <Link href={action.link} key={index} className={`quick-action-card quick-action-${action.color}`}>
                <div className="quick-action-icon">
                  <i className={`fas ${action.icon}`}></i>
                </div>
                <span>{action.label}</span>
              </Link>
            ))}
          </div> */}

          {/* Restaurant Section */}
          <section className="dashboard-section">
            <div className="section-header-row">
              <div>
                <h2>Available Restaurants</h2>
                <p>Choose a restaurant to view details and place orders</p>
              </div>
              
              {/* Search Bar */}
              <div className="search-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search restaurants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>

            {/* Loading State */}
            {loading ? (
              <div className="loading-state">
                <div className="loading-grid">
                  {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="skeleton-card">
                      <div className="skeleton skeleton-image"></div>
                      <div className="skeleton skeleton-title"></div>
                      <div className="skeleton skeleton-text"></div>
                      <div className="skeleton skeleton-button"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : filteredRestaurants.length === 0 ? (
              /* Empty State */
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-store-alt"></i>
                </div>
                <h3>No Restaurants Found</h3>
                <p>
                  {searchTerm
                    ? "No restaurants match your search. Try different keywords."
                    : "There are currently no active restaurants available."}
                </p>
                {searchTerm && (
                  <button
                    className="secondary-btn"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="fas fa-times"></i>
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              /* Restaurant Grid */
              <div className="restaurant-grid">
                {filteredRestaurants.map((restaurant) => (
                  <div className="restaurant-card" key={restaurant.id}>
                    {/* Restaurant Image */}
                    <div className="restaurant-image">
                      {restaurant.image ? (
                        <img src={restaurant.image} alt={restaurant.name} />
                      ) : (
                        <div className="restaurant-image-placeholder">
                          <i className="fas fa-store"></i>
                        </div>
                      )}
                      <div className="restaurant-status">
                        <span className="status-dot"></span>
                        Open
                      </div>
                    </div>

                    {/* Restaurant Info */}
                    <div className="restaurant-card-body">
                      <div className="restaurant-card-header">
                        <h3>{restaurant.name}</h3>
                        {restaurant.rating && (
                          <span className="restaurant-rating">
                            <i className="fas fa-star"></i>
                            {restaurant.rating}
                          </span>
                        )}
                      </div>

                      {restaurant.cuisine && (
                        <span className="restaurant-cuisine">
                          <i className="fas fa-tag"></i>
                          {restaurant.cuisine}
                        </span>
                      )}

                      {restaurant.address && (
                        <p className="restaurant-address">
                          <i className="fas fa-map-marker-alt"></i>
                          {restaurant.address}
                        </p>
                      )}

                      {restaurant.phone && (
                        <p className="restaurant-phone">
                          <i className="fas fa-phone"></i>
                          {restaurant.phone}
                        </p>
                      )}
                    </div>

                    {/* Card Footer */}
                    <div className="restaurant-card-footer">
                      <button
                        className="primary-btn"
                        onClick={() =>
                          router.push(`/customer/restaurant/${restaurant.slug}`)
                        }
                      >
                        <i className="fas fa-eye"></i>
                        View Restaurant
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </AuthGuard>
  );
}