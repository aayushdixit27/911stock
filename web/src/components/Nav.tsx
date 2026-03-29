"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState, useEffect, useRef } from "react";

interface NavProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

interface Notification {
  id: string;
  signal_id: string | null;
  type: string;
  title: string;
  body: string;
  read: boolean;
  deliver_at: string;
  created_at: string;
}

export default function Nav({ user }: NavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/feed", label: "Feed" },
    { href: "/settings", label: "Settings" },
  ];

  // Fetch unread count on mount and periodically
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/notifications/unread-count");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  }

  async function fetchNotifications() {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?includeRead=true&limit=10");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleBellClick() {
    if (!isDropdownOpen) {
      fetchNotifications();
    }
    setIsDropdownOpen(!isDropdownOpen);
  }

  async function handleNotificationClick(notification: Notification) {
    // Mark as read
    if (!notification.read) {
      try {
        const res = await fetch(`/api/notifications/${notification.id}`, {
          method: "PATCH",
        });
        if (res.ok) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === notification.id ? { ...n, read: true } : n
            )
          );
        }
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    // Navigate to signal detail if signal_id exists
    if (notification.signal_id) {
      router.push(`/feed?id=${notification.signal_id}`);
    }

    setIsDropdownOpen(false);
  }

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
  }

  function formatRelativeTime(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  }

  return (
    <nav
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 500,
        padding: "1rem 5vw",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--ink-08)",
      }}
    >
      {/* Logo */}
      <Link
        href="/"
        style={{
          fontFamily: "var(--font-display)",
          fontWeight: 500,
          fontSize: "1.25rem",
          fontStyle: "italic",
          color: "var(--orange)",
          textDecoration: "none",
        }}
      >
        911stock
      </Link>

      {/* Nav Links */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flex: 1,
          justifyContent: "center",
        }}
      >
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: "var(--text-xs)",
                fontWeight: 500,
                letterSpacing: "0.02em",
                color: isActive ? "var(--ink)" : "var(--ink-50)",
                padding: "0.375rem 0.75rem",
                borderRadius: "4px",
                textDecoration: "none",
                background: isActive ? "var(--paper)" : "transparent",
                transition: "color 0.15s, background 0.15s",
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </div>

      {/* User Email + Notification Bell + Logout */}
      <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        {/* Notification Bell */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            onClick={handleBellClick}
            style={{
              position: "relative",
              padding: "0.5rem",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              borderRadius: "4px",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--ink-08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
            }}
            aria-label="Notifications"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="var(--ink-70)"
              strokeWidth="2"
            >
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "2px",
                  right: "2px",
                  width: "16px",
                  height: "16px",
                  background: "var(--orange)",
                  color: "white",
                  fontSize: "10px",
                  fontWeight: 600,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {isDropdownOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "0.5rem",
                width: "320px",
                maxHeight: "400px",
                background: "var(--white)",
                border: "1px solid var(--ink-08)",
                borderRadius: "8px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
                zIndex: 1000,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "0.75rem 1rem",
                  borderBottom: "1px solid var(--ink-08)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "var(--ink)",
                  }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--orange)",
                      fontWeight: 500,
                    }}
                  >
                    {unreadCount} unread
                  </span>
                )}
              </div>

              <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                {isLoading ? (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--ink-50)",
                      fontSize: "0.875rem",
                    }}
                  >
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div
                    style={{
                      padding: "2rem",
                      textAlign: "center",
                      color: "var(--ink-50)",
                      fontSize: "0.875rem",
                    }}
                  >
                    No notifications yet
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <button
                      key={notification.id}
                      onClick={() => handleNotificationClick(notification)}
                      style={{
                        width: "100%",
                        padding: "0.75rem 1rem",
                        border: "none",
                        borderBottom: "1px solid var(--ink-08)",
                        background: notification.read
                          ? "transparent"
                          : "rgba(234,76,0,0.04)",
                        textAlign: "left",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "var(--paper)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = notification.read
                          ? "transparent"
                          : "rgba(234,76,0,0.04)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: "0.5rem",
                        }}
                      >
                        {!notification.read && (
                          <span
                            style={{
                              width: "6px",
                              height: "6px",
                              background: "var(--orange)",
                              borderRadius: "50%",
                              marginTop: "6px",
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p
                            style={{
                              fontSize: "0.8125rem",
                              fontWeight: notification.read ? 400 : 600,
                              color: "var(--ink)",
                              marginBottom: "0.25rem",
                              lineHeight: 1.4,
                            }}
                          >
                            {notification.title}
                          </p>
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "var(--ink-50)",
                              marginBottom: "0.25rem",
                              lineHeight: 1.4,
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                            }}
                          >
                            {notification.body}
                          </p>
                          <span
                            style={{
                              fontSize: "0.6875rem",
                              color: "var(--ink-30)",
                            }}
                          >
                            {formatRelativeTime(notification.deliver_at)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <Link
                href="/feed"
                onClick={() => setIsDropdownOpen(false)}
                style={{
                  display: "block",
                  padding: "0.75rem 1rem",
                  textAlign: "center",
                  fontSize: "0.8125rem",
                  color: "var(--terra)",
                  textDecoration: "none",
                  borderTop: "1px solid var(--ink-08)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--paper)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                View all signals →
              </Link>
            </div>
          )}
        </div>

        <span
          style={{
            fontFamily: "var(--font-body)",
            fontSize: "var(--text-sm)",
            color: "var(--ink-50)",
            maxWidth: "200px",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
          title={user.email ?? undefined}
        >
          {user.email}
        </span>

        <button
          onClick={handleLogout}
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: "var(--text-xs)",
            fontWeight: 500,
            color: "var(--orange)",
            padding: "0.375rem 0.75rem",
            border: "1px solid var(--orange-lt)",
            borderRadius: "4px",
            background: "transparent",
            cursor: "pointer",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(234,76,0,0.08)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
          }}
        >
          Logout
        </button>
      </span>
    </nav>
  );
}
