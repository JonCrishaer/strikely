
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, startOfMonth } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function MonthlyChart({ positions, isLoading }) {
  const generateChartData = () => {
    if (!positions.length) return [];

    const monthlyData = {};
    
    positions.forEach(position => {
      if (position.profit_loss !== undefined) {
        const monthKey = format(startOfMonth(new Date(position.created_date)), "MMM yyyy");
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { 
            month: monthKey, 
            profit: 0, 
            loss: 0,
            net: 0,
            trades: 0
          };
        }
        
        if (position.profit_loss > 0) {
          monthlyData[monthKey].profit += position.profit_loss;
        } else {
          monthlyData[monthKey].loss += Math.abs(position.profit_loss);
        }
        
        monthlyData[monthKey].net += position.profit_loss;
        monthlyData[monthKey].trades += 1;
      }
    });

    return Object.values(monthlyData)
      .sort((a, b) => new Date(a.month) - new Date(b.month))
      .slice(-12); // Last 12 months
  };

  const chartData = generateChartData();

  return (
    <Card className="bg-white rounded-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-black">Monthly P&L Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-64 w-full bg-gray-200" />
          </div>
        ) : chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis 
                dataKey="month" 
                tick={{ fontSize: 16, fontFamily: 'VT323, monospace' }}
                stroke="#111111"
              />
              <YAxis 
                tick={{ fontSize: 16, fontFamily: 'VT323, monospace' }}
                stroke="#111111"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip 
                formatter={(value, name) => [
                  `$${value.toFixed(2)}`, 
                  name === 'profit' ? 'Profit' : 'Loss'
                ]}
                labelStyle={{ color: '#111111', fontFamily: 'VT323, monospace' }}
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '2px solid #111111',
                  borderRadius: '0.25rem',
                  fontFamily: 'VT323, monospace'
                }}
              />
              <Bar 
                dataKey="profit" 
                fill="#4ade80" 
                radius={[4, 4, 0, 0]}
                name="profit"
              />
              <Bar 
                dataKey="loss" 
                fill="#f87171" 
                radius={[4, 4, 0, 0]}
                name="loss"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>No closed positions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
