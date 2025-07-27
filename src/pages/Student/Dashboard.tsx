import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, BookOpen, Calendar, Clock, 
  Bell, FileText, BarChart2, CreditCard, 
  AlertTriangle, Clock as ClockIcon,
  Menu, X, LogOut
} from 'lucide-react';

// Types
type StatCard = {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
  color: string;
};

// Notification type for the notifications array
interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'homework' | 'exam' | 'attendance' | 'general';
}

interface StudentDashboardProps {
  onLogout: () => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ onLogout }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Toggle mobile menu
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // Sample data
  const stats: StatCard[] = [
    { title: 'Today\'s Classes', value: '3/5', icon: <BookOpen className="h-6 w-6" />, trend: '+1 from yesterday', trendType: 'up', color: 'bg-blue-100 text-blue-600' },
    { title: 'Pending Homework', value: '4', icon: <FileText className="h-6 w-6" />, trend: '2 due tomorrow', trendType: 'down', color: 'bg-amber-100 text-amber-600' },
    { title: 'Upcoming Exams', value: '2', icon: <Calendar className="h-6 w-6" />, trend: 'Next in 3 days', trendType: 'neutral', color: 'bg-purple-100 text-purple-600' },
    { title: 'Attendance', value: '82%', icon: <BarChart2 className="h-6 w-6" />, trend: '3% below target', trendType: 'down', color: 'bg-green-100 text-green-600' }
  ];

  const notifications = [
    { id: 1, title: 'Math Homework', message: 'Complete exercises 1-10', time: '2h ago', read: false, type: 'homework' },
    { id: 2, title: 'Science Test', message: 'Chapter 3: Chemical Reactions', time: '1d ago', read: false, type: 'exam' },
    { id: 3, title: 'Attendance Alert', message: 'Attendance below 75% in Physics', time: '2d ago', read: true, type: 'attendance' }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'homework': return <FileText className="h-5 w-5 text-amber-500" />;
      case 'exam': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'attendance': return <ClockIcon className="h-5 w-5 text-blue-500" />;
      default: return <Bell className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
            onClick={toggleMobileMenu}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">E</div>
              <span className="ml-2 text-lg font-semibold">EduSmart360</span>
            </div>
            <button onClick={toggleMobileMenu} className="p-1 text-gray-500 lg:hidden">
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-2">
            {['overview', 'timetable', 'homework', 'exams', 'attendance', 'reports', 'fees', 'events'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex w-full items-center rounded-lg px-4 py-3 text-sm font-medium mb-1 ${
                  activeTab === tab
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab === 'overview' && <LayoutDashboard className="mr-3 h-5 w-5" />}
                {tab === 'timetable' && <Calendar className="mr-3 h-5 w-5" />}
                {tab === 'homework' && <FileText className="mr-3 h-5 w-5" />}
                {tab === 'exams' && <AlertTriangle className="mr-3 h-5 w-5" />}
                {tab === 'attendance' && <BarChart2 className="mr-3 h-5 w-5" />}
                {tab === 'reports' && <FileText className="mr-3 h-5 w-5" />}
                {tab === 'fees' && <CreditCard className="mr-3 h-5 w-5" />}
                {tab === 'events' && <Calendar className="mr-3 h-5 w-5" />}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">JS</div>
              <div className="ml-3">
                <p className="text-sm font-medium">John Student</p>
                <p className="text-xs text-gray-500">Grade 10 - Section A</p>
              </div>
              <button onClick={onLogout} className="ml-auto p-1 text-gray-500" title="Logout">
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 shadow-sm lg:pl-64">
          <div className="flex items-center">
            <button onClick={toggleMobileMenu} className="mr-2 text-gray-500 lg:hidden">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-semibold">
              {activeTab === 'overview' && 'Dashboard'}
              {activeTab === 'timetable' && 'Class Timetable'}
              {activeTab === 'homework' && 'Homework'}
              {activeTab === 'exams' && 'Exams'}
              {activeTab === 'attendance' && 'Attendance'}
              {activeTab === 'reports' && 'Report Cards'}
              {activeTab === 'fees' && 'Fee Payments'}
              {activeTab === 'events' && 'Events & Holidays'}
            </h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-500">
              <Bell className="h-5 w-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:pl-64">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome card */}
              <div className="rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white shadow-lg">
                <h2 className="text-2xl font-bold">Welcome back, John! 👋</h2>
                <p className="mt-1 text-blue-100">Here's what's happening with your classes today</p>
                <div className="mt-4 flex items-center space-x-2">
                  <div className="rounded-full bg-blue-500 bg-opacity-30 p-1.5">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-sm">Next class: Math at 10:00 AM</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat, index) => (
                  <div key={index} className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full ${stat.color}`}>
                          {stat.icon}
                        </div>
                        <div className="ml-4">
                          <p className="text-sm text-gray-500">{stat.title}</p>
                          <p className="text-2xl font-semibold">{stat.value}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Content sections */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Today's Schedule */}
                <div className="rounded-lg bg-white p-6 shadow">
                  <h3 className="mb-4 text-lg font-medium">Today's Schedule</h3>
                  <div className="space-y-4">
                    {[
                      { time: '09:00 - 10:00', subject: 'Mathematics', room: 'B-204' },
                      { time: '10:15 - 11:15', subject: 'Science', room: 'Lab-3' },
                      { time: '11:30 - 12:30', subject: 'English', room: 'A-102' },
                    ].map((cls, i) => (
                      <div key={i} className="flex items-center rounded-lg border p-3">
                        <div className="text-center">
                          <p className="font-medium">{cls.time}</p>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium">{cls.subject}</p>
                          <p className="text-sm text-gray-500">Room: {cls.room}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Notifications */}
                <div className="rounded-lg bg-white p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium">Notifications</h3>
                    <button className="text-sm text-blue-600">Mark all as read</button>
                  </div>
                  <div className="space-y-4">
                    {notifications.map((notif) => (
                      <div key={notif.id} className={`flex items-start rounded-lg border p-3 ${!notif.read ? 'border-l-4 border-l-blue-500' : ''}`}>
                        <div className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${!notif.read ? 'bg-blue-100 text-blue-600' : 'text-gray-400'}`}>
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="ml-3 flex-1">
                          <p className={`text-sm ${!notif.read ? 'font-medium' : ''}`}>{notif.title}</p>
                          <p className="text-sm text-gray-500">{notif.message}</p>
                          <p className="mt-1 text-xs text-gray-400">{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && (
            <div className="flex h-64 items-center justify-center rounded-lg bg-white p-6 shadow">
              <div className="text-center">
                <h3 className="text-lg font-medium">Coming Soon</h3>
                <p className="mt-1 text-sm text-gray-500">This section is under development.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default StudentDashboard;
