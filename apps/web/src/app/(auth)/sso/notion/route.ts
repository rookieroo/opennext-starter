import "server-only";
import { getSessionFromCookie } from "@/utils/auth";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { redirect } from "next/navigation";
import { generateState } from "arctic";
import { cookies } from "next/headers";
import { NOTION_OAUTH_STATE_COOKIE_NAME } from "@/constants";
import isProd from "@/utils/is-prod";
import ms from "ms";
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { isNotionSSOEnabled } from "@/flags";
import { notionSSOClient } from "@/lib/sso/notion-sso";

const cookieOptions: Partial<ResponseCookie> = {
  path: "/",
  httpOnly: true,
  secure: isProd,
  maxAge: Math.floor(ms("10 minutes") / 1000),
  sameSite: "lax",
};

export async function GET() {
  return withRateLimit(async () => {
    if (!(await isNotionSSOEnabled())) {
      console.error("Notion client ID or secret is not set");
      return redirect("/");
    }

    const session = await getSessionFromCookie();
    const notion = await notionSSOClient();

    if (session) {
      return redirect("/dashboard");
    }

    let ssoRedirectUrl: null | URL = null;

    try {
      const state = generateState();

      ssoRedirectUrl = notion.createAuthorizationURL(state);

      const cookieStore = await cookies();
      cookieStore.set(NOTION_OAUTH_STATE_COOKIE_NAME, state, cookieOptions);
    } catch (error) {
      console.error("Error generating Notion OAuth state", error);
      return redirect("/");
    }

    return new Response(null, {
      status: 307,
      headers: {
        Location: ssoRedirectUrl.toString(),
      },
    });
  }, RATE_LIMITS.NOTION_SSO_REQUEST);
}
