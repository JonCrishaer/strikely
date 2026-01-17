import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

export default function PricingPage() {
  const stripePaymentLink = "https://buy.stripe.com/your_link_here";
  
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="grid lg:grid-cols-2 gap-8 max-w-4xl w-full">
        {/* Free Plan */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-slate-900">Free Plan</CardTitle>
            <CardDescription className="text-slate-600 pt-2">
              Perfect for getting started and trying out the platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-4xl font-extrabold text-slate-900">
                $0<span className="text-lg font-medium text-slate-500">/month</span>
              </p>
            </div>
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Up to 3 Open Positions</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Up to 10 Trades/Month</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Basic Performance Metrics</span>
              </li>
              <li className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-slate-400" />
                <span className="text-slate-500">Community Access</span>
              </li>
            </ul>
            <Button variant="outline" className="w-full" disabled>Your Current Plan</Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="shadow-2xl border-blue-500 ring-2 ring-blue-500">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-slate-900">Upgrade to Pro</CardTitle>
            <CardDescription className="text-lg text-slate-600 pt-2">
              Unlock all features and take your trading to the next level.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-5xl font-extrabold text-slate-900">
                $4.99<span className="text-xl font-medium text-slate-500">/month</span>
              </p>
            </div>
            
            <ul className="space-y-3 text-slate-700">
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span><strong>Unlimited</strong> Position Tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Advanced Performance Analytics</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Full Community Access</span>
              </li>
               <li className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Priority Support</span>
              </li>
            </ul>
            
            <Button asChild size="lg" className="w-full text-lg">
              <a href={stripePaymentLink} target="_blank" rel="noopener noreferrer">
                Subscribe Now
              </a>
            </Button>
            
            <div className="text-center text-sm text-slate-500 bg-slate-100 p-3 rounded-lg">
              <p className="font-semibold">Important:</p>
              <p>You will be redirected to our secure payment partner, Stripe. After payment, your account will be activated automatically (once automation is configured).</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}