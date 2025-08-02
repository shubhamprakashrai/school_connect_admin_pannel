import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Drawer from './Drawer';
import AddSchoolForm from '../../SuperAdminPages/SuperAdminDashboard/AddSchoolForm';

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

const SuperAdminDashboard = ({ onLogout }: SuperAdminDashboardProps) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(true);

  return (
    <div className="flex h-screen bg-gray-50 relative">
      {/* Overlay when drawer is open on mobile */}
      {isDrawerOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      <div className={`fixed inset-y-0 left-0 z-40 ${isDrawerOpen ? 'w-64' : 'w-0'} transition-all duration-300`}>
        <Drawer 
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
          onLogout={onLogout}
        />
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${
        isDrawerOpen ? 'ml-64' : 'ml-0'
      }`}>
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-20">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setIsDrawerOpen(!isDrawerOpen)}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isDrawerOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Welcome, Admin</span>
              <button 
                onClick={onLogout}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          <Routes>
            <Route index element={
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Super Admin Dashboard</h1>
                <p>Welcome to the School Connect Admin Panel. Use the sidebar to navigate.</p>
              </div>
            } />
            <Route path="schools">
              <Route index element={
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h1 className="text-2xl font-bold mb-4">Schools Management</h1>
                  <p>Manage all schools in the system.</p>
                </div>
              } />
              <Route path="add" element={<AddSchoolForm />} />
            </Route>
            <Route path="users" element={
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Users Management</h1>
                <p>Manage all users in the system.</p>
              </div>
            } />
            <Route path="settings" element={
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h1 className="text-2xl font-bold mb-4">Settings</h1>
                <p>Configure system settings.</p>
              </div>
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;