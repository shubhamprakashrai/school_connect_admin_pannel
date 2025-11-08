import { Bell, BookOpen, Users, CheckCircle, Clock } from 'lucide-react';

const activities = [
  {
    id: 1,
    time: '10:30 AM',
    event: 'New student added: John Doe',
    icon: <Users className="h-4 w-4" />,
    status: 'completed',
  },
  {
    id: 2,
    time: 'Yesterday',
    event: 'Notice published: Summer Break',
    icon: <Bell className="h-4 w-4" />,
    status: 'completed',
  },
  {
    id: 3,
    time: '2 days ago',
    event: 'Exam scheduled: Final Term',
    icon: <BookOpen className="h-4 w-4" />,
    status: 'pending',
  },
  {
    id: 4,
    time: '3 days ago',
    event: 'New teacher joined: Sarah Smith',
    icon: <Users className="h-4 w-4" />,
    status: 'completed',
  },
];

export const RecentActivity = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
      <div className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3 group">
            <div className={`p-2 rounded-full ${
              activity.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {activity.status === 'completed' ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Clock className="h-4 w-4" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{activity.event}</p>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
              <div className="flex items-center mt-1 text-xs text-gray-500">
                <span className="flex items-center">
                  <span className="mr-1">{activity.icon}</span>
                  {activity.status === 'completed' ? 'Completed' : 'Pending'}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
          View All Activity
        </button>
      </div>
    </div>
  );
};
