import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Copy, ExternalLink, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function WebhookInfo() {
  const webhookUrl = `${window.location.origin}/api/webhooks/stripe`;
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const zapierSteps = [
    "Create a Zap in Zapier with 'Stripe' as the trigger app",
    "Select 'Payment Succeeded' or 'Customer Subscription Updated' as the trigger event",
    "Use 'Webhooks by Zapier' as the action app",
    "Set the action to 'PUT' request to your base44 API",
    "Map the customer email from Stripe to update the user's subscription_status"
  ];

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Zap className="w-8 h-8 text-blue-600" />
        <h1 className="text-3xl font-bold text-slate-900">Subscription Automation Setup</h1>
      </div>

      {/* Backend Function Option */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Option 1: Backend Functions (Recommended)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Enable backend functions in Dashboard → Settings, then I can create a webhook endpoint for you.
          </p>
          
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-slate-700 mb-2">Webhook URL for Stripe:</p>
            <div className="flex items-center gap-2">
              <code className="bg-white px-3 py-2 rounded border text-sm flex-1">
                {webhookUrl}
              </code>
              <Button
                variant="outline"
                size="icon"
                onClick={() => copyToClipboard(webhookUrl)}
              >
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800 text-sm">
              <strong>Next Steps:</strong> After enabling backend functions, let me know and I'll create the webhook handler that will automatically update user subscription statuses when Stripe sends payment events.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Zapier Option */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Option 2: Zapier Integration (No-Code)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            Use Zapier to connect Stripe webhooks to your base44 app automatically.
          </p>
          
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-800">Setup Steps:</h4>
            <ol className="space-y-2">
              {zapierSteps.map((step, index) => (
                <li key={index} className="flex gap-3">
                  <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold">
                    {index + 1}
                  </span>
                  <span className="text-slate-700">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex gap-3">
            <Button asChild variant="outline">
              <a href="https://zapier.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Zapier
              </a>
            </Button>
            <Button asChild variant="outline">
              <a href="https://make.com" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Make.com
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Manual Override */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-slate-900">Manual Testing & Override</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            For testing or manual subscription management, you can update users directly in the Data Dashboard.
          </p>
          
          <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
            <p className="text-amber-800 text-sm">
              <strong>Manual Process:</strong> Go to Dashboard → Data → User → Find user by email → Update subscription_status to "active" or "cancelled"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}