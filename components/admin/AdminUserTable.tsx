'use client'

import { RegularUser } from '@/types/admin'

interface AdminUserTableProps {
  users: RegularUser[]
  loading: boolean
  hasMore: boolean
  onLoadMore: () => void
}

export function AdminUserTable({ users, loading, hasMore, onLoadMore }: AdminUserTableProps) {
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Users</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Cross-tenant user list with privacy protection
        </p>
      </div>

      <ul className="divide-y divide-gray-200">
        {users.map((user) => (
          <li key={user.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10">
                  <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {user.name && user.name.charAt(0).toUpperCase() || '?'}
                    </span>
                  </div>
                </div>
                <div className="ml-4">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-1">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  user.isPenguinMailsStaff
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {user.isPenguinMailsStaff ? 'Staff' : user.role}
                </span>
                <div className="text-xs text-gray-500">
                  {user.tenantCount} tenants • {user.companyCount} companies
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {hasMore && (
        <div className="px-4 py-4 sm:px-6 border-t border-gray-200">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              'Load More Users'
            )}
          </button>
        </div>
      )}

      {users.length === 0 && !loading && (
        <div className="px-4 py-8 sm:px-6 text-center">
          <p className="text-gray-500">No users found.</p>
        </div>
      )}
    </div>
  )
}
