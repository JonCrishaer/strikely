
import React, { useState } from "react";
import { OptionsPosition } from "@/entities/OptionsPosition";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { differenceInDays } from "date-fns";

export default function ClosePositionDialog({ position, open, onOpenChange, onPositionClosed }) {
  const [closeData, setCloseData] = useState({
    status: "",
    closing_premium_paid: "",
    assignment_price: "",
    notes: position?.notes || ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculateProfitLoss = () => {
    if (!position) return 0;
    
    // Premium received: per contract * contracts * 100 shares per contract
    const premiumReceived = position.premium_received * position.contracts_count * 100;
    let cost = 0;
    
    if (closeData.status === "bought_to_close") {
      // Premium paid to close: per contract * contracts * 100 shares per contract
      cost = (parseFloat(closeData.closing_premium_paid) || 0) * position.contracts_count * 100;
    } else if (closeData.status === "assigned") {
      // For assignments, the P&L is just the premium (simplified)
      cost = 0;
    }
    
    return premiumReceived - cost;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const profitLoss = calculateProfitLoss();
      const daysHeld = Math.max(1, differenceInDays(new Date(), new Date(position.created_date)));
      
      const updateData = {
        ...closeData,
        closing_premium_paid: parseFloat(closeData.closing_premium_paid) || 0,
        assignment_price: parseFloat(closeData.assignment_price) || 0,
        profit_loss: profitLoss,
        // Recalculate annualized return based on actual days held
        annualized_return: position.cash_secured_amount 
          ? (profitLoss / position.cash_secured_amount) * (365 / daysHeld) * 100
          : 0
      };

      await OptionsPosition.update(position.id, updateData);
      onPositionClosed();
    } catch (error) {
      console.error("Error closing position:", error);
    }

    setIsSubmitting(false);
  };

  if (!position) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Close Position: {position.symbol}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">How was this position closed?</Label>
            <Select value={closeData.status} onValueChange={(value) => setCloseData(prev => ({...prev, status: value}))}>
              <SelectTrigger>
                <SelectValue placeholder="Select closing method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="expired_worthless">Expired Worthless</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="bought_to_close">Bought to Close</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {closeData.status === "bought_to_close" && (
            <div className="space-y-2">
              <Label htmlFor="closing_premium">Premium Paid to Close (per contract)</Label>
              <Input
                id="closing_premium"
                type="number"
                step="0.01"
                placeholder="e.g., 0.50"
                value={closeData.closing_premium_paid}
                onChange={(e) => setCloseData(prev => ({...prev, closing_premium_paid: e.target.value}))}
                required
              />
            </div>
          )}

          {closeData.status === "assigned" && (
            <div className="space-y-2">
              <Label htmlFor="assignment_price">Assignment Price</Label>
              <Input
                id="assignment_price"
                type="number"
                step="0.01"
                placeholder={position.strike_price.toString()}
                value={closeData.assignment_price}
                onChange={(e) => setCloseData(prev => ({...prev, assignment_price: e.target.value}))}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="close_notes">Additional Notes</Label>
            <Textarea
              id="close_notes"
              placeholder="Any additional notes about closing this position..."
              value={closeData.notes}
              onChange={(e) => setCloseData(prev => ({...prev, notes: e.target.value}))}
              className="h-20"
            />
          </div>

          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-slate-700 mb-1">Estimated P&L:</p>
            <p className="text-lg font-bold text-green-600">
              +${calculateProfitLoss().toFixed(2)}
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!closeData.status || isSubmitting}
              className="flex-1 bg-slate-900 hover:bg-slate-800"
            >
              {isSubmitting ? "Closing..." : "Close Position"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
