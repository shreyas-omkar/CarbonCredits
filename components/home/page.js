"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function CronjobDashboard({ userID }) {
  const [emissions, setEmissions] = useState([]);
  const [credits, setCredits] = useState(null);
  const [lastPing, setLastPing] = useState(null);
  const [sensorStatus, setSensorStatus] = useState(false);
  const [sensorFailures, setSensorFailures] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Computed usage metrics
  const [currentUsage, setCurrentUsage] = useState(0);
  const [dailyAverage, setDailyAverage] = useState(0);
  const [peakUsage, setPeakUsage] = useState(0);
  const [totalConsumption, setTotalConsumption] = useState(0);

  const fetchCreditsData = async () => {
    if (!userID) return;
    try {
      const res = await axios.get(`/api/dashboard/credits/${userID}`);
      const data = res.data;

      const userData = data.userData;

      // Set carbon credits (Decimal128 stored as string in MongoDB)
      setCredits(parseFloat(userData?.carbonCredits?.toString()) || 0);

      // Emissions array from userData
      const ems = userData?.emissions || [];
      setEmissions(ems);

      // lastPing from userData (handle if missing)
      setLastPing(userData?.lastPing || null);

      // === Calculate usage metrics from emissions ===
      if (ems.length > 0) {
        // currentUsage = creditsUsed of most recent emission
        const sortedEmissions = [...ems].sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        setCurrentUsage(parseFloat(sortedEmissions[0].creditsUsed) || 0);

        // totalConsumption = sum of creditsUsed
        const total = ems.reduce(
          (acc, emission) => acc + (parseFloat(emission.creditsUsed) || 0),
          0
        );
        setTotalConsumption(total);

        // peakUsage = max creditsUsed
        const peak = Math.max(
          ...ems.map((e) => parseFloat(e.creditsUsed) || 0)
        );
        setPeakUsage(peak);

        // dailyAverage over last 7 days
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        // Filter emissions in last 7 days
        const last7DaysEmissions = ems.filter(
          (e) => new Date(e.timestamp) >= oneWeekAgo
        );
        // Sum creditsUsed in last 7 days
        const sum7Days = last7DaysEmissions.reduce(
          (acc, e) => acc + (parseFloat(e.creditsUsed) || 0),
          0
        );
        // Average per day
        const avgPerDay = sum7Days / 7;
        setDailyAverage(avgPerDay);
      } else {
        setCurrentUsage(0);
        setTotalConsumption(0);
        setPeakUsage(0);
        setDailyAverage(0);
      }

      // Sensor status logic remains the same
      const pingAge = Date.now() - new Date(userData?.lastPing).getTime();
      if (pingAge < 90000) {
        setSensorFailures(0);
        setSensorStatus(true);
      } else {
        setSensorFailures((prev) => {
          const newFail = prev + 1;
          if (newFail >= 3) setSensorStatus(false);
          return newFail;
        });
      }

      setError(null);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to fetch dashboard data.");
      setSensorFailures((prev) => {
        const newFail = prev + 1;
        if (newFail >= 3) setSensorStatus(false);
        return newFail;
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userID) return;
    fetchCreditsData();
    const interval = setInterval(fetchCreditsData, 30000);
    return () => clearInterval(interval);
  }, [userID]);

  const formattedData = emissions.map((entry) => ({
    name: new Date(entry.timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
    creditsUsed: parseFloat(entry.creditsUsed),
  }));

  return (
    <main className="min-h-screen px-4 py-10 bg-white text-green-900 flex flex-col items-center justify-center overflow-auto">
      <div className="w-full max-w-6xl space-y-8">
        <Card className="shadow-xl backdrop-blur-md border-0 bg-white/30 rounded-xl text-green-900">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center text-green-800">
              Real-Time Carbon Credits Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <MetricCard
              title="Remaining Credits"
              value={`${credits?.toFixed(3)} Z`}
            />
            <MetricCard
              title="Current Usage"
              value={`${currentUsage.toExponential(3)} Z/s`}
            />
            <MetricCard
              title="Daily Average"
              value={`${dailyAverage.toExponential(3)} Z`}
            />
            <MetricCard
              title="Peak Usage"
              value={`${peakUsage.toExponential(3)} Z`}
            />
            <MetricCard
              title="Total Consumed"
              value={`${totalConsumption.toExponential(3)} Z`}
            />
            <MetricCard
              title="Sensor Status"
              value={
                sensorStatus ? (
                  <span className="flex items-center gap-1 text-green-700">
                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-red-700">
                    <span className="w-3 h-3 bg-red-500 rounded-full" />
                    Inactive
                  </span>
                )
              }
            />
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-md rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-green-900 text-center">
              Live Usage Graph
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {formattedData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={formattedData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(v) => v.toExponential(2)} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="creditsUsed"
                    stroke="#047857"
                    strokeWidth={3}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-green-700">No data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function MetricCard({ title, value }) {
  return (
    <div className="flex flex-col items-center justify-center border p-4 rounded-xl bg-white/80 shadow">
      <p className="text-md text-gray-600">{title}</p>
      <h2 className="text-2xl font-semibold text-green-800">{value}</h2>
    </div>
  );
}
