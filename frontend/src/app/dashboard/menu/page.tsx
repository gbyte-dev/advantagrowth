"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type Category = {
  id: number;
  name: string;
  description?: string | null;
  is_active: boolean;
  items?: MenuItem[];
};

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

const authConfig = () => ({
  headers: {
    Authorization: `Bearer ${sessionStorage.getItem("token")}`,
  },
});

export default function MenuPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"add-category" | "add-item" | "view-menu">("view-menu");

  // Category form
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");

  // Item form
  const [itemForm, setItemForm] = useState({
    menu_category_id: "",
    name: "",
    description: "",
    price: "",
    food_type: "veg",
  });

  // Category edit
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editCategoryName, setEditCategoryName] = useState("");
  const [editCategoryDescription, setEditCategoryDescription] = useState("");

  // Item edit
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [editItemForm, setEditItemForm] = useState({
    menu_category_id: "",
    name: "",
    description: "",
    price: "",
    food_type: "veg",
  });

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") setSidebarCollapsed(true);

    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    loadMenu();
    return () => window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener);
  }, []);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const response = await api.get("/auth/menu", authConfig());
      setCategories(response.data.categories || []);
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to load menu.");
    } finally {
      setLoading(false);
    }
  };

  // Add Category
  const addCategory = async () => {
    if (!categoryName.trim()) return alert("Category name is required.");
    try {
      setSaving(true);
      await api.post("/auth/menu/categories", {
        name: categoryName.trim(),
        description: categoryDescription.trim() || null,
      }, authConfig());
      setCategoryName("");
      setCategoryDescription("");
      await loadMenu();
      alert("Category added successfully.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add category.");
    } finally {
      setSaving(false);
    }
  };

  // Edit Category
  const openCategoryEdit = (category: Category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryDescription(category.description || "");
  };

  const updateCategory = async () => {
    if (!editingCategory) return;
    if (!editCategoryName.trim()) return alert("Category name is required.");
    try {
      setSaving(true);
      await api.put(`/auth/menu/categories/${editingCategory.id}`, {
        name: editCategoryName.trim(),
        description: editCategoryDescription.trim() || null,
      }, authConfig());
      setEditingCategory(null);
      await loadMenu();
      alert("Category updated successfully.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update category.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Category
  const deleteCategory = async (id: number) => {
    if (!window.confirm("Delete this category and all its menu items?")) return;
    try {
      await api.delete(`/auth/menu/categories/${id}`, authConfig());
      await loadMenu();
      alert("Category deleted successfully.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete category.");
    }
  };

  // Add Menu Item
  const addItem = async () => {
    if (!itemForm.menu_category_id) return alert("Please select a category.");
    if (!itemForm.name.trim()) return alert("Item name is required.");
    if (!itemForm.price) return alert("Price is required.");
    try {
      setSaving(true);
      await api.post("/auth/menu/items", {
        menu_category_id: Number(itemForm.menu_category_id),
        name: itemForm.name.trim(),
        description: itemForm.description.trim() || null,
        price: Number(itemForm.price),
        food_type: itemForm.food_type,
      }, authConfig());
      setItemForm({ menu_category_id: "", name: "", description: "", price: "", food_type: "veg" });
      await loadMenu();
      alert("Menu item added successfully.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add menu item.");
    } finally {
      setSaving(false);
    }
  };

  // Edit Menu Item
  const openItemEdit = (item: MenuItem) => {
    setEditingItem(item);
    setEditItemForm({
      menu_category_id: String(item.menu_category_id),
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      food_type: item.food_type,
    });
  };

  const updateItem = async () => {
    if (!editingItem) return;
    if (!editItemForm.menu_category_id) return alert("Please select a category.");
    if (!editItemForm.name.trim()) return alert("Item name is required.");
    if (!editItemForm.price) return alert("Price is required.");
    try {
      setSaving(true);
      await api.put(`/auth/menu/items/${editingItem.id}`, {
        menu_category_id: Number(editItemForm.menu_category_id),
        name: editItemForm.name.trim(),
        description: editItemForm.description.trim() || null,
        price: Number(editItemForm.price),
        food_type: editItemForm.food_type,
      }, authConfig());
      setEditingItem(null);
      await loadMenu();
      alert("Menu item updated successfully.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update menu item.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Menu Item
  const deleteItem = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this menu item?")) return;
    try {
      await api.delete(`/auth/menu/items/${id}`, authConfig());
      await loadMenu();
      alert("Menu item deleted successfully.");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to delete menu item.");
    }
  };

  // Toggle Availability
  const toggleAvailability = async (id: number) => {
    try {
      await api.patch(`/auth/menu/items/${id}/availability`, {}, authConfig());
      await loadMenu();
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to update availability.");
    }
  };

  const totalItems = categories.reduce((acc, cat) => acc + (cat.items?.length || 0), 0);

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
                    <i className="fas fa-utensils"></i>
                    <span>Menu Management</span>
                  </div>
                  <h1>Menu Management</h1>
                  <p>Add, edit and manage your restaurant menu categories and items</p>
                </div>
                <div className="header-stats">
                  <div className="header-stat">
                    <span className="header-stat-number">{categories.length}</span>
                    <span className="header-stat-label">Categories</span>
                  </div>
                  <div className="header-stat">
                    <span className="header-stat-number">{totalItems}</span>
                    <span className="header-stat-label">Items</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="tab-nav">
              <button className={`tab-btn ${activeTab === "view-menu" ? "tab-active" : ""}`} onClick={() => setActiveTab("view-menu")}>
                <i className="fas fa-list"></i> View Menu
              </button>
              <button className={`tab-btn ${activeTab === "add-category" ? "tab-active" : ""}`} onClick={() => setActiveTab("add-category")}>
                <i className="fas fa-plus-circle"></i> Add Category
              </button>
              <button className={`tab-btn ${activeTab === "add-item" ? "tab-active" : ""}`} onClick={() => setActiveTab("add-item")}>
                <i className="fas fa-plus"></i> Add Menu Item
              </button>
            </div>

            {/* Add Category Tab */}
            {activeTab === "add-category" && (
              <div className="dashboard-section">
                <div className="section-header-row">
                  <div>
                    <h2>Add New Category</h2>
                    <p>Create a new category for your menu items</p>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category Name <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <i className="fas fa-tag input-icon"></i>
                      <input type="text" placeholder="e.g., Pizzas, Beverages" value={categoryName} onChange={(e) => setCategoryName(e.target.value)} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <div className="input-wrapper">
                      <i className="fas fa-align-left input-icon"></i>
                      <input type="text" placeholder="Brief description" value={categoryDescription} onChange={(e) => setCategoryDescription(e.target.value)} />
                    </div>
                  </div>
                </div>
                <button className="primary-btn" onClick={addCategory} disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-plus"></i> Add Category</>}
                </button>
              </div>
            )}

            {/* Add Menu Item Tab */}
            {activeTab === "add-item" && (
              <div className="dashboard-section">
                <div className="section-header-row">
                  <div>
                    <h2>Add New Menu Item</h2>
                    <p>Add a new item to your menu</p>
                  </div>
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Category <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <i className="fas fa-folder input-icon"></i>
                      <select value={itemForm.menu_category_id} onChange={(e) => setItemForm({ ...itemForm, menu_category_id: e.target.value })}>
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Item Name <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <i className="fas fa-utensils input-icon"></i>
                      <input type="text" placeholder="e.g., Margherita Pizza" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <div className="input-wrapper">
                      <i className="fas fa-align-left input-icon"></i>
                      <input type="text" placeholder="Brief description" value={itemForm.description} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Price <span className="required">*</span></label>
                    <div className="input-wrapper">
                      <i className="fas fa-rupee-sign input-icon"></i>
                      <input type="number" min="0" placeholder="299" value={itemForm.price} onChange={(e) => setItemForm({ ...itemForm, price: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Food Type</label>
                    <div className="input-wrapper">
                      <i className="fas fa-leaf input-icon"></i>
                      <select value={itemForm.food_type} onChange={(e) => setItemForm({ ...itemForm, food_type: e.target.value as any })}>
                        <option value="veg">Veg</option>
                        <option value="non_veg">Non-Veg</option>
                        <option value="egg">Egg</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button className="primary-btn" onClick={addItem} disabled={saving}>
                  {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-plus"></i> Add Menu Item</>}
                </button>
              </div>
            )}

            {/* View Menu Tab */}
            {activeTab === "view-menu" && (
              <div className="dashboard-section">
                <div className="section-header-row">
                  <div>
                    <h2>Current Menu</h2>
                    <p>All categories and their items</p>
                  </div>
                  <button className="secondary-btn" onClick={loadMenu} disabled={loading}>
                    <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`}></i> Refresh
                  </button>
                </div>

                {loading ? (
                  <div className="loading-state">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="skeleton skeleton-item-lg"></div>
                    ))}
                  </div>
                ) : categories.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-state-icon"><i className="fas fa-book-open"></i></div>
                    <h3>No Menu Yet</h3>
                    <p>Add a category to start building your restaurant menu.</p>
                    <button className="primary-btn" onClick={() => setActiveTab("add-category")}>
                      <i className="fas fa-plus"></i> Add Category
                    </button>
                  </div>
                ) : (
                  <div className="menu-categories-list">
                    {categories.map((category) => (
                      <div className="menu-category-card" key={category.id}>
                        <div className="category-header">
                          <div className="category-header-left">
                            <div className="category-icon"><i className="fas fa-utensils"></i></div>
                            <div>
                              <h3>{category.name}</h3>
                              {category.description && <p>{category.description}</p>}
                            </div>
                          </div>
                          <div className="category-header-right">
                            <span className="item-count-badge">{category.items?.length || 0} items</span>
                            <button className="icon-btn edit-icon-btn" onClick={() => openCategoryEdit(category)}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="icon-btn delete-icon-btn" onClick={() => deleteCategory(category.id)}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                        <div className="category-items-list">
                          {category.items && category.items.length > 0 ? (
                            <table className="menu-table">
                              <thead>
                                <tr>
                                  <th>Item Name</th>
                                  <th>Price</th>
                                  <th>Type</th>
                                  <th>Status</th>
                                  <th>Actions</th>
                                </tr>
                              </thead>
                              <tbody>
                                {category.items.map((item) => (
                                  <tr key={item.id}>
                                    <td>
                                      <div className="item-name-cell">
                                        <span className="item-name">{item.name}</span>
                                        {item.description && <span className="item-desc">{item.description}</span>}
                                      </div>
                                    </td>
                                    <td><span className="price-tag">₹{item.price}</span></td>
                                    <td>
                                      <span className={`food-type-badge food-type-${item.food_type}`}>
                                        <span className={`food-dot ${item.food_type}`}></span>
                                        {item.food_type === "non_veg" ? "Non-Veg" : item.food_type === "egg" ? "Egg" : "Veg"}
                                      </span>
                                    </td>
                                    <td>
                                      <button className={`status-toggle ${item.is_available ? "status-active" : "status-inactive"}`} onClick={() => toggleAvailability(item.id)}>
                                        <span className={`status-dot-sm ${item.is_available ? "dot-available" : "dot-unavailable"}`}></span>
                                        {item.is_available ? "Available" : "Unavailable"}
                                      </button>
                                    </td>
                                    <td>
                                      <div className="action-btns">
                                        <button className="icon-btn edit-icon-btn" onClick={() => openItemEdit(item)}>
                                          <i className="fas fa-edit"></i>
                                        </button>
                                        <button className="icon-btn delete-icon-btn" onClick={() => deleteItem(item.id)}>
                                          <i className="fas fa-trash"></i>
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
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
            )}

            {/* Edit Category Modal */}
            {editingCategory && (
              <div className="modal-overlay" onClick={() => setEditingCategory(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Edit Category</h3>
                    <button className="modal-close" onClick={() => setEditingCategory(null)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Category Name <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-tag input-icon"></i>
                        <input type="text" value={editCategoryName} onChange={(e) => setEditCategoryName(e.target.value)} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <div className="input-wrapper">
                        <i className="fas fa-align-left input-icon"></i>
                        <input type="text" value={editCategoryDescription} onChange={(e) => setEditCategoryDescription(e.target.value)} />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="secondary-btn" onClick={() => setEditingCategory(null)}>Cancel</button>
                    <button className="primary-btn" onClick={updateCategory} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Item Modal */}
            {editingItem && (
              <div className="modal-overlay" onClick={() => setEditingItem(null)}>
                <div className="modal-card" onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Edit Menu Item</h3>
                    <button className="modal-close" onClick={() => setEditingItem(null)}>
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                  <div className="modal-body">
                    <div className="form-group">
                      <label>Category <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-folder input-icon"></i>
                        <select value={editItemForm.menu_category_id} onChange={(e) => setEditItemForm({ ...editItemForm, menu_category_id: e.target.value })}>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Item Name <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-utensils input-icon"></i>
                        <input type="text" value={editItemForm.name} onChange={(e) => setEditItemForm({ ...editItemForm, name: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <div className="input-wrapper">
                        <i className="fas fa-align-left input-icon"></i>
                        <input type="text" value={editItemForm.description} onChange={(e) => setEditItemForm({ ...editItemForm, description: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Price <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-rupee-sign input-icon"></i>
                        <input type="number" min="0" value={editItemForm.price} onChange={(e) => setEditItemForm({ ...editItemForm, price: e.target.value })} />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Food Type</label>
                      <div className="input-wrapper">
                        <i className="fas fa-leaf input-icon"></i>
                        <select value={editItemForm.food_type} onChange={(e) => setEditItemForm({ ...editItemForm, food_type: e.target.value as any })}>
                          <option value="veg">Veg</option>
                          <option value="non_veg">Non-Veg</option>
                          <option value="egg">Egg</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button className="secondary-btn" onClick={() => setEditingItem(null)}>Cancel</button>
                    <button className="primary-btn" onClick={updateItem} disabled={saving}>
                      {saving ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}