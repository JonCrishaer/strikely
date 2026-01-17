import React, { useState, useEffect, useCallback } from 'react';
import { CommunityPost } from '@/entities/CommunityPost';
import { PostComment } from '@/entities/PostComment';
import { OptionsPosition } from '@/entities/OptionsPosition';
import { Notification } from '@/entities/Notification';
import { User } from '@/entities/User';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { toast } from 'sonner';

const strategyColors = {
  cash_secured_put: "bg-blue-100 text-blue-800 border-blue-200",
  covered_call: "bg-green-100 text-green-800 border-green-200"
};

export default function PostDetailsPage() {
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const postId = urlParams.get('id');
  
  const [post, setPost] = useState(null);
  const [position, setPosition] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!postId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const postData = await CommunityPost.get(postId);
      setPost(postData);

      if (postData?.position_id) {
        const positionData = await OptionsPosition.get(postData.position_id);
        setPosition(positionData);
      }
      
      const commentsData = await PostComment.filter({ post_id: postId }, '-created_date');
      setComments(commentsData);

    } catch (error) {
      console.error("Error fetching post details:", error);
      toast.error("Could not load post details.");
    } finally {
        setIsLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await PostComment.create({
        post_id: postId,
        comment: newComment.trim()
      });

      // Create notification for post author
      if (user && post && user.email !== post.created_by) {
        await Notification.create({
          user_email: post.created_by,
          type: "comment_on_your_post",
          title: `New comment on your post`,
          message: `${user.full_name} commented on your post: ${post.title}`,
          related_id: postId,
          from_user_email: user.email,
          from_user_name: user.full_name
        });
      }

      setNewComment('');
      fetchData(); // Refresh comments
      toast.success("Comment posted!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast.error("Could not post comment.");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="h-64 bg-slate-200 rounded"></div>
          <div className="h-32 bg-slate-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6 lg:p-8 text-center">
        <p className="text-slate-500">Post not found</p>
        <Link to={createPageUrl("Community")}>
          <Button className="mt-4">Back to Community</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      <div className="flex items-center gap-4">
        <Link to={createPageUrl("Community")}>
          <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">Post Details</h1>
      </div>

      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900 mb-2">{post.title}</CardTitle>
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
        <CardContent className="space-y-4">
          <div className="prose max-w-none">
            <p className="text-slate-700 whitespace-pre-wrap">{post.notes}</p>
          </div>
          
          {position && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-slate-800 mb-3">Trade Details</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Symbol:</span>
                  <span className="font-semibold ml-2">{position.symbol}</span>
                </div>
                <div>
                  <span className="text-slate-500">Strike:</span>
                  <span className="font-semibold ml-2">${position.strike_price}</span>
                </div>
                <div>
                  <span className="text-slate-500">Expiration:</span>
                  <span className="font-semibold ml-2">{format(new Date(position.expiration_date), "MMM d, yyyy")}</span>
                </div>
                <div>
                  <span className="text-slate-500">Premium:</span>
                  <span className="font-semibold ml-2">${(position.premium_received * position.contracts_count * 100).toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Comments ({comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {user ? (
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts..."
                className="h-24"
              />
              <Button type="submit" disabled={!newComment.trim() || isSubmitting}>
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          ) : (
            <div className="text-center py-4 text-slate-500">
              <p>Please log in to comment</p>
            </div>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment.id} className="border-l-4 border-slate-200 pl-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-semibold text-slate-900">Anonymous User</span>
                  <span className="text-xs text-slate-500">
                    {formatDistanceToNow(new Date(comment.created_date), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-slate-700 whitespace-pre-wrap">{comment.comment}</p>
              </div>
            ))}
            
            {comments.length === 0 && (
              <div className="text-center py-8 text-slate-500">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}