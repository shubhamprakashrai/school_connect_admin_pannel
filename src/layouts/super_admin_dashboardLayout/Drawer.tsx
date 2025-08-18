import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, School, Users, Settings, LogOut, GraduationCap, UserPlus, BookOpen, BookOpenText, Bell, CalendarCheck, BookOpenCheck } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const Drawer: React.FC<DrawerProps> = ({ onClose, onLogout }) => {
  const [expandedItems, setExpandedItems] = React.useState<Record<string, boolean>>({
    schools: true,
    students: true,
    teachers: true,
    classes: true,
    subjects: true
  });

  const toggleItem = (key: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const menuItems = [
    { 
      key: 'dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />, 
      label: 'Dashboard', 
      path: '/dashboard',
      exact: true
    },
    { 
      key: 'schools',
      icon: <School className="w-5 h-5" />, 
      label: 'Schools',
      children: [
        { 
          label: 'Add School', 
          path: '/dashboard/schools/add' 
        },
        { 
          label: 'View Schools', 
          path: '/dashboard/schools' 
        }
      ]
    },
    { 
      key: 'students',
      icon: <GraduationCap className="w-5 h-5" />, 
      label: 'Students',
      children: [
        { 
          label: 'Add Student', 
          path: '/dashboard/students/add' 
        },
        { 
          label: 'View Students', 
          path: '/dashboard/students' 
        }
      ]
    },
    { 
      key: 'teachers',
      icon: <UserPlus className="w-5 h-5" />, 
      label: 'Teachers',
      children: [
        { 
          label: 'Add Teacher', 
          path: '/dashboard/teachers/add' 
        },
        { 
          label: 'View Teachers', 
          path: '/dashboard/teachers' 
        }
      ]
    },
    { 
      key: 'classes',
      icon: <BookOpen className="w-5 h-5" />, 
      label: 'Class Management',
      children: [
        { 
          label: 'Add Class', 
          path: '/dashboard/classes/add' 
        },
        { 
          label: 'View Classes', 
          path: '/dashboard/classes' 
        },
        { 
          label: 'Class Schedule', 
          path: '/dashboard/classes/schedule' 
        }
      ]
    },
    { 
      key: 'attendance',
      icon: <CalendarCheck className="w-5 h-5" />, 
      label: 'Attendance',
      children: [
        { 
          label: 'Mark Attendance', 
          path: '/dashboard/attendance/mark' 
        },
        { 
          label: 'View Attendance', 
          path: '/dashboard/attendance' 
        }
      ]
    },
    { 
      key: 'users',
      icon: <Users className="w-5 h-5" />, 
      label: 'Users', 
      path: '/dashboard/users'
    },
    { 
      key: 'subjects',
      icon: <BookOpenText className="w-5 h-5" />, 
      label: 'Subject Management',
      children: [
        { 
          label: 'Add Subject', 
          path: '/dashboard/subjects/add' 
        },
        { 
          label: 'View Subjects', 
          path: '/dashboard/subjects' 
        }
      ]
    },
    { 
      key: 'notices',
      icon: <Bell className="w-5 h-5" />, 
      label: 'Notices',
      children: [
        { 
          label: 'View Notices', 
          path: '/dashboard/notices' 
        },
        { 
          label: 'Add Notice', 
          path: '/dashboard/notices/add' 
        }
      ]
    },
    { 
      key: 'exams',
      icon: <BookOpenCheck className="w-5 h-5" />, 
      label: 'Exam Management',
      children: [
        { 
          label: 'Schedule Exam', 
          path: '/dashboard/exams/schedule' 
        },
        { 
          label: 'View Exams', 
          path: '/dashboard/exams' 
        },
        { 
          label: 'Exam Results', 
          path: '/dashboard/exams/results' 
        }
      ]
    },
    { 
      key: 'settings',
      icon: <Settings className="w-5 h-5" />, 
      label: 'Settings', 
      path: '/dashboard/settings' 
    },
  ];

  return (
    <div 
      className={`h-full bg-white shadow-lg`}
      style={{
        height: '100vh',
        width: '100%',
        overflowY: 'auto'
      }}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">School Connect</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 overflow-y-auto">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.key || item.path}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => toggleItem(item.key!)}
                      className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
                        expandedItems[item.key!] ? 'text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-center">
                        <span className="mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </div>
                      <svg
                        className={`w-4 h-4 transition-transform ${
                          expandedItems[item.key!] ? 'transform rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {expandedItems[item.key!] && (
                      <ul className="ml-8 mt-1 space-y-1">
                        {item.children.map((child, index) => (
                          <li key={`${item.key}-${index}`}>
                            <NavLink
                              to={child.path}
                              className={({ isActive }) =>
                                `flex items-center px-4 py-2 text-sm rounded-lg mx-2 transition-colors ${
                                  isActive
                                    ? 'bg-blue-50 text-blue-600 font-medium'
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`
                              }
                              onClick={onClose}
                            >
                              <span className="truncate">{child.label}</span>
                            </NavLink>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <NavLink
                    to={item.path}
                    end={item.exact}
                    className={({ isActive }) =>
                      `flex items-center px-4 py-3 text-sm font-medium rounded-lg mx-2 transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`
                    }
                    onClick={onClose}
                  >
                    <span className="mr-3">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </NavLink>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-200 mt-auto">
          <button
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Drawer;
