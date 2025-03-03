import "server-only"

import { Notion } from "arctic";
import { getEnvByKey } from "../constants";

export async function notionSSOClient() {
  const notionClientId = await getEnvByKey('NOTION_CLIENT_ID');
  const notionClientSecret = await getEnvByKey('NOTION_CLIENT_SECRET');
  const notionAuthCallback = await getEnvByKey('NEXT_PUBLIC_APP_URL');

  if (!notionClientId || !notionClientSecret || !notionAuthCallback) {
    throw new Error('Missing required environment variables for Notion SSO');
  }

  return new Notion(
    notionClientId.toString(),
    notionClientSecret.toString(),
    notionAuthCallback.toString() + `/sso/notion/callback`
  )
}