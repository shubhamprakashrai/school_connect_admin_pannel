import React, { useCallback, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Subject } from '../types/subject.d';
import SubjectForm from '../components/SubjectForm';
import dummySubjects from '../data/dummySubjects';

interface EditSubjectPageProps {
  subjects?: Subject[];
  onUpdate?: (subject: Subject) => void;
  onCancel?: () => void;
}

const EditSubjectPage: React.FC<EditSubjectPageProps> = ({
  subjects: externalSubjects,
  onUpdate: externalOnUpdate,
  onCancel: externalOnCancel
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [subject, setSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load subject data
  useEffect(() => {
    const loadSubject = async () => {
      try {
        setIsLoading(true);
        
        // In a real app, you would fetch the subject from an API
        const subjects = externalSubjects || dummySubjects;
        const foundSubject = subjects.find(s => s.id === id);
        
        if (!foundSubject) {
          throw new Error('Subject not found');
        }
        
        setSubject(foundSubject);
      } catch (err) {
        setError('Failed to load subject. It may have been deleted or you may not have permission to view it.');
        console.error('Error loading subject:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      loadSubject();
    }
  }, [id, externalSubjects]);

  const handleSubmit = useCallback(async (subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    if (!subject) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      const updatedSubject = {
        ...subject,
        ...subjectData,
      };
      
      if (externalOnUpdate) {
        await externalOnUpdate(updatedSubject);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real app, you would save to an API here
        console.log('Updated subject:', updatedSubject);
      }
      
      // Navigate back after successful update
      if (externalOnCancel) {
        externalOnCancel();
      } else {
        navigate('..');
      }
    } catch (err) {
      setError('Failed to update subject. Please try again.');
      console.error('Error updating subject:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [subject, externalOnUpdate, externalOnCancel, navigate]);

  const handleCancel = useCallback(() => {
    if (externalOnCancel) {
      externalOnCancel();
    } else {
      navigate('..');
    }
  }, [externalOnCancel, navigate]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
                <div className="mt-2">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="text-sm font-medium text-red-700 hover:text-red-600 focus:outline-none focus:underline transition duration-150 ease-in-out"
                  >
                    Back to Subjects <span aria-hidden="true">&rarr;</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!subject) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Subject not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The subject you're looking for doesn't exist or has been deleted.
        </p>
        <div className="mt-6">
          <button
            type="button"
            onClick={handleCancel}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Back to Subjects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Edit Subject</h1>
        <p className="mt-1 text-sm text-gray-500">
          Update the details of this subject.
        </p>
      </div>
      
      <SubjectForm
        subject={subject}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
};

export default EditSubjectPage;
