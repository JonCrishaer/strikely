import React, { useState, useEffect } from "react";
import { JournalEntry } from "@/entities/JournalEntry";
import { OptionsPosition } from "@/entities/OptionsPosition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, Plus } from "lucide-react";

import JournalEntryCard from "../components/journal/JournalEntryCard";
import CreateJournalDialog from "../components/journal/CreateJournalDialog";
import TradeJournalCard from "../components/journal/TradeJournalCard";

export default function Journal() {
  const [journalEntries, setJournalEntries] = useState([]);
  const [tradeEntries, setTradeEntries] = useState([]);
  const [filteredJournalEntries, setFilteredJournalEntries] = useState([]);
  const [filteredTradeEntries, setFilteredTradeEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const filterEntries = React.useCallback(() => {
    // Filter journal entries
    let filtered = journalEntries;
    if (searchTerm) {
      filtered = filtered.filter(entry => 
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (entry.tags && entry.tags.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterType !== "all") {
      filtered = filtered.filter(entry => entry.entry_type === filterType);
    }
    setFilteredJournalEntries(filtered);

    // Filter trade entries
    let filteredTrades = tradeEntries;
    if (searchTerm) {
      filteredTrades = filteredTrades.filter(trade => 
        trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trade.pre_trade_thesis && trade.pre_trade_thesis.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (trade.market_conditions_at_entry && trade.market_conditions_at_entry.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    setFilteredTradeEntries(filteredTrades);
  }, [journalEntries, tradeEntries, searchTerm, filterType]);

  useEffect(() => {
    filterEntries();
  }, [filterEntries]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [journalData, positionsData] = await Promise.all([
        JournalEntry.list("-created_date"),
        OptionsPosition.list("-created_date")
      ]);
      
      setJournalEntries(journalData);
      
      // Filter positions that have journal data
      const tradesWithJournal = positionsData.filter(pos => 
        pos.pre_trade_thesis || pos.market_conditions_at_entry || pos.lessons_learned
      );
      setTradeEntries(tradesWithJournal);
    } catch (error) {
      console.error("Error loading journal data:", error);
    }
    setIsLoading(false);
  };

  const handleEntryCreated = () => {
    loadData();
    setShowCreateDialog(false);
  };

  const handleEntryDeleted = async (entryId) => {
    try {
      await JournalEntry.delete(entryId);
      loadData();
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-black mb-2">Trading Journal</h1>
          <p className="text-gray-600 text-lg">Track your thoughts, learnings, and market insights</p>
        </div>
        <Button 
          onClick={() => setShowCreateDialog(true)}
          className="bg-black hover:bg-gray-800 text-white rounded-md shadow-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Entry
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 bg-white rounded-md p-6 border-2 border-black shadow-lg">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <Input
            placeholder="Search journal entries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 rounded-md border-2 border-black"
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48 rounded-md border-2 border-black">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="custom">Custom Entries</SelectItem>
              <SelectItem value="trade_reflection">Trade Reflections</SelectItem>
              <SelectItem value="market_observation">Market Observations</SelectItem>
              <SelectItem value="lesson_learned">Lessons Learned</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="journal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 bg-gray-100 rounded-md p-1 border-2 border-black">
          <TabsTrigger value="journal" className="rounded-md">
            Journal Entries ({filteredJournalEntries.length})
          </TabsTrigger>
          <TabsTrigger value="trades" className="rounded-md">
            Trade Journal ({filteredTradeEntries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="journal" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-md animate-pulse border-2 border-black" />
              ))}
            </div>
          ) : filteredJournalEntries.length > 0 ? (
            <div className="grid gap-4">
              {filteredJournalEntries.map((entry) => (
                <JournalEntryCard
                  key={entry.id}
                  entry={entry}
                  onEntryDeleted={handleEntryDeleted}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-md border-2 border-black">
              <p className="text-gray-500 text-lg">No journal entries found</p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="mt-4 bg-black hover:bg-gray-800 text-white rounded-md"
              >
                Create Your First Entry
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="trades" className="space-y-4">
          {isLoading ? (
            <div className="grid gap-4">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="h-32 bg-gray-100 rounded-md animate-pulse border-2 border-black" />
              ))}
            </div>
          ) : filteredTradeEntries.length > 0 ? (
            <div className="grid gap-4">
              {filteredTradeEntries.map((trade) => (
                <TradeJournalCard
                  key={trade.id}
                  trade={trade}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-md border-2 border-black">
              <p className="text-gray-500 text-lg">No trade journal entries found</p>
              <p className="text-gray-500">Add journal notes to your positions to see them here</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateJournalDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onEntryCreated={handleEntryCreated}
      />
    </div>
  );
}