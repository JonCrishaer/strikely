import React, { useState } from 'react';
import { SupportRequest } from '@/entities/SupportRequest';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { MessageCircle, Send, AlertTriangle } from 'lucide-react';

const priorityColors = {
  low: "bg-gray-100 text-gray-800 border-gray-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200", 
  high: "bg-orange-100 text-orange-800 border-orange-200",
  urgent: "bg-red-100 text-red-800 border-red-200"
};

export default function SupportForm() {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const user = await User.me();
      
      await SupportRequest.create({
        ...formData,
        user_email: user.email,
        user_name: user.full_name || user.email
      });

      toast.success('Support request submitted successfully!');
      setFormData({
        subject: '',
        category: '',
        priority: 'medium', 
        description: ''
      });
      setOpen(false);
    } catch (error) {
      console.error('Error submitting support request:', error);
      toast.error('Failed to submit support request');
    }

    setIsSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full rounded-md border-2 border-black hover:bg-gray-100"
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          Contact Support
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-black">Submit Support Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="subject" className="text-black font-medium">Subject</Label>
            <Input
              id="subject"
              placeholder="Brief description of your issue"
              value={formData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="rounded-md border-2 border-black"
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category" className="text-black font-medium">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                <SelectTrigger className="rounded-md border-2 border-black">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bug_report">Bug Report</SelectItem>
                  <SelectItem value="feature_request">Feature Request</SelectItem>
                  <SelectItem value="account_issue">Account Issue</SelectItem>
                  <SelectItem value="payment_issue">Payment Issue</SelectItem>
                  <SelectItem value="general_question">General Question</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority" className="text-black font-medium">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                <SelectTrigger className="rounded-md border-2 border-black">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-black font-medium">Description</Label>
            <Textarea
              id="description"
              placeholder="Please provide detailed information about your issue or question..."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="rounded-md border-2 border-black h-32"
              required
            />
          </div>

          <div className="bg-gray-50 p-4 rounded-md border-2 border-gray-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-gray-600 mt-0.5" />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Support Response Times:</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Urgent:</strong> Within 2-4 hours</li>
                  <li>• <strong>High:</strong> Within 24 hours</li>
                  <li>• <strong>Medium/Low:</strong> Within 48 hours</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 rounded-md border-2 border-black hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-black hover:bg-gray-800 text-white rounded-md shadow-lg"
            >
              <Send className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Submitting...' : 'Submit Request'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}