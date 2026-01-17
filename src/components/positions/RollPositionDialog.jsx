import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function RollPositionDialog({ position, open, onOpenChange, onPositionRolled }) {
  const [rollData, setRollData] = useState({
    closing_premium_paid: "",
    new_strike_price: "",
    new_expiration_date: "",
    new_premium_received: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setRollData(prev => ({ ...prev, [field]: value }));
  };
  
  const netCreditDebit = 
    (parseFloat(rollData.new_premium_received) || 0) - 
    (parseFloat(rollData.closing_premium_paid) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onPositionRolled(rollData);
      toast.success("Position rolled successfully!");
      onOpenChange(false);
    } catch (error) {
      console.error("Error rolling position:", error);
      toast.error("Failed to roll position.");
    } finally {
        setIsSubmitting(false);
    }
  };

  if (!position) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-slate-900">
            Roll Position: {position.symbol} ${position.strike_price}{position.contract_type.charAt(0).toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Close the current position and open a new one.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 border-b pb-2">Closing Old Position</h4>
            <div className="space-y-2 mt-2">
              <Label htmlFor="closing_premium">Premium Paid to Close (per contract)</Label>
              <Input
                id="closing_premium"
                type="number"
                step="0.01"
                placeholder="e.g., 0.50"
                value={rollData.closing_premium_paid}
                onChange={(e) => handleInputChange('closing_premium_paid', e.target.value)}
                required
              />
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-800 mb-2 border-b pb-2">Opening New Position</h4>
            <div className="grid grid-cols-2 gap-4 mt-2">
               <div className="space-y-2">
                <Label htmlFor="new_strike">New Strike Price</Label>
                <Input
                  id="new_strike"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 155.00"
                  value={rollData.new_strike_price}
                  onChange={(e) => handleInputChange('new_strike_price', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new_expiration">New Expiration Date</Label>
                <Input
                  id="new_expiration"
                  type="date"
                  value={rollData.new_expiration_date}
                  onChange={(e) => handleInputChange('new_expiration_date', e.target.value)}
                  required
                />
              </div>
               <div className="space-y-2 col-span-2">
                <Label htmlFor="new_premium">New Premium Received (per contract)</Label>
                <Input
                  id="new_premium"
                  type="number"
                  step="0.01"
                  placeholder="e.g., 3.10"
                  value={rollData.new_premium_received}
                  onChange={(e) => handleInputChange('new_premium_received', e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
            <p className="text-sm font-medium text-slate-700 mb-1">Net Credit/Debit for this roll:</p>
            <p className={`text-lg font-bold ${netCreditDebit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {netCreditDebit >= 0 ? '+' : ''}${netCreditDebit.toFixed(2)}
            </p>
            <p className="text-xs text-slate-500">per contract</p>
          </div>
          
          <DialogFooter className="pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-slate-900 hover:bg-slate-800"
            >
              {isSubmitting ? "Rolling..." : "Execute Roll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}