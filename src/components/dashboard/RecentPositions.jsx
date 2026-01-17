
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, differenceInDays } from "date-fns";
import { ArrowRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const strategyColors = {
  cash_secured_put: "bg-blue-100 text-blue-800 border-blue-200",
  covered_call: "bg-green-100 text-green-800 border-green-200"
};

const statusColors = {
  open: "bg-yellow-100 text-yellow-800 border-yellow-200",
  expired_worthless: "bg-green-100 text-green-800 border-green-200",
  assigned: "bg-orange-100 text-orange-800 border-orange-200",
  bought_to_close: "bg-blue-100 text-blue-800 border-blue-200",
  rolled: "bg-purple-100 text-purple-800 border-purple-200"
};

export default function RecentPositions({ positions, isLoading }) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-2xl font-bold text-slate-900">Recent Positions</CardTitle>
        <Link to={createPageUrl("Positions")}>
          <Button variant="ghost" className="text-slate-600 hover:text-slate-900 rounded-xl">
            View All
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          Array(4).fill(0).map((_, i) => (
            <div key={i} className="p-4 border border-slate-200 rounded-xl space-y-2">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))
        ) : positions.length > 0 ? (
          positions.map((position) => {
            const daysToExpiry = differenceInDays(new Date(position.expiration_date), new Date());
            // Fixed: Premium calculation - per contract * contracts * 100 shares
            const totalPremium = position.premium_received * position.contracts_count * 100;
            
            return (
              <div key={position.id} className="p-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors duration-200">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">{position.symbol}</h3>
                    <p className="text-slate-600">
                      ${position.strike_price.toFixed(2)} {position.contract_type} • {position.contracts_count} contract{position.contracts_count > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">+${totalPremium.toFixed(2)}</p>
                    {position.status === "open" && (
                      <p className="text-sm text-slate-500">
                        {daysToExpiry > 0 ? `${daysToExpiry} days left` : 'Expired'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge className={`${strategyColors[position.strategy_type]} border font-medium`}>
                      {position.strategy_type.replace('_', ' ')}
                    </Badge>
                    <Badge className={`${statusColors[position.status]} border font-medium`}>
                      {position.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="text-sm text-slate-500">
                    Exp: {format(new Date(position.expiration_date), "MMM d, yyyy")}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-8 text-slate-500">
            <p>No positions yet. Create your first position to get started!</p>
            <Link to={createPageUrl("AddPosition")}>
              <Button className="mt-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl">
                Add Position
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
