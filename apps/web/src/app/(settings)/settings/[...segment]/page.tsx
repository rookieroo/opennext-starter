import { getSessionFromCookie } from "@/utils/auth";
import { redirect } from "next/navigation";
import { SettingsForm } from "../settings-form";
import { Suspense } from "react";
import { Card, CardContent, CardHeader } from "@repo/ui/components/ui/card";
import { Skeleton } from "@repo/ui/components/ui/skeleton";

function SettingsFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-[200px]" />
          </div>

          <div className="flex justify-end">
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface SegmentParams {
  segment?: string [];
}

interface PageProps {
  segmentParams: Promise<SegmentParams>;
}

export default async function SettingsPage({
  params,
}: {
  params: PageProps["segmentParams"];
}) {
  const session = await getSessionFromCookie();

  if (!session) {
    redirect("/sign-in");
  }

  return (
    <div className="grid gap-4">
      <Suspense fallback={<SettingsFormSkeleton />}>
        <SettingsForm />
      </Suspense>
    </div>
  );
}
