import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import ResetPasswordClientComponent from "./reset-password.client";
import { getResetTokenKey } from "@/utils/auth-utils";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Set a new password for your account",
};

interface SearchParams {
  token?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function ResetPasswordPage({
  searchParams,
}: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return notFound();
  }

  const { env } = getCloudflareContext();
  const resetTokenStr = await env.NEXT_CACHE_WORKERS_KV.get(getResetTokenKey(token));

  if (!resetTokenStr) {
    return notFound();
  }

  return <ResetPasswordClientComponent />;
}
