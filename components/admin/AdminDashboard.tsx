'use client'

import { useState, useEffect } from 'react'
import { AdminUsersResponse } from '@/types/admin'
import { AdminUserTable } from './AdminUserTable'
import { AdminUserFilters } from './AdminUserFilters'
import { AdminDashboardSkeleton } from './AdminDashboardSkeleton'

interface AdminDashboardProps {
  initialData?: AdminUsersResponse
}

export function AdminDashboard({ initialData }: AdminDashboardProps) {
  const [data, setData] = useState<AdminUsersResponse | null>(initialData || null)
  const [loading, setLoading] = useState(!initialData)
  const [error, setError] = useState<string | null>(null)

  // Debug logging
  console.log('AdminDashboard: Component loaded')
  console.log('AdminDashboard: initialData:', initialData)

  const fetchUsers = async (search?: string, role?: string, staffOnly?: boolean) => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (role) params.set('role', role)
      if (staffOnly) params.set('staff_only', 'true')

      console.log('AdminDashboard: Fetching users with params:', params.toString())

      const response = await fetch(`/api/admin/users?${params}`)
      console.log('AdminDashboard: Response status:', response.status)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error('AdminDashboard: Response error:', errorData)
        throw new Error(`Failed to fetch users: ${response.status} - ${(errorData as Record<string, unknown>)?.error as string || 'Unknown error'}`)
      }

      const result: AdminUsersResponse = await response.json()
      console.log('AdminDashboard: Received data:', result)
      setData(result)
    } catch (err) {
      console.error('AdminDashboard: Fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const loadMore = async () => {
    if (!data || loading) return

    try {
      const params = new URLSearchParams({
        limit: '50',
        offset: data.users.length.toString(),
      })

      const response = await fetch(`/api/admin/users?${params}`)
      if (!response.ok) {
        throw new Error(`Failed to fetch more users: ${response.status}`)
      }

      const result: AdminUsersResponse = await response.json()
      setData(prev => prev ? {
        ...prev,
        users: [...prev.users, ...result.users],
        pagination: result.pagination,
      } : result)
    } catch (err) {
      console.error('Load more error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load more users')
    }
  }

  useEffect(() => {
    if (!initialData) {
      fetchUsers()
    }
  }, [initialData])

  if (loading && !data) {
    return <AdminDashboardSkeleton />
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error loading users</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <div className="mt-4">
              <button
                onClick={() => fetchUsers()}
                className="rounded-md bg-red-100 px-3 py-2 text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) {
    return <AdminDashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
                  <dd className="text-lg font-medium text-gray-900">{data.total.toLocaleString()}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Staff Users</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.users.filter(u => u.isPenguinMailsStaff).length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Tenants</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.users.reduce((sum, u) => sum + u.tenantCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Companies</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {data.users.reduce((sum, u) => sum + u.companyCount, 0)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <AdminUserFilters
        onFilter={(search: string, role: string, staffOnly: boolean) => fetchUsers(search, role, staffOnly)}
        loading={loading}
      />

      {/* User Table */}
      <AdminUserTable
        users={data.users}
        loading={loading}
        hasMore={data.pagination.hasMore}
        onLoadMore={loadMore}
      />
    </div>
  )
}
