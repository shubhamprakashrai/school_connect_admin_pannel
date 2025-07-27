import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Users, FileText, Calendar, 
  X, LogOut, BookOpen, ClipboardList,
  MessageSquare, Bell, BarChart2,
  FileCheck, FileSpreadsheet
} from 'lucide-react';

type TabType = 'overview' | 'classes' | 'students' | 'attendance' | 'homework' | 'grades' | 'exams' | 'reports' | 'messages' | 'announcements';

type StatCard = {
  name: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
};

interface TeacherDashboardProps {
  onLogout: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  // Sample data
  const stats: StatCard[] = [
    { 
      name: 'Total Students', 
      value: '42', 
      icon: <Users className="h-6 w-6" />,
      change: '+2',
      changeType: 'positive',
      color: 'text-blue-500'
    },
    { 
      name: 'Classes Today', 
      value: '3', 
      icon: <Calendar className="h-6 w-6" />,
      change: '0',
      changeType: 'neutral',
      color: 'text-green-500'
    },
    { 
      name: 'Pending Grading', 
      value: '8', 
      icon: <FileCheck className="h-6 w-6" />,
      change: '+3',
      changeType: 'negative',
      color: 'text-amber-500'
    },
    { 
      name: 'Unread Messages', 
      value: '5', 
      icon: <MessageSquare className="h-6 w-6" />,
      change: '+2',
      changeType: 'negative',
      color: 'text-purple-500'
    },
  ];

  const tabs = [
    { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
    { id: 'classes', icon: <BookOpen size={20} />, label: 'Classes' },
    { id: 'students', icon: <Users size={20} />, label: 'Students' },
    { id: 'attendance', icon: <ClipboardList size={20} />, label: 'Attendance' },
    { id: 'homework', icon: <FileText size={20} />, label: 'Homework' },
    { id: 'grades', icon: <FileSpreadsheet size={20} />, label: 'Grades' },
    { id: 'exams', icon: <FileCheck size={20} />, label: 'Exams' },
    { id: 'reports', icon: <BarChart2 size={20} />, label: 'Reports' },
    { id: 'messages', icon: <MessageSquare size={20} />, label: 'Messages' },
    { id: 'announcements', icon: <Bell size={20} />, label: 'Announcements' },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: <ClipboardList className="h-5 w-5" />, label: 'Mark Attendance', color: 'bg-blue-100 text-blue-600' },
                { icon: <BookOpen className="h-5 w-5" />, label: 'Assign Homework', color: 'bg-green-100 text-green-600' },
                { icon: <FileCheck className="h-5 w-5" />, label: 'Grade Work', color: 'bg-purple-100 text-purple-600' },
                { icon: <MessageSquare className="h-5 w-5" />, label: 'Message Class', color: 'bg-amber-100 text-amber-600' },
              ].map((action, index) => (
                <button
                  key={index}
                  className={`flex flex-col items-center justify-center rounded-lg p-4 text-center transition-all hover:shadow-md ${action.color} hover:opacity-90`}
                >
                  <div className="mb-2 rounded-full bg-white/20 p-2">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </button>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((stat, index) => (
                <div key={index} className="overflow-hidden rounded-lg bg-white p-5 shadow">
                  <div className="flex items-center">
                    <div className={`rounded-lg p-3 ${stat.color.replace('text-', 'bg-').replace(/-[0-9]+$/, '')} bg-opacity-10`}>
                      {stat.icon}
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                      <div className="flex items-center">
                        <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                        {stat.change && (
                          <span className={`ml-2 text-xs font-medium ${
                            stat.changeType === 'positive' ? 'text-green-600' : 
                            stat.changeType === 'negative' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            {stat.change}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return (
          <div className="flex h-64 items-center justify-center rounded-lg bg-white p-6 shadow">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">Coming Soon</h3>
              <p className="mt-1 text-sm text-gray-500">This section is under development.</p>
            </div>
          </div>
        );
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={toggleMobileMenu}
      />

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo and School Name */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                EduSmart360
              </span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* User Profile */}
          <div className="border-b px-4 py-3">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                T
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Teacher Name</p>
                <p className="text-xs text-gray-500">Teacher</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-2">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex w-full items-center rounded-lg p-2.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="border-t p-4">
            <button
              onClick={onLogout}
              className="flex w-full items-center rounded-lg p-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white shadow-sm">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="mr-2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <span className="sr-only">Open sidebar</span>
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
              <h1 className="text-lg font-semibold text-gray-900">
                {tabs.find(t => t.id === activeTab)?.label || 'Dashboard'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                type="button"
                className="rounded-full bg-white p-1 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <span className="sr-only">View notifications</span>
                <Bell className="h-6 w-6" />
              </button>
              <div className="relative ml-3">
                <div>
                  <button
                    type="button"
                    className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    id="user-menu-button"
                    aria-expanded="false"
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                      T
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          <div className="mx-auto max-w-7xl">
            {renderTabContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default TeacherDashboard;
