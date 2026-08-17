  "use client";

  import { useEffect, useState } from "react";
  import {
    getStaff,
    createStaff,
    updateStaff,
    deleteStaff,
  } from "@/services/staff";

  type Staff = {
    id: number;
    owner_name: string;
    phone: string;
    email: string | null;
    username: string;
    staff_role: string;
    profile_image?: string | null;
    is_active: boolean;
  };

  export default function StaffPage() {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [staff, setStaff] = useState<Staff[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const [form, setForm] = useState({
      owner_name: "",
      phone: "",
      email: "",
      username: "",
      password: "",
      staff_role: "Manager",
      profile_image: null as File | null,
    });

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

      loadStaff();

      return () => {
        window.removeEventListener(
          "sidebarToggle",
          handleSidebarToggle as EventListener
        );
      };
    }, []);

    const loadStaff = async () => {
      try {
        setLoading(true);

        const res = await getStaff();

        setStaff(res.data);
      } catch (error: any) {
        console.error(error);

        alert(
          error.response?.data?.message ||
            "Unable to load staff."
        );
      } finally {
        setLoading(false);
      }
    };

    const handleChange = (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement
      >
    ) => {
      setForm((current) => ({
        ...current,
        [e.target.name]: e.target.value,
      }));
    };

    const handleProfileImageChange = (
      e: React.ChangeEvent<HTMLInputElement>
    ) => {
      const file = e.target.files?.[0] || null;

      setForm((current) => ({
        ...current,
        profile_image: file,
      }));
    };
    const resetForm = () => {
      setForm({
        owner_name: "",
        phone: "",
        email: "",
        username: "",
        password: "",
        staff_role: "Manager",
        profile_image: null,
      });

      setEditingId(null);
    };

    const handleSubmit = async (
      e: React.FormEvent
    ) => {
      e.preventDefault();

      if (
        !form.owner_name ||
        !form.phone ||
        !form.username ||
        !form.staff_role
      ) {
        alert("Please fill all required fields.");
        return;
      }

      if (!editingId && !form.password) {
        alert("Password is required.");
        return;
      }

      try {
        setSaving(true);

        const formData = new FormData();

        formData.append(
          "owner_name",
          form.owner_name
        );

        formData.append(
          "phone",
          form.phone
        );

        formData.append(
          "username",
          form.username
        );

        formData.append(
          "staff_role",
          form.staff_role
        );

        if (form.email) {
          formData.append(
            "email",
            form.email
          );
        }

        if (form.profile_image) {
          formData.append(
            "profile_image",
            form.profile_image
          );
        }

        if (!editingId) {
          formData.append(
            "password",
            form.password
          );
        }

        if (editingId) {
          await updateStaff(
            editingId,
            formData
          );

          alert(
            "Staff updated successfully."
          );
        } else {
          await createStaff(formData);

          alert(
            "Staff added successfully."
          );
        }

        resetForm();

        await loadStaff();
      } catch (error: any) {
        console.error(error);

        const errors =
          error.response?.data?.errors;

        if (errors) {
          const firstError =
            Object.values(errors)[0] as string[];

          alert(
            firstError?.[0] ||
              "Validation failed."
          );
        } else {
          alert(
            error.response?.data?.message ||
              "Something went wrong."
          );
        }
      } finally {
        setSaving(false);
      }
    };

    const handleEdit = (member: Staff) => {
      setEditingId(member.id);

      setForm({
        owner_name:
          member.owner_name || "",
        phone: member.phone || "",
        email: member.email || "",
        username:
          member.username || "",
        password: "",
        staff_role:
          member.staff_role || "Manager",
        profile_image: null,
      });

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };

    const handleDelete = async (
      id: number
    ) => {
      if (
        !window.confirm(
          "Are you sure you want to delete this staff member?"
        )
      ) {
        return;
      }

      try {
        await deleteStaff(id);

        setStaff((current) =>
          current.filter(
            (member) =>
              member.id !== id
          )
        );

        if (editingId === id) {
          resetForm();
        }

        alert(
          "Staff deleted successfully."
        );
      } catch (error: any) {
        console.error(error);

        alert(
          error.response?.data?.message ||
            "Unable to delete staff."
        );
      }
    };

    const roleIcons: Record<
      string,
      string
    > = {
      Manager: "fa-user-tie",
      Cashier: "fa-cash-register",
      Chef: "fa-fire",
      Waiter: "fa-user",
      "Delivery Boy":
        "fa-motorcycle",
    };

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

              {/* HEADER */}

              <div className="dashboard-welcome">
                <div className="welcome-content">

                  <div className="welcome-left">

                    <div className="page-badge">
                      <i className="fas fa-users"></i>

                      <span>
                        Staff Management
                      </span>
                    </div>

                    <h1>
                      Staff Management
                    </h1>

                    <p>
                      Add, edit and manage
                      your restaurant staff
                      members
                    </p>

                  </div>

                  <div className="header-stats">

                    <div className="header-stat">
                      <span className="header-stat-number">
                        {staff.length}
                      </span>

                      <span className="header-stat-label">
                        Total Staff
                      </span>
                    </div>

                    <div className="header-stat">
                      <span className="header-stat-number">
                        {
                          staff.filter(
                            (s) =>
                              s.is_active
                          ).length
                        }
                      </span>

                      <span className="header-stat-label">
                        Active
                      </span>
                    </div>

                  </div>

                </div>
              </div>

              {/* ADD / EDIT FORM */}

              <div className="dashboard-section">

                <div className="section-header-row">

                  <div>

                    <h2>
                      {editingId
                        ? "Edit Staff Member"
                        : "Add New Staff"}
                    </h2>

                    <p>
                      {editingId
                        ? "Update staff details"
                        : "Add a new member to your team"}
                    </p>

                  </div>

                  {editingId && (
                    <button
                      type="button"
                      className="secondary-btn"
                      onClick={resetForm}
                    >
                      <i className="fas fa-plus"></i>
                      Add New
                    </button>
                  )}

                </div>

                <form
                  onSubmit={handleSubmit}
                >

                  <div className="form-grid">

                    {/* PROFILE PICTURE */}

                    <div className="form-group">

                      <label>
                        Profile Picture
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-camera input-icon"></i>

                        <input
                          type="file"
                          name="profile_image"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleProfileImageChange}
                        />

                      </div>

                      <small
                        style={{
                          display: "block",
                          marginTop: "6px",
                          color: "#6b7280",
                        }}
                      >
                        JPG, PNG or WEBP
                      </small>

                      {form.profile_image && (
                        <small
                          style={{
                            display: "block",
                            marginTop: "6px",
                            color: "#374151",
                          }}
                        >
                          Selected:{" "}
                          {
                            form
                              .profile_image
                              .name
                          }
                        </small>
                      )}

                    </div>

                    {/* NAME */}

                    <div className="form-group">

                      <label>
                        Full Name{" "}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-user input-icon"></i>

                        <input
                          type="text"
                          name="owner_name"
                          value={
                            form.owner_name
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="Rahul Sharma"
                        />

                      </div>

                    </div>

                    {/* PHONE */}

                    <div className="form-group">

                      <label>
                        Phone{" "}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-phone input-icon"></i>

                        <input
                          type="text"
                          name="phone"
                          value={
                            form.phone
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="9876543210"
                        />

                      </div>

                    </div>

                    {/* EMAIL */}

                    <div className="form-group">

                      <label>
                        Email
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-envelope input-icon"></i>

                        <input
                          type="email"
                          name="email"
                          value={
                            form.email
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="staff@email.com"
                        />

                      </div>

                    </div>

                    {/* ROLE */}

                    <div className="form-group">

                      <label>
                        Role{" "}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-briefcase input-icon"></i>

                        <select
                          name="staff_role"
                          value={
                            form.staff_role
                          }
                          onChange={
                            handleChange
                          }
                        >
                          <option value="Manager">
                            Manager
                          </option>

                          <option value="Cashier">
                            Cashier
                          </option>

                          <option value="Chef">
                            Chef
                          </option>

                          <option value="Waiter">
                            Waiter
                          </option>

                          <option value="Delivery Boy">
                            Delivery Boy
                          </option>
                        </select>

                      </div>

                    </div>

                    {/* USERNAME */}

                    <div className="form-group">

                      <label>
                        Username{" "}
                        <span className="required">
                          *
                        </span>
                      </label>

                      <div className="input-wrapper">

                        <i className="fas fa-at input-icon"></i>

                        <input
                          type="text"
                          name="username"
                          value={
                            form.username
                          }
                          onChange={
                            handleChange
                          }
                          placeholder="staff001"
                        />

                      </div>

                    </div>

                    {/* PASSWORD */}

                    {!editingId && (
                      <div className="form-group">

                        <label>
                          Password{" "}
                          <span className="required">
                            *
                          </span>
                        </label>

                        <div className="input-wrapper">

                          <i className="fas fa-lock input-icon"></i>

                          <input
                            type="password"
                            name="password"
                            value={
                              form.password
                            }
                            onChange={
                              handleChange
                            }
                            placeholder="••••••"
                          />

                        </div>

                      </div>
                    )}

                  </div>

                  <div className="form-actions">

                    {editingId && (
                      <button
                        type="button"
                        className="secondary-btn"
                        onClick={
                          resetForm
                        }
                      >
                        <i className="fas fa-times"></i>
                        Cancel
                      </button>
                    )}

                    <button
                      type="submit"
                      className="primary-btn"
                      disabled={saving}
                    >

                      {saving ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : editingId ? (
                        <>
                          <i className="fas fa-save"></i>
                          Update Staff
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus"></i>
                          Add Staff
                        </>
                      )}

                    </button>

                  </div>

                </form>

              </div>

              {/* STAFF LIST */}

              <div className="dashboard-section">

                <div className="section-header-row">

                  <div>

                    <h2>
                      Staff Members
                    </h2>

                    <p>
                      All team members and
                      their details
                    </p>

                  </div>

                </div>

                {loading ? (

                  <div className="loading-state">

                    {[1, 2, 3, 4].map(
                      (i) => (
                        <div
                          key={i}
                          className="skeleton skeleton-item-lg"
                        ></div>
                      )
                    )}

                  </div>

                ) : staff.length === 0 ? (

                  <div className="empty-state">

                    <div className="empty-state-icon">
                      <i className="fas fa-users-slash"></i>
                    </div>

                    <h3>
                      No Staff Members
                    </h3>

                    <p>
                      Add your first staff
                      member using the
                      form above.
                    </p>

                  </div>

                ) : (

                  <div className="table-responsive">

                    <table className="menu-table">

                      <thead>

                        <tr>
                          <th>Photo</th>
                          <th>Name</th>
                          <th>Username</th>
                          <th>Role</th>
                          <th>Phone</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>

                      </thead>

                      <tbody>

                        {staff.map(
                          (member) => (

                            <tr
                              key={member.id}
                            >

                              {/* PHOTO */}

                              <td>

                                {member.profile_image ? (

                                  <img
                                    src={
                                      member.profile_image
                                    }
                                    alt={
                                      member.owner_name
                                    }
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      borderRadius:
                                        "50%",
                                      objectFit:
                                        "cover",
                                    }}
                                  />

                                ) : (

                                  <div
                                    style={{
                                      width: "48px",
                                      height: "48px",
                                      borderRadius:
                                        "50%",
                                      display:
                                        "flex",
                                      alignItems:
                                        "center",
                                      justifyContent:
                                        "center",
                                      background:
                                        "#f3f4f6",
                                    }}
                                  >
                                    <i className="fas fa-user"></i>
                                  </div>

                                )}

                              </td>

                              {/* NAME */}

                              <td>

                                <div className="item-name-cell">

                                  <span className="item-name">
                                    {
                                      member.owner_name
                                    }
                                  </span>

                                  {member.email && (
                                    <span className="item-desc">
                                      {
                                        member.email
                                      }
                                    </span>
                                  )}

                                </div>

                              </td>

                              {/* USERNAME */}

                              <td>
                                {
                                  member.username
                                }
                              </td>

                              {/* ROLE */}

                              <td>

                                <span className="role-badge">

                                  <i
                                    className={`fas ${
                                      roleIcons[
                                        member
                                          .staff_role
                                      ] ||
                                      "fa-user"
                                    }`}
                                  ></i>

                                  {
                                    member.staff_role
                                  }

                                </span>

                              </td>

                              {/* PHONE */}

                              <td>
                                {
                                  member.phone
                                }
                              </td>

                              {/* STATUS */}

                              <td>

                                <span
                                  className={`status-toggle ${
                                    member.is_active
                                      ? "status-active"
                                      : "status-inactive"
                                  }`}
                                >

                                  <span
                                    className={`status-dot-sm ${
                                      member.is_active
                                        ? "dot-available"
                                        : "dot-unavailable"
                                    }`}
                                  ></span>

                                  {member.is_active
                                    ? "Active"
                                    : "Inactive"}

                                </span>

                              </td>

                              {/* ACTIONS */}

                              <td>

                                <div className="action-btns">

                                  <button
                                    type="button"
                                    className="icon-btn edit-icon-btn"
                                    onClick={() =>
                                      handleEdit(
                                        member
                                      )
                                    }
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>

                                  <button
                                    type="button"
                                    className="icon-btn delete-icon-btn"
                                    onClick={() =>
                                      handleDelete(
                                        member.id
                                      )
                                    }
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>

                                </div>

                              </td>

                            </tr>

                          )
                        )}

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