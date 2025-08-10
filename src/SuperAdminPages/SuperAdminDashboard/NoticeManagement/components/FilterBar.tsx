import React from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { NoticeAudience, NoticeStatus } from '../types/notice';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  audienceFilter: NoticeAudience | 'All';
  onAudienceChange: (value: NoticeAudience | 'All') => void;
  statusFilter: NoticeStatus | 'All';
  onStatusChange: (value: NoticeStatus | 'All') => void;
  onAddNew: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  audienceFilter,
  onAudienceChange,
  statusFilter,
  onStatusChange,
  onAddNew,
}) => {
  return (
    <div className="mb-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
            </div>
            <input
              type="text"
              name="search"
              id="search"
              className="block w-full rounded-md border-0 bg-white py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              placeholder="Search notices..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-4 flex items-center space-x-4 sm:ml-4 sm:mt-0">
          <select
            id="audience"
            name="audience"
            className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={audienceFilter}
            onChange={(e) => onAudienceChange(e.target.value as NoticeAudience | 'All')}
          >
            <option value="All">All Audiences</option>
            <option value="all">Everyone</option>
            <option value="teachers">Teachers</option>
            <option value="students">Students</option>
            <option value="parents">Parents</option>
          </select>
          
          <select
            id="status"
            name="status"
            className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value as NoticeStatus | 'All')}
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          
          <button
            type="button"
            onClick={onAddNew}
            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Add Notice
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;
