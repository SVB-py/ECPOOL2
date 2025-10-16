import { useNavigate, useLocation } from "react-router-dom";
import { Home, Car, Wallet, BarChart3, User } from "lucide-react";
import { useState } from "react";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [ecoCredits] = useState(156); // This would come from state/context in real app
  const userRole = localStorage.getItem("userRole");

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    {
      path: userRole === "driver" ? "/driver" : "/student",
      icon: Home,
      label: "Home",
    },
    {
      path: userRole === "driver" ? "/driver/routes" : "/request-ride",
      icon: Car,
      label: "My Rides",
      badge: null, // Can show notification dot here
    },
    {
      path: "/wallet",
      icon: Wallet,
      label: "Wallet",
      showCredits: true,
    },
    {
      path: "/analytics",
      icon: BarChart3,
      label: "Stats",
    },
    {
      path: userRole === "driver" ? "/driver-profile" : "/student-profile",
      icon: User,
      label: "Profile",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-card border-t border-border rounded-t-3xl shadow-card">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around h-[70px]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 hover:scale-110 relative group ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {/* Active glow background */}
                {active && (
                  <div className="absolute inset-0 bg-primary/10 rounded-xl animate-glow-pulse" />
                )}

                {/* Icon */}
                <div className="relative">
                  <Icon
                    className={`w-6 h-6 transition-all duration-300 ${
                      active ? "scale-110" : ""
                    }`}
                    strokeWidth={active ? 2.5 : 2}
                  />

                  {/* Credits badge on wallet */}
                  {item.showCredits && (
                    <div className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center animate-glow-pulse">
                      {ecoCredits}
                    </div>
                  )}

                  {/* Notification badge */}
                  {item.badge && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={`text-xs font-medium transition-all duration-300 ${
                    active ? "text-primary font-semibold" : ""
                  }`}
                >
                  {item.label}
                </span>

                {/* Active indicator line */}
                {active && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
