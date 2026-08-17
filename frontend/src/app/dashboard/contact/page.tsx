"use client";

import { useState, useEffect } from "react";
import api from "@/lib/axios";

type ContactInfo = {
  phone: string;
  email: string;
  address: string;
  googleMapUrl: string;
};

type SocialLink = {
  platform: string;
  url: string;
  icon: string;
  color: string;
};

const defaultSocialLinks: SocialLink[] = [
  {
    platform: "Facebook",
    url: "",
    icon: "fa-facebook-f",
    color: "facebook",
  },
  {
    platform: "Instagram",
    url: "",
    icon: "fa-instagram",
    color: "instagram",
  },
  {
    platform: "Twitter",
    url: "",
    icon: "fa-twitter",
    color: "twitter",
  },
  {
    platform: "YouTube",
    url: "",
    icon: "fa-youtube",
    color: "youtube",
  },
  {
    platform: "LinkedIn",
    url: "",
    icon: "fa-linkedin-in",
    color: "linkedin",
  },
  {
    platform: "WhatsApp",
    url: "",
    icon: "fa-whatsapp",
    color: "whatsapp",
  },
];

export default function ContactPage() {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [contactForm, setContactForm] =
    useState<ContactInfo>({
      phone: "",
      email: "",
      address: "",
      googleMapUrl: "",
    });

  const [socialLinks, setSocialLinks] =
    useState<SocialLink[]>(
      defaultSocialLinks
    );

  /*
  |--------------------------------------------------------------------------
  | SIDEBAR
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
  const saved = localStorage.getItem("sidebarCollapsed");

  if (saved === "true") {
    setSidebarCollapsed(true);
  }

  const handleSidebarToggle = (e: CustomEvent) => {
    setSidebarCollapsed(e.detail.collapsed);
  };

  window.addEventListener(
    "sidebarToggle",
    handleSidebarToggle as EventListener
  );

  const loadContactSettings = async () => {
    try {
      const response = await api.get("/contact/settings");

      const settings = response.data.settings;

      if (!settings) {
        return;
      }

      setContactForm({
        phone: settings.phone || "",
        email: settings.email || "",
        address: settings.address || "",
        googleMapUrl: settings.google_map_url || "",
      });

      if (settings.social_links) {
        setSocialLinks(
          socialLinks.map((social) => ({
            ...social,
            url: settings.social_links[social.platform] || "",
          }))
        );
      }
    } catch (error: any) {
      console.error(
        "Failed to load contact settings:",
        error
      );
    }

  };

  loadContactSettings();

  return () => {
    window.removeEventListener(
      "sidebarToggle",
      handleSidebarToggle as EventListener
    );
  };
}, []);

  /*
  |--------------------------------------------------------------------------
  | LOAD CONTACT SETTINGS
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    loadContactSettings();
  }, []);

  const authHeader = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem(
        "token"
      )}`,
    },
  });

  const loadContactSettings = async () => {
    try {
      setLoading(true);

      const response = await api.get(
        "/contact/settings",
        authHeader()
      );

      const data =
        response.data;

      if (data.contact) {
        setContactForm({
          phone:
            data.contact.phone || "",
          email:
            data.contact.email || "",
          address:
            data.contact.address || "",
          googleMapUrl:
            data.contact.googleMapUrl || "",
        });
      }

      if (
        Array.isArray(
          data.socialLinks
        )
      ) {
        setSocialLinks(
          defaultSocialLinks.map(
            (defaultItem) => {
              const savedItem =
                data.socialLinks.find(
                  (item: SocialLink) =>
                    item.platform ===
                    defaultItem.platform
                );

              return {
                ...defaultItem,
                url:
                  savedItem?.url || "",
              };
            }
          )
        );
      }
    } catch (error: any) {
      console.error(
        "Contact settings error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Unable to load contact settings."
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  |--------------------------------------------------------------------------
  | CONTACT INPUT
  |--------------------------------------------------------------------------
  */

  const handleContactChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {
    setContactForm({
      ...contactForm,
      [e.target.name]: e.target.value,
    });
  };

  /*
  |--------------------------------------------------------------------------
  | SOCIAL INPUT
  |--------------------------------------------------------------------------
  */

  const handleSocialChange = (
    index: number,
    url: string
  ) => {
    const updated = [
      ...socialLinks,
    ];

    updated[index].url = url;

    setSocialLinks(updated);
  };

  /*
  |--------------------------------------------------------------------------
  | SAVE
  |--------------------------------------------------------------------------
  */

  const handleSave = async () => {
  try {
    setSaving(true);

    const socialData = socialLinks.reduce(
      (acc, social) => {
        acc[social.platform] = social.url;
        return acc;
      },
      {} as Record<string, string>
    );

    await api.put("/contact/settings", {
      phone: contactForm.phone,
      email: contactForm.email,
      address: contactForm.address,
      google_map_url: contactForm.googleMapUrl,
      social_links: socialData,
    });

    alert("Contact & social information saved successfully!");
  } catch (error: any) {
    console.error(
      "Failed to save contact settings:",
      error
    );

    alert(
      error.response?.data?.message ||
      "Unable to save contact information."
    );
  } finally {
    setSaving(false);
  }
};

  /*
  |--------------------------------------------------------------------------
  | CANCEL
  |--------------------------------------------------------------------------
  */

  const handleCancel = () => {
    loadContactSettings();
  };

  /*
  |--------------------------------------------------------------------------
  | LOADING
  |--------------------------------------------------------------------------
  */

  if (loading) {
    return (
      <div className="owner-layout">
        <main className="owner-main-content">
          <div className="dashboard-page">
            <div className="dashboard-container">
              <div className="empty-state">
                Loading contact settings...
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | PAGE
  |--------------------------------------------------------------------------
  */

  return (
    <div className="owner-layout">
      <main
        className={`owner-main-content ${
          sidebarCollapsed
            ? "sidebar-collapsed-main"
            : "sidebar-expanded-main"
        }`}
      >
        <div className="dashboard-page">
          <div className="dashboard-container">

            {/* PAGE HEADER */}

            <div className="dashboard-welcome">
              <div className="welcome-content">
                <div className="welcome-left">

                  <div className="page-badge">
                    <i className="fas fa-address-book"></i>
                    <span>
                      Contact & Social
                    </span>
                  </div>

                  <h1>
                    Contact & Social
                  </h1>

                  <p>
                    Manage contact information
                    and social media links
                  </p>

                </div>
              </div>
            </div>

            {/* CONTACT INFORMATION */}

            <div className="dashboard-section">

              <div className="section-header-row">
                <div>
                  <h2>
                    Contact Information
                  </h2>

                  <p>
                    Your restaurant contact
                    details visible to
                    customers
                  </p>
                </div>
              </div>

              <div className="form-layout">

                <div className="form-section">

                  <h3 className="form-section-title">
                    <i className="fas fa-info-circle"></i>
                    Contact Details
                  </h3>

                  <div className="form-grid">

                    {/* PHONE */}

                    <div className="form-group">

                      <label>
                        Phone Number
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-phone input-icon"></i>

                        <input
                          type="text"
                          name="phone"
                          placeholder="+91 98765 43210"
                          value={
                            contactForm.phone
                          }
                          onChange={
                            handleContactChange
                          }
                        />

                      </div>
                    </div>

                    {/* EMAIL */}

                    <div className="form-group">

                      <label>
                        Email Address
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-envelope input-icon"></i>

                        <input
                          type="email"
                          name="email"
                          placeholder="restaurant@email.com"
                          value={
                            contactForm.email
                          }
                          onChange={
                            handleContactChange
                          }
                        />

                      </div>
                    </div>

                    {/* ADDRESS */}

                    <div className="form-group full-width">

                      <label>
                        Address
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-map-marker-alt input-icon"></i>

                        <textarea
                          name="address"
                          rows={3}
                          placeholder="Enter complete restaurant address"
                          value={
                            contactForm.address
                          }
                          onChange={
                            handleContactChange
                          }
                        />

                      </div>
                    </div>

                    {/* GOOGLE MAP */}

                    <div className="form-group full-width">

                      <label>
                        Google Maps Embed URL
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-map input-icon"></i>

                        <input
                          type="text"
                          name="googleMapUrl"
                          placeholder="Paste Google Maps embed URL"
                          value={
                            contactForm.googleMapUrl
                          }
                          onChange={
                            handleContactChange
                          }
                        />

                      </div>
                    </div>

                  </div>
                </div>
              </div>
            </div>

            {/* SOCIAL MEDIA */}

            <div className="dashboard-section">

              <div className="section-header-row">

                <div>

                  <h2>
                    Social Media Links
                  </h2>

                  <p>
                    Connect your social media
                    profiles with your
                    restaurant
                  </p>

                </div>

              </div>

              <div className="social-links-grid">

                {socialLinks.map(
                  (social, index) => (

                    <div
                      className="social-link-card"
                      key={
                        social.platform
                      }
                    >

                      <div
                        className={`social-icon-wrapper social-${social.color}`}
                      >
                        <i
                          className={`fab ${social.icon}`}
                        ></i>
                      </div>

                      <div className="social-input-group">

                        <label>
                          {social.platform}
                        </label>

                        <div className="input-wrapper">

                          <i
                            className={`fab ${social.icon} input-icon`}
                          ></i>

                          <input
                            type="url"
                            placeholder={`https://${social.platform.toLowerCase()}.com/yourhandle`}
                            value={
                              social.url
                            }
                            onChange={(e) =>
                              handleSocialChange(
                                index,
                                e.target.value
                              )
                            }
                          />

                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>
            </div>

            {/* ACTIONS */}

            <div className="form-actions">

              <button
                className="secondary-btn"
                type="button"
                onClick={
                  handleCancel
                }
                disabled={saving}
              >
                <i className="fas fa-times"></i>
                Cancel
              </button>

              <button
                className="primary-btn"
                type="button"
                onClick={
                  handleSave
                }
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
                    Save Changes
                  </>
                )}

              </button>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}