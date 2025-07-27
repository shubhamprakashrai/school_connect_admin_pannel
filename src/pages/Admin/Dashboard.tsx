import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Debugging wrapper component
const DebugWrapper = ({ children, name }: { children: React.ReactNode; name: string }) => {
  useEffect(() => {
    console.log(`[${name}] Mounted`);
    return () => console.log(`[${name}] Unmounted`);
  }, [name]);
  
  return <>{children}</>;
};
import { 
  LayoutDashboard, Users, FileText, ChevronDown, 
  X, LogOut, GraduationCap, Users2, BookType,
  CalendarDays, Plus as PlusIcon
} from 'lucide-react';

// Types
type StatCard = {
  name: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
};

type MenuItem = {
  title: string;
  icon: React.ReactNode;
  path: string;
  subItems?: { title: string; path: string }[];
};

type Event = {
  id: number;
  title: string;
  date: string;
  type: 'event' | 'holiday' | 'exam';
};

type RecentActivity = {
  id: number;
  user: string;
  action: string;
  time: string;
  avatar: string;
};

interface AdminDashboardProps {
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  console.log('AdminDashboard rendering...');
  const navigate = useNavigate();
  
  // Debug effect to check props and state
  useEffect(() => {
    console.log('AdminDashboard mounted with props:', { onLogout });
    
    // Check if we have the required data
    if (!onLogout) {
      console.error('onLogout prop is missing!');
    }
    
    return () => {
      console.log('AdminDashboard unmounting...');
    };
  }, [onLogout]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);

  // Sample data
  const stats: StatCard[] = [
    { 
      name: 'Total Students', 
      value: '1,245', 
      icon: <Users className="h-6 w-6 text-blue-500" />,
      change: '+12%',
      changeType: 'positive',
      color: 'blue'
    },
    { 
      name: 'Active Teachers', 
      value: '84', 
      icon: <GraduationCap className="h-6 w-6 text-green-500" />,
      change: '+5%',
      changeType: 'positive',
      color: 'green'
    },
    { 
      name: 'Active Schools', 
      value: '24', 
      icon: <Users2 className="h-6 w-6 text-purple-500" />,
      change: '+2',
      changeType: 'positive',
      color: 'purple'
    },
    { 
      name: 'Pending Approvals', 
      value: '12', 
      icon: <FileText className="h-6 w-6 text-yellow-500" />,
      change: '+3',
      changeType: 'negative',
      color: 'yellow'
    }
  ];
  
  const upcomingEvents: Event[] = [
    { id: 1, title: 'Staff Meeting', date: '2023-06-15', type: 'event' },
    { id: 2, title: 'End of Term', date: '2023-06-30', type: 'holiday' },
    { id: 3, title: 'Final Exams', date: '2023-06-25', type: 'exam' },
  ];
  
  const recentActivities: RecentActivity[] = [
    { id: 1, user: 'John Doe', action: 'added a new student', time: '2 hours ago', avatar: 'JD' },
    { id: 2, user: 'Jane Smith', action: 'updated class schedule', time: '5 hours ago', avatar: 'JS' },
    { id: 3, user: 'Admin', action: 'approved school registration', time: '1 day ago', avatar: 'A' },
    { id: 1, user: 'John Doe', action: 'added a new student', time: '10 mins ago', avatar: 'JD' },
    { id: 2, user: 'Sarah Smith', action: 'updated class schedule', time: '25 mins ago', avatar: 'SS' },
    { id: 3, user: 'Mike Johnson', action: 'uploaded exam results', time: '1 hour ago', avatar: 'MJ' },
  ];

  // Navigation menu items
  const menuItems: MenuItem[] = [
    { 
      title: 'Dashboard', 
      icon: <LayoutDashboard size={20} />, 
      path: '/admin/dashboard' 
    },
    {
      title: 'Student Management',
      icon: <GraduationCap size={20} />,
      path: '/admin/students',
      subItems: [
        { title: 'All Students', path: '/admin/students' },
        { title: 'Add New Student', path: '/admin/students/add' },
      ]
    },
    {
      title: 'Teacher Management',
      icon: <Users2 size={20} />,
      path: '/admin/teachers',
      subItems: [
        { title: 'All Teachers', path: '/admin/teachers' },
        { title: 'Add New Teacher', path: '/admin/teachers/add' },
      ]
    },
    {
      title: 'Class & Subjects',
      icon: <BookType size={20} />,
      path: '/admin/classes',
      subItems: [
        { title: 'Class Management', path: '/admin/classes' },
        { title: 'Subject Management', path: '/admin/subjects' },
      ]
    },
    {
      title: 'Attendance',
      icon: <FileText size={20} />,
      path: '/admin/attendance',
      subItems: [
        { title: 'Mark Attendance', path: '/admin/attendance/mark' },
        { title: 'View Records', path: '/admin/attendance/records' },
      ]
    },
    {
      title: 'Exams & Homework',
      icon: <FileText size={20} />,
      path: '/admin/exams',
      subItems: [
        { title: 'Exam Schedule', path: '/admin/exams/schedule' },
        { title: 'Homework', path: '/admin/homework' },
      ]
    },
    {
      title: 'Fee Management',
      icon: <FileText size={20} />,
      path: '/admin/fees',
      subItems: [
        { title: 'Collect Fees', path: '/admin/fees/collect' },
        { title: 'Due Reports', path: '/admin/fees/due' },
      ]
    },
    {
      title: 'Messaging',
      icon: <FileText size={20} />,
      path: '/admin/messaging',
      subItems: [
        { title: 'Send Notice', path: '/admin/messaging/notice' },
        { title: 'Inbox', path: '/admin/messaging/inbox' },
      ]
    },
    {
      title: 'Calendar',
      icon: <CalendarDays size={20} />,
      path: '/admin/calendar',
    },
    {
      title: 'Reports',
      icon: <FileText size={20} />,
      path: '/admin/reports',
    },
    {
      title: 'Settings',
      icon: <FileText size={20} />,
      path: '/admin/settings',
    },
  ];

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle logout
  const handleLogout = () => {
    onLogout();
  };

  // Get appropriate icon for event type
  const getEventIcon = (type: Event['type']) => {
    switch (type) {
      case 'event':
        return <CalendarDays className="h-4 w-4 text-blue-500" />;
      case 'exam':
        return <FileText className="h-4 w-4 text-red-500" />;
      case 'holiday':
        return <CalendarDays className="h-4 w-4 text-green-500" />;
      default:
        return <CalendarDays className="h-4 w-4 text-gray-500" />;
    }
  };

  try {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <DebugWrapper name="AdminDashboard">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
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
          {/* Logo and School Name */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">ES</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">EduSmart360</span>
            </div>
            <button 
              onClick={toggleMobileMenu}
              className="lg:hidden p-1 rounded-md hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* User Profile */}
          <div className="border-b px-4 py-3">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold">
                A
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-2">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <div key={item.title}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => setActiveSubmenu(activeSubmenu === item.title ? null : item.title)}
                        className={`flex w-full items-center justify-between rounded-lg p-2.5 text-sm font-medium transition-colors ${
                          location.pathname.startsWith(item.path) 
                            ? 'bg-blue-50 text-blue-700' 
                            : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                        }`}
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown 
                          size={16} 
                          className={`transition-transform ${
                            activeSubmenu === item.title ? 'rotate-180' : ''
                          }`} 
                        />
                      </button>
                      <AnimatePresence>
                        {activeSubmenu === item.title && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-8 mt-1 space-y-1 overflow-hidden"
                          >
                            {item.subItems.map((subItem) => (
                              <Link
                                key={subItem.path}
                                to={subItem.path}
                                className={`block rounded-md py-2 px-3 text-sm transition-colors ${
                                  location.pathname === subItem.path
                                    ? 'bg-blue-50 text-blue-700 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <span className="flex items-center">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
                                  {subItem.title}
                                </span>
                              </Link>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center rounded-lg p-2.5 text-sm font-medium transition-colors ${
                        location.pathname === item.path
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </nav>

          {/* Logout Button */}
          <div className="border-t p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center rounded-lg p-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Main content area */}
      <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          {/* Page title and actions */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-1 text-sm text-gray-500">Welcome back, Admin! Here's what's happening with your school.</p>
            </div>
            <div className="flex space-x-3">
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-white px-3.5 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 border border-gray-300"
              >
                <FileText className="-ml-0.5 mr-1.5 h-4 w-4" />
                Generate Report
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-blue-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                Add New
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 transition-all duration-200 hover:shadow-md"
              >
                <div className="flex items-center">
                  <div className="rounded-lg bg-opacity-10 p-3" style={{ backgroundColor: stat.color.replace('text-', 'bg-').replace(/-[0-9]+$/, '') + '10' }}>
                    {stat.icon}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">
                      {stat.name}
                    </p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {stat.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Upcoming Events and Recent Activities */}
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Upcoming Events */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Events</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="divide-y divide-gray-200">
                  {upcomingEvents.map((event) => (
                    <li key={event.id} className="py-3">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="ml-3 w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900">{event.title}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(event.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Activities</h3>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <ul className="divide-y divide-gray-200">
                  {recentActivities.map((activity) => (
                    <li key={activity.id} className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
                            {activity.avatar}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {activity.user}
                          </p>
                          <p className="text-sm text-gray-500 truncate">
                            {activity.action}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500 whitespace-nowrap">
                          {activity.time}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
        </DebugWrapper>
      </div>
    );
  } catch (error) {
    console.error('Error rendering AdminDashboard:', error);
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Dashboard Error</h2>
          <p className="text-gray-700 mb-4">An error occurred while rendering the dashboard.</p>
          <p className="text-sm text-gray-600 mb-6">Error details: {error instanceof Error ? error.message : 'Unknown error'}</p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
            <button 
              onClick={() => navigate('/')}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default AdminDashboard;
