import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Target, Percent, DollarSign } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PerformanceMetrics({ positions, closedPositions, isLoading }) {
  const calculateMetrics = () => {
    const totalPremium = positions.reduce((sum, pos) => 
      sum + (pos.premium_received * pos.contracts_count * 100), 0);
    
    const totalPL = closedPositions.reduce((sum, pos) => 
      sum + (pos.profit_loss || 0), 0);
    
    const winningTrades = closedPositions.filter(pos => (pos.profit_loss || 0) > 0).length;
    const winRate = closedPositions.length > 0 ? (winningTrades / closedPositions.length) * 100 : 0;
    
    const avgReturn = closedPositions.length > 0
      ? closedPositions.reduce((sum, pos) => sum + (pos.annualized_return || 0), 0) / closedPositions.length
      : 0;

    const putPositions = positions.filter(pos => pos.strategy_type === "cash_secured_put").length;
    const callPositions = positions.filter(pos => pos.strategy_type === "covered_call").length;

    return {
      totalPremium,
      totalPL,
      winRate,
      avgReturn,
      totalPositions: positions.length,
      openPositions: positions.filter(pos => pos.status === "open").length,
      putPositions,
      callPositions
    };
  };

  const metrics = calculateMetrics();

  const statCards = [
    {
      title: "Total Premium Collected",
      value: `$${metrics.totalPremium.toLocaleString()}`,
      icon: DollarSign,
      color: "green"
    },
    {
      title: "Total P&L",
      value: `${metrics.totalPL >= 0 ? '+' : ''}$${metrics.totalPL.toLocaleString()}`,
      icon: metrics.totalPL >= 0 ? TrendingUp : TrendingDown,
      color: metrics.totalPL >= 0 ? "green" : "red"
    },
    {
      title: "Win Rate",
      value: `${metrics.winRate.toFixed(1)}%`,
      icon: Target,
      color: "blue"
    },
    {
      title: "Avg Annual Return",
      value: `${metrics.avgReturn.toFixed(1)}%`,
      icon: Percent,
      color: "purple"
    }
  ];

  const colorClasses = {
    green: {
      bg: "bg-green-500",
      text: "text-green-600",
      bgLight: "bg-green-50"
    },
    red: {
      bg: "bg-red-500", 
      text: "text-red-600",
      bgLight: "bg-red-50"
    },
    blue: {
      bg: "bg-blue-500",
      text: "text-blue-600", 
      bgLight: "bg-blue-50"
    },
    purple: {
      bg: "bg-purple-500",
      text: "text-purple-600",
      bgLight: "bg-purple-50"
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {statCards.map((stat) => {
        const colors = colorClasses[stat.color];
        return (
          <Card key={stat.title} className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${colors.bg} bg-opacity-10`}>
                <stat.icon className={`w-5 h-5 ${colors.text}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}