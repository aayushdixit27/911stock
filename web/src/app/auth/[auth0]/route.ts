import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";

// Handles /auth/login, /auth/logout, /auth/callback, /auth/profile, etc.
export async function GET(request: NextRequest) {
  return await auth0.middleware(request);
}

export async function POST(request: NextRequest) {
  return await auth0.middleware(request);
}
