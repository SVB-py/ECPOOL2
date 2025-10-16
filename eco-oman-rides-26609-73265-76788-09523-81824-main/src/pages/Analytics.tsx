import { TrendingUp, Users, Leaf, Award, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

const Analytics = () => {
  const navigate = useNavigate();

  const leaderboardData = [
    { rank: 1, name: "Ahmed Al-Balushi", rides: 156, co2: 428, credits: 4850 },
    { rank: 2, name: "Fatima Al-Harthy", rides: 143, co2: 392, credits: 4320 },
    { rank: 3, name: "Mohammed Al-Lawati", rides: 128, co2: 351, credits: 3890 },
    { rank: 4, name: "Sara Ibrahim", rides: 115, co2: 315, credits: 3450 },
    { rank: 5, name: "Khalid Al-Hinai", rides: 98, co2: 268, credits: 2980 },
  ];

  const achievements = [
    { icon: "🌟", name: "Eco Champion", desc: "100+ rides completed" },
    { icon: "🌍", name: "Carbon Warrior", desc: "500kg CO₂ saved" },
    { icon: "⚡", name: "Early Adopter", desc: "First 100 users" },
    { icon: "🏆", name: "Top Driver", desc: "Monthly leader" },
  ];

  return (
    <div className="min-h-screen bg-background p-6 pb-24 md:pb-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <Home className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-4xl font-bold">Analytics & Leaderboard</h1>
            <p className="text-muted-foreground">Community impact & achievements</p>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card p-6 glow-primary animate-scale-in">
            <Users className="w-8 h-8 text-primary mb-3" />
            <p className="text-sm text-muted-foreground">Active Users</p>
            <p className="text-3xl font-bold">2,547</p>
            <p className="text-sm text-primary mt-2">↑ 12% this month</p>
          </Card>
          <Card className="glass-card p-6 glow-cyan animate-scale-in" style={{ animationDelay: '0.1s' }}>
            <TrendingUp className="w-8 h-8 text-secondary mb-3" />
            <p className="text-sm text-muted-foreground">Total Rides</p>
            <p className="text-3xl font-bold">8,342</p>
            <p className="text-sm text-secondary mt-2">↑ 18% this month</p>
          </Card>
          <Card className="glass-card p-6 glow-primary animate-scale-in" style={{ animationDelay: '0.2s' }}>
            <Leaf className="w-8 h-8 text-primary mb-3" />
            <p className="text-sm text-muted-foreground">CO₂ Saved</p>
            <p className="text-3xl font-bold">23.4T</p>
            <p className="text-sm text-primary mt-2">↑ 24% this month</p>
          </Card>
          <Card className="glass-card p-6 glow-accent animate-scale-in" style={{ animationDelay: '0.3s' }}>
            <Award className="w-8 h-8 text-accent mb-3" />
            <p className="text-sm text-muted-foreground">EcoCredits</p>
            <p className="text-3xl font-bold">94.2K</p>
            <p className="text-sm text-accent mt-2">↑ 15% this month</p>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <Card className="glass-card p-6 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Top Eco Warriors</h2>
                <Button variant="outline" size="sm">This Month</Button>
              </div>
              
              <div className="space-y-4">
                {leaderboardData.map((user, index) => (
                  <div 
                    key={user.rank}
                    className="glass-card p-4 flex items-center gap-4 hover-scale"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-xl ${
                      user.rank === 1 ? 'bg-accent/20 text-accent' :
                      user.rank === 2 ? 'bg-muted text-muted-foreground' :
                      user.rank === 3 ? 'bg-accent/10 text-accent/70' :
                      'bg-card text-foreground'
                    }`}>
                      {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : user.rank}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-semibold">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.rides} rides completed</p>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2 text-primary">
                        <Leaf className="w-4 h-4" />
                        <span className="font-bold">{user.co2} kg</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{user.credits} credits</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Achievements */}
          <div className="space-y-6">
            <Card className="glass-card p-6 animate-slide-up">
              <h2 className="text-2xl font-bold mb-6">Achievements</h2>
              <div className="space-y-4">
                {achievements.map((achievement, index) => (
                  <div 
                    key={index}
                    className="glass-card p-4 hover-scale"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-3xl">{achievement.icon}</div>
                      <div>
                        <p className="font-semibold">{achievement.name}</p>
                        <p className="text-sm text-muted-foreground">{achievement.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Monthly Impact */}
            <Card className="glass-card p-6 animate-scale-in">
              <h2 className="text-xl font-bold mb-4">Monthly Impact</h2>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Ride Goal</span>
                    <span className="text-sm font-semibold">842/1000</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-primary w-[84%]"></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">CO₂ Goal</span>
                    <span className="text-sm font-semibold">2.3T/3T</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-primary w-[76%]"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Analytics;
