"use client";

import { useState } from "react";

interface AdminUserFiltersProps {
  onFilter: (search: string, role: string, staffOnly: boolean) => void;
  loading: boolean;
}

export function AdminUserFilters({ onFilter, loading }: AdminUserFiltersProps) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [staffOnly, setStaffOnly] = useState(false);

  const handleFilter = () => {
    onFilter(search, role, staffOnly);
  };

  const handleReset = () => {
    setSearch("");
    setRole("");
    setStaffOnly(false);
    onFilter("", "", false);
  };

  return (
    <div className="bg-white dark:bg-card shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-foreground mb-4">
          Filters
        </h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Search Input */}
          <div>
            <label
              htmlFor="search"
              className="block text-sm font-medium text-gray-700 dark:text-foreground"
            >
              Search
            </label>
            <input
              type="text"
              name="search"
              id="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name or email..."
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
          </div>

          {/* Role Filter */}
          <div>
            <label
              htmlFor="role"
              className="block text-sm font-medium text-gray-700 dark:text-foreground"
            >
              Role
            </label>
            <select
              id="role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="mt-1 block w-full border-gray-300 dark:border-border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          {/* Staff Only Checkbox */}
          <div className="flex items-end">
            <div className="flex items-center">
              <input
                id="staff-only"
                name="staff-only"
                type="checkbox"
                checked={staffOnly}
                onChange={(e) => setStaffOnly(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-border rounded"
              />
              <label
                htmlFor="staff-only"
                className="ml-2 block text-sm text-gray-900 dark:text-foreground"
              >
                Staff Only
              </label>
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end space-x-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-border shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-foreground bg-white dark:bg-card hover:bg-gray-50 dark:hover:bg-muted/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleFilter}
            disabled={loading}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Filtering..." : "Apply Filters"}
          </button>
        </div>
      </div>
    </div>
  );
}
