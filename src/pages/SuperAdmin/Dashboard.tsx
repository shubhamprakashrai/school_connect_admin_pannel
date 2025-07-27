import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  AlertCircle,
  BarChart2, 
  Bell, 
  BookOpen, 
  Calendar, 
  ClipboardList,
  FileCheck, 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  MessageSquare, 
  School, 
  Users, 
  X 
} from 'lucide-react';

type TabType = 'overview' | 'schools' | 'users' | 'subscriptions' | 'reports' | 'settings';

type StatCard = {
  name: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  color: string;
};

type School = {
  id: string;
  name: string;
  admin: string;
  plan: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  students: number;
  status: 'active' | 'pending' | 'suspended';
  joinDate: string;
};

interface SuperAdminDashboardProps {
  onLogout: () => void;
}

const SuperAdminDashboard = ({ onLogout }: SuperAdminDashboardProps): JSX.Element => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [, setActiveNav] = useState('dashboard');
  const location = useLocation();
  const navigate = useNavigate();

  // Teacher Dashboard Stats
  const teacherStats: StatCard[] = [
    { 
      name: 'Total Students', 
      value: '42', 
      icon: <Users className="h-6 w-6" />,
      change: '+2',
      changeType: 'positive',
      color: 'blue-500'
    },
    { 
      name: 'Classes Today', 
      value: '3', 
      icon: <Calendar className="h-6 w-6" />,
      change: '0',
      changeType: 'neutral',
      color: 'green-500'
    },
    { 
      name: 'Pending Grading', 
      value: '8', 
      icon: <FileCheck className="h-6 w-6" />,
      change: '+3',
      changeType: 'negative',
      color: 'amber-500'
    },
    { 
      name: 'Unread Messages', 
      value: '5', 
      icon: <MessageSquare className="h-6 w-6" />,
      change: '+2',
      changeType: 'negative',
      color: 'purple-500'
    },
  ];

  // Check if mobile view on resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update active nav and tab based on URL
  useEffect(() => {
    const path = location.pathname.split('/').pop() as TabType || 'overview';
    setActiveNav(path);
    setActiveTab(path);
  }, [location]);

  const navigateTo = (path: string) => {
    setActiveNav(path);
    setActiveTab(path as TabType);
    navigate(`/super-admin/${path}`);
    if (isMobile) setMobileMenuOpen(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { icon: <ClipboardList className="h-5 w-5" />, label: 'Manage Schools', color: 'bg-blue-100 text-blue-600' },
                { icon: <BookOpen className="h-5 w-5" />, label: 'View Users', color: 'bg-green-100 text-green-600' },
                { icon: <FileCheck className="h-5 w-5" />, label: 'Subscriptions', color: 'bg-purple-100 text-purple-600' },
                { icon: <MessageSquare className="h-5 w-5" />, label: 'Support', color: 'bg-amber-100 text-amber-600' },
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
              {teacherStats.map((stat, index) => (
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

            {/* Recent Schools Table */}
            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Schools</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        School
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Plan
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {recentSchools.map((school) => (
                      <tr key={school.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{school.name}</div>
                          <div className="text-sm text-gray-500">{school.admin}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPlanBadge(school.plan)}`}>
                            {school.plan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadge(school.status)}`}>
                            {school.status.charAt(0).toUpperCase() + school.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button className="text-blue-600 hover:text-blue-900">View</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
  
  const recentSchools: School[] = [
    { id: '1', name: 'Greenwood High', admin: 'admin@greenwood.edu', plan: 'Pro', students: 1245, status: 'active', joinDate: '2023-10-15' },
    { id: '2', name: 'Sunrise Academy', admin: 'admin@sunrise.edu', plan: 'Basic', students: 842, status: 'pending', joinDate: '2023-11-02' },
    { id: '3', name: 'Riverside Public', admin: 'admin@riverside.edu', plan: 'Enterprise', students: 2150, status: 'active', joinDate: '2023-09-20' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  const getPlanBadge = (plan: string) => {
    const styles = {
      Enterprise: 'bg-purple-100 text-purple-800',
      Pro: 'bg-blue-100 text-blue-800',
      Basic: 'bg-green-100 text-green-800',
      Free: 'bg-gray-100 text-gray-800'
    };
    return styles[plan as keyof typeof styles] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity lg:hidden ${
          mobileMenuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />
      {/* Mobile header */}
      <div className="lg:hidden bg-white border-b p-4 fixed top-0 left-0 right-0 z-50">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
              className="text-gray-600 p-1"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
            <h1 className="font-bold text-lg">EduSmart360</h1>
          </div>
          <div className="flex items-center space-x-3">
            <button className="relative p-1">
              <AlertCircle className="h-5 w-5 text-gray-500" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo and Title */}
          <div className="flex h-16 items-center justify-between border-b px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center mr-2">
                <span className="text-white font-bold text-sm">SA</span>
              </div>
              <span className="text-xl font-bold">EduSmart360</span>
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
                SA
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">Super Admin</p>
                <p className="text-xs text-gray-500">Administrator</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-2 px-2">
            <div className="space-y-1">
              {[
                { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                { id: 'schools', icon: <School size={20} />, label: 'Schools' },
                { id: 'users', icon: <Users size={20} />, label: 'Users' },
                { id: 'subscriptions', icon: <FileText size={20} />, label: 'Subscriptions' },
                { id: 'reports', icon: <BarChart2 size={20} />, label: 'Reports' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setMobileMenuOpen(false);
                    navigateTo(tab.id);
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
      </div>

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
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
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
                      SA
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
}

export default SuperAdminDashboard;
// superadmin@edusmart360.com
// password