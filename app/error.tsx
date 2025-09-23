'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div className="mx-auto h-12 w-12 text-red-400">
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-full w-full"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Something went wrong!</h1>
          <p className="mt-2 text-sm text-gray-600">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <div className="mt-6">
            <button
              onClick={reset}
              className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Try again
            </button>
          </div>
        </div>
        <div className="rounded-md bg-gray-100 p-4 text-left">
          <details className="text-sm">
            <summary className="cursor-pointer font-medium text-gray-700">
              Error details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-600">
              {error.message}
              {error.digest && (
                <>
                  {'\n\nDigest: '}{error.digest}
                </>
              )}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
