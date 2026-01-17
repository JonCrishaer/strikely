import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target, Activity, Percent } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PortfolioStats({ openPositions, totalPremium, openPremium, totalPL, avgReturn, isLoading }) {
  const stats = [
    {
      title: "Open Positions",
      value: openPositions,
      icon: Activity,
      colorClass: "text-black",
    },
    {
      title: "Open Premium",
      value: `$${openPremium.toFixed(2)}`,
      icon: Target,
      colorClass: "text-black",
    },
    {
      title: "Total Premium Collected",
      value: `$${totalPremium.toFixed(2)}`,
      icon: DollarSign,
      colorClass: "text-black",
    },
    {
      title: "Total P&L",
      value: `${totalPL >= 0 ? '+' : ''}$${totalPL.toFixed(2)}`,
      icon: totalPL >= 0 ? TrendingUp : TrendingDown,
      colorClass: totalPL >= 0 ? "text-green-600" : "text-red-600",
    },
    {
      title: "Avg Annual Return",
      value: `${avgReturn.toFixed(1)}%`,
      icon: Percent,
      colorClass: "text-black",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
      {stats.map((stat) => (
        <Card key={stat.title} className="bg-white border-2 border-black rounded-md shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              {stat.title}
            </CardTitle>
            <div className="p-2 rounded-md bg-gray-100 border-2 border-black">
              <stat.icon className={`w-5 h-5 ${stat.colorClass}`} />
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24 bg-gray-200" />
            ) : (
              <div className="text-3xl font-bold text-black mb-2">
                {stat.value}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}