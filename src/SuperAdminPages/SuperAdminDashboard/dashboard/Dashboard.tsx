import { Users, GraduationCap, BookOpen, Bell } from 'lucide-react';
import { StatsCard } from './components/StatsCard';
import { AttendanceChart, PerformanceChart, FeeCollectionChart } from './components/Charts';
import { RecentActivity } from './components/RecentActivity';


export const Dashboard = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome, Admin</h1>
          <p className="text-muted-foreground">
            Here's what's happening with your school today.
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Total Students" 
          value="1,245" 
          icon={<Users className="h-5 w-5" />}
          trend={12.5}
          trendLabel="from last month"
        />
        <StatsCard 
          title="Total Teachers" 
          value="68" 
          icon={<GraduationCap className="h-5 w-5" />}
          trend={5.2}
          trendLabel="from last month"
        />
        <StatsCard 
          title="Total Classes" 
          value="24" 
          icon={<BookOpen className="h-5 w-5" />}
          trend={0}
          trendLabel="no change"
        />
        <StatsCard 
          title="Active Notices" 
          value="5" 
          icon={<Bell className="h-5 w-5" />}
          trend={-2.1}
          trendLabel="from last month"
        />
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <AttendanceChart />
          <PerformanceChart />
        </div>
        <div className="space-y-6">
          <FeeCollectionChart />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
