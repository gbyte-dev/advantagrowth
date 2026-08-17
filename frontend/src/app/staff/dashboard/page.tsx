"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

type MenuItem = {
  id: number;
  menu_category_id: number;
  name: string;
  description?: string | null;
  price: string | number;
  food_type: "veg" | "non_veg" | "egg";
  is_available: boolean;
  is_active: boolean;
};

type Category = {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  items?: MenuItem[];
};

export default function StaffDashboard() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [staffName, setStaffName] = useState("Staff");
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [foodFilter, setFoodFilter] = useState<"all" | "veg" | "non_veg" | "egg">("all");

  const loadMenu = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      if (!token) {
        setError("Staff session not found.");
        return;
      }

      const response = await api.get("/auth/menu", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error("Staff menu error:", error);
      setError(error.response?.data?.message || "Unable to load menu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        setStaffName(parsedUser.owner_name || parsedUser.name || "Staff");
      } catch {
        setStaffName("Staff");
      }
    }
    loadMenu();
  }, []);

  // Filter items based on search and food type
  const getFilteredCategories = () => {
    return categories
      .map((category) => ({
        ...category,
        items: category.items?.filter((item) => {
          const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
          const matchesFoodType = foodFilter === "all" || item.food_type === foodFilter;
          return matchesSearch && matchesFoodType;
        }),
      }))
      .filter((category) => category.items && category.items.length > 0);
  };

  const filteredCategories = getFilteredCategories();
  const totalItems = categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);
  const availableItems = categories.reduce(
    (acc, cat) => acc + (cat.items?.filter((item) => item.is_available).length || 0),
    0
  );

  const handleLogout = () => {
    localStorage.clear();
    window.dispatchEvent(new Event("storage"));
    router.replace("/staff/login");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-container">
        {/* Header Section */}
        <div className="dashboard-welcome">
          <div className="welcome-content">
            <div className="welcome-left">
              <div className="staff-badge-header">
                <i className="fas fa-user-tie"></i>
                <span>Staff Panel</span>
              </div>
              <h1>Welcome, {staffName}!</h1>
              <p>View and manage the restaurant menu</p>
            </div>
            <div className="welcome-actions">
              <button className="secondary-btn" onClick={loadMenu} disabled={loading}>
                <i className={`fas ${loading ? "fa-spinner fa-spin" : "fa-sync-alt"}`}></i>
                {loading ? "Loading..." : "Refresh"}
              </button>
              <button className="logout-btn-outline" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Logout
              </button>
            </div>
          </div>

          {/* Stats Row */}
          <div className="stats-row">
            <div className="stat-item">
              <div className="stat-icon stat-icon-blue">
                <i className="fas fa-layer-group"></i>
              </div>
              <div className="stat-info">
                <h3>{categories.length}</h3>
                <p>Categories</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon stat-icon-green">
                <i className="fas fa-utensils"></i>
              </div>
              <div className="stat-info">
                <h3>{totalItems}</h3>
                <p>Total Items</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon stat-icon-purple">
                <i className="fas fa-check-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{availableItems}</h3>
                <p>Available</p>
              </div>
            </div>
            <div className="stat-item">
              <div className="stat-icon stat-icon-red">
                <i className="fas fa-times-circle"></i>
              </div>
              <div className="stat-info">
                <h3>{totalItems - availableItems}</h3>
                <p>Unavailable</p>
              </div>
            </div>
          </div>
        </div>

        {/* Menu Section */}
        <div className="dashboard-section">
          <div className="section-header-row">
            <div>
              <h2>Restaurant Menu</h2>
              <p>Live menu from your restaurant</p>
            </div>
            <div className="filter-controls">
              {/* Search */}
              <div className="search-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search menu items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              {/* Food Type Filter */}
              <div className="food-filter">
                <button
                  className={`filter-chip ${foodFilter === "all" ? "filter-chip-active" : ""}`}
                  onClick={() => setFoodFilter("all")}
                >
                  All
                </button>
                <button
                  className={`filter-chip filter-chip-veg ${foodFilter === "veg" ? "filter-chip-active" : ""}`}
                  onClick={() => setFoodFilter("veg")}
                >
                  <span className="food-dot veg"></span>
                  Veg
                </button>
                <button
                  className={`filter-chip filter-chip-nonveg ${foodFilter === "non_veg" ? "filter-chip-active" : ""}`}
                  onClick={() => setFoodFilter("non_veg")}
                >
                  <span className="food-dot nonveg"></span>
                  Non-Veg
                </button>
                <button
                  className={`filter-chip filter-chip-egg ${foodFilter === "egg" ? "filter-chip-active" : ""}`}
                  onClick={() => setFoodFilter("egg")}
                >
                  <span className="food-dot egg"></span>
                  Egg
                </button>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="loading-state">
              <div className="loading-category">
                <div className="skeleton skeleton-title-lg"></div>
                <div className="loading-items">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="skeleton skeleton-item"></div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </div>
              <h3>Unable to Load Menu</h3>
              <p>{error}</p>
              <button className="primary-btn" onClick={loadMenu}>
                <i className="fas fa-redo"></i>
                Try Again
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && categories.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-book-open"></i>
              </div>
              <h3>No Menu Available</h3>
              <p>The restaurant owner has not added any menu items yet.</p>
            </div>
          )}

          {/* Menu Categories */}
          {!loading && !error && filteredCategories.length === 0 && searchTerm && (
            <div className="empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-search"></i>
              </div>
              <h3>No Results Found</h3>
              <p>No items match your search. Try different keywords.</p>
              <button className="secondary-btn" onClick={() => setSearchTerm("")}>
                <i className="fas fa-times"></i>
                Clear Search
              </button>
            </div>
          )}

          {!loading && !error && filteredCategories.length > 0 && (
            <div className="menu-categories">
              {filteredCategories.map((category) => (
                <div className="menu-category-card" key={category.id}>
                  {/* Category Header */}
                  <div
                    className="category-header"
                    onClick={() =>
                      setActiveCategory(activeCategory === category.id ? null : category.id)
                    }
                  >
                    <div className="category-header-left">
                      <div className="category-icon">
                        <i className="fas fa-utensils"></i>
                      </div>
                      <div>
                        <h3>{category.name}</h3>
                        {category.description && <p>{category.description}</p>}
                      </div>
                    </div>
                    <div className="category-header-right">
                      <span className="category-item-count">
                        {category.items?.length || 0} items
                      </span>
                      <i
                        className={`fas fa-chevron-down category-arrow ${
                          activeCategory === category.id ? "arrow-rotated" : ""
                        }`}
                      ></i>
                    </div>
                  </div>

                  {/* Items */}
                  <div
                    className={`category-items ${
                      activeCategory === category.id ? "category-expanded" : "category-collapsed"
                    }`}
                  >
                    {category.items && category.items.length > 0 ? (
                      <div className="items-list">
                        {category.items.map((item) => (
                          <div className="menu-item-row" key={item.id}>
                            <div className="item-left">
                              <div className="item-name-row">
                                <h4>{item.name}</h4>
                                <span
                                  className={`food-dot ${
                                    item.food_type === "non_veg"
                                      ? "nonveg"
                                      : item.food_type === "egg"
                                      ? "egg"
                                      : "veg"
                                  }`}
                                ></span>
                              </div>
                              {item.description && (
                                <p className="item-description">{item.description}</p>
                              )}
                            </div>
                            <div className="item-right">
                              <span className="item-price">₹{item.price}</span>
                              <span
                                className={`item-status ${
                                  item.is_available ? "status-available" : "status-unavailable"
                                }`}
                              >
                                <span
                                  className={`status-dot-sm ${
                                    item.is_available ? "dot-available" : "dot-unavailable"
                                  }`}
                                ></span>
                                {item.is_available ? "Available" : "Unavailable"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="category-empty">
                        <i className="fas fa-inbox"></i>
                        <p>No items in this category</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}