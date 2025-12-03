'use client'

import type { PostHog } from 'posthog-js'

// Fallback NOOP client (never breaks)
const NOOP: PostHog = {
  capture: () => {},
  identify: () => {},
  reset: () => {},
  group: () => {},
  setPersonProperties: () => {},
  setGroupProperties: () => {},
  onFeatureFlags: () => {},
  getFeatureFlag: () => null,
  isFeatureEnabled: () => false,
  reloadFeatureFlags: () => Promise.resolve(),
} as any

// Internal variable storing the real instance
let client: PostHog | null = null

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

/**
 * Always returns a functional client.
 * If PostHog fails, returns the NOOP client.
 */
export function ph(): PostHog {
  return client ?? NOOP
}

/**
 * Safely initializes PostHog.
 * - Runs only in the browser
 * - Does not break SSR
 * - Does not throw errors if it fails
 */
export async function initPostHog(): Promise<PostHog> {
  if (typeof window === 'undefined') return NOOP

  if (!KEY || !HOST) {
    console.warn('[Analytics] PostHog disabled (missing env vars)')
    return NOOP
  }

  try {
    const { default: posthog } = await import('posthog-js')

    posthog.init(KEY, {
      api_host: HOST,
      autocapture: true,
      capture_pageview: true,
      capture_pageleave: true,
    })

    client = posthog
    return posthog
  } catch (error) {
    console.error('[Analytics] PostHog init failed:', error)
    return NOOP
  }
}
