import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { Subject, SubjectStatus, SubjectType } from '../types/subject.d';
import { filterSubjects, sortSubjects } from '../utils/subjectHelpers';
import dummySubjects from '../data/dummySubjects';
import SubjectTable from '../components/SubjectTable';
import FilterBar from '../components/FilterBar';
import SubjectForm from '../components/SubjectForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import SubjectDetailsDrawer from '../components/SubjectDetailsDrawer';

const SubjectListPage: React.FC = () => {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState<Subject[]>(dummySubjects);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<SubjectStatus | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<SubjectType | 'All'>('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Subject; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  });
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentSubject, setCurrentSubject] = useState<Subject | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter and sort subjects
  const filteredSubjects = useMemo(() => {
    let result = [...subjects];
    
    // Apply filters
    result = filterSubjects(result, {
      searchTerm,
      status: statusFilter === 'All' ? undefined : statusFilter,
      type: typeFilter === 'All' ? undefined : typeFilter,
    });
    
    // Apply sorting
    result = sortSubjects(result, sortConfig.key, sortConfig.direction);
    
    return result;
  }, [subjects, searchTerm, statusFilter, typeFilter, sortConfig]);

  // Handle sort
  const handleSort = (key: keyof Subject) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  // Handle add new subject
  const handleAddNew = () => {
    setCurrentSubject(null);
    setIsEditing(false);
    setError(null);
    setIsFormOpen(true);
  };

  // Handle edit subject
  const handleEdit = (subject: Subject) => {
    setCurrentSubject(subject);
    setIsEditing(true);
    setError(null);
    setIsFormOpen(true);
  };

  // Handle view subject details
  const handleViewSubject = useCallback((subject: Subject) => {
    setCurrentSubject(subject);
    setIsDrawerOpen(true);
  }, []);

  // Handle delete subject
  const handleDeleteClick = (subject: Subject) => {
    setCurrentSubject(subject);
    setIsDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = () => {
    if (!currentSubject) return;
    
    setSubjects((prev) => prev.filter((s) => s.id !== currentSubject.id));
    setIsDeleteModalOpen(false);
    setCurrentSubject(null);
  };

  // Handle form submit
  const handleSubmit = useCallback((subjectData: Omit<Subject, 'id' | 'createdAt'>) => {
    setIsSubmitting(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      try {
        if (isEditing && currentSubject) {
          // Update existing subject
          setSubjects((prev) =>
            prev.map((s) =>
              s.id === currentSubject.id
                ? { ...s, ...subjectData }
                : s
            )
          );
        } else {
          // Add new subject
          const newSubject: Subject = {
            ...subjectData,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
          };
          setSubjects((prev) => [...prev, newSubject]);
        }
        
        setIsFormOpen(false);
        setCurrentSubject(null);
      } catch (err) {
        setError('An error occurred while saving the subject. Please try again.');
        console.error('Error saving subject:', err);
      } finally {
        setIsSubmitting(false);
      }
    }, 500);
  }, [isEditing, currentSubject]);

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Subjects</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all subjects in your school. Add, edit, or remove subjects as needed.
          </p>
        </div>
      </div>

      <div className="mt-8">
        <FilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          onAddNew={handleAddNew}
        />

        <SubjectTable
          subjects={filteredSubjects}
          onView={handleViewSubject}
          onEdit={handleEdit}
          onDelete={handleDeleteClick}
        />
      </div>

      {/* Add/Edit Subject Form Modal */}
      {isFormOpen && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <SubjectForm
                subject={currentSubject}
                onSubmit={handleSubmit}
                onCancel={() => setIsFormOpen(false)}
                isSubmitting={isSubmitting}
                error={error}
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
        itemName={currentSubject?.name || ''}
      />
      
      <SubjectDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onEdit={(subject) => {
          setCurrentSubject(subject);
          setIsEditing(true);
          setIsFormOpen(true);
          setIsDrawerOpen(false);
        }}
        onDelete={(subject) => {
          setCurrentSubject(subject);
          setIsDeleteModalOpen(true);
          setIsDrawerOpen(false);
        }}
        subject={currentSubject}
      />
    </div>
  );
};

export default SubjectListPage;
