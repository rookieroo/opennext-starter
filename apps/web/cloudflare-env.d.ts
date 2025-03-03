// Generated by Wrangler by running `wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts`

interface CloudflareEnv {
	NEXT_CACHE_WORKERS_KV: KVNamespace;
	EMAIL_FROM: "hello@notionflare.com";
	EMAIL_FROM_NAME: "NotionFlare Team";
	EMAIL_REPLY_TO: "useone.online@gmail.com";
	NEXT_PUBLIC_TURNSTILE_SITE_KEY: "0x4AAAAAAA9kOm1yylE_rjIE";
	NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PLAN_ID: "price_1Qd5AbKl4eZ0Kp65p1gi2Ir7";
	NEXT_PUBLIC_STRIPE_PRO_YEARLY_PLAN_ID: "price_1QgkC0Kl4eZ0Kp65yx0EDvSE";
	NEXT_PUBLIC_STRIPE_BUSINESS_MONTHLY_PLAN_ID: "price_1Qd6rwKl4eZ0Kp65NWGNrtpF";
	NEXT_PUBLIC_STRIPE_BUSINESS_YEARLY_PLAN_ID: "price_1QgkCIKl4eZ0Kp65GOEiwycm";
	NEXT_PUBLIC_APP_URL: "https://notionflare.com";
	NEXT_PUBLIC_GITHUB_REPO_URL: "https://notionflare.com";
	NEXT_PUBLIC_SITE_DESCRIPTION: "NotionFlare is a platform that allows you to create websites using Notion as a CMS.";
	NEXT_PUBLIC_SITE_IMAGE: "https://notionflare.com/images/notionflare.png";
	NEXTJS_ENV: string;
	COMPANY_NAME: string;
	TWITTER_CREATOR: string;
	TWITTER_SITE: string;
	NEXT_PUBLIC_SITE_NAME: string;
	SHOPIFY_REVALIDATION_SECRET: string;
	SHOPIFY_STOREFRONT_ACCESS_TOKEN: string;
	SHOPIFY_STORE_DOMAIN: string;
	DATABASE: D1Database;
	ASSETS: Fetcher;
}
