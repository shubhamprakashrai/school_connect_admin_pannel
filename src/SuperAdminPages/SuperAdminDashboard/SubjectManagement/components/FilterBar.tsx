import React from 'react';
import { SubjectStatus, SubjectType } from '../types/subject.d';

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: SubjectStatus | 'All';
  onStatusFilterChange: (status: SubjectStatus | 'All') => void;
  typeFilter: SubjectType | 'All';
  onTypeFilterChange: (type: SubjectType | 'All') => void;
  onAddNew: () => void;
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  onAddNew,
}) => {
  return (
    <div className="filter-bar bg-white p-4 rounded-lg shadow mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search subjects..."
            className="w-full p-2 border rounded-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as SubjectStatus | 'All')}
            className="w-full p-2 border rounded-md"
          >
            <option value="All">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as SubjectType | 'All')}
            className="w-full p-2 border rounded-md"
          >
            <option value="All">All Types</option>
            <option value="Core">Core</option>
            <option value="Elective">Elective</option>
            <option value="Practical">Practical</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button
            onClick={onAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md w-full transition-colors"
          >
            + Add New Subject
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;