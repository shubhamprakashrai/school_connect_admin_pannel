import { LineChart, BarChart, PieChart, Pie, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';

const attendanceData = [
  { name: 'Mon', attendance: 75 },
  { name: 'Tue', attendance: 82 },
  { name: 'Wed', attendance: 78 },
  { name: 'Thu', attendance: 85 },
  { name: 'Fri', attendance: 90 },
];

const performanceData = [
  { grade: 'A', students: 45 },
  { grade: 'B', students: 30 },
  { grade: 'C', students: 15 },
  { grade: 'D', students: 7 },
  { grade: 'F', students: 3 },
];

const feeData = [
  { name: 'Paid', value: 75 },
  { name: 'Pending', value: 25 },
];

const COLORS = ['#0088FE', '#FF8042'];

export const AttendanceChart = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-medium mb-4">Weekly Attendance</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={attendanceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="attendance" 
            stroke="#3b82f6" 
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Attendance %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const PerformanceChart = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-medium mb-4">Student Performance</h3>
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={performanceData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="grade" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar 
            dataKey="students" 
            fill="#10b981"
            name="Number of Students"
            radius={[4, 4, 0, 0]}
          >
            {performanceData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={`#10b981${99 - index * 15}`} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export const FeeCollectionChart = () => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-medium mb-4">Fee Collection Overview</h3>
    <div className="h-64 flex flex-col items-center">
      <div className="w-full h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={feeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
              label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {feeData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 text-center">
        <p className="text-sm text-gray-500">
          Total Collected: <span className="font-medium">$24,500</span>
        </p>
      </div>
    </div>
  </div>
);
