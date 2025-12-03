'use client'

import type { PostHog } from 'posthog-js'

// Fallback NOOP client (nunca rompe)
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

// Variable interna que almacenará la instancia real
let client: PostHog | null = null

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST

/**
 * Devuelve SIEMPRE un cliente funcional.
 * Si PostHog falló, devuelve NOOP.
 */
export function ph(): PostHog {
  return client ?? NOOP
}

/**
 * Inicializa PostHog de forma segura.
 * - Solo corre en el browser
 * - No rompe SSR
 * - No lanza errores si falla
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
