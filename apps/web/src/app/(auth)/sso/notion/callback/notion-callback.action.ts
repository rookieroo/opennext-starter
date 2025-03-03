"use server";

import { createServerAction, ZSAError } from "zsa";
import { notionSSOCallbackSchema } from "@/schemas/notion-sso-callback.schema";
import { withRateLimit, RATE_LIMITS } from "@/utils/with-rate-limit";
import { NOTION_OAUTH_STATE_COOKIE_NAME } from "@/constants";
import { cookies } from "next/headers";
import { getDB } from "@/db";
import { eq } from "drizzle-orm";
import { notionConnectionsTable, userTable } from "@/db/schema";
import { createAndStoreSession, canSignUp } from "@/utils/auth";
import { isNotionSSOEnabled } from "@/flags";
import { getIP } from "@/utils/get-IP";
import { getEnvByKey } from "@/lib/constants";

type NotionSSOResponse = {
  person: any;
  /**
   * Issuer
   * Example: /oauth/token
   */
  workspace_id: string;
  workspace_name: string;
  workspace_icon: string;
  access_token: string;
  bot_id: string;
  owner: any;
  /**
   * Authorized party
   * Example: /users/me
   */
  id: string;
  object: string;
  name: string;
  avatar_url: string;
  bot: any;
  email_verified: boolean;
};

export const notionSSOCallbackAction = createServerAction()
  .input(notionSSOCallbackSchema)
  .handler(async ({ input }) => {
    return withRateLimit(async () => {
      const NOTION_CLIENT_ID = await getEnvByKey('NOTION_CLIENT_ID');
      const NOTION_CLIENT_SECRET = await getEnvByKey('NOTION_CLIENT_SECRET');
      const NOTION_AUTH_CALLBACK = await getEnvByKey('NEXT_PUBLIC_APP_URL');

      if (!(await isNotionSSOEnabled())) {
        throw new ZSAError("FORBIDDEN", "Notion SSO is not enabled");
      }

      if (!NOTION_CLIENT_ID || !NOTION_CLIENT_SECRET || !NOTION_AUTH_CALLBACK) {
        throw new Error('Missing required environment variables for Notion SSO');
      }

      const cookieStore = await cookies();
      const cookieState =
        cookieStore.get(NOTION_OAUTH_STATE_COOKIE_NAME)?.value ?? null;

      if (!cookieState) {
        throw new ZSAError("NOT_AUTHORIZED", "Missing required cookies");
      }

      if (input.state !== cookieState) {
        throw new ZSAError("NOT_AUTHORIZED", "Invalid state parameter");
      }

      const oauth2token_response = await fetch(
        "https://api.notion.com/v1/oauth/token",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString("base64")}`,
            "Content-Type": "application/json",
            // "Notion-Version": "2022-06-28",
          } as const,
          body: JSON.stringify({
            grant_type: "authorization_code",
            code: input.code,
            redirect_uri: NOTION_AUTH_CALLBACK.toString() + `/sso/notion/callback`,
          }),
        },
      );
      if (!oauth2token_response.ok) {
        const error = await oauth2token_response.json();
        throw new Error(
          `Failed to fetch notion access token: ${JSON.stringify(error)}`,
        );
      }
      const oauth2token_data: NotionSSOResponse =
        await oauth2token_response.json();

      const {
        access_token,
        workspace_id,
        workspace_name,
        workspace_icon,
        bot_id,
        owner,
      } = oauth2token_data;

      const claims = owner?.user as NotionSSOResponse;
      const notionAccountId = claims?.id;
      const notionAccountName = claims?.name;
      const avatarUrl = claims?.avatar_url;
      const email = claims?.person?.email;

      // Check if email is disposable
      await canSignUp({ email });

      const db = await getDB();

      try {
        // First check if user exists with this notionAccountId
        let existingUserWithNotion = await db.query.userTable.findFirst({
          where: eq(userTable.notionAccountId, notionAccountId),
        });

        // Then check if notionConnections exists with this workspace_id
        const existingConnectionWithNotionConnections =
          await db.query.notionConnectionsTable.findFirst({
            where: eq(notionConnectionsTable.notionWorkspaceId, workspace_id),
          });

        // Then check if user exists with this email
        const existingUserWithEmail = await db.query.userTable.findFirst({
          where: eq(userTable.email, email),
        });

        if (
          existingUserWithNotion?.id &&
          existingConnectionWithNotionConnections?.id
        ) {
          await createAndStoreSession(
            existingUserWithNotion.id,
            "notion-oauth",
          );
          return { success: true };
        }

        if (!existingUserWithNotion?.id && existingUserWithEmail?.id) {
          // User exists but hasn't linked Notion - let's link their account
          [existingUserWithNotion] = await db
            .update(userTable)
            .set({
              notionAccountId,
              avatar: existingUserWithEmail.avatar || avatarUrl,
              segmentName:
                notionAccountName || existingUserWithEmail.segmentName,
            })
            .where(eq(userTable.id, existingUserWithEmail.id))
            .returning();
        }
        if (!existingUserWithNotion?.id && !existingUserWithEmail?.id) {
          // No existing user found - create a new one
          [existingUserWithNotion] = await db
            .insert(userTable)
            .values({
              notionAccountId,
              firstName: notionAccountName || null,
              lastName: notionAccountName || null,
              segmentName: notionAccountName || null,
              avatar: avatarUrl,
              email,
              emailVerified: email ? new Date() : null,
              signUpIpAddress: await getIP(),
            })
            .returning();
        }

        // TODO: If the user is not verified, send a verification email

        if (!existingUserWithNotion?.id) {
          throw new ZSAError(
            "INTERNAL_SERVER_ERROR",
            "Failed to create or update user",
          );
        }
        if (!existingConnectionWithNotionConnections) {
          const [connection] = await db
            .insert(notionConnectionsTable)
            .values({
              userId: existingUserWithNotion?.id,
              notionWorkspaceId: workspace_id,
              botId: bot_id,
              notionAccessToken: access_token,
              workspaceIcon: workspace_icon,
              workspaceName: workspace_name,
            })
            .returning();
        }

        await createAndStoreSession(existingUserWithNotion.id, "notion-oauth");
        return { success: true };
      } catch (error) {
        console.error(error);

        if (error instanceof ZSAError) {
          throw error;
        }

        throw new ZSAError(
          "INTERNAL_SERVER_ERROR",
          "An unexpected error occurred: " +
            `${JSON.stringify(input)}==${JSON.stringify(oauth2token_data)}==${JSON.stringify(claims)}`,
        );
      }
    }, RATE_LIMITS.NOTION_SSO_CALLBACK);
  });
