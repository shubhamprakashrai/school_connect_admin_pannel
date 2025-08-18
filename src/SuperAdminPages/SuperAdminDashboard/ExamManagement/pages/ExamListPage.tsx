import React from 'react';
import { Link } from 'react-router-dom';

export const ExamListPage = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Exam Management</h1>
        <Link
          to="/dashboard/exams/schedule"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Schedule New Exam
        </Link>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Upcoming Exams</h2>
        </div>
        <div className="p-4">
          <p>No upcoming exams scheduled.</p>
        </div>
      </div>
      
      <div className="mt-6 bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Past Exams</h2>
        </div>
        <div className="p-4">
          <p>No past exams found.</p>
        </div>
      </div>
    </div>
  );
};

export default ExamListPage;
