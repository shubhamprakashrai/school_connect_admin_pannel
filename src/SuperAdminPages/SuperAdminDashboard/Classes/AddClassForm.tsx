import React from 'react';

const AddClassForm: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h1 className="text-2xl font-bold mb-6">Add New Class</h1>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Class Name</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter class name"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Grade Level</label>
          <select className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500">
            <option>Select grade level</option>
            <option>Nursery</option>
            <option>LKG</option>
            <option>UKG</option>
            <option>1st Grade</option>
            <option>2nd Grade</option>
            <option>3rd Grade</option>
            <option>4th Grade</option>
            <option>5th Grade</option>
            <option>6th Grade</option>
            <option>7th Grade</option>
            <option>8th Grade</option>
            <option>9th Grade</option>
            <option>10th Grade</option>
            <option>11th Grade</option>
            <option>12th Grade</option>
          </select>
        </div>
        <div className="pt-4">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Add Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddClassForm;
