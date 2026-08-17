"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type HeroForm = {
  hero_badge: string;
  hero_title_line_1: string;
  hero_title_line_2: string;
  hero_title_line_3: string;
  hero_title_line_4: string;
  hero_description: string;

  hero_owner_name: string;

  hero_deal_title: string;
  hero_deal_subtitle: string;

  hero_delivery_time: string;
  hero_delivery_subtitle: string;

  hero_rating: string;
  hero_reviews: string;

  hero_explore_button: string;
  hero_story_button: string;

  hero_customers_count: string;
  hero_menu_count: string;
  hero_chefs_count: string;
  hero_experience_count: string;
};

const initialForm: HeroForm = {
  hero_badge: "",
  hero_title_line_1: "",
  hero_title_line_2: "",
  hero_title_line_3: "",
  hero_title_line_4: "",
  hero_description: "",

  hero_owner_name: "",

  hero_deal_title: "",
  hero_deal_subtitle: "",

  hero_delivery_time: "",
  hero_delivery_subtitle: "",

  hero_rating: "",
  hero_reviews: "",

  hero_explore_button: "",
  hero_story_button: "",

  hero_customers_count: "",
  hero_menu_count: "",
  hero_chefs_count: "",
  hero_experience_count: "",
};

export default function HeroEditor() {
  const [form, setForm] = useState<HeroForm>(initialForm);

  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadHero();
  }, []);

  const loadHero = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/owner/hero");

      if (response.data?.success) {
        const hero = response.data.hero;

        setForm({
          hero_badge: hero?.hero_badge ?? "",
          hero_title_line_1: hero?.hero_title_line_1 ?? "",
          hero_title_line_2: hero?.hero_title_line_2 ?? "",
          hero_title_line_3: hero?.hero_title_line_3 ?? "",
          hero_title_line_4: hero?.hero_title_line_4 ?? "",
          hero_description: hero?.hero_description ?? "",

          hero_owner_name: hero?.hero_owner_name ?? "",

          hero_deal_title: hero?.hero_deal_title ?? "",
          hero_deal_subtitle: hero?.hero_deal_subtitle ?? "",

          hero_delivery_time: hero?.hero_delivery_time ?? "",
          hero_delivery_subtitle: hero?.hero_delivery_subtitle ?? "",

          hero_rating: hero?.hero_rating ?? "",
          hero_reviews: hero?.hero_reviews ?? "",

          hero_explore_button: hero?.hero_explore_button ?? "",
          hero_story_button: hero?.hero_story_button ?? "",

          hero_customers_count: hero?.hero_customers_count ?? "",
          hero_menu_count: hero?.hero_menu_count ?? "",
          hero_chefs_count: hero?.hero_chefs_count ?? "",
          hero_experience_count: hero?.hero_experience_count ?? "",
        });

        setImagePreview(hero?.hero_image ?? null);
      }
    } catch (err: any) {
      console.error("Hero load error:", err);

      setError(
        err?.response?.data?.message ||
          "Unable to load hero section."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    setHeroImage(file);

    const reader = new FileReader();

    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        data.append(key, value);
      });

      if (heroImage) {
        data.append("hero_image", heroImage);
      }

      const response = await api.post("/owner/hero", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        setMessage("Hero section saved successfully!");

        if (response.data.hero?.hero_image) {
          setImagePreview(response.data.hero.hero_image);
        }

        setHeroImage(null);
      }
    } catch (err: any) {
      console.error("Hero save error:", err);

      if (err?.response?.status === 422) {
        setError(
          err?.response?.data?.message ||
            "Please check the entered information."
        );
      } else {
        setError(
          err?.response?.data?.message ||
            "Unable to save hero section."
        );
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-section">
        <div className="section-header-row">
          <div>
            <h2>Hero Section</h2>
            <p>Loading hero settings...</p>
          </div>
        </div>

        <div className="form-section">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <div className="section-header-row">
        <div>
          <h2>Hero Section</h2>
          <p>
            Manage everything displayed in the main restaurant hero
            section.
          </p>
        </div>
      </div>

      {/* Success */}
      {message && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#eaf8ef",
            color: "#187a3d",
            fontWeight: 600,
          }}
        >
          <i
            className="fas fa-check-circle"
            style={{ marginRight: "8px" }}
          ></i>
          {message}
        </div>
      )}

      {/* Error */}
      {error && (
        <div
          style={{
            padding: "14px 18px",
            marginBottom: "20px",
            borderRadius: "10px",
            background: "#fff0f0",
            color: "#c62828",
            fontWeight: 600,
          }}
        >
          <i
            className="fas fa-exclamation-circle"
            style={{ marginRight: "8px" }}
          ></i>
          {error}
        </div>
      )}

      {/* Hero Image */}
      <div className="form-section">
        <h3 className="form-section-title">
          <i className="fas fa-image"></i>
          Hero Image
        </h3>

        <div className="branding-upload-grid">
          <div className="upload-card">
            <div
              className="upload-preview-area"
              style={{
                minHeight: "280px",
                overflow: "hidden",
              }}
            >
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Hero preview"
                  className="upload-preview-img"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div className="upload-placeholder">
                  <i className="fas fa-image"></i>
                  <span>Hero Image</span>
                  <p>
                    Recommended: 800 x 800 px
                  </p>
                </div>
              )}
            </div>

            <div className="upload-card-footer">
              <label className="upload-btn">
                <i className="fas fa-upload"></i>
                Upload Hero Image

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />
              </label>

              {imagePreview && (
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => {
                    setHeroImage(null);
                    setImagePreview(null);
                  }}
                >
                  <i className="fas fa-times"></i>
                  Remove Preview
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Hero Content */}
      <div className="form-section">
        <h3 className="form-section-title">
          <i className="fas fa-heading"></i>
          Main Hero Content
        </h3>

        <div className="form-grid">

          <div className="form-group full-width">
            <label>Top Badge</label>

            <div className="input-wrapper">
              <i className="fas fa-star input-icon"></i>

              <input
                type="text"
                name="hero_badge"
                placeholder="e.g. #1 Rated Fast Food Restaurant in New York"
                value={form.hero_badge}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Title Line 1</label>

            <div className="input-wrapper">
              <i className="fas fa-font input-icon"></i>

              <input
                type="text"
                name="hero_title_line_1"
                placeholder="e.g. Delicious"
                value={form.hero_title_line_1}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Title Line 2</label>

            <div className="input-wrapper">
              <i className="fas fa-font input-icon"></i>

              <input
                type="text"
                name="hero_title_line_2"
                placeholder="e.g. Fast Food"
                value={form.hero_title_line_2}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Title Line 3</label>

            <div className="input-wrapper">
              <i className="fas fa-font input-icon"></i>

              <input
                type="text"
                name="hero_title_line_3"
                placeholder="e.g. for Every"
                value={form.hero_title_line_3}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Title Line 4</label>

            <div className="input-wrapper">
              <i className="fas fa-font input-icon"></i>

              <input
                type="text"
                name="hero_title_line_4"
                placeholder="e.g. Moment"
                value={form.hero_title_line_4}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label>Hero Description</label>

            <div className="input-wrapper">
              <i className="fas fa-align-left input-icon"></i>

              <textarea
                name="hero_description"
                rows={4}
                placeholder="Write your restaurant hero description..."
                value={form.hero_description}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

        </div>
      </div>

      {/* Owner / Deal */}
      <div className="form-section">
        <h3 className="form-section-title">
          <i className="fas fa-fire"></i>
          Hero Cards
        </h3>

        <div className="form-grid">

          <div className="form-group">
            <label>Owner Name</label>

            <div className="input-wrapper">
              <i className="fas fa-user input-icon"></i>

              <input
                type="text"
                name="hero_owner_name"
                placeholder="e.g. Owner"
                value={form.hero_owner_name}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Deal Title</label>

            <div className="input-wrapper">
              <i className="fas fa-fire input-icon"></i>

              <input
                type="text"
                name="hero_deal_title"
                placeholder="e.g. Hot Deal"
                value={form.hero_deal_title}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Deal Subtitle</label>

            <div className="input-wrapper">
              <i className="fas fa-percent input-icon"></i>

              <input
                type="text"
                name="hero_deal_subtitle"
                placeholder="e.g. 30% off today"
                value={form.hero_deal_subtitle}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Delivery Time</label>

            <div className="input-wrapper">
              <i className="fas fa-clock input-icon"></i>

              <input
                type="text"
                name="hero_delivery_time"
                placeholder="e.g. 20 min"
                value={form.hero_delivery_time}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Delivery Subtitle</label>

            <div className="input-wrapper">
              <i className="fas fa-truck input-icon"></i>

              <input
                type="text"
                name="hero_delivery_subtitle"
                placeholder="e.g. Fast delivery"
                value={form.hero_delivery_subtitle}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Rating</label>

            <div className="input-wrapper">
              <i className="fas fa-star input-icon"></i>

              <input
                type="text"
                name="hero_rating"
                placeholder="e.g. 4.9/5"
                value={form.hero_rating}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Reviews</label>

            <div className="input-wrapper">
              <i className="fas fa-comments input-icon"></i>

              <input
                type="text"
                name="hero_reviews"
                placeholder="e.g. 2k+ reviews"
                value={form.hero_reviews}
                onChange={handleChange}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Buttons */}
      <div className="form-section">
        <h3 className="form-section-title">
          <i className="fas fa-mouse-pointer"></i>
          Hero Buttons
        </h3>

        <div className="form-grid">

          <div className="form-group">
            <label>Explore Menu Button</label>

            <div className="input-wrapper">
              <i className="fas fa-utensils input-icon"></i>

              <input
                type="text"
                name="hero_explore_button"
                placeholder="e.g. Explore Menu"
                value={form.hero_explore_button}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Story Button</label>

            <div className="input-wrapper">
              <i className="fas fa-play input-icon"></i>

              <input
                type="text"
                name="hero_story_button"
                placeholder="e.g. Watch Our Story"
                value={form.hero_story_button}
                onChange={handleChange}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Statistics */}
      <div className="form-section">
        <h3 className="form-section-title">
          <i className="fas fa-chart-line"></i>
          Hero Statistics
        </h3>

        <div className="form-grid">

          <div className="form-group">
            <label>Happy Customers</label>

            <div className="input-wrapper">
              <i className="fas fa-users input-icon"></i>

              <input
                type="text"
                name="hero_customers_count"
                placeholder="e.g. 850+"
                value={form.hero_customers_count}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Menu Items</label>

            <div className="input-wrapper">
              <i className="fas fa-book-open input-icon"></i>

              <input
                type="text"
                name="hero_menu_count"
                placeholder="e.g. 120+"
                value={form.hero_menu_count}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Expert Chefs</label>

            <div className="input-wrapper">
              <i className="fas fa-user-chef input-icon"></i>

              <input
                type="text"
                name="hero_chefs_count"
                placeholder="e.g. 15+"
                value={form.hero_chefs_count}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Experience</label>

            <div className="input-wrapper">
              <i className="fas fa-award input-icon"></i>

              <input
                type="text"
                name="hero_experience_count"
                placeholder="e.g. 12Y"
                value={form.hero_experience_count}
                onChange={handleChange}
              />
            </div>
          </div>

        </div>
      </div>

      {/* Save */}
      <div className="form-actions">
        <button
          className="primary-btn"
          type="button"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Saving...
            </>
          ) : (
            <>
              <i className="fas fa-save"></i>
              Save Hero Section
            </>
          )}
        </button>
      </div>
    </div>
  );
}