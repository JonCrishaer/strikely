import React from 'react';
import { Button } from '@/components/ui/button';
import { createPageUrl } from '@/utils';
import { User } from '@/entities/User';
import { BarChart3, TrendingUp, Target, ArrowRight, Check } from 'lucide-react';

const features = [
  {
    icon: <Target className="w-6 h-6 text-black" />,
    title: 'Track Every Trade',
    description: 'Log cash-secured puts and covered calls with precision. Never lose track of a position again.'
  },
  {
    icon: <BarChart3 className="w-6 h-6 text-black" />,
    title: 'Measure Performance',
    description: 'See your real P&L, win rates, and annualized returns. Know exactly how your strategies perform.'
  },
  {
    icon: <TrendingUp className="w-6 h-6 text-black" />,
    title: 'Optimize Strategy',
    description: 'Identify what works and what doesn\'t. Make data-driven decisions to improve your trading.'
  }
];

const benefits = [
  'Unlimited position tracking',
  'Advanced performance analytics', 
  'Strategy breakdowns by type',
  'Trade journaling system',
  'Community insights',
  'Mobile-responsive design'
];

export default function HomePage() {
  const handleGetStarted = async () => {
    try {
      await User.loginWithRedirect(window.location.origin + createPageUrl('Dashboard'));
    } catch (error) {
      console.error("Login failed", error);
    }
  };
  
  return (
    <div className="bg-white text-black min-h-screen">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-b-2 border-black z-50">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center border-2 border-black">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a5d54cac6db8aec83cac8a/f3546a8ed_Screenshot2025-09-04at94429AM.png"
                  alt="Strikely Logo"
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="text-xl font-bold tracking-wider">Strikely</span>
            </div>
            <Button 
              onClick={handleGetStarted}
              className="bg-black hover:bg-gray-800 text-white px-6 py-2 rounded-md shadow-lg hover:shadow-xl transition-all duration-200"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <main className="pt-32">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-black mb-8">
              Stop Guessing.<br />Start <span className="underline decoration-4 underline-offset-8">Measuring</span>.
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-2xl mx-auto leading-relaxed">
              Most options traders have no idea if their strategies actually work. 
              Strikely gives you the data to trade smarter.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-md shadow-2xl hover:shadow-none transition-all duration-200"
              >
                Access Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-sm text-gray-500">Free to start • No credit card required</p>
            </div>
          </div>
        </div>

        {/* Problem Section */}
        <section className="py-20 border-y-2 border-black bg-gray-50">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
                The Problem with Options Trading
              </h2>
              <div className="grid md:grid-cols-3 gap-8 text-left">
                <div className="bg-white p-6 rounded-md border-2 border-black shadow-lg">
                  <h3 className="text-xl font-bold text-black mb-3">No Clear Records</h3>
                  <p className="text-gray-600">Spreadsheets are messy. Broker reports are confusing. You can't see the big picture.</p>
                </div>
                <div className="bg-white p-6 rounded-md border-2 border-black shadow-lg">
                  <h3 className="text-xl font-bold text-black mb-3">Unknown Performance</h3>
                  <p className="text-gray-600">Are your strategies actually profitable? What's your real annualized return? You're flying blind.</p>
                </div>
                <div className="bg-white p-6 rounded-md border-2 border-black shadow-lg">
                  <h3 className="text-xl font-bold text-black mb-3">No Optimization</h3>
                  <p className="text-gray-600">Without data, you can't improve. You keep repeating the same mistakes.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-4">
                Built for Serious Traders
              </h2>
              <p className="text-xl text-gray-600">Everything you need to track, analyze, and optimize your options trading.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {features.map((feature, index) => (
                <div key={index} className="text-center">
                  <div className="inline-block p-4 bg-gray-100 rounded-md mb-6 border-2 border-black">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-black mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-gray-50 border-y-2 border-black">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-12">
                Everything You Need
              </h2>
              
              <div className="grid md:grid-cols-2 gap-4 mb-12">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3 text-left">
                    <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-lg text-black">{benefit}</span>
                  </div>
                ))}
              </div>
              
              <Button 
                onClick={handleGetStarted}
                size="lg"
                className="bg-black hover:bg-gray-800 text-white px-8 py-4 text-lg rounded-md shadow-2xl hover:shadow-xl transition-all duration-200"
              >
                Start Tracking Your Trades
              </Button>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-bold text-black mb-8">
                Simple Pricing
              </h2>
              <p className="text-xl text-gray-600 mb-12">Start free, upgrade when you're ready.</p>
              
              <div className="bg-white p-12 rounded-md border-2 border-black shadow-2xl">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">Pro Plan</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold text-black">$4.99</span>
                    <span className="text-xl text-gray-500">/month</span>
                  </div>
                </div>
                
                <div className="space-y-3 mb-8 text-left max-w-sm mx-auto">
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-black flex-shrink-0" />
                    <span>Unlimited positions</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-black flex-shrink-0" />
                    <span>Advanced analytics</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-black flex-shrink-0" />
                    <span>Community access</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-black flex-shrink-0" />
                    <span>Priority support</span>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGetStarted}
                  size="lg"
                  className="w-full bg-black hover:bg-gray-800 text-white text-lg py-4 rounded-md shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  Start Free Trial
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-50 border-t-2 border-black py-12">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center border-2 border-black">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a5d54cac6db8aec83cac8a/f3546a8ed_Screenshot2025-09-04at94429AM.png"
                alt="Strikely Logo"
                className="w-4 h-4 object-contain"
              />
            </div>
            <span className="font-bold tracking-wider">Strikely</span>
          </div>
          <p className="text-gray-500">&copy; {new Date().getFullYear()} Strikely. Built for serious options traders.</p>
        </div>
      </footer>
    </div>
  );
}