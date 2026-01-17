import React, { useState } from "react";
import { OptionsPosition } from "@/entities/OptionsPosition";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function EditPositionDialog({ position, open, onOpenChange, onPositionUpdated }) {
  const [formData, setFormData] = useState(position ? {
    symbol: position.symbol || "",
    strategy_type: position.strategy_type || "",
    strike_price: position.strike_price?.toString() || "",
    expiration_date: position.expiration_date || "",
    premium_received: position.premium_received?.toString() || "",
    contracts_count: position.contracts_count?.toString() || "",
    underlying_price_at_entry: position.underlying_price_at_entry?.toString() || "",
    cash_secured_amount: position.cash_secured_amount?.toString() || "",
    notes: position.notes || "",
    pre_trade_thesis: position.pre_trade_thesis || "",
    market_conditions_at_entry: position.market_conditions_at_entry || ""
  } : {});
  
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const totalPremium = premium * contracts * 100;
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
    setIsSubmitting(true);

    try {
      const updateData = {
        ...formData,
        contract_type: formData.strategy_type === "cash_secured_put" ? "put" : "call",
        strike_price: parseFloat(formData.strike_price),
        premium_received: parseFloat(formData.premium_received),
        contracts_count: parseInt(formData.contracts_count),
        underlying_price_at_entry: parseFloat(formData.underlying_price_at_entry),
        cash_secured_amount: parseFloat(formData.cash_secured_amount),
        annualized_return: calculateAnnualizedReturn()
      };

      await OptionsPosition.update(position.id, updateData);
      toast.success("Position updated successfully!");
      onPositionUpdated();
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating position:", error);
      toast.error("Failed to update position.");
    }

    setIsSubmitting(false);
  };

  if (!position) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">
            Edit Position: {position.symbol}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="symbol" className="text-black font-medium">Stock Symbol</Label>
              <Input
                id="symbol"
                placeholder="e.g., AAPL"
                value={formData.symbol}
                onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                className="rounded-md border-2 border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="strategy" className="text-black font-medium">Strategy Type</Label>
              <Select value={formData.strategy_type} onValueChange={(value) => handleInputChange('strategy_type', value)}>
                <SelectTrigger className="rounded-md border-2 border-black">
                  <SelectValue placeholder="Select strategy" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash_secured_put">Cash Secured Put</SelectItem>
                  <SelectItem value="covered_call">Covered Call</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="strike" className="text-black font-medium">Strike Price</Label>
              <Input
                id="strike"
                type="number"
                step="0.01"
                placeholder="e.g., 150.00"
                value={formData.strike_price}
                onChange={(e) => handleInputChange('strike_price', e.target.value)}
                className="rounded-md border-2 border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration" className="text-black font-medium">Expiration Date</Label>
              <Input
                id="expiration"
                type="date"
                value={formData.expiration_date}
                onChange={(e) => handleInputChange('expiration_date', e.target.value)}
                className="rounded-md border-2 border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="premium" className="text-black font-medium">Premium Received (per contract)</Label>
              <Input
                id="premium"
                type="number"
                step="0.01"
                placeholder="e.g., 2.50"
                value={formData.premium_received}
                onChange={(e) => handleInputChange('premium_received', e.target.value)}
                className="rounded-md border-2 border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contracts" className="text-black font-medium">Number of Contracts</Label>
              <Input
                id="contracts"
                type="number"
                min="1"
                placeholder="e.g., 1"
                value={formData.contracts_count}
                onChange={(e) => handleInputChange('contracts_count', e.target.value)}
                className="rounded-md border-2 border-black"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="underlying_price" className="text-black font-medium">Stock Price at Entry</Label>
              <Input
                id="underlying_price"
                type="number"
                step="0.01"
                placeholder="e.g., 155.00"
                value={formData.underlying_price_at_entry}
                onChange={(e) => handleInputChange('underlying_price_at_entry', e.target.value)}
                className="rounded-md border-2 border-black"
                required
              />
            </div>

            {formData.strategy_type === "cash_secured_put" && (
              <div className="space-y-2">
                <Label htmlFor="cash_secured" className="text-black font-medium">Cash Secured Amount</Label>
                <Input
                  id="cash_secured"
                  type="number"
                  step="0.01"
                  value={formData.cash_secured_amount}
                  onChange={(e) => handleInputChange('cash_secured_amount', e.target.value)}
                  className="rounded-md border-2 border-black bg-gray-100"
                  readOnly
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-black font-medium">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this position..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              className="rounded-md border-2 border-black h-20"
            />
          </div>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pre_trade_thesis" className="text-black font-medium">Pre-Trade Thesis</Label>
              <Textarea
                id="pre_trade_thesis"
                placeholder="Why did you enter this trade? What was your edge?"
                value={formData.pre_trade_thesis}
                onChange={(e) => handleInputChange('pre_trade_thesis', e.target.value)}
                className="rounded-md border-2 border-black h-20"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="market_conditions" className="text-black font-medium">Market Conditions</Label>
              <Textarea
                id="market_conditions"
                placeholder="e.g., VIX level, market sentiment, recent news..."
                value={formData.market_conditions_at_entry}
                onChange={(e) => handleInputChange('market_conditions_at_entry', e.target.value)}
                className="rounded-md border-2 border-black h-20"
              />
            </div>
          </div>

          <DialogFooter className="pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-md border-2 border-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-black hover:bg-gray-800 text-white rounded-md shadow-lg"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Updating...' : 'Update Position'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}