import type { Metadata } from "next";
import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import NotionCallbackClientComponent from "./notion-callback.client";

export const metadata: Metadata = {
  title: "Sign in with Notion",
  description: "Complete your sign in with Notion",
};

export default async function NotionCallbackPage() {
  const session = await getSessionFromCookie();

  if (session) {
    return redirect('/dashboard');
  }

  return <NotionCallbackClientComponent />;
}
