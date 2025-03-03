import "server-only"

import { Google } from "arctic";
import { getCloudflareContext } from "@opennextjs/cloudflare";

export async function googleSSOClient() {

  const {env}: {env: any} = await getCloudflareContext({ async: true });

  const google = new Google(
    env.GOOGLE_CLIENT_ID ?? "",
    env.GOOGLE_CLIENT_SECRET ?? "",
    `${env.NEXT_PUBLIC_APP_URL}/sso/google/callback`
  )

  return google;
}