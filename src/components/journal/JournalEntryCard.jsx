import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Trash2, BookOpen, TrendingUp, Eye, Target } from "lucide-react";

const entryTypeColors = {
  custom: "bg-gray-200 text-black border-black",
  trade_reflection: "bg-gray-200 text-black border-black",
  market_observation: "bg-gray-200 text-black border-black",
  lesson_learned: "bg-gray-200 text-black border-black"
};

const entryTypeIcons = {
  custom: <BookOpen className="w-4 h-4" />,
  trade_reflection: <Target className="w-4 h-4" />,
  market_observation: <Eye className="w-4 h-4" />,
  lesson_learned: <TrendingUp className="w-4 h-4" />
};

const moodColors = {
  bullish: "bg-green-100 text-green-800 border-green-200",
  bearish: "bg-red-100 text-red-800 border-red-200",
  neutral: "bg-gray-100 text-gray-800 border-gray-200",
  uncertain: "bg-yellow-100 text-yellow-800 border-yellow-200"
};

export default function JournalEntryCard({ entry, onEntryDeleted }) {
  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this journal entry?")) {
      onEntryDeleted(entry.id);
    }
  };

  return (
    <Card className="bg-white rounded-md shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-black">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-black mb-2">{entry.title}</CardTitle>
            <div className="flex gap-2 flex-wrap">
              <Badge className={`${entryTypeColors[entry.entry_type]} border-2 font-medium flex items-center gap-1`}>
                {entryTypeIcons[entry.entry_type]}
                {entry.entry_type.replace('_', ' ')}
              </Badge>
              {entry.mood && (
                <Badge className={`${moodColors[entry.mood]} border-2 font-medium`}>
                  {entry.mood}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">
              {format(new Date(entry.created_date), "MMM d, yyyy")}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              className="rounded-md border-2 border-red-500 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-700 whitespace-pre-wrap">{entry.content}</p>
        </div>

        {entry.tags && (
          <div className="flex gap-1 flex-wrap">
            {entry.tags.split(',').map((tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-xs bg-gray-50 text-gray-600 border-gray-300"
              >
                #{tag.trim()}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}