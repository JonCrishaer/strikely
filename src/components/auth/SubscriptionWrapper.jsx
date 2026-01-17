import React, { useState, useEffect } from 'react';
import { User } from '@/entities/User';
import { Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import HomePage from '@/pages/Home';

export default function SubscriptionWrapper({ children }) {
  const [isAuth, setIsAuth] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        await User.me();
        setIsAuth(true);
      } catch (error) {
        setIsAuth(false);
      }
    };

    checkUserStatus();
  }, [location.pathname]);

  if (isAuth === null) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 text-slate-500 animate-spin" />
        <p className="ml-4 text-slate-600">Loading...</p>
      </div>
    );
  }

  if (isAuth) {
    return <>{children}</>;
  }
  
  // If not authenticated, show the public home page.
  // This prevents logged-out users from seeing a loader on dashboard URLs.
  return <HomePage />;
}