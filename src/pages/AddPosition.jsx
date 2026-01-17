
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { OptionsPosition } from "@/entities/OptionsPosition";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import PremiumCalculator from "../components/add-position/PremiumCalculator";
import { toast } from "sonner";

const LimitUpgradePrompt = ({ limits }) => (
  <Card className="bg-orange-50 border-orange-200">
    <CardHeader>
      <CardTitle className="flex items-center gap-3 text-orange-800">
        <AlertTriangle />
        Free Plan Limit Reached
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-orange-700">
      <p>You've reached the limits of the free plan:</p>
      <ul className="list-disc pl-5 space-y-1">
        {limits.openPositions >= 3 && <li>You have {limits.openPositions} open positions (max 3).</li>}
        {limits.monthlyCreations >= 10 && <li>You've created {limits.monthlyCreations} trades this month (max 10).</li>}
      </ul>
      <p>To continue adding trades, please upgrade to the Pro plan for unlimited access.</p>
      <Button asChild className="bg-slate-900 hover:bg-slate-800">
        <Link to={createPageUrl("Pricing")}>Upgrade to Pro</Link>
      </Button>
    </CardContent>
  </Card>
);

export default function AddPosition() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [limits, setLimits] = useState({ openPositions: 0, monthlyCreations: 0, isLoaded: false });
  const [isBlocked, setIsBlocked] = useState(false);

  const [formData, setFormData] = useState({
    symbol: "",
    strategy_type: "",
    strike_price: "",
    expiration_date: "",
    premium_received: "",
    contracts_count: 1,
    underlying_price_at_entry: "",
    cash_secured_amount: "",
    notes: "",
    pre_trade_thesis: "", // New field
    market_conditions_at_entry: "" // New field
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkLimits = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);

        if (currentUser.subscription_status === 'free') {
          const open = await OptionsPosition.filter({ status: 'open' });
          const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
          const monthly = await OptionsPosition.filter({ created_date: { '$gte': startOfMonth.toISOString() } });

          const newLimits = { openPositions: open.length, monthlyCreations: monthly.length, isLoaded: true };
          setLimits(newLimits);

          if (newLimits.openPositions >= 3 || newLimits.monthlyCreations >= 10) {
            setIsBlocked(true);
          } else {
            setIsBlocked(false); // Ensure it's not blocked if limits aren't exceeded
          }
        } else {
          setLimits({ isLoaded: true, openPositions: 0, monthlyCreations: 0 }); // Pro users are not blocked, reset counts
          setIsBlocked(false);
        }
      } catch (error) {
        console.error("Error checking user limits:", error);
        // Optionally handle error state for limits (e.g., show a message)
      }
    };
    checkLimits();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
      // Auto-calculate contract type based on strategy
      contract_type: field === "strategy_type" 
        ? (value === "cash_secured_put" ? "put" : "call")
        : prev.contract_type
    }));

    // Auto-calculate cash secured amount for puts
    if (field === "strike_price" || field === "contracts_count") {
      if (formData.strategy_type === "cash_secured_put") {
        const strike = field === "strike_price" ? parseFloat(value) || 0 : parseFloat(formData.strike_price) || 0;
        const contracts = field === "contracts_count" ? parseInt(value) || 0 : parseInt(formData.contracts_count) || 0;
        setFormData(prev => ({
          ...prev,
          cash_secured_amount: (strike * 100 * contracts).toString()
        }));
      }
    }
  };

  const calculateAnnualizedReturn = () => {
    const premium = parseFloat(formData.premium_received) || 0;
    const contracts = parseInt(formData.contracts_count) || 0;
    const cashSecured = parseFloat(formData.cash_secured_amount) || 0;
    
    if (!premium || !contracts || !formData.expiration_date) return 0;

    const totalPremium = premium * contracts * 100; // Premium per share * shares
    const daysToExpiration = Math.max(1, (new Date(formData.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    const capital = formData.strategy_type === "cash_secured_put" 
      ? cashSecured 
      : parseFloat(formData.underlying_price_at_entry) * 100 * contracts;
    
    if (!capital) return 0;
    
    const returnPercent = (totalPremium / capital) * 100;
    const annualizedReturn = (returnPercent * 365) / daysToExpiration;
    
    return Math.round(annualizedReturn * 100) / 100;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isBlocked) {
        toast.error("Upgrade to Pro to add more positions.");
        return;
    }
    setIsSubmitting(true);

    try {
      const positionData = {
        ...formData,
        contract_type: formData.strategy_type === "cash_secured_put" ? "put" : "call",
        strike_price: parseFloat(formData.strike_price),
        premium_received: parseFloat(formData.premium_received),
        contracts_count: parseInt(formData.contracts_count),
        underlying_price_at_entry: parseFloat(formData.underlying_price_at_entry),
        cash_secured_amount: parseFloat(formData.cash_secured_amount),
        annualized_return: calculateAnnualizedReturn(),
        status: "open",
        pre_trade_thesis: formData.pre_trade_thesis, // Add new field
        market_conditions_at_entry: formData.market_conditions_at_entry // Add new field
      };

      await OptionsPosition.create(positionData);
      toast.success("Position created successfully!");
      navigate(createPageUrl("Positions"));
    } catch (error) {
      console.error("Error creating position:", error);
      toast.error("Failed to create position.");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(createPageUrl("Dashboard"))}
          className="rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Add New Position</h1>
          <p className="text-slate-600 text-lg">Create a new options contract</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {isBlocked && <LimitUpgradePrompt limits={limits} />}
          
          <fieldset disabled={isBlocked}>
            <Card className={`bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg ${isBlocked ? 'opacity-60 pointer-events-none' : ''}`}>
              <CardHeader className="pb-6">
                <CardTitle className="text-2xl font-bold text-slate-900">Position Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="symbol" className="text-slate-700 font-medium">Stock Symbol</Label>
                      <Input
                        id="symbol"
                        placeholder="e.g., AAPL"
                        value={formData.symbol}
                        onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                        className="rounded-xl border-slate-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="strategy" className="text-slate-700 font-medium">Strategy Type</Label>
                      <Select value={formData.strategy_type} onValueChange={(value) => handleInputChange('strategy_type', value)}>
                        <SelectTrigger className="rounded-xl border-slate-200">
                          <SelectValue placeholder="Select strategy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash_secured_put">Cash Secured Put</SelectItem>
                          <SelectItem value="covered_call">Covered Call</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="strike" className="text-slate-700 font-medium">Strike Price</Label>
                      <Input
                        id="strike"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 150.00"
                        value={formData.strike_price}
                        onChange={(e) => handleInputChange('strike_price', e.target.value)}
                        className="rounded-xl border-slate-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiration" className="text-slate-700 font-medium">Expiration Date</Label>
                      <Input
                        id="expiration"
                        type="date"
                        value={formData.expiration_date}
                        onChange={(e) => handleInputChange('expiration_date', e.target.value)}
                        className="rounded-xl border-slate-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="premium" className="text-slate-700 font-medium">Premium Received (per contract)</Label>
                      <Input
                        id="premium"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 2.50"
                        value={formData.premium_received}
                        onChange={(e) => handleInputChange('premium_received', e.target.value)}
                        className="rounded-xl border-slate-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contracts" className="text-slate-700 font-medium">Number of Contracts</Label>
                      <Input
                        id="contracts"
                        type="number"
                        min="1"
                        placeholder="e.g., 1"
                        value={formData.contracts_count}
                        onChange={(e) => handleInputChange('contracts_count', e.target.value)}
                        className="rounded-xl border-slate-200"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="underlying_price" className="text-slate-700 font-medium">Stock Price at Entry</Label>
                      <Input
                        id="underlying_price"
                        type="number"
                        step="0.01"
                        placeholder="e.g., 155.00"
                        value={formData.underlying_price_at_entry}
                        onChange={(e) => handleInputChange('underlying_price_at_entry', e.target.value)}
                        className="rounded-xl border-slate-200"
                        required
                      />
                    </div>

                    {formData.strategy_type === "cash_secured_put" && (
                      <div className="space-y-2">
                        <Label htmlFor="cash_secured" className="text-slate-700 font-medium">Cash Secured Amount</Label>
                        <Input
                          id="cash_secured"
                          type="number"
                          step="0.01"
                          value={formData.cash_secured_amount}
                          onChange={(e) => handleInputChange('cash_secured_amount', e.target.value)}
                          className="rounded-xl border-slate-200 bg-slate-50"
                          readOnly
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-slate-700 font-medium">Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Add any additional notes about this position..."
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="rounded-xl border-slate-200 h-24"
                    />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100 space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800">Trade Journal</h3>
                     <div className="space-y-2">
                      <Label htmlFor="pre_trade_thesis" className="text-slate-700 font-medium">Pre-Trade Thesis</Label>
                      <Textarea
                        id="pre_trade_thesis"
                        placeholder="Why are you entering this trade? What is your edge?"
                        value={formData.pre_trade_thesis}
                        onChange={(e) => handleInputChange('pre_trade_thesis', e.target.value)}
                        className="rounded-xl border-slate-200 h-24"
                      />
                    </div>
                     <div className="space-y-2">
                      <Label htmlFor="market_conditions" className="text-slate-700 font-medium">Market Conditions</Label>
                      <Textarea
                        id="market_conditions"
                        placeholder="e.g., VIX level, market sentiment (bullish/bearish), recent news..."
                        value={formData.market_conditions_at_entry}
                        onChange={(e) => handleInputChange('market_conditions_at_entry', e.target.value)}
                        className="rounded-xl border-slate-200 h-24"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 pt-6">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate(createPageUrl("Dashboard"))}
                      className="flex-1 rounded-xl border-slate-200 hover:bg-slate-50"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                      <Save className="w-5 h-5 mr-2" />
                      {isSubmitting ? 'Saving...' : 'Save Position'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </fieldset>
        </div>

        <div className="space-y-6">
          <PremiumCalculator 
            formData={formData}
            annualizedReturn={calculateAnnualizedReturn()}
          />
        </div>
      </div>
    </div>
  );
}
