
import React, { useState, useEffect } from 'react';
import { FeatureRequest } from '@/entities/FeatureRequest';
import { FeatureVote } from '@/entities/FeatureVote';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Lightbulb, ChevronUp, ChevronDown, Plus, Filter } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const statusColors = {
  pending: "bg-gray-100 text-gray-800 border-gray-200",
  under_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  in_progress: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200"
};

const FeatureCard = ({ feature, onVote, userVotes }) => {
  const userVote = userVotes.find(v => v.feature_request_id === feature.id);
  
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-slate-900 mb-2">{feature.title}</CardTitle>
            <div className="flex gap-2">
              <Badge className={`${statusColors[feature.status]} border font-medium`}>
                {feature.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>
          <p className="text-sm text-slate-500">
            {formatDistanceToNow(new Date(feature.created_date), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-slate-700 mb-4">{feature.description}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant={userVote?.vote_type === 'upvote' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVote(feature.id, 'upvote')}
              className="flex items-center gap-1"
            >
              <ChevronUp className="w-4 h-4" />
              {feature.upvotes}
            </Button>
            <Button
              variant={userVote?.vote_type === 'downvote' ? 'default' : 'outline'}
              size="sm"
              onClick={() => onVote(feature.id, 'downvote')}
              className="flex items-center gap-1"
            >
              <ChevronDown className="w-4 h-4" />
              {feature.downvotes}
            </Button>
          </div>
          <div className="text-sm text-slate-600">
            Net: {feature.vote_count} votes
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const CreateFeatureDialog = ({ onFeatureCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim()) {
      toast.error("Please fill in both title and description");
      return;
    }

    setIsSubmitting(true);
    try {
      await FeatureRequest.create({
        title: title.trim(),
        description: description.trim()
      });
      toast.success("Feature request submitted!");
      onFeatureCreated();
      setTitle('');
      setDescription('');
      setOpen(false);
    } catch (error) {
      console.error("Failed to create feature request:", error);
      toast.error("Could not submit feature request.");
    }
    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200">
          <Plus className="w-5 h-5 mr-2" />
          Request Feature
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Submit Feature Request</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feature-title">Feature Title</Label>
            <Input 
              id="feature-title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="e.g., Dark mode toggle"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feature-description">Description</Label>
            <Textarea 
              id="feature-description" 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              className="h-32"
              placeholder="Describe the feature you'd like to see added..."
            />
          </div>
          <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Request"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default function FeatureRequestsPage() {
  const [features, setFeatures] = useState([]);
  const [userVotes, setUserVotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("votes");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [featuresData, votesData] = await Promise.all([
        FeatureRequest.list('-vote_count'),
        FeatureVote.list()
      ]);
      setFeatures(featuresData);
      setUserVotes(votesData);
    } catch (error) {
      console.error("Error loading feature requests:", error);
    }
    setIsLoading(false);
  };

  const handleVote = async (featureId, voteType) => {
    try {
      const existingVote = userVotes.find(v => v.feature_request_id === featureId);
      
      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Remove vote if clicking same button
          await FeatureVote.delete(existingVote.id);
        } else {
          // Update vote type
          await FeatureVote.update(existingVote.id, { vote_type: voteType });
        }
      } else {
        // Create new vote
        await FeatureVote.create({
          feature_request_id: featureId,
          vote_type: voteType
        });
      }
      
      // Refresh data to update vote counts
      loadData();
    } catch (error) {
      console.error("Error voting:", error);
      toast.error("Could not register vote");
    }
  };

  const filteredFeatures = features.filter(feature => 
    statusFilter === "all" || feature.status === statusFilter
  );

  const sortedFeatures = [...filteredFeatures].sort((a, b) => {
    if (sortBy === "votes") return b.vote_count - a.vote_count;
    if (sortBy === "newest") return new Date(b.created_date) - new Date(a.created_date);
    if (sortBy === "oldest") return new Date(a.created_date) - new Date(b.created_date);
    return 0;
  });

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Feature Requests</h1>
          <p className="text-slate-600 text-lg">Help shape the future of Strikely by voting on features</p>
        </div>
        <CreateFeatureDialog onFeatureCreated={loadData} />
      </div>

      <div className="flex flex-col lg:flex-row gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-slate-200 shadow-lg">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-slate-400" />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48 rounded-xl border-slate-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48 rounded-xl border-slate-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="votes">Most Voted</SelectItem>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : sortedFeatures.length > 0 ? (
        <div className="space-y-6">
          {sortedFeatures.map(feature => (
            <FeatureCard 
              key={feature.id} 
              feature={feature} 
              onVote={handleVote}
              userVotes={userVotes}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
          <Lightbulb className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-500 text-lg mb-2">No feature requests yet</p>
          <p className="text-slate-500">Be the first to suggest an improvement!</p>
        </div>
      )}
    </div>
  );
}
