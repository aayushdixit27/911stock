# Auth.js v5 (NextAuth v5) — Next.js App Router Integration

> Official docs: https://authjs.dev/getting-started
> Note: Auth.js project is now part of Better Auth (https://better-auth.com/blog/authjs-joins-better-auth), but the `next-auth` v5 package remains the standard for Next.js.

## Installation

```bash
npm install next-auth@5 @auth/pg-adapter pg
npm install bcryptjs zod
npm install --save-dev @types/pg @types/bcryptjs
```

## Environment Variables

```env
# .env.local
AUTH_SECRET=<generate with `npx auth secret`>
AUTH_URL=http://localhost:3000

# Google OAuth
AUTH_GOOGLE_ID=<your-google-client-id>
AUTH_GOOGLE_SECRET=<your-google-client-secret>

# Database — set DATABASE_URL to your Postgres connection string
```

## Core Configuration — `auth.ts`

Create `auth.ts` at the project root (next to `next.config.ts`):

```typescript
// auth.ts
import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import PostgresAdapter from "@auth/pg-adapter"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { z } from "zod"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ characters").max(64),
})

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PostgresAdapter(pool),
  session: { strategy: "jwt" }, // REQUIRED when using Credentials provider
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      authorize: async (credentials) => {
        const { email, password } = signInSchema.parse(credentials)

        // Query user from database
        const result = await pool.query(
          'SELECT * FROM users WHERE email = $1',
          [email]
        )
        const user = result.rows[0]

        if (!user || !user.password_hash) return null

        const isValid = await bcrypt.compare(password, user.password_hash)
        if (!isValid) return null

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    // Add user id to the JWT token
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }
      return token
    },
    // Expose user id in session
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string
      }
      return session
    },
    // Control who can sign in
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard")
      if (isOnDashboard) {
        return isLoggedIn // redirect to login if not authenticated
      }
      return true
    },
  },
  pages: {
    signIn: "/login",  // Custom login page
    // error: "/auth/error",
  },
})
```

## Route Handler — `app/api/auth/[...nextauth]/route.ts`

```typescript
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth"

export const { GET, POST } = handlers
```

## Route Protection — Proxy (Next.js 16) or Middleware (Next.js 15)

### Next.js 16: `proxy.ts`

```typescript
// proxy.ts (project root)
export { auth as proxy } from "@/auth"
```

### Next.js 15: `middleware.ts`

```typescript
// middleware.ts (project root)
export { auth as middleware } from "@/auth"

export const config = {
  matcher: [
    // Protect everything except public routes, API auth, static files
    "/((?!api/auth|_next/static|_next/image|favicon.ico|login|register|$).*)",
  ],
}
```

## Database Schema (for `@auth/pg-adapter`)

The adapter expects these tables. Add a `password_hash` column for credentials:

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  "emailVerified" TIMESTAMPTZ,
  image TEXT,
  password_hash TEXT  -- Custom: for credentials provider
);

CREATE TABLE accounts (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(255) NOT NULL,
  provider VARCHAR(255) NOT NULL,
  "providerAccountId" VARCHAR(255) NOT NULL,
  refresh_token TEXT,
  access_token TEXT,
  expires_at BIGINT,
  id_token TEXT,
  scope TEXT,
  session_state TEXT,
  token_type TEXT
);

CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  "userId" INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires TIMESTAMPTZ NOT NULL,
  "sessionToken" VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE verification_token (
  identifier TEXT NOT NULL,
  expires TIMESTAMPTZ NOT NULL,
  token TEXT NOT NULL,
  PRIMARY KEY (identifier, token)
);
```

## Protecting Server Components (Pages)

```typescript
// app/dashboard/page.tsx
import { auth } from "@/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user) redirect("/login")

  return <div>Welcome, {session.user.name}</div>
}
```

## Protecting API Routes

```typescript
// app/api/protected/route.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const GET = auth(function GET(req) {
  if (!req.auth) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return NextResponse.json({ user: req.auth.user })
})
```

Alternative pattern:

```typescript
// app/api/data/route.ts
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  // ... fetch data
  return NextResponse.json({ data: "..." })
}
```

## Client Components — Session Access

Wrap layout with `<SessionProvider>`:

```typescript
// app/layout.tsx
import { SessionProvider } from "next-auth/react"
import { auth } from "@/auth"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  return (
    <html>
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

Use `useSession()` in client components:

```typescript
"use client"
import { useSession, signIn, signOut } from "next-auth/react"

export function UserButton() {
  const { data: session, status } = useSession()

  if (status === "loading") return <div>Loading...</div>
  if (!session) return <button onClick={() => signIn()}>Sign In</button>

  return (
    <div>
      <span>{session.user?.name}</span>
      <button onClick={() => signOut()}>Sign Out</button>
    </div>
  )
}
```

## Sign-In Form (Server Action)

```typescript
// app/login/page.tsx
import { signIn } from "@/auth"
import { redirect } from "next/navigation"

export default function LoginPage() {
  return (
    <div>
      {/* Google OAuth */}
      <form action={async () => {
        "use server"
        await signIn("google", { redirectTo: "/dashboard" })
      }}>
        <button type="submit">Sign in with Google</button>
      </form>

      {/* Email/Password */}
      <form action={async (formData) => {
        "use server"
        try {
          await signIn("credentials", {
            email: formData.get("email"),
            password: formData.get("password"),
            redirectTo: "/dashboard",
          })
        } catch (error) {
          // Handle NEXT_REDIRECT (this is expected after successful signIn)
          if ((error as any)?.digest?.startsWith("NEXT_REDIRECT")) throw error
          // Handle auth error
          redirect("/login?error=InvalidCredentials")
        }
      }}>
        <input name="email" type="email" placeholder="Email" required />
        <input name="password" type="password" placeholder="Password" required />
        <button type="submit">Sign In</button>
      </form>
    </div>
  )
}
```

## User Registration Endpoint

```typescript
// app/api/register/route.ts
import { NextResponse } from "next/server"
import { Pool } from "pg"
import bcrypt from "bcryptjs"
import { z } from "zod"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8).max(64),
})

export async function POST(req: Request) {
  const body = await req.json()
  const { name, email, password } = registerSchema.parse(body)

  // Check if user exists
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rows.length > 0) {
    return NextResponse.json({ error: "Email already registered" }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 12)

  const result = await pool.query(
    'INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id',
    [name, email, passwordHash]
  )

  return NextResponse.json({ id: result.rows[0].id }, { status: 201 })
}
```

## TypeScript Augmentation

```typescript
// types/next-auth.d.ts
import "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
  }
}
```

## Common Pitfalls

1. **JWT strategy required for Credentials**: When using the Credentials provider, you MUST set `session: { strategy: "jwt" }`. The database session strategy doesn't work with Credentials because `authorize()` doesn't trigger the adapter's `createSession`.

2. **`AUTH_SECRET` is required**: Generate with `npx auth secret`. In production, set it as an environment variable.

3. **Credentials provider doesn't auto-persist users**: Unlike OAuth, you must handle user creation/lookup yourself in `authorize()`.

4. **NEXT_REDIRECT errors in Server Actions**: `signIn()` throws a redirect. Catch and re-throw `NEXT_REDIRECT` errors — don't swallow them.

5. **`@auth/pg-adapter` uses `camelCase` column names**: Columns like `userId`, `providerAccountId`, `emailVerified`, `sessionToken` must be quoted in SQL.

6. **Pool per-request for serverless**: If on a serverless platform (Vercel), create the pool inside the NextAuth callback function, not at module scope. For traditional servers, module-scope pool is fine.

7. **Next.js 16 uses `proxy.ts` instead of `middleware.ts`**: The function export is `proxy` not `middleware`.

8. **Google OAuth callback URL**: Set `{YOUR_URL}/api/auth/callback/google` in Google Cloud Console.

## Key Links

- Auth.js v5 docs: https://authjs.dev/getting-started
- PostgreSQL adapter: https://authjs.dev/getting-started/adapters/pg
- Credentials provider: https://authjs.dev/getting-started/authentication/credentials
- Route protection: https://authjs.dev/getting-started/session-management/protecting
- Google provider: https://authjs.dev/getting-started/authentication/oauth
