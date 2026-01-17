import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export default function StrategyBreakdown({ positions, isLoading }) {
  const generateStrategyData = () => {
    const strategyCounts = {
      cash_secured_put: { count: 0, premium: 0, name: "Cash Secured Puts" },
      covered_call: { count: 0, premium: 0, name: "Covered Calls" }
    };

    positions.forEach(position => {
      if (strategyCounts[position.strategy_type]) {
        strategyCounts[position.strategy_type].count += 1;
        strategyCounts[position.strategy_type].premium += 
          position.premium_received * position.contracts_count * 100;
      }
    });

    return Object.entries(strategyCounts)
      .filter(([_, data]) => data.count > 0)
      .map(([strategy, data], index) => ({
        name: data.name,
        value: data.count,
        premium: data.premium,
        color: index === 0 ? "#a3a3a3" : "#404040" // shades of gray
      }));
  };

  const data = generateStrategyData();
  const totalPositions = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card className="bg-white rounded-md shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-black">Strategy Breakdown</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-48 w-48 rounded-full mx-auto bg-gray-200" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full bg-gray-200" />
              <Skeleton className="h-4 w-3/4 bg-gray-200" />
            </div>
          </div>
        ) : data.length > 0 ? (
          <div className="space-y-6">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="#111"
                  strokeWidth={2}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name, props) => [
                    `${value} positions (${((value / totalPositions) * 100).toFixed(1)}%)`,
                    props.payload.name
                  ]}
                  contentStyle={{ 
                    backgroundColor: 'white', 
                    border: '2px solid #111111',
                    borderRadius: '0.25rem',
                    fontFamily: 'VT323, monospace'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-100 rounded-md border-2 border-black">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full border-2 border-black"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-black">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-black">{item.value} positions</p>
                    <p className="text-sm text-gray-600">
                      ${item.premium.toLocaleString()} premium
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>No positions yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}