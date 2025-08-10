import React from 'react';
import { Notice, NoticeAudience, NoticeStatus } from '../types/notice.d';
import { formatDate, getAudienceBadgeClass, getStatusBadgeClass } from '../utils/noticeHelpers';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface NoticeTableProps {
  notices: Notice[];
  onView: (notice: Notice) => void;
  onEdit: (notice: Notice) => void;
  onDelete: (notice: Notice) => void;
  sortConfig: { key: string; direction: 'asc' | 'desc' };
  onSort: (key: string) => void;
}

const NoticeTable: React.FC<NoticeTableProps> = ({
  notices,
  onView,
  onEdit,
  onDelete,
  sortConfig,
  onSort,
}) => {
  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  const handleSort = (key: string) => {
    onSort(key);
  };

  if (notices.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No notices found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('title')}
                >
                  <div className="flex items-center">
                    Title {getSortIndicator('title')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                  onClick={() => handleSort('date')}
                >
                  <div className="flex items-center">
                    Date {getSortIndicator('date')}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Audience
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  Status
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {notices.map((notice) => (
                <tr key={notice.id} className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-900">
                    <div className="font-medium text-gray-900">{notice.title}</div>
                    <div className="text-gray-500 line-clamp-2">{notice.description}</div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatDate(notice.date)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={getAudienceBadgeClass(notice.audience)}>
                      {notice.audience === NoticeAudience.ALL ? 'All' : 
                       notice.audience === NoticeAudience.TEACHERS ? 'Teachers' :
                       notice.audience === NoticeAudience.STUDENTS ? 'Students' : 'Parents'}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <span className={getStatusBadgeClass(notice.status)}>
                      {notice.status === NoticeStatus.ACTIVE ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => onView(notice)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onEdit(notice)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(notice)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default NoticeTable;
