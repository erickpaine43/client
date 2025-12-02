'use client'
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button/button"
import { PasswordInput } from "@/components/ui/custom/password-input"
import { Input } from "@/components/ui/input/input"
import { Label } from "@/components/ui/label"
import { LogIn, User } from "lucide-react"
import { LandingLayout } from "@/components/landing/LandingLayout"
import { loginContent } from "./content"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { AuthTemplate } from "@/components/auth/AuthTemplate"
import { Turnstile } from "next-turnstile"
import { verifyTurnstileToken } from "./signup/verifyToken"
import { useTranslations } from "next-intl"

//PostHog
import posthog from '@/lib/instrumentation-client'


export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { login, user } = useAuth()
  const [token, setToken] = useState("") // stores Turnstile token

  const t = useTranslations("Login")

   useEffect(() => {
    posthog.capture('login_page_loaded')
  }, [])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!token) {
      setError("Please complete the CAPTCHA verification.")
      return
    }

    try {
      // CAPTCHA verification
      await verifyTurnstileToken(token)
      posthog.capture('captcha_completed', { email })

      // Login attempt
      await login(email, password)
      posthog.capture('login_attempt', { email, success: true })

      router.push("/dashboard")
      setToken("")
    } catch (err) {
      console.error("Login failed:", err)
      const errorMsg = (err as Error)?.message || loginContent.errors.generic
      setError(errorMsg)

      // Log failed login attempt
      posthog.capture('login_attempt', { email, success: false, error: errorMsg })
    } finally {
      setIsLoading(false)
    }
  }

  const icon = user ? User : LogIn
  const mode = user ? "loggedIn" : "form"
  const footer = user ? undefined : (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-xs text-muted-foreground">
        {loginContent.signup.text}{" "}
        <Link href="/signup" className="underline font-medium text-primary">
          {loginContent.signup.link}
        </Link>
      </p>
    </div>
  )

  return (
    <LandingLayout>
      <AuthTemplate
        mode={mode}
        icon={icon}
        title={t("title")}
        description={t("description")}
        footer={footer}
        error={mode === "form" ? error : undefined}
      >
        {user ? undefined : (
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email.label")}</Label>
              <Input
                id="email"
                type="email"
                placeholder={t("email.placeholder")}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password.label")}</Label>
              </div>
              <PasswordInput
                name="password"
                placeholder=""
                value={password}
                onValueChange={setPassword}
                disabled={isLoading}
                required
              />
            </div>

            <div className="flex justify-center">
              {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
                <Turnstile
                  siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
                  onVerify={(token) => setToken(token)}
                />
              ) : (
                <p className="text-sm text-destructive">
                  CAPTCHA is not configured. Please contact support.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t("loginButton.loading") : t("loginButton.default")}
            </Button>
          </form>
        )}
      </AuthTemplate>
    </LandingLayout>
  )
}

// Force dynamic rendering to prevent SSR issues
export const dynamic = "force-dynamic"
