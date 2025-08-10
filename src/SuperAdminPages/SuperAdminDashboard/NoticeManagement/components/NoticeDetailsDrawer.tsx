import React from 'react';
import { XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Notice, NoticeAudience, NoticeStatus } from '../types/notice.d';
import { formatDate, getAudienceBadgeClass, getStatusBadgeClass } from '../utils/noticeHelpers';

interface NoticeDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notice: Notice | null;
  onEdit: (notice: Notice) => void;
  onDelete: (notice: Notice) => void;
}

const NoticeDetailsDrawer: React.FC<NoticeDetailsDrawerProps> = ({
  isOpen,
  onClose,
  notice,
  onEdit,
  onDelete,
}) => {
  if (!notice) return null;

  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-xl transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Notice Details</h2>
          <button
            type="button"
            className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close panel</span>
            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{notice.title}</h3>
              <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                <time dateTime={notice.date}>{formatDate(notice.date)}</time>
                <span className="mx-1">•</span>
                <span className={getAudienceBadgeClass(notice.audience)}>
                  {notice.audience === NoticeAudience.ALL ? 'All' : 
                   notice.audience === NoticeAudience.TEACHERS ? 'Teachers' :
                   notice.audience === NoticeAudience.STUDENTS ? 'Students' : 'Parents'}
                </span>
                <span className={getStatusBadgeClass(notice.status)}>
                  {notice.status === NoticeStatus.ACTIVE ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="prose max-w-none">
              <p className="whitespace-pre-line text-gray-700">{notice.description}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => onDelete(notice)}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
            >
              Delete
            </button>
            <button
              type="button"
              onClick={() => onEdit(notice)}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Edit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeDetailsDrawer;
