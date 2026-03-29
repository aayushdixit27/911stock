import { auth } from "@/lib/auth";
import { GuardianEnroll } from "@/components/GuardianEnroll";

export default async function Settings() {
  const session = await auth();

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "var(--white)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "420px" }}>
        <div style={{ marginBottom: "2rem", textAlign: "center" }}>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 500,
              fontSize: "1.25rem",
              fontStyle: "italic",
              color: "var(--orange)",
              textDecoration: "none",
              display: "block",
              marginBottom: "0.5rem",
            }}
          >
            911stock
          </a>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)" }}>
            Settings
          </p>
        </div>

        <div className="mark-card" style={{ padding: "1.5rem", overflow: "hidden" }}>
          <div
            style={{
              height: "3px",
              background: "linear-gradient(to right, var(--orange), var(--ember))",
              margin: "-1.5rem -1.5rem 1.5rem",
            }}
          />

          <div className="mark-eyebrow" style={{ marginBottom: "1rem" }}>
            Auth0 Guardian
          </div>

          {session?.user ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.625rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#22c55e",
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink)", fontWeight: 600 }}>
                  {session.user.email ?? session.user.name}
                </span>
              </div>

              <GuardianEnroll />

              <div style={{ height: "1px", background: "var(--ink-08)", margin: "1.25rem 0" }} />

              <a
                href="/auth/logout"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "var(--font-body)",
                  fontWeight: 600,
                  fontSize: "var(--text-xs)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "var(--ink-30)",
                  border: "1px solid var(--ink-08)",
                  borderRadius: "4px",
                  padding: "0.75rem 1rem",
                  textDecoration: "none",
                }}
              >
                Sign out
              </a>
            </>
          ) : (
            <>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "var(--text-sm)", color: "var(--ink-50)", marginBottom: "0.75rem", lineHeight: 1.6 }}>
                Sign in to enable Guardian push notifications for CIBA trade approvals.
              </p>
              <a
                href="/auth/login"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontFamily: "var(--font-body)",
                  fontWeight: 700,
                  fontSize: "var(--text-sm)",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase" as const,
                  color: "var(--white)",
                  background: "var(--ink)",
                  borderRadius: "4px",
                  padding: "0.875rem 1rem",
                  textDecoration: "none",
                }}
              >
                Sign in with Auth0
              </a>
            </>
          )}
        </div>

        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a href="/" style={{ fontFamily: "var(--font-mono)", fontSize: "var(--text-xs)", color: "var(--ink-30)", textDecoration: "none" }}>
            ← Back to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
