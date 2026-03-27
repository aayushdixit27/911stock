import { auth0 } from "@/lib/auth0";
import PageClient from "./page-client";

export default async function Home() {
  const session = await auth0.getSession();

  if (!session) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "var(--white)" }}>
        <h1 style={{ fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 14, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--orange)", marginBottom: 32 }}>
          911stock
        </h1>
        <p style={{ fontFamily: "var(--font-body)", fontSize: 18, color: "var(--ink)", marginBottom: 8 }}>
          Your portfolio, watched.
        </p>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-30)", marginBottom: 40 }}>
          Sign in to activate your AI stock guardian.
        </p>
        <a href="/auth/login" style={{ background: "var(--ink)", color: "var(--white)", fontFamily: "var(--font-body)", fontWeight: 700, fontSize: 13, letterSpacing: "0.15em", textTransform: "uppercase", padding: "18px 40px", borderRadius: 3, textDecoration: "none" }}>
          Sign in with Auth0
        </a>
        <p style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-30)", marginTop: 16 }}>
          First sign-in enrolls your Guardian MFA device.
        </p>
      </main>
    );
  }

  return <PageClient userId={session.user.sub} />;
}
