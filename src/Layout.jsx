import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { OptionsPosition } from "@/entities/OptionsPosition";
import SubscriptionWrapper from "./components/auth/SubscriptionWrapper";
import { 
  TrendingUp, 
  BarChart3, 
  PlusCircle, 
  Activity,
  Target,
  Users,
  Rss,
  MessageCircle,
  Lightbulb,
  Settings
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

const navigationItems = [
  {
    title: "Portfolio",
    url: createPageUrl("Dashboard"),
    icon: BarChart3,
  },
  {
    title: "Positions",
    url: createPageUrl("Positions"),
    icon: Target,
  },
  {
    title: "Performance",
    url: createPageUrl("Performance"),
    icon: TrendingUp,
  },
  {
    title: "Journal",
    url: createPageUrl("Journal"),
    icon: Activity,
  },
  {
    title: "Add Position",
    url: createPageUrl("AddPosition"),
    icon: PlusCircle,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [stats, setStats] = useState({ openPositions: 0, totalPremium: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [location.pathname]);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const allUserPositions = await OptionsPosition.list();
      
      const openPositionsCount = allUserPositions.filter(p => p.status === 'open').length;
      
      const totalPremiumCollected = allUserPositions.reduce((sum, pos) => {
        return sum + (pos.premium_received * pos.contracts_count * 100);
      }, 0);

      setStats({
        openPositions: openPositionsCount,
        totalPremium: totalPremiumCollected
      });
    } catch (error) {
      console.error("Could not load layout stats, user might not be logged in.", error);
      setStats({ openPositions: 0, totalPremium: 0 });
    }
    setIsLoading(false);
  };

  return (
    <SubscriptionWrapper>
      <SidebarProvider>
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

            html {
              font-size: 18px;
            }
            body, .font-pixel {
              font-family: 'VT323', monospace;
              letter-spacing: 0.05em;
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: 'VT323', monospace;
              letter-spacing: 0.05em;
            }
            
            /* Pixelated shadows */
            .shadow-lg {
                box-shadow: 4px 4px 0px 0px rgba(0,0,0,1);
                border: 2px solid black;
            }
            .shadow-xl {
                box-shadow: 6px 6px 0px 0px rgba(0,0,0,1);
                border: 2px solid black;
            }
            .shadow-2xl {
                box-shadow: 8px 8px 0px 0px rgba(0,0,0,1);
                border: 2px solid black;
            }
          `}
        </style>
        <div className="min-h-screen flex w-full bg-white text-black">
          <Sidebar className="border-r-2 border-black bg-white">
            <SidebarHeader className="border-b-2 border-black p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center border-2 border-black">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a5d54cac6db8aec83cac8a/f3546a8ed_Screenshot2025-09-04at94429AM.png"
                    alt="Strikely Logo"
                    className="w-6 h-6 object-contain"
                  />
                </div>
                <div>
                  <h2 className="font-bold text-black text-lg tracking-wider">Strikely</h2>
                  <p className="text-xs text-gray-600 font-medium">Portfolio Manager</p>
                </div>
              </div>
            </SidebarHeader>
            
            <SidebarContent className="p-3">
              <SidebarGroup>
                <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 py-3">
                  Trading
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    {navigationItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton 
                          asChild 
                          className={`hover:bg-gray-100 hover:text-black transition-all duration-200 rounded-md py-3 px-3 ${
                            location.pathname === item.url 
                              ? 'bg-black text-white' 
                              : 'text-gray-600'
                          }`}
                        >
                          <Link to={item.url} className="flex items-center gap-3">
                            <item.icon className="w-5 h-5" />
                            <span className="font-medium">{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 py-3">
                  Quick Stats
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <div className="px-3 space-y-4">
                    <div className="bg-gray-100 rounded-md p-4 border-2 border-black">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Open Positions</span>
                        <Activity className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-2xl font-bold text-black">
                        {isLoading ? '...' : stats.openPositions}
                      </span>
                    </div>
                    <div className="bg-gray-100 rounded-md p-4 border-2 border-black">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Total Premium</span>
                        <TrendingUp className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-2xl font-bold text-black">
                        ${isLoading ? '...' : stats.totalPremium.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </SidebarGroupContent>
              </SidebarGroup>

              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-semibold text-gray-600 uppercase tracking-wider px-3 py-3">
                  Community
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-1">
                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gray-100 hover:text-black transition-all duration-200 rounded-md py-3 px-3 ${
                          location.pathname === createPageUrl("Community")
                            ? 'bg-black text-white' 
                            : 'text-gray-600'
                        }`}
                      >
                        <Link to={createPageUrl("Community")} className="flex items-center gap-3">
                          <Users className="w-5 h-5" />
                          <span className="font-medium">Community Feed</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gray-100 hover:text-black transition-all duration-200 rounded-md py-3 px-3 ${
                          location.pathname === createPageUrl("FeatureRequests")
                            ? 'bg-black text-white' 
                            : 'text-gray-600'
                        }`}
                      >
                        <Link to={createPageUrl("FeatureRequests")} className="flex items-center gap-3">
                          <Lightbulb className="w-5 h-5" />
                          <span className="font-medium">Feature Requests</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild
                        className="text-gray-600 hover:bg-gray-100 hover:text-black transition-all duration-200 rounded-md py-3 px-3"
                      >
                        <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <Rss className="w-5 h-5" />
                          <span className="font-medium">Twitter</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>

                    <SidebarMenuItem>
                      <SidebarMenuButton 
                        asChild
                        className="text-gray-600 hover:bg-gray-100 hover:text-black transition-all duration-200 rounded-md py-3 px-3"
                      >
                        <a href="#" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">Discord</span>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t-2 border-black p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center border-2 border-black">
                  <span className="text-black font-semibold text-sm">T</span>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-black text-sm">Trader</p>
                  <p className="text-xs text-gray-600">Options Specialist</p>
                </div>
              </div>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 flex flex-col overflow-hidden">
            <header className="bg-white/80 backdrop-blur-sm border-b-2 border-black px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors duration-200" />
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center border-2 border-black">
                    <img 
                      src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68a5d54cac6db8aec83cac8a/f3546a8ed_Screenshot2025-09-04at94429AM.png"
                      alt="Strikely Logo"
                      className="w-5 h-5 object-contain"
                    />
                  </div>
                  <h1 className="text-xl font-bold text-black tracking-wider">Strikely</h1>
                </div>
              </div>
            </header>

            <div className="flex-1 overflow-auto bg-white">
              {children}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </SubscriptionWrapper>
  );
}