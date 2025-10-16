import { Trophy, TrendingUp, Flame, Crown, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";

const Leaderboard = () => {
  const [activeTab, setActiveTab] = useState("week");
  const [filterRole, setFilterRole] = useState("all");

  const topThree = [
    {
      rank: 2,
      name: "Fatima Al-Zaabi",
      avatar: "👩",
      credits: 892,
      co2: 45.2,
      rides: 156,
      medal: "🥈",
      glow: "shadow-[0_0_30px_rgba(192,192,192,0.5)]",
    },
    {
      rank: 1,
      name: "Ahmed Al-Balushi",
      avatar: "👨",
      credits: 1247,
      co2: 78.5,
      rides: 234,
      medal: "🥇",
      badges: ["🌟 Eco Legend", "🔥 Hot Streak"],
      glow: "shadow-[0_0_40px_rgba(255,215,0,0.6)]",
    },
    {
      rank: 3,
      name: "Sara Mohammed",
      avatar: "👩‍🦱",
      credits: 756,
      co2: 38.9,
      rides: 142,
      medal: "🥉",
      glow: "shadow-[0_0_30px_rgba(205,127,50,0.5)]",
    },
  ];

  const rankings = [
    { rank: 4, name: "Mohammed Ali", avatar: "👨‍💼", role: "Driver", credits: 654, co2: 32.1, badges: ["🔥"] },
    { rank: 5, name: "Layla Hassan", avatar: "👩‍🎓", role: "Student", credits: 598, co2: 29.8, badges: [] },
    { rank: 6, name: "Omar Khalid", avatar: "👨‍🔧", role: "Driver", credits: 543, co2: 27.6, badges: ["⚡"] },
    { rank: 7, name: "Zainab Rashid", avatar: "👩‍💻", role: "Parent", credits: 487, co2: 24.3, badges: [] },
    { rank: 8, name: "Rashid Ahmed", avatar: "👨‍🏫", role: "Driver", credits: 432, co2: 21.7, badges: ["🔥"] },
    { rank: 9, name: "Aisha Salem", avatar: "👩‍⚕️", role: "Student", credits: 398, co2: 19.9, badges: ["⚡"] },
    { rank: 10, name: "Yusuf Ibrahim", avatar: "👨‍🎤", role: "Driver", credits: 365, co2: 18.4, badges: [] },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 md:pb-8">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-primary bg-clip-text text-transparent">
            🏆 EcoChampions
          </h1>
          <p className="text-xl text-muted-foreground">Top eco-warriors in Oman</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex justify-center gap-3 mb-8 flex-wrap">
          <Button
            variant={activeTab === "week" ? "hero" : "outline"}
            onClick={() => setActiveTab("week")}
            className="rounded-full"
          >
            This Week
          </Button>
          <Button
            variant={activeTab === "month" ? "hero" : "outline"}
            onClick={() => setActiveTab("month")}
            className="rounded-full"
          >
            This Month
          </Button>
          <Button
            variant={activeTab === "alltime" ? "hero" : "outline"}
            onClick={() => setActiveTab("alltime")}
            className="rounded-full"
          >
            All Time
          </Button>
        </div>

        {/* Top 3 Podium */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 max-w-5xl mx-auto">
          {/* 2nd Place */}
          <div className="md:order-1 order-2">
            <Card className={`glass-card p-6 text-center relative ${topThree[0].glow} animate-fade-in`}>
              <div className="text-4xl mb-2">{topThree[0].medal}</div>
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-4xl mb-3">
                {topThree[0].avatar}
              </div>
              <h3 className="text-xl font-bold mb-1">{topThree[0].name}</h3>
              <p className="text-3xl font-bold text-primary mb-2">{topThree[0].credits}</p>
              <p className="text-sm text-muted-foreground">CO₂ saved: {topThree[0].co2} kg</p>
              <p className="text-sm text-muted-foreground">{topThree[0].rides} trips</p>
            </Card>
          </div>

          {/* 1st Place */}
          <div className="md:order-2 order-1 md:scale-110">
            <Card className={`glass-card p-6 text-center relative ${topThree[1].glow} animate-scale-in`}>
              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-4xl animate-bounce">
                <Crown className="w-12 h-12 text-accent" />
              </div>
              <div className="text-5xl mb-2 mt-4">{topThree[1].medal}</div>
              <div className="w-28 h-28 mx-auto rounded-full bg-gradient-to-br from-yellow-300 to-yellow-600 flex items-center justify-center text-5xl mb-3 animate-glow-pulse">
                {topThree[1].avatar}
              </div>
              <h3 className="text-2xl font-bold mb-1 bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                {topThree[1].name}
              </h3>
              <p className="text-4xl font-bold text-primary mb-2">{topThree[1].credits}</p>
              <p className="text-sm text-primary font-bold">CO₂ saved: {topThree[1].co2} kg</p>
              <p className="text-sm text-muted-foreground">{topThree[1].rides} trips</p>
              <div className="flex gap-2 justify-center mt-3 flex-wrap">
                {topThree[1].badges?.map((badge, i) => (
                  <span key={i} className="text-xs bg-primary/20 px-2 py-1 rounded-full">
                    {badge}
                  </span>
                ))}
              </div>
            </Card>
          </div>

          {/* 3rd Place */}
          <div className="md:order-3 order-3">
            <Card className={`glass-card p-6 text-center relative ${topThree[2].glow} animate-fade-in`}>
              <div className="text-4xl mb-2">{topThree[2].medal}</div>
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-orange-300 to-orange-600 flex items-center justify-center text-4xl mb-3">
                {topThree[2].avatar}
              </div>
              <h3 className="text-xl font-bold mb-1">{topThree[2].name}</h3>
              <p className="text-3xl font-bold text-primary mb-2">{topThree[2].credits}</p>
              <p className="text-sm text-muted-foreground">CO₂ saved: {topThree[2].co2} kg</p>
              <p className="text-sm text-muted-foreground">{topThree[2].rides} trips</p>
            </Card>
          </div>
        </div>

        {/* Rankings 4-50 */}
        <Card className="glass-card p-6 max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Rankings</h2>
            <div className="flex gap-2">
              <select className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
                <option>By EcoCredits</option>
                <option>By CO₂ Saved</option>
                <option>By Rides</option>
              </select>
              <select className="bg-card border border-border rounded-lg px-3 py-2 text-sm">
                <option>All Roles</option>
                <option>Drivers Only</option>
                <option>Students Only</option>
              </select>
            </div>
          </div>

          <div className="space-y-3">
            {rankings.map((user) => (
              <div
                key={user.rank}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary/5 border border-transparent hover:border-primary transition-all cursor-pointer"
              >
                <div className="text-2xl font-bold text-muted-foreground w-8">#{user.rank}</div>
                <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-2xl">
                  {user.avatar}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">{user.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    user.role === "Driver" ? "bg-primary/20 text-primary" :
                    user.role === "Student" ? "bg-secondary/20 text-secondary" :
                    "bg-accent/20 text-accent"
                  }`}>
                    {user.role}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">💰 {user.credits}</p>
                  <p className="text-sm text-muted-foreground">🌿 {user.co2} kg</p>
                </div>
                <div className="flex gap-1">
                  {user.badges.map((badge, i) => (
                    <span key={i} className="text-xl">{badge}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Your Rank */}
        <Card className="glass-card p-6 max-w-4xl mx-auto mt-6 border-2 border-primary">
          <div className="flex items-center gap-4">
            <div className="text-3xl font-bold text-primary">Your Position: #23</div>
            <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-2xl">
              👤
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">Your EcoCredits: 156</h3>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-3/4"></div>
                  </div>
                  <span className="text-sm text-muted-foreground">15 from #20</span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center mt-4 text-primary font-semibold">Keep riding to climb! 🚀</p>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default Leaderboard;
