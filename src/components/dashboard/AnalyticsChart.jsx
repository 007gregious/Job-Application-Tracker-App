import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const AnalyticsChart = ({ applications }) => {
  const [chartData, setChartData] = useState({
    monthlyData: [],
    statusData: [],
    responseData: []
  });

  useEffect(() => {
    if (applications && applications.length > 0) {
      generateCharts();
    }
  }, [applications]);

  const generateCharts = () => {
    // 1. Applications by month
    const monthlyData = generateMonthlyData();
    
    // 2. Status distribution
    const statusData = generateStatusData();
    
    // 3. Applications by day of week
    const weeklyData = generateWeeklyData();

    setChartData({
      monthlyData,
      statusData,
      weeklyData
    });
  };

  const generateMonthlyData = () => {
    const months = {};
    const last6Months = [];
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthKey = `${d.getFullYear()}-${d.getMonth() + 1}`;
      const monthName = d.toLocaleString('default', { month: 'short' });
      months[monthKey] = { month: monthName, count: 0, interviews: 0 };
      last6Months.push(monthKey);
    }
    
    // Count applications per month
    applications.forEach(app => {
      const date = new Date(app.applied_date);
      const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
      if (months[monthKey]) {
        months[monthKey].count++;
        if (app.status === 'Interview' || app.status === 'Offer') {
          months[monthKey].interviews++;
        }
      }
    });
    
    return last6Months.map(key => months[key]);
  };

  const generateStatusData = () => {
    const statusCounts = {};
    applications.forEach(app => {
      statusCounts[app.status] = (statusCounts[app.status] || 0) + 1;
    });
    
    return Object.entries(statusCounts).map(([name, value]) => ({
      name,
      value
    }));
  };

  const generateWeeklyData = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyData = days.map(day => ({ day, count: 0 }));
    
    applications.forEach(app => {
      const date = new Date(app.applied_date);
      const dayName = days[date.getDay()];
      const dayData = weeklyData.find(d => d.day === dayName);
      if (dayData) dayData.count++;
    });
    
    return weeklyData;
  };

  const getTotalStats = () => {
    const total = applications.length;
    const interviews = applications.filter(a => a.status === 'Interview' || a.status === 'Offer').length;
    const responseRate = total ? ((interviews / total) * 100).toFixed(1) : 0;
    const uniqueCompanies = new Set(applications.map(a => a.company)).size;
    
    return { total, interviews, responseRate, uniqueCompanies };
  };

  const stats = getTotalStats();

  if (applications.length === 0) {
    return (
      <div className="analytics-empty">
        <p>í³Š Add some applications to see analytics!</p>
      </div>
    );
  }

  return (
    <div className="analytics-charts">
      {/* KPI Cards */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <h3>Total Applications</h3>
          <p className="kpi-value">{stats.total}</p>
        </div>
        <div className="kpi-card">
          <h3>Interview Rate</h3>
          <p className="kpi-value">{stats.responseRate}%</p>
        </div>
        <div className="kpi-card">
          <h3>Companies Applied</h3>
          <p className="kpi-value">{stats.uniqueCompanies}</p>
        </div>
        <div className="kpi-card">
          <h3>Interviews</h3>
          <p className="kpi-value">{stats.interviews}</p>
        </div>
      </div>

      {/* Monthly Trends Chart */}
      {chartData.monthlyData.length > 0 && (
        <div className="chart-card">
          <h3>í³ˆ Monthly Application Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="count" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} name="Applications" />
              <Area type="monotone" dataKey="interviews" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Interviews" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Two column layout */}
      <div className="charts-row">
        {/* Status Distribution */}
        {chartData.statusData.length > 0 && (
          <div className="chart-card half">
            <h3>í¾¯ Application Status</h3>
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
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Best Days to Apply */}
        {chartData.weeklyData && (
          <div className="chart-card half">
            <h3>í³… Best Days to Apply</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsChart;
