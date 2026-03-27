import { auth0 } from "@/lib/auth0";

export default async function Settings() {
  const session = await auth0.getSession();

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
        {/* Header */}
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
          <p
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--ink-30)",
            }}
          >
            Settings
          </p>
        </div>

        {/* Auth card */}
        <div
          className="mark-card"
          style={{ padding: "1.5rem", overflow: "hidden" }}
        >
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

          {session ? (
            <>
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  color: "var(--ink-50)",
                  marginBottom: "1rem",
                  lineHeight: 1.6,
                }}
              >
                Logged in as{" "}
                <strong style={{ color: "var(--ink)", fontWeight: 600 }}>
                  {session.user.email ?? session.user.sub}
                </strong>
                . Auth0 Guardian push notifications will be sent to this account.
              </p>

              <div
                style={{
                  background: "var(--paper)",
                  borderRadius: "4px",
                  padding: "0.75rem 1rem",
                  marginBottom: "1.25rem",
                  fontFamily: "var(--font-mono)",
                  fontSize: "var(--text-xs)",
                  color: "var(--ink-30)",
                  wordBreak: "break-all" as const,
                }}
              >
                <span style={{ color: "var(--ink-50)" }}>sub: </span>
                {session.user.sub}
              </div>

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
              <p
                style={{
                  fontFamily: "var(--font-body)",
                  fontSize: "var(--text-sm)",
                  color: "var(--ink-50)",
                  marginBottom: "1.25rem",
                  lineHeight: 1.6,
                }}
              >
                Sign in with your Auth0 account to enable Guardian push
                notifications for trade approvals via CIBA.
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

        {/* Back link */}
        <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
          <a
            href="/"
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: "var(--text-xs)",
              color: "var(--ink-30)",
              textDecoration: "none",
            }}
          >
            ← Back to dashboard
          </a>
        </div>
      </div>
    </main>
  );
}
