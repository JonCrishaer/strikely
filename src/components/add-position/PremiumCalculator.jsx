
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calculator, TrendingUp, DollarSign, Calendar } from "lucide-react";
import { differenceInDays } from "date-fns";

export default function PremiumCalculator({ formData, annualizedReturn }) {
  const calculateMetrics = () => {
    const premium = parseFloat(formData.premium_received) || 0;
    const contracts = parseInt(formData.contracts_count) || 0;
    const strike = parseFloat(formData.strike_price) || 0;
    const underlyingPrice = parseFloat(formData.underlying_price_at_entry) || 0;
    
    // Premium is per contract, multiply by contracts and 100 shares per contract
    const totalPremium = premium * contracts * 100;
    const cashSecured = strike * contracts * 100;
    const maxRisk = formData.strategy_type === "cash_secured_put" 
      ? Math.max(0, (strike - premium) * contracts * 100)
      : 0;
    
    let daysToExpiration = 0;
    if (formData.expiration_date) {
      daysToExpiration = Math.max(1, differenceInDays(new Date(formData.expiration_date), new Date()));
    }

    return {
      totalPremium,
      cashSecured,
      maxRisk,
      daysToExpiration,
      breakeven: formData.strategy_type === "cash_secured_put" 
        ? strike - premium 
        : strike + premium
    };
  };

  const metrics = calculateMetrics();

  return (
    <div className="space-y-6">
      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg font-bold text-slate-900">
            <Calculator className="w-5 h-5" />
            Position Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-700">Total Premium</span>
              </div>
              <p className="text-xl font-bold text-green-800">
                ${metrics.totalPremium.toFixed(2)}
              </p>
            </div>

            <div className="p-3 bg-purple-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-700">Annualized</span>
              </div>
              <p className="text-xl font-bold text-purple-800">
                {annualizedReturn.toFixed(1)}%
              </p>
            </div>

            <div className="p-3 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Days to Exp</span>
              </div>
              <p className="text-xl font-bold text-blue-800">
                {metrics.daysToExpiration}
              </p>
            </div>

            <div className="p-3 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-4 h-4 text-orange-600">⚖️</span>
                <span className="text-sm font-medium text-orange-700">Breakeven</span>
              </div>
              <p className="text-xl font-bold text-orange-800">
                ${metrics.breakeven.toFixed(2)}
              </p>
            </div>
          </div>

          {formData.strategy_type === "cash_secured_put" && (
            <div className="pt-4 border-t border-slate-200">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Cash Required:</span>
                  <span className="font-semibold">${metrics.cashSecured.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Max Risk:</span>
                  <span className="font-semibold text-red-600">${metrics.maxRisk.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-slate-50/80 backdrop-blur-sm border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-slate-900">Strategy Notes</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.strategy_type === "cash_secured_put" ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p>• You're selling put options and securing cash to buy shares if assigned</p>
              <p>• Maximum profit: Premium received if options expire worthless</p>
              <p>• Assignment risk if stock price falls below strike price</p>
            </div>
          ) : formData.strategy_type === "covered_call" ? (
            <div className="space-y-2 text-sm text-slate-700">
              <p>• You own the underlying stock and are selling call options</p>
              <p>• Maximum profit: Premium + (Strike - Current Price) if called away</p>
              <p>• Shares may be called away if stock price rises above strike</p>
            </div>
          ) : (
            <p className="text-slate-500 italic">Select a strategy to see notes</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
