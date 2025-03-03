export const SITE_NAME = "NotionFlare"
export const SITE_DESCRIPTION = "NotionFlare is a platform that allows you to create websites using Notion as a CMS."
export const SITE_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://notionflare.com"
export const GITHUB_REPO_URL = "https://github.com/LubomirGeorgiev/cloudflare-workers-nextjs-saas-template"

export const SITE_DOMAIN = new URL(SITE_URL as string).hostname
export const PASSWORD_RESET_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const EMAIL_VERIFICATION_TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60 // 24 hours
export const SESSION_COOKIE_NAME = "session";
export const NOTION_OAUTH_STATE_COOKIE_NAME = "notion-oauth-state";
export const GOOGLE_OAUTH_STATE_COOKIE_NAME = "google-oauth-state";
export const GOOGLE_OAUTH_CODE_VERIFIER_COOKIE_NAME = "google-oauth-code-verifier";
