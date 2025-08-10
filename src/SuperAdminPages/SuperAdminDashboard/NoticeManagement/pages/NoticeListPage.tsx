import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { Notice, NoticeAudience, NoticeStatus } from '../types/notice.d';
import { filterNotices, sortNotices } from '../utils/noticeHelpers';
import dummyNotices from '../data/dummyNoticeData';
import FilterBar from '../components/FilterBar';
import NoticeTable from '../components/NoticeTable';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import NoticeDetailsDrawer from '../components/NoticeDetailsDrawer';
import NoticeForm from '../components/NoticeForm';

const NoticeListPage: React.FC = () => {
  // Note: navigate is kept as it might be needed for future routing
  const [notices, setNotices] = useState<Notice[]>(dummyNotices);
  const [searchTerm, setSearchTerm] = useState('');
  const [audienceFilter, setAudienceFilter] = useState<NoticeAudience | 'All'>('All');
  const [statusFilter, setStatusFilter] = useState<NoticeStatus | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'date',
    direction: 'desc',
  });
  
  // Modal and drawer states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentNotice, setCurrentNotice] = useState<Notice | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Initialize with empty notice to avoid null issues
  const safeCurrentNotice = currentNotice || {
    id: '',
    title: 'Untitled Notice',
    description: '',
    date: new Date().toISOString(),
    audience: 'all' as const,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  // Filter and sort notices
  const filteredNotices = useMemo(() => {
    let result = [...notices];
    
    // Apply filters
    result = filterNotices(result, {
      searchTerm,
      audience: audienceFilter === 'All' ? undefined : audienceFilter,
      status: statusFilter === 'All' ? undefined : statusFilter,
    });
    
    // Apply sorting
    result = sortNotices(result, sortConfig.key as any, sortConfig.direction);
    
    return result;
  }, [notices, searchTerm, audienceFilter, statusFilter, sortConfig]);

  // Handle sort
  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle add new notice
  const handleAddNew = () => {
    setCurrentNotice(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  // Handle edit notice
  const handleEdit = (notice: Notice) => {
    setCurrentNotice(notice);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  // Handle view notice details
  const handleViewNotice = useCallback((notice: Notice) => {
    setCurrentNotice(notice);
    setIsDrawerOpen(true);
  }, []);

  // Handle delete notice
  const handleDeleteClick = (notice: Notice) => {
    setCurrentNotice(notice);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!currentNotice) return;
    
    setNotices((prev) => prev.filter((n) => n.id !== currentNotice.id));
    setIsDeleteModalOpen(false);
    setCurrentNotice(null);
    toast.success('Notice deleted successfully');
  };

  // Handle form submit
  const handleSubmit = (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (isEditing && currentNotice) {
      // Update existing notice
      setNotices((prev) =>
        prev.map((n) =>
          n.id === currentNotice.id
            ? {
                ...n,
                ...noticeData,
                updatedAt: new Date().toISOString(),
              }
            : n
        )
      );
      toast.success('Notice updated successfully');
    } else {
      // Add new notice
      const newNotice: Notice = {
        ...noticeData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setNotices((prev) => [newNotice, ...prev]);
      toast.success('Notice added successfully');
    }
    
    setIsFormOpen(false);
    setCurrentNotice(null);
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Notices</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all notices and announcements in the system.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          audienceFilter={audienceFilter}
          onAudienceChange={setAudienceFilter}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          onAddNew={handleAddNew}
        />

        <NoticeTable
          notices={filteredNotices}
          onView={handleViewNotice}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
          sortConfig={sortConfig}
          onSort={handleSort}
        />
      </div>

      {/* Add/Edit Form Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:h-screen sm:align-middle" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block w-full max-w-2xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all sm:my-8 sm:max-w-3xl sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {isEditing ? 'Edit Notice' : 'Add New Notice'}
              </h2>
              <NoticeForm
                initialData={currentNotice || undefined}
                onSubmit={handleSubmit}
                onCancel={() => {
                  setIsFormOpen(false);
                  setCurrentNotice(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        notice={safeCurrentNotice}
      />

      {/* Notice Details Drawer */}
      <NoticeDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        notice={currentNotice}
        onEdit={(notice) => {
          setCurrentNotice(notice);
          setIsEditing(true);
          setIsFormOpen(true);
          setIsDrawerOpen(false);
        }}
        onDelete={(notice) => {
          setCurrentNotice(notice);
          setIsDeleteModalOpen(true);
          setIsDrawerOpen(false);
        }}
      />
    </div>
  );
};

export default NoticeListPage;
