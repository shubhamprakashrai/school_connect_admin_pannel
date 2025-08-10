import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Subject } from '../types/subject.d';
import SubjectForm from '../components/SubjectForm';

interface AddSubjectPageProps {
  onSubmit?: (subject: Omit<Subject, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
}

const AddSubjectPage: React.FC<AddSubjectPageProps> = ({ 
  onSubmit: externalOnSubmit, 
  onCancel: externalOnCancel 
}) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = useCallback(async (subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      if (externalOnSubmit) {
        await externalOnSubmit(subjectData);
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));
        // In a real app, you would save to an API here
        console.log('New subject:', subjectData);
      }
      
      // Navigate back to the subject list after successful submission
      if (externalOnCancel) {
        externalOnCancel();
      } else {
        navigate('..');
      }
    } catch (err) {
      setError('Failed to add subject. Please try again.');
      console.error('Error adding subject:', err);
    } finally {
      setIsSubmitting(false);
    }
  }, [externalOnSubmit, externalOnCancel, navigate]);

  const handleCancel = useCallback(() => {
    if (externalOnCancel) {
      externalOnCancel();
    } else {
      navigate('..');
    }
  }, [externalOnCancel, navigate]);

  return (
    <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">Add New Subject</h1>
        <p className="mt-1 text-sm text-gray-500">
          Fill in the details below to create a new subject.
        </p>
      </div>
      
      <SubjectForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isSubmitting={isSubmitting}
        error={error}
      />
    </div>
  );
};

export default AddSubjectPage;
