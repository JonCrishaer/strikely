import React, { useState } from "react";
import { JournalEntry } from "@/entities/JournalEntry";
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
import { toast } from "sonner";
import { Save } from "lucide-react";

export default function CreateJournalDialog({ open, onOpenChange, onEntryCreated }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    entry_type: "custom",
    tags: "",
    mood: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await JournalEntry.create(formData);
      toast.success("Journal entry created successfully!");
      onEntryCreated();
      setFormData({
        title: "",
        content: "",
        entry_type: "custom",
        tags: "",
        mood: ""
      });
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating journal entry:", error);
      toast.error("Failed to create journal entry.");
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">
            New Journal Entry
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-black font-medium">Title</Label>
            <Input
              id="title"
              placeholder="What's on your mind?"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              className="rounded-md border-2 border-black"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_type" className="text-black font-medium">Entry Type</Label>
              <Select value={formData.entry_type} onValueChange={(value) => handleInputChange('entry_type', value)}>
                <SelectTrigger className="rounded-md border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom Entry</SelectItem>
                  <SelectItem value="trade_reflection">Trade Reflection</SelectItem>
                  <SelectItem value="market_observation">Market Observation</SelectItem>
                  <SelectItem value="lesson_learned">Lesson Learned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mood" className="text-black font-medium">Market Mood (Optional)</Label>
              <Select value={formData.mood} onValueChange={(value) => handleInputChange('mood', value)}>
                <SelectTrigger className="rounded-md border-2 border-black">
                  <SelectValue placeholder="Select mood" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>None</SelectItem>
                  <SelectItem value="bullish">Bullish</SelectItem>
                  <SelectItem value="bearish">Bearish</SelectItem>
                  <SelectItem value="neutral">Neutral</SelectItem>
                  <SelectItem value="uncertain">Uncertain</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="content" className="text-black font-medium">Content</Label>
            <Textarea
              id="content"
              placeholder="Write your thoughts, observations, or lessons here..."
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              className="rounded-md border-2 border-black h-32"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags" className="text-black font-medium">Tags (Optional)</Label>
            <Input
              id="tags"
              placeholder="e.g., SPY, earnings, volatility (comma-separated)"
              value={formData.tags}
              onChange={(e) => handleInputChange('tags', e.target.value)}
              className="rounded-md border-2 border-black"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-md border-2 border-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black hover:bg-gray-800 text-white rounded-md shadow-lg"
            >
              <Save className="w-5 h-5 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}