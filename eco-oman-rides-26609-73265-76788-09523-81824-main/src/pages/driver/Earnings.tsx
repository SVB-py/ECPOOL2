import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DriverBottomNav from "@/components/DriverBottomNav";
import {
  DollarSign,
  TrendingUp,
  Calendar,
  ArrowLeft,
  Download,
  Wallet,
  CreditCard,
  Leaf,
} from "lucide-react";

const Earnings = () => {
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  const earningHistory = [
    {
      date: "Oct 15, 7:00 AM",
      route: "Seeb - School",
      passengers: 18,
      amount: 18.5,
    },
    {
      date: "Oct 15, 8:45 AM",
      route: "Qurum - University",
      passengers: 12,
      amount: 12.0,
    },
    {
      date: "Oct 15, 2:00 PM",
      route: "Al Khuwair - Mall",
      passengers: 8,
      amount: 8.0,
    },
    {
      date: "Oct 14, 7:15 AM",
      route: "Ruwi - School",
      passengers: 15,
      amount: 15.0,
    },
  ];

  const weeklyData = [
    { day: "Monday", amount: 42.3, trips: 10 },
    { day: "Tuesday", amount: 38.9, trips: 9 },
    { day: "Wednesday", amount: 45.5, trips: 12 },
    { day: "Thursday", amount: 0, trips: 0 },
    { day: "Friday", amount: 0, trips: 0 },
    { day: "Saturday", amount: 0, trips: 0 },
    { day: "Sunday", amount: 0, trips: 0 },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/driver/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">EcoCredits</h1>
              <p className="text-muted-foreground">Track your earnings</p>
            </div>
          </div>

          <Button variant="outline">
            <Download className="mr-2 w-4 h-4" />
            Export
          </Button>
        </div>

        {/* Today's Summary */}
        <Card className="glass-card p-8 mb-8 animate-scale-in">
          <div className="text-center mb-6">
            <p className="text-sm text-muted-foreground mb-2">Today's Credits Earned</p>
            <p className="text-6xl font-bold text-primary mb-2">+455 EC</p>
            <div className="flex items-center justify-center gap-2 text-green-500">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm">+12% vs yesterday</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Trips</p>
              <p className="text-3xl font-bold">12</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">Credits per Trip</p>
              <p className="text-3xl font-bold">38 EC</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">CO₂ Saved</p>
              <p className="text-3xl font-bold text-green-500 flex items-center justify-center gap-2">
                <Leaf className="w-6 h-6" />
                45 kg
              </p>
            </div>
          </div>
        </Card>

        {/* This Week Summary */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">This Week</h2>
          <div className="space-y-4">
            {weeklyData.map((day) => (
              <div
                key={day.day}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/5 hover:bg-secondary/10 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Calendar className="w-5 h-5 text-primary" />
                  <span className="font-semibold">{day.day}</span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Trips</p>
                    <p className="font-semibold">{day.trips}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Credits</p>
                    <p className="text-xl font-bold text-primary">
                      {Math.floor(day.amount * 10)} EC
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Weekly Total</span>
              <span className="text-2xl font-bold text-primary">1,267 EC</span>
            </div>
          </div>
        </Card>

        {/* Redemption Section */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Redeem Credits</h2>
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">Available EcoCredits</p>
            <p className="text-4xl font-bold text-primary">4,503 EC</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="hero" size="lg">
              <Wallet className="mr-2 w-4 h-4" />
              Convert to Cash
            </Button>
            <Button variant="outline" size="lg">
              <CreditCard className="mr-2 w-4 h-4" />
              Shop Rewards
            </Button>
            <Button variant="outline" size="lg">
              <Leaf className="mr-2 w-4 h-4" />
              Plant Trees
            </Button>
          </div>
        </Card>

        {/* Trip History */}
        <Card className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Trip History</h2>
          <div className="space-y-4">
            {earningHistory.map((trip, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-secondary/5 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-semibold mb-1">{trip.route}</p>
                  <p className="text-sm text-muted-foreground">{trip.date}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground">Passengers</p>
                    <p className="font-semibold">{trip.passengers}</p>
                  </div>
                  <div className="text-right">
                    <Badge className="text-lg font-bold">
                      +{Math.floor(trip.amount * 10)} EC
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Earnings;
