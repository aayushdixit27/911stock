import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PageClient from "./page-client";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  return <PageClient user={session.user} />;
}
