import { auth0 } from "@/lib/auth0";
import PageClient from "./page-client";

export default async function Home() {
  const session = await auth0.getSession();

  // Use logged-in user's sub, or fall back to the configured admin sub from env
  const userId =
    session?.user?.sub ?? process.env.AUTH0_USER_SUB ?? "";

  return <PageClient userId={userId} />;
}
