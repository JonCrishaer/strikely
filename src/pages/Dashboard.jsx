
import React, { useState, useEffect } from "react";
import { OptionsPosition } from "@/entities/OptionsPosition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { 
  TrendingUp, 
  Target,
  PlusCircle,
  Activity
} from "lucide-react";

import PortfolioStats from "../components/dashboard/PortfolioStats";
import RecentPositions from "../components/dashboard/RecentPositions";
import PerformanceChart from "../components/dashboard/PerformanceChart";

export default function Dashboard() {
  const [positions, setPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const openPositions = positions.filter(pos => pos.status === "open");
  const closedPositions = positions.filter(pos => pos.status !== "open");
  
  // Fixed: Premium is per contract, multiply by contracts and 100 shares per contract
  // Total premium collected from all positions (historical)
  const totalPremium = positions.reduce((sum, pos) => 
    sum + (pos.premium_received * pos.contracts_count * 100), 0);
  
  // Premium from currently open positions only
  const openPremium = openPositions.reduce((sum, pos) => 
    sum + (pos.premium_received * pos.contracts_count * 100), 0);
    
  const totalPL = closedPositions.reduce((sum, pos) => sum + (pos.profit_loss || 0), 0);
  
  const avgAnnualizedReturn = closedPositions.length > 0 
    ? closedPositions.reduce((sum, pos) => sum + (pos.annualized_return || 0), 0) / closedPositions.length
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Portfolio Overview</h1>
          <p className="text-slate-600 text-lg">Track your options trading performance</p>
        </div>
        <Link to={createPageUrl("AddPosition")}>
          <Button className="bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
            <PlusCircle className="w-5 h-5 mr-2" />
            New Position
          </Button>
        </Link>
      </div>

      <PortfolioStats 
        openPositions={openPositions.length}
        totalPremium={totalPremium}
        openPremium={openPremium}
        totalPL={totalPL}
        avgReturn={avgAnnualizedReturn}
        isLoading={isLoading}
      />

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <RecentPositions 
            positions={positions.slice(0, 8)}
            isLoading={isLoading}
          />
        </div>
        
        <div className="space-y-6">
          <PerformanceChart 
            positions={closedPositions}
            isLoading={isLoading}
          />
          
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-slate-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to={createPageUrl("AddPosition")} className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-slate-50">
                  <Target className="w-4 h-4 mr-3" />
                  Add New Position
                </Button>
              </Link>
              <Link to={createPageUrl("Positions")} className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-slate-50">
                  <Activity className="w-4 h-4 mr-3" />
                  View All Positions
                </Button>
              </Link>
              <Link to={createPageUrl("Performance")} className="block">
                <Button variant="outline" className="w-full justify-start rounded-xl hover:bg-slate-50">
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Performance Report
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
