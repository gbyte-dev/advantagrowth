"use client";

import { useEffect, useState } from "react";
import api from "@/lib/axios";

type ContactMessage = {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
};

export default function ContactMessagesPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] =
    useState<ContactMessage | null>(null);

  const loadMessages = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");

      const response = await api.get("/contact/messages", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(response.data.messages || []);
    } catch (error: any) {
      console.error("Contact messages error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  const toggleRead = async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      const response = await api.patch(
        `/contact/messages/${id}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessages((current) =>
        current.map((message) =>
          message.id === id
            ? {
                ...message,
                is_read: response.data.is_read,
              }
            : message
        )
      );

      if (selectedMessage?.id === id) {
        setSelectedMessage((current) =>
          current
            ? {
                ...current,
                is_read: response.data.is_read,
              }
            : null
        );
      }
    } catch (error: any) {
      console.error("Read status error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to update message status."
      );
    }
  };

  const deleteMessage = async (id: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this message?"
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem("token");

      await api.delete(`/contact/messages/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages((current) =>
        current.filter((message) => message.id !== id)
      );

      if (selectedMessage?.id === id) {
        setSelectedMessage(null);
      }
    } catch (error: any) {
      console.error("Delete message error:", error);

      alert(
        error.response?.data?.message ||
          "Unable to delete message."
      );
    }
  };

  const unreadCount = messages.filter(
    (message) => !message.is_read
  ).length;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  if (loading) {
    return (
      <div className="owner-layout">
        <main className="owner-main-content">
          <div className="dashboard-page">
            <div className="dashboard-container">
              <div className="empty-state">
                Loading contact messages...
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="owner-layout">
      <main className="owner-main-content">
        <div className="dashboard-page">
          <div className="dashboard-container">

            {/* HEADER */}

            <div className="dashboard-welcome">
              <div className="welcome-content">
                <div className="welcome-left">

                  <div className="page-badge">
                    <i className="fas fa-envelope"></i>

                    <span>
                      Contact Messages
                    </span>
                  </div>

                  <h1>
                    Contact Messages
                  </h1>

                  <p>
                    Messages received from your
                    restaurant customers
                  </p>

                </div>
              </div>
            </div>

            {/* STATS */}

            <div className="dashboard-section">

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                }}
              >

                <div className="dashboard-card">
                  <div>
                    <small>
                      Total Messages
                    </small>

                    <h2>
                      {messages.length}
                    </h2>
                  </div>

                  <i className="fas fa-envelope"></i>
                </div>

                <div className="dashboard-card">
                  <div>
                    <small>
                      Unread Messages
                    </small>

                    <h2>
                      {unreadCount}
                    </h2>
                  </div>

                  <i className="fas fa-envelope-open"></i>
                </div>

                <div className="dashboard-card">
                  <div>
                    <small>
                      Read Messages
                    </small>

                    <h2>
                      {messages.length -
                        unreadCount}
                    </h2>
                  </div>

                  <i className="fas fa-check-circle"></i>
                </div>

              </div>

            </div>

            {/* MESSAGES */}

            <div className="dashboard-section">

              <div className="section-header-row">

                <div>
                  <h2>
                    Customer Messages
                  </h2>

                  <p>
                    View and manage customer
                    enquiries
                  </p>
                </div>

              </div>

              {messages.length === 0 ? (

                <div className="empty-state">

                  <div className="empty-state-icon">
                    <i className="fas fa-inbox"></i>
                  </div>

                  <h3>
                    No Messages Yet
                  </h3>

                  <p>
                    Customer contact messages
                    will appear here.
                  </p>

                </div>

              ) : (

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >

                  {messages.map((message) => (

                    <div
                      key={message.id}
                      onClick={() =>
                        setSelectedMessage(message)
                      }
                      style={{
                        padding: "20px",
                        borderRadius: "12px",
                        border: message.is_read
                          ? "1px solid #e5e7eb"
                          : "2px solid #111827",
                        background:
                          message.is_read
                            ? "#ffffff"
                            : "#f9fafb",
                        cursor: "pointer",
                        transition:
                          "all 0.2s ease",
                      }}
                    >

                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          alignItems: "flex-start",
                          gap: "20px",
                        }}
                      >

                        <div
                          style={{
                            flex: 1,
                          }}
                        >

                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: "10px",
                              marginBottom:
                                "8px",
                            }}
                          >

                            {!message.is_read && (
                              <span
                                style={{
                                  width: "8px",
                                  height: "8px",
                                  borderRadius:
                                    "50%",
                                  background:
                                    "#ef4444",
                                  display:
                                    "inline-block",
                                }}
                              />
                            )}

                            <strong>
                              {message.name}
                            </strong>

                            <span
                              style={{
                                color: "#6b7280",
                                fontSize:
                                  "14px",
                              }}
                            >
                              {message.email}
                            </span>

                          </div>

                          <h3
                            style={{
                              margin:
                                "0 0 6px",
                            }}
                          >
                            {message.subject}
                          </h3>

                          <p
                            style={{
                              margin: 0,
                              color: "#6b7280",
                              display:
                                "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient:
                                "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {message.message}
                          </p>

                          <small
                            style={{
                              display:
                                "block",
                              marginTop:
                                "10px",
                              color: "#9ca3af",
                            }}
                          >
                            {formatDate(
                              message.created_at
                            )}
                          </small>

                        </div>

                        <div
                          style={{
                            display: "flex",
                            gap: "8px",
                          }}
                          onClick={(e) =>
                            e.stopPropagation()
                          }
                        >

                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() =>
                              toggleRead(
                                message.id
                              )
                            }
                          >
                            <i
                              className={
                                message.is_read
                                  ? "fas fa-envelope"
                                  : "fas fa-envelope-open"
                              }
                            ></i>

                            {message.is_read
                              ? "Unread"
                              : "Read"}
                          </button>

                          <button
                            type="button"
                            className="secondary-btn"
                            onClick={() =>
                              deleteMessage(
                                message.id
                              )
                            }
                          >
                            <i className="fas fa-trash"></i>
                          </button>

                        </div>

                      </div>

                    </div>

                  ))}

                </div>

              )}

            </div>

            {/* MESSAGE DETAIL */}

            {selectedMessage && (

              <div className="dashboard-section">

                <div className="section-header-row">

                  <div>
                    <h2>
                      Message Details
                    </h2>

                    <p>
                      Customer enquiry details
                    </p>
                  </div>

                  <button
                    type="button"
                    className="secondary-btn"
                    onClick={() =>
                      setSelectedMessage(null)
                    }
                  >
                    <i className="fas fa-times"></i>
                    Close
                  </button>

                </div>

                <div
                  style={{
                    padding: "25px",
                    borderRadius: "12px",
                    background: "#f9fafb",
                  }}
                >

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: "20px",
                      marginBottom: "25px",
                    }}
                  >

                    <div>
                      <small>
                        Customer
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px",
                        }}
                      >
                        {selectedMessage.name}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Email
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px",
                        }}
                      >
                        {selectedMessage.email}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Phone
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px",
                        }}
                      >
                        {selectedMessage.phone ||
                          "Not provided"}
                      </strong>
                    </div>

                    <div>
                      <small>
                        Date
                      </small>

                      <strong
                        style={{
                          display:
                            "block",
                          marginTop:
                            "5px",
                        }}
                      >
                        {formatDate(
                          selectedMessage.created_at
                        )}
                      </strong>
                    </div>

                  </div>

                  <div
                    style={{
                      marginBottom:
                        "20px",
                    }}
                  >
                    <small>
                      Subject
                    </small>

                    <h3>
                      {selectedMessage.subject}
                    </h3>
                  </div>

                  <div>
                    <small>
                      Message
                    </small>

                    <p
                      style={{
                        whiteSpace:
                          "pre-wrap",
                        lineHeight: 1.7,
                        marginTop:
                          "10px",
                      }}
                    >
                      {selectedMessage.message}
                    </p>
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