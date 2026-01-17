import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Target, Eye, BookOpen } from "lucide-react";

const strategyColors = {
  cash_secured_put: "bg-gray-200 text-black border-black",
  covered_call: "bg-gray-200 text-black border-black"
};

const statusColors = {
  open: "bg-gray-200 text-black border-black",
  expired_worthless: "bg-gray-200 text-black border-black",
  assigned: "bg-gray-200 text-black border-black",
  bought_to_close: "bg-gray-200 text-black border-black",
  rolled: "bg-gray-200 text-black border-black"
};

export default function TradeJournalCard({ trade }) {
  return (
    <Card className="bg-white rounded-md shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-black">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold text-black mb-2">
              {trade.symbol} - ${trade.strike_price} {trade.contract_type.toUpperCase()}
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge className={`${strategyColors[trade.strategy_type]} border-2 font-medium`}>
                {trade.strategy_type.replace('_', ' ')}
              </Badge>
              <Badge className={`${statusColors[trade.status]} border-2 font-medium`}>
                {trade.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <span className="text-sm text-gray-500">
            {format(new Date(trade.created_date), "MMM d, yyyy")}
          </span>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {trade.pre_trade_thesis && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold text-black">Pre-Trade Thesis</h4>
            </div>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md border-2 border-gray-200 whitespace-pre-wrap">
              {trade.pre_trade_thesis}
            </p>
          </div>
        )}

        {trade.market_conditions_at_entry && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold text-black">Market Conditions at Entry</h4>
            </div>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md border-2 border-gray-200 whitespace-pre-wrap">
              {trade.market_conditions_at_entry}
            </p>
          </div>
        )}

        {trade.lessons_learned && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-gray-600" />
              <h4 className="font-semibold text-black">Lessons Learned</h4>
            </div>
            <p className="text-gray-700 bg-gray-50 p-3 rounded-md border-2 border-gray-200 whitespace-pre-wrap">
              {trade.lessons_learned}
            </p>
          </div>
        )}

        <div className="pt-4 border-t-2 border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Premium:</span>
              <p className="font-semibold text-black">${(trade.premium_received * trade.contracts_count * 100).toFixed(2)}</p>
            </div>
            <div>
              <span className="text-gray-500">Expiration:</span>
              <p className="font-semibold text-black">{format(new Date(trade.expiration_date), "MMM d")}</p>
            </div>
            <div>
              <span className="text-gray-500">Contracts:</span>
              <p className="font-semibold text-black">{trade.contracts_count}</p>
            </div>
            {trade.profit_loss !== null && (
              <div>
                <span className="text-gray-500">P&L:</span>
                <p className={`font-semibold ${trade.profit_loss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {trade.profit_loss >= 0 ? '+' : ''}${trade.profit_loss?.toFixed(2)}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}