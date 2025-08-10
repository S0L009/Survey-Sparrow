"use client";

import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function DashboardPage() {
  // Dummy data for charts
  const barData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Creativity Score",
        data: [75, 82, 90, 87],
        backgroundColor: "rgba(54, 162, 235, 0.5)",
      },
    ],
  };

  const lineData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Sessions per Day",
        data: [2, 4, 3, 5, 6, 2, 4],
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold mb-6 text-black">
        Welcome to your Dashboard
      </h1>
      <p className="text-gray-500 mb-6">
        Here&apos;s your AI public speaking progress analytics.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-black">Total Sessions</h3>
          <p className="text-2xl font-bold mt-2 text-black">42</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-black">Avg. Creativity Score</h3>
          <p className="text-2xl font-bold mt-2 text-black">87%</p>
        </div>
        <div className="bg-gray-50 p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-black">Improvement Rate</h3>
          <p className="text-2xl font-bold mt-2 text-black">+15%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-black">Creativity Score Over Time</h2>
          <Bar data={barData} />
        </div>
        <div className="bg-white border p-4 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4 text-black">Weekly Sessions</h2>
          <Line data={lineData} />
        </div>
      </div>
    </div>
  );
}
