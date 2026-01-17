
import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { CommunityPost } from "@/entities/CommunityPost";
import { Notification } from "@/entities/Notification";
import { UserFollow } from "@/entities/UserFollow";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, differenceInDays } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Target,
  Clock,
  Share2,
  RefreshCw, // Icon for Roll
  Pencil // Icon for Edit
} from "lucide-react";

const strategyColors = {
  cash_secured_put: "bg-gray-200 text-black border-black",
  covered_call: "bg-gray-200 text-black border-black"
};

const statusColors = {
  open: "bg-gray-200 text-black border-black",
  expired_worthless: "bg-gray-200 text-black border-black",
  assigned: "bg-gray-200 text-black border-black",
  bought_to_close: "bg-gray-200 text-black border-black",
  rolled: "bg-gray-200 text-black border-black"
};

const ShareDialog = ({ position, onPostShared }) => {
    const [title, setTitle] = useState(`Trade Review: ${position.symbol} ${position.strike_price}${position.contract_type.charAt(0).toUpperCase()}`);
    const [notes, setNotes] = useState(position.pre_trade_thesis || position.notes || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [open, setOpen] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Create the community post
            const newPost = await CommunityPost.create({
                position_id: position.id,
                symbol: position.symbol,
                strategy_type: position.strategy_type,
                title,
                notes,
            });

            // Get current user info
            const currentUser = await User.me();

            // Get all followers of the current user
            const followers = await UserFollow.filter({ followed_email: currentUser.email });

            // Create notifications for all followers
            const notificationPromises = followers.map(follow => 
                Notification.create({
                    user_email: follow.follower_email,
                    type: "new_post_from_followed",
                    title: `New post from ${currentUser.full_name}`,
                    message: `${currentUser.full_name} shared a trade: ${title}`,
                    related_id: newPost.id,
                    from_user_email: currentUser.email,
                    from_user_name: currentUser.full_name
                })
            );

            await Promise.all(notificationPromises);

            toast.success("Trade shared to community!");
            onPostShared();
            setOpen(false);
        } catch (error) {
            console.error("Failed to share post:", error);
            toast.error("Could not share trade.");
        }
        setIsSubmitting(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-lg border-slate-200 hover:bg-slate-50">
                    <Share2 className="w-4 h-4 mr-2" /> Share
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Share Trade to Community</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="post-title">Post Title</Label>
                        <Input id="post-title" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="post-notes">Your Notes for the Community</Label>
                        <Textarea id="post-notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="h-32" />
                    </div>
                    <Button onClick={handleSubmit} disabled={isSubmitting} className="w-full">
                        {isSubmitting ? "Sharing..." : "Post to Community"}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};


export default function PositionCard({ position, onClosePosition, onRollPosition, onEditPosition, onPositionShared }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    User.me().then(setUser).catch(() => setUser(null));
  }, []);

  const daysToExpiry = differenceInDays(new Date(position.expiration_date), new Date());
  const totalPremium = position.premium_received * position.contracts_count * 100;
  const isOpen = position.status === "open";
  const isProfitable = (position.profit_loss || 0) >= 0;

  return (
    <Card className="bg-white rounded-md shadow-lg hover:shadow-xl transition-all duration-200">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-black">{position.symbol}</h3>
              {position.annualized_return && (
                <Badge variant="outline" className="text-black border-black bg-white">
                  {position.annualized_return.toFixed(1)}% APR
                </Badge>
              )}
            </div>
            <p className="text-gray-600 text-lg">
              ${position.strike_price} {position.contract_type.toUpperCase()} • {position.contracts_count} contract{position.contracts_count > 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-black">
              +${totalPremium.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500">Premium Collected</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Entry Price</p>
              <p className="font-semibold">${position.underlying_price_at_entry}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <div>
              <p className="text-xs text-gray-500">Expiration</p>
              <p className="font-semibold">{format(new Date(position.expiration_date), "MMM d")}</p>
            </div>
          </div>
          
          {isOpen && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Days Left</p>
                <p className="font-semibold">{Math.max(0, daysToExpiry)}</p>
              </div>
            </div>
          )}
          
          {!isOpen && position.profit_loss !== undefined && (
            <div className="flex items-center gap-2">
              {isProfitable ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <div>
                <p className="text-xs text-gray-500">P&L</p>
                <p className={`font-semibold ${isProfitable ? 'text-green-600' : 'text-red-600'}`}>
                  {isProfitable ? '+' : ''}${position.profit_loss.toFixed(2)}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between pt-4 border-t-2 border-black">
          <div className="flex gap-2 flex-wrap">
            <Badge className={`${strategyColors[position.strategy_type]} border-2 font-medium`}>
              {position.strategy_type.replace('_', ' ')}
            </Badge>
            <Badge className={`${statusColors[position.status]} border-2 font-medium`}>
              {position.status.replace('_', ' ')}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {user?.subscription_status === 'active' && (
              <ShareDialog position={position} onPostShared={onPositionShared || (() => {})} />
            )}
            {onEditPosition && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditPosition(position)}
                className="rounded-md border-2 border-black hover:bg-gray-100"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            {isOpen && onRollPosition && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onRollPosition(position)}
                className="rounded-md border-2 border-black hover:bg-gray-100"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Roll
              </Button>
            )}
            {isOpen && onClosePosition && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onClosePosition(position)}
                className="rounded-md border-2 border-black hover:bg-gray-100"
              >
                Close
              </Button>
            )}
          </div>
        </div>

        {position.pre_trade_thesis && (
          <div className="pt-4 border-t border-gray-100 space-y-3">
            <div>
              <h4 className="font-semibold text-sm text-black">Pre-Trade Thesis</h4>
              <p className="text-sm text-gray-600 italic whitespace-pre-wrap">{position.pre_trade_thesis}</p>
            </div>
             {position.market_conditions_at_entry && (
                <div>
                  <h4 className="font-semibold text-sm text-black">Market Conditions at Entry</h4>
                  <p className="text-sm text-gray-600 italic whitespace-pre-wrap">{position.market_conditions_at_entry}</p>
                </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
