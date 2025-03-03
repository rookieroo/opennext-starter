import "server-only"

import { cache } from "react"

export async function isGoogleSSOEnabled() {
  return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)
}

export async function isNotionSSOEnabled() {
  return Boolean(process.env.NOTION_CLIENT_ID && process.env.NOTION_CLIENT_SECRET)
}

export async function isTurnstileEnabled() {
  return Boolean(process.env.TURNSTILE_SECRET_KEY)
}

export const getConfig = cache(async () => {
  return {
    isGoogleSSOEnabled: await isGoogleSSOEnabled(),
    isNotionSSOEnabled: await isNotionSSOEnabled(),
    isTurnstileEnabled: await isTurnstileEnabled(),
  }
})
