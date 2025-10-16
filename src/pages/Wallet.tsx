import { useState } from "react";
import { Coins, TrendingUp, Gift, ArrowUpRight, ArrowDownLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";

const Wallet = () => {
  const [balance] = useState(156);
  const weeklyGain = 23;

  const earningMethods = [
    {
      icon: "🚗",
      title: "As Passenger",
      rate: "0.3 credits per km",
      example: "10 km ride = 3 credits",
      average: "12 km/day = 36 credits/month",
    },
    {
      icon: "🚙",
      title: "As Driver",
      rate: "0.5 credits per km",
      example: "10 km ride with 4 passengers = 5 credits",
      bonus: "+1 credit per passenger",
    },
    {
      icon: "👥",
      title: "Referral Bonus",
      rate: "10 credits per friend",
      example: "Refer friends and earn!",
      earned: "3 friends = 30 credits earned",
    },
    {
      icon: "⭐",
      title: "Bonus Activities",
      items: [
        "Daily login: +1 credit",
        "Complete profile: +5 credits",
        "First ride: +10 credits",
        "10 rides milestone: +20 credits",
      ],
    },
  ];

  const transactions = [
    {
      id: 1,
      type: "earned",
      description: "Completed ride to Indian School",
      details: "12 km • As passenger",
      amount: 3.6,
      date: "Oct 14, 7:30 AM",
      balance: 156,
    },
    {
      id: 2,
      type: "earned",
      description: "Driver bonus - Full carpool",
      details: "4 passengers",
      amount: 2,
      date: "Oct 13, 3:00 PM",
      balance: 152.4,
    },
    {
      id: 3,
      type: "spent",
      description: "Redeemed for fuel voucher",
      details: "Shell station",
      amount: -20,
      date: "Oct 12, 10:15 AM",
      balance: 150.4,
    },
    {
      id: 4,
      type: "earned",
      description: "Referral bonus",
      details: "Friend Sara joined",
      amount: 10,
      date: "Oct 11, 9:00 AM",
      balance: 170.4,
    },
    {
      id: 5,
      type: "earned",
      description: "Completed ride from Seeb",
      details: "8 km • As passenger",
      amount: 2.4,
      date: "Oct 10, 7:45 AM",
      balance: 160.4,
    },
  ];

  const redeemOptions = [
    {
      icon: "⛽",
      title: "Fuel Vouchers",
      description: "20 credits = 1 OMR fuel",
      minimum: "Minimum: 40 credits",
      popular: true,
    },
    {
      icon: "☕",
      title: "Coffee/Food",
      description: "10 credits = Free coffee",
      extra: "50 credits = Meal voucher",
    },
    {
      icon: "🌳",
      title: "Plant Trees",
      description: "25 credits = Plant 1 tree in Oman",
      impact: "Offset 10kg CO₂/year",
    },
    {
      icon: "❤️",
      title: "Charity Donation",
      description: "Donate to Oman Charity",
      custom: "Custom amount",
    },
    {
      icon: "👑",
      title: "Premium Upgrade",
      description: "100 credits = 1 month Premium",
      features: "Unlimited rides, 2x earning rate",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-gradient-primary p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">💰 EcoWallet</h1>
        <p className="text-muted-foreground">Your sustainable savings</p>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        {/* Balance Card */}
        <Card className="glass-card p-8 text-center mb-6 animate-scale-in">
          <div className="mb-4">
            <Coins className="w-12 h-12 mx-auto text-accent animate-glow-pulse" />
          </div>
          <div className="text-6xl font-bold text-accent mb-2">{balance}</div>
          <div className="text-lg text-muted-foreground mb-4">
            EcoCredits
          </div>
          <div className="text-sm text-muted-foreground mb-4">
            = {(balance * 0.05).toFixed(2)} OMR
          </div>
          <div className="flex items-center justify-center gap-2 text-primary">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">↑ +{weeklyGain} this week</span>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-3 mt-6">
            <Button variant="hero" className="flex-1">
              Redeem Credits
            </Button>
            <Button variant="secondary" className="flex-1">
              Earn More
            </Button>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="earn" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="earn">💚 Earn</TabsTrigger>
            <TabsTrigger value="history">📊 History</TabsTrigger>
            <TabsTrigger value="redeem">🎁 Redeem</TabsTrigger>
          </TabsList>

          {/* Earn Tab */}
          <TabsContent value="earn" className="space-y-4">
            <h2 className="text-2xl font-bold mb-4">How to Earn</h2>
            {earningMethods.map((method, index) => (
              <Card key={index} className="glass-card p-6 hover-scale">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{method.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">{method.title}</h3>
                    <div className="space-y-1 text-sm">
                      <p className="text-primary font-medium">{method.rate}</p>
                      <p className="text-muted-foreground">{method.example}</p>
                      {method.average && (
                        <p className="text-muted-foreground">{method.average}</p>
                      )}
                      {method.bonus && (
                        <p className="text-secondary">{method.bonus}</p>
                      )}
                      {method.earned && (
                        <p className="text-primary">{method.earned}</p>
                      )}
                      {method.items && (
                        <ul className="space-y-1 mt-2">
                          {method.items.map((item, i) => (
                            <li key={i} className="text-muted-foreground">• {item}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">Recent Transactions</h2>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>

            {transactions.map((transaction) => (
              <Card key={transaction.id} className="glass-card p-4 hover-scale">
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-full ${
                      transaction.type === "earned"
                        ? "bg-primary/20"
                        : "bg-destructive/20"
                    }`}
                  >
                    {transaction.type === "earned" ? (
                      <ArrowDownLeft className="w-5 h-5 text-primary" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{transaction.description}</h4>
                    <p className="text-sm text-muted-foreground">
                      {transaction.details}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {transaction.date} • Balance: {transaction.balance}
                    </p>
                  </div>
                  <div
                    className={`text-xl font-bold ${
                      transaction.type === "earned"
                        ? "text-primary"
                        : "text-destructive"
                    }`}
                  >
                    {transaction.amount > 0 ? "+" : ""}
                    {transaction.amount}
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Redeem Tab */}
          <TabsContent value="redeem" className="space-y-4">
            <div className="mb-4">
              <h2 className="text-2xl font-bold mb-2">Redeem Your Credits</h2>
              <p className="text-sm text-muted-foreground">
                1 credit = 0.05 OMR value
              </p>
            </div>

            {redeemOptions.map((option, index) => (
              <Card key={index} className="glass-card p-6 hover-scale">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{option.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-xl font-bold">{option.title}</h3>
                      {option.popular && (
                        <Badge className="bg-accent text-accent-foreground">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm font-medium text-primary mb-1">
                      {option.description}
                    </p>
                    {option.minimum && (
                      <p className="text-xs text-muted-foreground">
                        {option.minimum}
                      </p>
                    )}
                    {option.extra && (
                      <p className="text-xs text-muted-foreground">
                        {option.extra}
                      </p>
                    )}
                    {option.impact && (
                      <p className="text-xs text-secondary">{option.impact}</p>
                    )}
                    {option.custom && (
                      <p className="text-xs text-muted-foreground">
                        {option.custom}
                      </p>
                    )}
                    {option.features && (
                      <p className="text-xs text-muted-foreground">
                        {option.features}
                      </p>
                    )}
                  </div>
                  <Button variant="default" size="sm">
                    Redeem
                  </Button>
                </div>
              </Card>
            ))}
          </TabsContent>
        </Tabs>

        {/* Statistics Card */}
        <Card className="glass-card p-6 mt-6 mb-8">
          <h3 className="text-xl font-bold mb-4">📈 Your Earnings Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold text-primary">456</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold text-destructive">300</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Earning Rate</p>
              <p className="text-2xl font-bold">15/week</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projected Monthly</p>
              <p className="text-2xl font-bold text-secondary">60</p>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Wallet;
