"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

interface NavProps {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

export default function Nav({ user }: NavProps) {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/feed", label: "Feed" },
    { href: "/settings", label: "Settings" },
  ];

  async function handleLogout() {
    await signOut({ callbackUrl: "/" });
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

      {/* User Email + Logout */}
      <span style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
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
