/**
 * Email masking utility for data privacy
 * Masks email addresses to show only first 3 characters + asterisks
 * e.g., "johndoe@example.com" → "joh***@example.com"
 */

/**
 * Mask an email address for privacy protection
 * Shows first 3 characters of the username, followed by asterisks, then the domain
 */
export function maskEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return email
  }

  const [username, domain] = email.split('@')

  if (!domain || !username) {
    return email // Invalid email format, return as-is
  }

  // Show first 3 characters, then asterisks
  const visibleChars = username.substring(0, 3)
  const maskedChars = '*'.repeat(Math.max(0, username.length - 3))
  const maskedUsername = visibleChars + maskedChars

  return `${maskedUsername}@${domain}`
}

/**
 * Unmask an email address (for admin override situations)
 * Returns original email if it was previously masked
 */
export function unmaskEmail(maskedEmail: string): string {
  // This is a simple implementation - in production, you'd want to store
  // the original email separately and only return it for authorized users
  return maskedEmail
}

/**
 * Check if an email is already masked
 */
export function isEmailMasked(email: string): boolean {
  return email.includes('***@')
}

/**
 * Validate email masking format
 */
export function isValidMaskedEmail(email: string): boolean {
  const maskedPattern = /^[a-zA-Z0-9]{3,}\*+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  return maskedPattern.test(email)
}
