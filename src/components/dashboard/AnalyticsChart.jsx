import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsChart = ({ applications }) => {
  const getAppliedDate = (application) => application.appliedDate || application.applied_date || application.dateApplied;

  const chartData = useMemo(() => {
    if (!applications?.length) {
      return {
        monthlyData: [],
        statusData: [],
        conversionData: []
      };
    }

    const months = {};
    const last6Months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);

      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const monthName = d.toLocaleString('default', { month: 'short' });

      months[monthKey] = {
        month: monthName,
        applications: 0,
        interviews: 0,
        rejected: 0
      };
      last6Months.push(monthKey);
    }

    const statusCounts = {
      Applied: 0,
      Interview: 0,
      Offer: 0,
      Accepted: 0,
      Rejected: 0,
      Withdrawn: 0
    };

    applications.forEach(app => {
      const appliedDate = getAppliedDate(app);
      const date = new Date(appliedDate);

      if (Number.isNaN(date.getTime())) {
        return;
      }

      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;

      if (months[monthKey]) {
        months[monthKey].applications += 1;
        if (app.status === 'Interview' || app.status === 'Offer' || app.status === 'Accepted') {
          months[monthKey].interviews += 1;
        }
        if (app.status === 'Rejected') {
          months[monthKey].rejected += 1;
        }
      }

      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });

    const monthlyData = last6Months.map(key => months[key]);

    const statusData = Object.entries(statusCounts)
      .filter(([, value]) => value > 0)
      .map(([name, value]) => ({ name, value }));

    const total = applications.length;
    const interviewPipeline = statusCounts.Interview + statusCounts.Offer + statusCounts.Accepted;
    const conversionData = [
      { metric: 'Pending', value: Number(((statusCounts.Applied / total) * 100).toFixed(1)) },
      { metric: 'Interview', value: Number(((interviewPipeline / total) * 100).toFixed(1)) },
      { metric: 'Offer/Accepted', value: Number((((statusCounts.Offer + statusCounts.Accepted) / total) * 100).toFixed(1)) },
      { metric: 'Rejected', value: Number(((statusCounts.Rejected / total) * 100).toFixed(1)) }
    ];

    return {
      monthlyData,
      statusData,
      conversionData
    };
  }, [applications]);

  if (!applications.length) {
    return (
      <div className="analytics-empty">
        <p>Add some applications to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="analytics-charts">
      <div className="chart-card">
        <h3>Monthly Application Trends</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="applications" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} name="Applications" />
            <Area type="monotone" dataKey="interviews" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Interview Stage" />
            <Area type="monotone" dataKey="rejected" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Rejected" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="charts-row">
        {chartData.statusData.length > 0 && (
          <div className="chart-card half">
            <h3>Application Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  dataKey="value"
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="chart-card half">
          <h3>Pipeline Conversion Rates</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData.conversionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="metric" />
              <YAxis unit="%" domain={[0, 100]} />
              <Tooltip formatter={value => `${value}%`} />
              <Bar dataKey="value" fill="#8b5cf6" name="Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
