import { useState } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, School, Users, CreditCard, Bell, 
  Settings, BarChart2, Mail, FileText, ChevronDown, 
  LogOut, Menu, X, CheckCircle2, Clock, AlertCircle, UserPlus, Search 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MenuItem = {
  title: string;
  icon: React.ReactNode;
  path: string;
  subItems?: { title: string; path: string }[];
};

const AdminDashboard = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<string | null>(null);
  const location = useLocation();

  const menuItems: MenuItem[] = [
    { title: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/admin/dashboard' },
    {
      title: 'Schools',
      icon: <School size={20} />,
      path: '/admin/schools',
      subItems: [
        { title: 'All Schools', path: '/admin/schools' },
        { title: 'Approval Requests', path: '/admin/schools/approvals' },
      ]
    },
    // Other menu items...
  ];

  const stats = [
    { name: 'Active Schools', value: '1,234', change: '+12%', changeType: 'positive' },
    { name: 'Pending Approvals', value: '24', change: '+3', changeType: 'negative' },
    { name: 'Total Users', value: '45,678', change: '+5.4%', changeType: 'positive' },
    { name: 'Monthly Revenue', value: '$124,500', change: '+8.2%', changeType: 'positive' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-20 bg-black/50 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white shadow-lg lg:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center justify-center border-b px-4">
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center mr-2">
                <span className="text-white font-bold">E</span>
              </div>
              <span className="text-xl font-bold">EduSmart360</span>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.title}>
                  {item.subItems ? (
                    <>
                      <button
                        onClick={() => setActiveSubmenu(activeSubmenu === item.title ? null : item.title)}
                        className="flex w-full items-center justify-between rounded-lg p-3 text-base font-medium hover:bg-gray-100"
                      >
                        <div className="flex items-center">
                          <span className="mr-3">{item.icon}</span>
                          <span>{item.title}</span>
                        </div>
                        <ChevronDown size={16} className={`transition-transform ${activeSubmenu === item.title ? 'rotate-180' : ''}`} />
                      </button>
                      <AnimatePresence>
                        {activeSubmenu === item.title && (
                          <motion.ul
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="ml-8 mt-1 space-y-1 overflow-hidden"
                          >
                            {item.subItems.map((subItem) => (
                              <li key={subItem.path}>
                                <Link
                                  to={subItem.path}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className="block rounded-md px-3 py-2 text-sm hover:bg-gray-100"
                                >
                                  {subItem.title}
                                </Link>
                              </li>
                            ))}
                          </motion.ul>
                        )}
                      </AnimatePresence>
                    </>
                  ) : (
                    <Link
                      to={item.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center rounded-lg p-3 text-base font-medium hover:bg-gray-100"
                    >
                      <span className="mr-3">{item.icon}</span>
                      <span>{item.title}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col lg:pl-64">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4 lg:px-6">
          <div className="flex items-center">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mr-2 rounded-md p-1.5 hover:bg-gray-100 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-semibold">Dashboard</h1>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search..."
                className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-sm text-gray-900 ring-1 ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button className="relative rounded-full p-1 text-gray-500 hover:bg-gray-100">
              <Bell size={20} />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 lg:p-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow">
                <dt className="truncate text-sm font-medium text-gray-500">{stat.name}</dt>
                <dd className="mt-1 flex items-baseline">
                  <div className="text-2xl font-semibold">{stat.value}</div>
                  <div className={`ml-2 text-sm font-semibold ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change}
                  </div>
                </dd>
              </div>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="overflow-hidden rounded-lg bg-white p-6 shadow lg:col-span-2">
              <h3 className="text-lg font-medium">Overview</h3>
              <div className="mt-4 h-64 flex items-center justify-center text-gray-400">
                <BarChart2 size={48} className="opacity-30" />
                <span className="ml-2">Chart will be displayed here</span>
              </div>
            </div>

            <div className="overflow-hidden rounded-lg bg-white shadow">
              <div className="border-b px-6 py-4">
                <h3 className="text-lg font-medium">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { id: 1, title: 'New school registration', time: '2 min ago' },
                    { id: 2, title: 'Subscription updated', time: '1 hour ago' },
                    { id: 3, title: 'New admin user added', time: '3 hours ago' },
                  ].map((item) => (
                    <div key={item.id} className="flex items-start">
                      <div className="h-2 w-2 mt-2 rounded-full bg-blue-500"></div>
                      <div className="ml-3">
                        <p className="text-sm font-medium">{item.title}</p>
                        <p className="text-xs text-gray-500">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
