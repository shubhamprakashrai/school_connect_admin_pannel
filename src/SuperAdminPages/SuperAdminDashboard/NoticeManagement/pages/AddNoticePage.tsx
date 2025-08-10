import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { Notice, NoticeAudience, NoticeStatus } from '../types/notice.d';
import dummyNotices from '../data/dummyNoticeData';
import NoticeForm from '../components/NoticeForm';

const AddNoticePage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsSubmitting(true);
      
      // In a real app, you would make an API call here
      // For now, we'll just update the local state
      const newNotice: Notice = {
        ...noticeData,
        id: uuidv4(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add the new notice to the beginning of the array
      dummyNotices.unshift(newNotice);
      
      toast.success('Notice added successfully');
      navigate('/dashboard/notices');
    } catch (error) {
      console.error('Error adding notice:', error);
      toast.error('Failed to add notice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Add New Notice</h1>
          <p className="mt-2 text-sm text-gray-700">
            Create a new notice or announcement.
          </p>
        </div>
      </div>

      <div className="mt-8 bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <NoticeForm
            onSubmit={handleSubmit}
            onCancel={() => navigate('/dashboard/notices')}
            loading={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};

export default AddNoticePage;
