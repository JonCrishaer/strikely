import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function PerformanceChart({ positions, isLoading }) {
  const generateChartData = () => {
    if (!positions.length) return [];

    const monthlyData = {};
    
    positions.forEach(position => {
      if (position.profit_loss) {
        const monthKey = format(startOfMonth(new Date(position.created_date)), "MMM yyyy");
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { month: monthKey, profit: 0 };
        }
        
        monthlyData[monthKey].profit += position.profit_loss;
      }
    });

    return Object.values(monthlyData).sort((a, b) => 
      new Date(a.month) - new Date(b.month)
    );
  };

  const chartData = generateChartData();

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-900">Monthly Performance</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#64748b"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value) => [`$${value.toFixed(2)}`, 'Profit/Loss']}
                labelStyle={{ color: '#1e293b' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="profit" 
                stroke="#059669" 
                strokeWidth={3}
                dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: '#065f46' }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No performance data yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}