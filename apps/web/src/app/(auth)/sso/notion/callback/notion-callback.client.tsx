"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@repo/ui/components/ui/card";
import { Button } from "@repo/ui/components/ui/button";
import { useServerAction } from "zsa-react";
import { notionSSOCallbackAction } from "./notion-callback.action";
import { notionSSOCallbackSchema } from "@/schemas/notion-sso-callback.schema";
import { Spinner } from "@repo/ui/components/ui/spinner";

export default function NotionCallbackClientComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const hasCalledCallback = useRef(false);

  const { execute: handleCallback, isPending, error } = useServerAction(notionSSOCallbackAction, {
    onError: (error) => {
      toast.dismiss();
      toast.error(error.err?.message || "Failed to sign in with Notion");
    },
    onStart: () => {
      toast.loading("Signing you in with Notion...");
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success("Signed in successfully");
      router.push("/dashboard");
    },
  });

  useEffect(() => {
    if (code && state && !hasCalledCallback.current) {
      const result = notionSSOCallbackSchema.safeParse({ code, state });
      if (result.success) {
        hasCalledCallback.current = true;
        handleCallback(result.data);
      } else {
        toast.error("Invalid callback parameters");
        router.push("/sign-in");
      }
    }
  }, [code, state]);

  if (isPending) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex flex-col items-center space-y-4">
              <Spinner size="large" />
              <CardTitle>Signing in with Notion</CardTitle>
              <CardDescription>
                Please wait while we complete your sign in...
              </CardDescription>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Sign in failed</CardTitle>
            <CardDescription>
              {error?.message || "Failed to sign in with Notion"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => router.push("/sign-in")}
            >
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 flex items-center justify-center min-h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Invalid callback</CardTitle>
          <CardDescription>
            The sign in callback is invalid or has expired. Please try signing in again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/sign-in")}
          >
            Back to sign in
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

