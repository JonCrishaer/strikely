import React, { useState, useEffect } from 'react';
import { CommunityPost } from '@/entities/CommunityPost';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ArrowRight } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const strategyColors = {
  cash_secured_put: "bg-blue-100 text-blue-800 border-blue-200",
  covered_call: "bg-green-100 text-green-800 border-green-200"
};

const PostCard = ({ post }) => (
  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-200">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 mb-2">{post.title}</CardTitle>
          <div className="flex gap-2">
            <Badge variant="secondary">{post.symbol}</Badge>
            <Badge className={`${strategyColors[post.strategy_type]} border font-medium`}>
              {post.strategy_type.replace(/_/g, ' ')}
            </Badge>
          </div>
        </div>
        <p className="text-sm text-slate-500">
          {formatDistanceToNow(new Date(post.created_date), { addSuffix: true })}
        </p>
      </div>
    </CardHeader>
    <CardContent>
      <p className="text-slate-700 line-clamp-3">{post.notes}</p>
    </CardContent>
    <CardFooter className="flex justify-between items-center">
      <div className="flex items-center gap-4 text-slate-600">
        <div className="flex items-center gap-2">
          <ThumbsUp className="w-4 h-4" />
          <span>{post.likes || 0}</span>
        </div>
        {/* We will need to query comment count separately if needed, for now this is a placeholder */}
        {/* <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>0</span>
        </div> */}
      </div>
      <Button asChild variant="ghost">
        <Link to={createPageUrl(`PostDetails?id=${post.id}`)}>
          View Discussion <ArrowRight className="w-4 h-4 ml-2" />
        </Link>
      </Button>
    </CardFooter>
  </Card>
);

export default function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const communityPosts = await CommunityPost.list('-created_date', 50);
        setPosts(communityPosts);
      } catch (error) {
        console.error("Error fetching community posts:", error);
      }
      setIsLoading(false);
    };
    fetchPosts();
  }, []);

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Community Feed</h1>
        <p className="text-slate-600 text-lg">See what other traders are doing and share your insights.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
          <div className="h-48 bg-slate-100 rounded-2xl animate-pulse" />
        </div>
      ) : posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200">
          <p className="text-slate-500 text-lg">The community feed is empty.</p>
          <p className="text-slate-500">Be the first to share a trade!</p>
        </div>
      )}
    </div>
  );
}