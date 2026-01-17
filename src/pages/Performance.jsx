import React, { useState, useEffect } from "react";
import { OptionsPosition } from "@/entities/OptionsPosition";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { subMonths } from "date-fns";

import PerformanceMetrics from "../components/performance/PerformanceMetrics";
import MonthlyChart from "../components/performance/MonthlyChart";
import StrategyBreakdown from "../components/performance/StrategyBreakdown";

export default function Performance() {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all");

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    setIsLoading(true);
    try {
      const data = await OptionsPosition.list("-created_date");
      setPositions(data);
    } catch (error) {
      console.error("Error loading positions:", error);
    }
    setIsLoading(false);
  };

  const getFilteredPositions = () => {
    if (timeframe === "all") return positions;
    
    const months = parseInt(timeframe);
    const cutoffDate = subMonths(new Date(), months);
    
    return positions.filter(pos => new Date(pos.created_date) >= cutoffDate);
  };

  const filteredPositions = getFilteredPositions();
  const closedPositions = filteredPositions.filter(pos => pos.status !== "open");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Performance Analysis</h1>
          <p className="text-slate-600 text-lg">Track your trading results and metrics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-500" />
          <Select value={timeframe} onValueChange={setTimeframe}>
            <SelectTrigger className="w-48 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="12">Last 12 Months</SelectItem>
              <SelectItem value="6">Last 6 Months</SelectItem>
              <SelectItem value="3">Last 3 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <PerformanceMetrics 
        positions={filteredPositions}
        closedPositions={closedPositions}
        isLoading={isLoading}
      />

      <div className="grid lg:grid-cols-2 gap-8">
        <MonthlyChart 
          positions={closedPositions}
          isLoading={isLoading}
        />
        
        <StrategyBreakdown 
          positions={filteredPositions}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}