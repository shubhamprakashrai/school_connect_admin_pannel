import React, { useState, useEffect } from 'react';
import { Notice, NoticeAudience, NoticeStatus } from '../types/notice.d';

interface NoticeFormProps {
  initialData?: Partial<Notice>;
  onSubmit: (data: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  loading?: boolean;
}

const NoticeForm: React.FC<NoticeFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
}) => {
  const [formData, setFormData] = useState<Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    audience: NoticeAudience.ALL,
    status: NoticeStatus.ACTIVE,
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        audience: initialData.audience || NoticeAudience.ALL,
        status: initialData.status || NoticeStatus.ACTIVE,
      });
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStatusToggle = () => {
    setFormData((prev) => ({
      ...prev,
      status: prev.status === NoticeStatus.ACTIVE ? NoticeStatus.INACTIVE : NoticeStatus.ACTIVE,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      date: new Date(formData.date).toISOString(),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            id="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
        </div>

        <div>
          <label htmlFor="audience" className="block text-sm font-medium text-gray-700">
            Audience <span className="text-red-500">*</span>
          </label>
          <select
            id="audience"
            name="audience"
            value={formData.audience}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value={NoticeAudience.ALL}>All</option>
            <option value={NoticeAudience.TEACHERS}>Teachers</option>
            <option value={NoticeAudience.STUDENTS}>Students</option>
            <option value={NoticeAudience.PARENTS}>Parents</option>
          </select>
        </div>
      </div>

      <div className="flex items-center">
        <span className="text-sm font-medium text-gray-700 mr-3">Status:</span>
        <button
          type="button"
          onClick={handleStatusToggle}
          className={`relative inline-flex h-6 w-11 items-center rounded-full ${
            formData.status === NoticeStatus.ACTIVE ? 'bg-blue-600' : 'bg-gray-200'
          }`}
        >
          <span
            className={`${
              formData.status === NoticeStatus.ACTIVE ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </button>
        <span className="ml-2 text-sm text-gray-600">
          {formData.status === NoticeStatus.ACTIVE ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Notice'}
        </button>
      </div>
    </form>
  );
};

export default NoticeForm;
