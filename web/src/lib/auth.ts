import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getSql } from "./db";

const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be 8+ characters").max(64),
});

// Custom Postgres adapter using the existing postgres connection
// This adapter creates the Auth.js compatible tables manually
async function createUser(user: {
  email: string;
  name?: string | null;
  image?: string | null;
  password_hash?: string | null;
}) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");

  const id = crypto.randomUUID();
  const now = new Date();

  await sql`
    INSERT INTO users (id, email, name, email_verified, image, password_hash, tier, created_at)
    VALUES (${id}, ${user.email}, ${user.name ?? null}, ${now}, ${user.image ?? null}, ${user.password_hash ?? null}, ${'free'}, ${now})
  `;

  return { id, email: user.email, name: user.name, image: user.image };
}

async function getUserByEmail(email: string) {
  const sql = getSql();
  if (!sql) return null;

  const rows = await sql<{
    id: string;
    email: string;
    name: string | null;
    email_verified: Date | null;
    image: string | null;
    password_hash: string | null;
  }[]>`
    SELECT * FROM users WHERE email = ${email} LIMIT 1
  `;

  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    email: rows[0].email,
    name: rows[0].name,
    emailVerified: rows[0].email_verified,
    image: rows[0].image,
    password_hash: rows[0].password_hash,
  };
}

async function getUserById(id: string) {
  const sql = getSql();
  if (!sql) return null;

  const rows = await sql<{
    id: string;
    email: string;
    name: string | null;
    email_verified: Date | null;
    image: string | null;
  }[]>`
    SELECT * FROM users WHERE id = ${id} LIMIT 1
  `;

  if (!rows[0]) return null;

  return {
    id: rows[0].id,
    email: rows[0].email,
    name: rows[0].name,
    emailVerified: rows[0].email_verified,
    image: rows[0].image,
  };
}

async function linkAccount(account: {
  userId: string;
  type: string;
  provider: string;
  providerAccountId: string;
  refresh_token?: string | null;
  access_token?: string | null;
  expires_at?: number | null;
  id_token?: string | null;
  scope?: string | null;
  session_state?: string | null;
  token_type?: string | null;
}) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");

  const id = crypto.randomUUID();

  await sql`
    INSERT INTO accounts (
      id, user_id, type, provider, provider_account_id,
      refresh_token, access_token, expires_at, id_token, scope, session_state, token_type
    )
    VALUES (
      ${id}, ${account.userId}, ${account.type}, ${account.provider}, ${account.providerAccountId},
      ${account.refresh_token ?? null}, ${account.access_token ?? null}, ${account.expires_at ?? null},
      ${account.id_token ?? null}, ${account.scope ?? null}, ${account.session_state ?? null}, ${account.token_type ?? null}
    )
  `;

  return account;
}

async function getAccount(provider: string, providerAccountId: string) {
  const sql = getSql();
  if (!sql) return null;

  const rows = await sql<{
    user_id: string;
    type: string;
    provider: string;
    provider_account_id: string;
    refresh_token: string | null;
    access_token: string | null;
    expires_at: number | null;
    id_token: string | null;
    scope: string | null;
    session_state: string | null;
    token_type: string | null;
  }[]>`
    SELECT * FROM accounts 
    WHERE provider = ${provider} AND provider_account_id = ${providerAccountId}
    LIMIT 1
  `;

  if (!rows[0]) return null;

  return {
    userId: rows[0].user_id,
    type: rows[0].type,
    provider: rows[0].provider,
    providerAccountId: rows[0].provider_account_id,
    refresh_token: rows[0].refresh_token,
    access_token: rows[0].access_token,
    expires_at: rows[0].expires_at,
    id_token: rows[0].id_token,
    scope: rows[0].scope,
    session_state: rows[0].session_state,
    token_type: rows[0].token_type,
  };
}

async function createSession(session: {
  sessionToken: string;
  userId: string;
  expires: Date;
}) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");

  const id = crypto.randomUUID();

  await sql`
    INSERT INTO sessions (id, user_id, session_token, expires)
    VALUES (${id}, ${session.userId}, ${session.sessionToken}, ${session.expires})
  `;

  return session;
}

async function getSessionAndUser(sessionToken: string) {
  const sql = getSql();
  if (!sql) return null;

  const rows = await sql<{
    session_token: string;
    user_id: string;
    expires: Date;
  }[]>`
    SELECT * FROM sessions WHERE session_token = ${sessionToken} LIMIT 1
  `;

  if (!rows[0]) return null;

  const user = await getUserById(rows[0].user_id);
  if (!user) return null;

  return {
    session: {
      sessionToken: rows[0].session_token,
      userId: rows[0].user_id,
      expires: rows[0].expires,
    },
    user,
  };
}

async function updateSession(session: {
  sessionToken: string;
  expires?: Date;
}) {
  const sql = getSql();
  if (!sql) return null;

  if (session.expires) {
    await sql`
      UPDATE sessions SET expires = ${session.expires} WHERE session_token = ${session.sessionToken}
    `;
  }

  return session;
}

async function deleteSession(sessionToken: string) {
  const sql = getSql();
  if (!sql) return;

  await sql`DELETE FROM sessions WHERE session_token = ${sessionToken}`;
}

async function createVerificationToken(verificationToken: {
  identifier: string;
  token: string;
  expires: Date;
}) {
  const sql = getSql();
  if (!sql) throw new Error("DATABASE_URL not set");

  await sql`
    INSERT INTO verification_tokens (identifier, token, expires)
    VALUES (${verificationToken.identifier}, ${verificationToken.token}, ${verificationToken.expires})
  `;

  return verificationToken;
}

async function useVerificationToken(params: { identifier: string; token: string }) {
  const sql = getSql();
  if (!sql) return null;

  const rows = await sql<{
    identifier: string;
    token: string;
    expires: Date;
  }[]>`
    SELECT * FROM verification_tokens 
    WHERE identifier = ${params.identifier} AND token = ${params.token}
    LIMIT 1
  `;

  if (!rows[0]) return null;

  await sql`
    DELETE FROM verification_tokens 
    WHERE identifier = ${params.identifier} AND token = ${params.token}
  `;

  return rows[0];
}

// Custom adapter that uses the existing postgres connection
const customAdapter = {
  createUser,
  getUser: getUserById,
  getUserByEmail,
  updateUser: async (user: { id: string; name?: string | null; email?: string | null; image?: string | null }) => {
    const sql = getSql();
    if (!sql) throw new Error("DATABASE_URL not set");

    const nameParam = user.name ?? null;
    const emailParam = user.email ?? null;
    const imageParam = user.image ?? null;

    await sql`
      UPDATE users 
      SET name = COALESCE(${nameParam}, name), 
          email = COALESCE(${emailParam}, email), 
          image = COALESCE(${imageParam}, image)
      WHERE id = ${user.id}
    `;

    return getUserById(user.id);
  },
  deleteUser: async (userId: string) => {
    const sql = getSql();
    if (!sql) return;

    await sql`DELETE FROM users WHERE id = ${userId}`;
  },
  linkAccount,
  unlinkAccount: async (params: { provider: string; providerAccountId: string }) => {
    const sql = getSql();
    if (!sql) return;

    await sql`
      DELETE FROM accounts 
      WHERE provider = ${params.provider} AND provider_account_id = ${params.providerAccountId}
    `;
  },
  getAccount,
  createSession,
  getSessionAndUser,
  updateSession,
  deleteSession,
  createVerificationToken,
  useVerificationToken,
};

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: customAdapter as unknown as import("next-auth/adapters").Adapter,
  session: { strategy: "jwt" }, // REQUIRED when using Credentials provider
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    Credentials({
      credentials: {
        email: { type: "email", label: "Email" },
        password: { type: "password", label: "Password" },
      },
      authorize: async (credentials) => {
        const { email, password } = signInSchema.parse(credentials);

        // Query user from database
        const user = await getUserByEmail(email);

        if (!user || !user.password_hash) return null;

        const isValid = await bcrypt.compare(password, user.password_hash);
        if (!isValid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    // Add user id to the JWT token
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    // Expose user id in session
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
    // Control who can sign in
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnProtected = 
        nextUrl.pathname.startsWith("/dashboard") ||
        nextUrl.pathname.startsWith("/feed") ||
        nextUrl.pathname.startsWith("/settings") ||
        nextUrl.pathname.startsWith("/resolution");
      
      if (isOnProtected) {
        return isLoggedIn; // redirect to login if not authenticated
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/error",
  },
});

// TypeScript augmentation for session
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface JWT {
    id?: string;
  }
}
