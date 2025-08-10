import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Notice, NoticeAudience, NoticeStatus } from '../types/notice.d';
import dummyNotices from '../data/dummyNoticeData';
import NoticeForm from '../components/NoticeForm';

const EditNoticePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // In a real app, you would fetch the notice from an API
    const foundNotice = dummyNotices.find((n) => n.id === id);
    
    if (foundNotice) {
      setNotice(foundNotice);
    } else {
      toast.error('Notice not found');
      navigate('/dashboard/notices');
    }
    
    setIsLoading(false);
  }, [id, navigate]);

  const handleSubmit = async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!notice) return;
    
    try {
      setIsSubmitting(true);
      
      // In a real app, you would make an API call here
      const updatedNotice: Notice = {
        ...notice,
        ...noticeData,
        updatedAt: new Date().toISOString(),
      };
      
      // Update the notice in the dummy data
      const index = dummyNotices.findIndex((n) => n.id === notice.id);
      if (index !== -1) {
        dummyNotices[index] = updatedNotice;
      }
      
      toast.success('Notice updated successfully');
      navigate('/dashboard/notices');
    } catch (error) {
      console.error('Error updating notice:', error);
      toast.error('Failed to update notice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Notice not found</h3>
        <p className="mt-2 text-sm text-gray-500">The requested notice could not be found.</p>
        <div className="mt-6">
          <button
            type="button"
            onClick={() => navigate('/dashboard/notices')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Go back to notices
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Edit Notice</h1>
          <p className="mt-2 text-sm text-gray-700">
            Update the notice details below.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <NoticeForm
            initialData={notice}
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard/notices')}
            loading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default EditNoticePage;
