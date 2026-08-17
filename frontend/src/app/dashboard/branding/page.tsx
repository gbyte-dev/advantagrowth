"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";
import HeroEditor from "./HeroEditor";

export default function BrandingPage() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    restaurantName: "",
    ownerName: "",
    email: "",
    phone: "",
    cuisine: "Indian",
    website: "",
    address: "",
    gstNumber: "",
    fssaiNumber: "",
    openingTime: "",
    closingTime: "",
    description: "",
  });
  const [aboutImage1, setAboutImage1] = useState<File | null>(null);
  const [aboutImage2, setAboutImage2] = useState<File | null>(null);

  const [aboutImage1Preview, setAboutImage1Preview] = useState<string | null>(null);
  const [aboutImage2Preview, setAboutImage2Preview] = useState<string | null>(null);
  const [aboutForm, setAboutForm] = useState({
    years: "",
    title: "",
    description: "",
    feature1Title: "",
    feature1Description: "",
    feature2Title: "",
    feature2Description: "",
    feature3Title: "",
    feature3Description: "",
  });

  const [aboutSaving, setAboutSaving] = useState(false);

  const handleAboutChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setAboutForm((current) => ({
      ...current,
      [e.target.name]: e.target.value,
    }));
  };

  const handleAboutImage1Change = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAboutImage1(file);
    setAboutImage1Preview(URL.createObjectURL(file));
  };

  const handleAboutImage2Change = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    setAboutImage2(file);
    setAboutImage2Preview(URL.createObjectURL(file));
  };
  const handleAboutSave = async () => {
    try {
      setAboutSaving(true);

      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login first.");
        return;
      }

      const formData = new FormData();

      formData.append("about_years", aboutForm.years);
      formData.append("about_title", aboutForm.title);
      formData.append(
        "about_description",
        aboutForm.description
      );

      formData.append(
        "about_feature_1_title",
        aboutForm.feature1Title
      );

      formData.append(
        "about_feature_1_description",
        aboutForm.feature1Description
      );

      formData.append(
        "about_feature_2_title",
        aboutForm.feature2Title
      );

      formData.append(
        "about_feature_2_description",
        aboutForm.feature2Description
      );

      formData.append(
        "about_feature_3_title",
        aboutForm.feature3Title
      );

      formData.append(
        "about_feature_3_description",
        aboutForm.feature3Description
      );

      if (aboutImage1) {
        formData.append(
          "about_image_1",
          aboutImage1
        );
      }

      if (aboutImage2) {
        formData.append(
          "about_image_2",
          aboutImage2
        );
      }

      const response = await api.post(
        "/restaurant/about",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(
        "OUR STORY SAVED:",
        response.data
      );

      alert("Our Story saved successfully!");

    } catch (error: any) {

      console.error(
        "OUR STORY SAVE ERROR:",
        error
      );

      alert(
        error.response?.data?.message ||
        "Unable to save Our Story."
      );

    } finally {
      setAboutSaving(false);
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    if (saved === "true") {
      setSidebarCollapsed(true);
    }

    const handleSidebarToggle = (e: CustomEvent) => {
      setSidebarCollapsed(e.detail.collapsed);
    };

    window.addEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    return () => {
      window.removeEventListener("sidebarToggle", handleSidebarToggle as EventListener);
    };
  }, []);

  useEffect(() => {
    loadMarqueeItems();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadMarqueeItems = async () => {
    try {
      setMarqueeLoading(true);

      const response = await api.get("/owner/marquee");

      setMarqueeItems(response.data.items || []);
    } catch (error: any) {
      console.error("Marquee loading error:", error);

      alert(
        error.response?.data?.message ||
        "Unable to load marquee items."
      );
    } finally {
      setMarqueeLoading(false);
    }
  };

  const handleAddMarquee = async () => {
  const text = marqueeText.trim();

  if (!text) {
    alert("Please enter marquee text.");
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Owner login token not found. Please login again.");
    return;
  }

  try {
    setMarqueeSaving(true);

    const response = await api.post(
      "/owner/marquee",
      {
        text,
        sort_order: marqueeItems.length,
        is_active: true,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMarqueeItems((current) => [
      ...current,
      response.data.item,
    ]);

    setMarqueeText("");

    alert("Marquee item added successfully.");
  } catch (error: any) {
    console.error("Marquee add error:", error);

    alert(
      error.response?.data?.message ||
      "Unable to add marquee item."
    );
  } finally {
    setMarqueeSaving(false);
  }
};

 const handleDeleteMarquee = async (id: number) => {
  const confirmed = window.confirm(
    "Are you sure you want to delete this marquee item?"
  );

  if (!confirmed) {
    return;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    alert("Owner login token not found. Please login again.");
    return;
  }

  try {
    await api.delete(
      `/owner/marquee/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMarqueeItems((current) =>
      current.filter((item) => item.id !== id)
    );

    alert("Marquee item deleted successfully.");
  } catch (error: any) {
    console.error("Marquee delete error:", error);

    alert(
      error.response?.data?.message ||
      "Unable to delete marquee item."
    );
  }
};

  const handleToggleMarquee = async (
  item: MarqueeItem
) => {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Owner login token not found. Please login again.");
    return;
  }

  try {
    const response = await api.put(
      `/owner/marquee/${item.id}`,
      {
        text: item.text,
        sort_order: item.sort_order,
        is_active: !item.is_active,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setMarqueeItems((current) =>
      current.map((currentItem) =>
        currentItem.id === item.id
          ? response.data.item
          : currentItem
      )
    );
  } catch (error: any) {
    console.error("Marquee toggle error:", error);

    alert(
      error.response?.data?.message ||
      "Unable to update marquee item."
    );
  }
};


const handleSave = async () => {
  try {
    setSaving(true);

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login again.");
      return;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/restaurant/profile`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.restaurantName,
          phone: form.phone,
          email: form.email,
          address: form.address,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Profile update error:", data);

      alert(
        data?.message ||
          "Restaurant profile update failed."
      );

      return;
    }

    alert("Restaurant profile updated successfully!");

    setForm((prev) => ({
      ...prev,
      restaurantName: data.restaurant.name ?? prev.restaurantName,
      phone: data.restaurant.phone ?? prev.phone,
      email: data.restaurant.email ?? prev.email,
      address: data.restaurant.address ?? prev.address,
    }));
  } catch (error) {
    console.error("Profile update error:", error);
    alert("Something went wrong while updating the restaurant profile.");
  } finally {
    setSaving(false);
  }
};


  const [marqueeItems, setMarqueeItems] = useState<
    {
      id: number;
      text: string;
      sort_order: number;
      is_active: boolean;
    }[]
  >([]);

  const [marqueeText, setMarqueeText] = useState("");
  const [marqueeSaving, setMarqueeSaving] = useState(false);
  const [marqueeLoading, setMarqueeLoading] = useState(false);

  return (
    <div className="owner-layout">
      <main className={`owner-main-content ${sidebarCollapsed ? "sidebar-collapsed-main" : "sidebar-expanded-main"}`}>
        <div className="dashboard-page">
          <div className="dashboard-container">
            <HeroEditor />
            {/* Page Header */}
            <div className="dashboard-welcome">
              <div className="welcome-content">
                <div className="welcome-left">
                  <div className="page-badge">
                    <i className="fas fa-store"></i>
                    <span>Restaurant Profile</span>
                  </div>
                  <h1>Basic Info & Branding</h1>
                  <p>Manage your restaurant profile, branding and business information</p>
                </div>
                <div className="welcome-illustration">
                  <i className="fas fa-building"></i>
                </div>
              </div>
            </div>

            {/* Brand Assets Section */}
            <div className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2>Brand Assets</h2>
                  <p>Upload your restaurant logo and cover image</p>
                </div>
              </div>

              <div className="branding-upload-grid">
                {/* Logo Upload */}
                <div className="upload-card">
                  <div className="upload-preview-area">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="upload-preview-img" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-store-alt"></i>
                        <span>Restaurant Logo</span>
                        <p>Recommended: 512 x 512 px</p>
                      </div>
                    )}
                  </div>
                  <div className="upload-card-footer">
                    <label className="upload-btn">
                      <i className="fas fa-upload"></i>
                      Upload Logo
                      <input type="file" accept="image/*" onChange={handleLogoUpload} hidden />
                    </label>
                    {logoPreview && (
                      <button className="remove-btn" onClick={() => setLogoPreview(null)}>
                        <i className="fas fa-times"></i>
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Cover Upload */}
                <div className="upload-card">
                  <div className="upload-preview-area upload-cover-area">
                    {coverPreview ? (
                      <img src={coverPreview} alt="Cover preview" className="upload-preview-img" />
                    ) : (
                      <div className="upload-placeholder">
                        <i className="fas fa-image"></i>
                        <span>Cover Image</span>
                        <p>Recommended: 1200 x 400 px</p>
                      </div>
                    )}
                  </div>
                  <div className="upload-card-footer">
                    <label className="upload-btn">
                      <i className="fas fa-upload"></i>
                      Upload Cover
                      <input type="file" accept="image/*" onChange={handleCoverUpload} hidden />
                    </label>
                    {coverPreview && (
                      <button className="remove-btn" onClick={() => setCoverPreview(null)}>
                        <i className="fas fa-times"></i>
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Restaurant Information Form */}
            <div className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2>Restaurant Information</h2>
                  <p>Fill in your restaurant details below</p>
                </div>
              </div>

              <div className="form-layout">
                {/* Basic Details */}
                <div className="form-section">
                  <h3 className="form-section-title">
                    <i className="fas fa-info-circle"></i>
                    Basic Details
                  </h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Restaurant Name <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-store input-icon"></i>
                        <input
                          type="text"
                          name="restaurantName"
                          placeholder="Enter restaurant name"
                          value={form.restaurantName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Owner Name <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-user input-icon"></i>
                        <input
                          type="text"
                          name="ownerName"
                          placeholder="Enter owner name"
                          value={form.ownerName}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Email <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-envelope input-icon"></i>
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter email address"
                          value={form.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Phone <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-phone input-icon"></i>
                        <input
                          type="text"
                          name="phone"
                          placeholder="Enter phone number"
                          value={form.phone}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Cuisine Type</label>
                      <div className="input-wrapper">
                        <i className="fas fa-utensils input-icon"></i>
                        <select name="cuisine" value={form.cuisine} onChange={handleChange}>
                          <option value="Indian">Indian</option>
                          <option value="Chinese">Chinese</option>
                          <option value="Italian">Italian</option>
                          <option value="Japanese">Japanese</option>
                          <option value="Mexican">Mexican</option>
                          <option value="Fast Food">Fast Food</option>
                          <option value="Multi Cuisine">Multi Cuisine</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Website</label>
                      <div className="input-wrapper">
                        <i className="fas fa-globe input-icon"></i>
                        <input
                          type="text"
                          name="website"
                          placeholder="https://example.com"
                          value={form.website}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group full-width">
                      <label>Address <span className="required">*</span></label>
                      <div className="input-wrapper">
                        <i className="fas fa-map-marker-alt input-icon"></i>
                        <textarea
                          name="address"
                          rows={3}
                          placeholder="Enter complete address"
                          value={form.address}
                          onChange={handleChange}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Legal & Compliance */}
                <div className="form-section">
                  <h3 className="form-section-title">
                    <i className="fas fa-certificate"></i>
                    Legal & Compliance
                  </h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>GST Number</label>
                      <div className="input-wrapper">
                        <i className="fas fa-file-invoice input-icon"></i>
                        <input
                          type="text"
                          name="gstNumber"
                          placeholder="Enter GST number"
                          value={form.gstNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>FSSAI Number</label>
                      <div className="input-wrapper">
                        <i className="fas fa-shield-alt input-icon"></i>
                        <input
                          type="text"
                          name="fssaiNumber"
                          placeholder="Enter FSSAI license number"
                          value={form.fssaiNumber}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Hours */}
                <div className="form-section">
                  <h3 className="form-section-title">
                    <i className="fas fa-clock"></i>
                    Business Hours
                  </h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Opening Time</label>
                      <div className="input-wrapper">
                        <i className="fas fa-door-open input-icon"></i>
                        <input
                          type="time"
                          name="openingTime"
                          value={form.openingTime}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Closing Time</label>
                      <div className="input-wrapper">
                        <i className="fas fa-door-closed input-icon"></i>
                        <input
                          type="time"
                          name="closingTime"
                          value={form.closingTime}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ============================================================
    MARQUEE MANAGEMENT
============================================================ */}

                <div className="form-section">

                  <h3 className="form-section-title">
                    <i className="fas fa-scroll"></i>
                    Restaurant Marquee
                  </h3>

                  <p style={{ marginBottom: "20px", color: "#777" }}>
                    Add the scrolling text that will appear on your restaurant
                    customer page.
                  </p>


                  {/* ADD MARQUEE */}
                  <div
                    style={{
                      display: "flex",
                      gap: "12px",
                      alignItems: "center",
                      marginBottom: "25px",
                    }}
                  >

                    <div
                      className="input-wrapper"
                      style={{ flex: 1 }}
                    >
                      <i className="fas fa-circle input-icon"></i>

                      <input
                        type="text"
                        placeholder="Example: Crispy Fried Chicken"
                        value={marqueeText}
                        onChange={(e) =>
                          setMarqueeText(e.target.value)
                        }
                        maxLength={255}
                      />
                    </div>


                    <button
                      type="button"
                      className="primary-btn"
                      onClick={handleAddMarquee}
                      disabled={marqueeSaving}
                    >

                      {marqueeSaving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Adding...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i>
                          Add
                        </>
                      )}

                    </button>

                  </div>


                  {/* MARQUEE LIST */}
                  {marqueeLoading ? (

                    <div style={{ padding: "20px", textAlign: "center" }}>
                      <i className="fas fa-spinner fa-spin"></i>
                      <p>Loading marquee items...</p>
                    </div>

                  ) : marqueeItems.length === 0 ? (

                    <div
                      style={{
                        padding: "25px",
                        textAlign: "center",
                        border: "1px dashed #ddd",
                        borderRadius: "10px",
                      }}
                    >
                      <i
                        className="fas fa-scroll"
                        style={{
                          fontSize: "28px",
                          marginBottom: "10px",
                        }}
                      ></i>

                      <p style={{ margin: 0 }}>
                        No marquee items added yet.
                      </p>
                    </div>

                  ) : (

                    <div>

                      {marqueeItems.map((item, index) => (

                        <div
                          key={item.id}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "15px",
                            padding: "14px 16px",
                            border: "1px solid #eee",
                            borderRadius: "10px",
                            marginBottom: "10px",
                            background: "#fff",
                          }}
                        >

                          {/* NUMBER */}
                          <div
                            style={{
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "50%",
                              background: "#f5f5f5",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: 600,
                            }}
                          >
                            {index + 1}
                          </div>


                          {/* TEXT */}
                          <div style={{ flex: 1 }}>

                            <strong>
                              {item.text}
                            </strong>

                            <div
                              style={{
                                fontSize: "12px",
                                marginTop: "4px",
                                color: item.is_active
                                  ? "#28a745"
                                  : "#999",
                              }}
                            >
                              {item.is_active
                                ? "Active"
                                : "Inactive"}
                            </div>

                          </div>


                          {/* TOGGLE */}
                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() =>
                              handleToggleMarquee(item)
                            }
                          >
                            <i
                              className={
                                item.is_active
                                  ? "fas fa-eye"
                                  : "fas fa-eye-slash"
                              }
                            ></i>

                            {item.is_active
                              ? "Active"
                              : "Inactive"}
                          </button>


                          {/* DELETE */}
                          <button
                            type="button"
                            className="remove-btn"
                            onClick={() =>
                              handleDeleteMarquee(item.id)
                            }
                          >
                            <i className="fas fa-trash"></i>
                            Delete
                          </button>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

                {/* Save Button */}
                <div className="form-actions">
                  <button className="secondary-btn" type="button">
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                  <button className="primary-btn" onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Save Restaurant Profile
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
            {/* =========================================================
    OUR STORY
========================================================= */}
            <div className="dashboard-section">
              <div className="section-header-row">
                <div>
                  <h2>Our Story</h2>
                  <p>
                    Manage the Our Story section displayed on your restaurant page.
                  </p>
                </div>
              </div>

              <div className="form-section">

                <h3 className="form-section-title">
                  <i className="fas fa-images"></i>
                  Our Story Images
                </h3>

                <div className="branding-upload-grid">

                  {/* IMAGE 1 */}
                  <div className="upload-card">

                    <div className="upload-preview-area upload-cover-area">

                      {aboutImage1Preview ? (
                        <img
                          src={aboutImage1Preview}
                          alt="Our Story Image 1"
                          className="upload-preview-img"
                        />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="fas fa-image"></i>
                          <span>Our Story Image 1</span>
                          <p>Recommended: 800 x 800 px</p>
                        </div>
                      )}

                    </div>

                    <div className="upload-card-footer">

                      <label className="upload-btn">
                        <i className="fas fa-upload"></i>
                        Upload Image 1

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAboutImage1Change}
                          hidden
                        />
                      </label>

                      {aboutImage1Preview && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            setAboutImage1(null);
                            setAboutImage1Preview(null);
                          }}
                        >
                          <i className="fas fa-times"></i>
                          Remove
                        </button>
                      )}

                    </div>

                  </div>


                  {/* IMAGE 2 */}
                  <div className="upload-card">

                    <div className="upload-preview-area upload-cover-area">

                      {aboutImage2Preview ? (
                        <img
                          src={aboutImage2Preview}
                          alt="Our Story Image 2"
                          className="upload-preview-img"
                        />
                      ) : (
                        <div className="upload-placeholder">
                          <i className="fas fa-image"></i>
                          <span>Our Story Image 2</span>
                          <p>Recommended: 800 x 800 px</p>
                        </div>
                      )}

                    </div>

                    <div className="upload-card-footer">

                      <label className="upload-btn">
                        <i className="fas fa-upload"></i>
                        Upload Image 2

                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAboutImage2Change}
                          hidden
                        />
                      </label>

                      {aboutImage2Preview && (
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => {
                            setAboutImage2(null);
                            setAboutImage2Preview(null);
                          }}
                        >
                          <i className="fas fa-times"></i>
                          Remove
                        </button>
                      )}

                    </div>

                  </div>

                </div>

              </div>

              <div className="form-layout">

                {/* Main Story */}
                <div className="form-section">

                  <h3 className="form-section-title">
                    <i className="fas fa-book-open"></i>
                    Story Information
                  </h3>

                  <div className="form-grid">

                    {/* Years */}
                    <div className="form-group">
                      <label>
                        Years of Excellence
                        <span className="required">*</span>
                      </label>

                      <div className="input-wrapper">
                        <i className="fas fa-calendar-alt input-icon"></i>

                        <input
                          type="text"
                          name="years"
                          placeholder="12+"
                          value={aboutForm.years}
                          onChange={handleAboutChange}
                        />
                      </div>
                    </div>

                    {/* Title */}
                    <div className="form-group">
                      <label>
                        Story Title
                        <span className="required">*</span>
                      </label>

                      <div className="input-wrapper">
                        <i className="fas fa-heading input-icon"></i>

                        <input
                          type="text"
                          name="title"
                          placeholder="We Invite You to Visit Our Food Restaurant"
                          value={aboutForm.title}
                          onChange={handleAboutChange}
                        />
                      </div>
                    </div>

                    {/* Description */}
                    <div className="form-group full-width">
                      <label>
                        Story Description
                        <span className="required">*</span>
                      </label>

                      <textarea
                        name="description"
                        rows={5}
                        placeholder="Write your restaurant story..."
                        value={aboutForm.description}
                        onChange={handleAboutChange}
                        className="description-textarea"
                      />

                      <span className="char-count">
                        {aboutForm.description.length} / 1000 characters
                      </span>
                    </div>

                  </div>
                </div>


                {/* Feature 1 */}
                <div className="form-section">

                  <h3 className="form-section-title">
                    <i className="fas fa-leaf"></i>
                    Feature 1
                  </h3>

                  <div className="form-grid">

                    <div className="form-group">
                      <label>Feature Title</label>

                      <div className="input-wrapper">
                        <i className="fas fa-heading input-icon"></i>

                        <input
                          type="text"
                          name="feature1Title"
                          placeholder="100% Fresh Ingredients"
                          value={aboutForm.feature1Title}
                          onChange={handleAboutChange}
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Feature Description</label>

                      <textarea
                        name="feature1Description"
                        rows={3}
                        placeholder="Describe this feature..."
                        value={aboutForm.feature1Description}
                        onChange={handleAboutChange}
                      />
                    </div>

                  </div>
                </div>


                {/* Feature 2 */}
                <div className="form-section">

                  <h3 className="form-section-title">
                    <i className="fas fa-award"></i>
                    Feature 2
                  </h3>

                  <div className="form-grid">

                    <div className="form-group">
                      <label>Feature Title</label>

                      <div className="input-wrapper">
                        <i className="fas fa-heading input-icon"></i>

                        <input
                          type="text"
                          name="feature2Title"
                          placeholder="Award-Winning Recipes"
                          value={aboutForm.feature2Title}
                          onChange={handleAboutChange}
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Feature Description</label>

                      <textarea
                        name="feature2Description"
                        rows={3}
                        placeholder="Describe this feature..."
                        value={aboutForm.feature2Description}
                        onChange={handleAboutChange}
                      />
                    </div>

                  </div>
                </div>


                {/* Feature 3 */}
                <div className="form-section">

                  <h3 className="form-section-title">
                    <i className="fas fa-shipping-fast"></i>
                    Feature 3
                  </h3>

                  <div className="form-grid">

                    <div className="form-group">
                      <label>Feature Title</label>

                      <div className="input-wrapper">
                        <i className="fas fa-heading input-icon"></i>

                        <input
                          type="text"
                          name="feature3Title"
                          placeholder="Lightning-Fast Delivery"
                          value={aboutForm.feature3Title}
                          onChange={handleAboutChange}
                        />
                      </div>
                    </div>

                    <div className="form-group full-width">
                      <label>Feature Description</label>

                      <textarea
                        name="feature3Description"
                        rows={3}
                        placeholder="Describe this feature..."
                        value={aboutForm.feature3Description}
                        onChange={handleAboutChange}
                      />
                    </div>

                  </div>
                </div>


                {/* Save */}
                <div className="form-actions">

                  <button
                    className="secondary-btn"
                    type="button"
                    onClick={() =>
                      setAboutForm({
                        years: "",
                        title: "",
                        description: "",
                        feature1Title: "",
                        feature1Description: "",
                        feature2Title: "",
                        feature2Description: "",
                        feature3Title: "",
                        feature3Description: "",
                      })
                    }
                  >
                    <i className="fas fa-times"></i>
                    Clear
                  </button>

                  <button
                    className="primary-btn"
                    type="button"
                    onClick={handleAboutSave}
                    disabled={aboutSaving}
                  >
                    {aboutSaving ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Save Our Story
                      </>
                    )}
                  </button>

                </div>

              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}