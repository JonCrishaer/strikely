
import React, { useState, useEffect, useCallback } from "react";
import { OptionsPosition } from "@/entities/OptionsPosition";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter } from "lucide-react";

import PositionCard from "../components/positions/PositionCard";
import ClosePositionDialog from "../components/positions/ClosePositionDialog";
import RollPositionDialog from "../components/positions/RollPositionDialog";
import EditPositionDialog from "../components/positions/EditPositionDialog";

export default function Positions() {
  const [positions, setPositions] = useState([]);
  const [filteredPositions, setFilteredPositions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStrategy, setFilterStrategy] = useState("all");
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showRollDialog, setShowRollDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false); // New state for edit dialog

  useEffect(() => {
    loadPositions();
  }, []);

  const filterPositions = useCallback(() => {
    let filtered = positions;

    if (searchTerm) {
      filtered = filtered.filter(pos => 
        pos.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStrategy !== "all") {
      filtered = filtered.filter(pos => pos.strategy_type === filterStrategy);
    }

    setFilteredPositions(filtered);
  }, [positions, searchTerm, filterStrategy]);

  useEffect(() => {
    filterPositions();
  }, [filterPositions]);

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

  const handleClosePosition = (position) => {
    setSelectedPosition(position);
    setShowCloseDialog(true);
  };
  
  const handleRollPosition = (position) => {
    setSelectedPosition(position);
    setShowRollDialog(true);
  };

  const handleEditPosition = (position) => {
    setSelectedPosition(position);
    setShowEditDialog(true);
  };

  const handlePositionClosed = () => {
    loadPositions();
    setShowCloseDialog(false);
    setSelectedPosition(null);
  };

  const handlePositionUpdated = () => {
    loadPositions();
    setShowEditDialog(false);
    setSelectedPosition(null);
  };

  const handlePositionRolled = async (rollData) => {
    if (!selectedPosition) return;

    try {
      // 1. Close the old position
      const oldPremiumReceived = selectedPosition.premium_received * selectedPosition.contracts_count * 100;
      const closingCost = (parseFloat(rollData.closing_premium_paid) || 0) * selectedPosition.contracts_count * 100;
      const profitLoss = oldPremiumReceived - closingCost;

      await OptionsPosition.update(selectedPosition.id, {
          status: "rolled",
          closing_premium_paid: parseFloat(rollData.closing_premium_paid) || 0,
          profit_loss: profitLoss,
          notes: `${selectedPosition.notes ? selectedPosition.notes + '\n' : ''}Rolled on ${new Date().toLocaleDateString()}.`
      });

      // 2. Create the new position
      const newStrike = parseFloat(rollData.new_strike_price);
      const newContracts = selectedPosition.contracts_count; // Assume same number of contracts
      const newCashSecured = selectedPosition.strategy_type === 'cash_secured_put' 
        ? newStrike * 100 * newContracts 
        : selectedPosition.cash_secured_amount;
        
      const newPositionData = {
          ...selectedPosition,
          id: undefined, // Let DB create new ID
          created_by: undefined, // Let DB set creator
          created_date: undefined, // Let DB set date
          updated_date: undefined, // Let DB set date
          strike_price: newStrike,
          expiration_date: rollData.new_expiration_date,
          premium_received: parseFloat(rollData.new_premium_received),
          cash_secured_amount: newCashSecured,
          status: "open",
          notes: `Rolled from position ${selectedPosition.id} on ${new Date().toLocaleDateString()}.`,
          // Reset fields that don't apply to the new open position
          profit_loss: null,
          closing_premium_paid: null,
          assignment_price: null,
          annualized_return: 0 // This will be recalculated later if needed
      };
      await OptionsPosition.create(newPositionData);

      loadPositions();
      setShowRollDialog(false);
      setSelectedPosition(null);
    } catch (error) {
      console.error("Error rolling position:", error);
      // Optionally, show an error message to the user
    }
  };

  const handlePositionShared = () => {
    // Optionally, you could add a success message here or refresh data
    // For now, no action is needed after sharing
  };

  const openPositions = filteredPositions.filter(pos => pos.status === "open");
  const closedPositions = filteredPositions.filter(pos => pos.status !== "open");

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">All Positions</h1>
        <p className="text-slate-600 text-lg">Manage your options contracts</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
          <Input
            placeholder="Search by symbol..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-xl border-slate-200"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <Select value={filterStrategy} onValueChange={setFilterStrategy}>
            <SelectTrigger className="w-48 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Strategies</SelectItem>
              <SelectItem value="cash_secured_put">Cash Secured Puts</SelectItem>
              <SelectItem value="covered_call">Covered Calls</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="open" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-slate-100 rounded-xl p-1">
          <TabsTrigger value="open" className="rounded-lg">
            Open Positions ({openPositions.length})
          </TabsTrigger>
          <TabsTrigger value="closed" className="rounded-lg">
            Closed Positions ({closedPositions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : openPositions.length > 0 ? (
            <div className="grid gap-4">
              {openPositions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  onClosePosition={handleClosePosition}
                  onRollPosition={handleRollPosition}
                  onEditPosition={handleEditPosition} // Pass new handler
                  onPositionShared={handlePositionShared}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-lg">No open positions found</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {Array(4).fill(0).map((_, i) => (
                <div key={i} className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : closedPositions.length > 0 ? (
            <div className="grid gap-4">
              {closedPositions.map((position) => (
                <PositionCard
                  key={position.id}
                  position={position}
                  onEditPosition={handleEditPosition} // Pass edit handler to closed positions too
                  onPositionShared={handlePositionShared}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
              <p className="text-slate-500 text-lg">No closed positions found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedPosition && (
        <ClosePositionDialog
          position={selectedPosition}
          open={showCloseDialog}
          onOpenChange={setShowCloseDialog}
          onPositionClosed={handlePositionClosed}
        />
      )}
      
      {selectedPosition && (
        <RollPositionDialog
          position={selectedPosition}
          open={showRollDialog}
          onOpenChange={setShowRollDialog}
          onPositionRolled={handlePositionRolled}
        />
      )}

      {selectedPosition && (
        <EditPositionDialog
          position={selectedPosition}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onPositionUpdated={handlePositionUpdated}
        />
      )}
    </div>
  );
}
