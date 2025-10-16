import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DriverBottomNav from "@/components/DriverBottomNav";
import {
  TrendingUp,
  Award,
  Target,
  Users,
  Clock,
  Route,
  ArrowLeft,
  Download,
} from "lucide-react";

const Stats = () => {
  const navigate = useNavigate();

  const achievements = [
    {
      icon: "🏆",
      name: "100 Trips Milestone",
      description: "Complete 100 trips",
      progress: 100,
      reward: "+50 OMR bonus",
      unlocked: true,
    },
    {
      icon: "⭐",
      name: "5-Star Master",
      description: "Get 10 perfect ratings",
      progress: 100,
      reward: "Gold badge",
      unlocked: true,
    },
    {
      icon: "⏰",
      name: "Always On Time",
      description: "95%+ punctuality",
      progress: 94,
      reward: "Premium badge",
      unlocked: false,
    },
    {
      icon: "🌍",
      name: "Eco Warrior",
      description: "Save 500kg CO₂",
      progress: 100,
      reward: "Green badge",
      unlocked: true,
    },
  ];

  const leaderboard = [
    { rank: 1, name: "Hassan Ali", trips: 267, earnings: "OMR 2,450" },
    { rank: 2, name: "Fatima Said", trips: 245, earnings: "OMR 2,280" },
    { rank: 3, name: "You (Ahmed)", trips: 245, earnings: "OMR 1,450" },
    { rank: 4, name: "Omar Khalid", trips: 198, earnings: "OMR 1,890" },
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
              <h1 className="text-4xl font-bold">Performance & Analytics</h1>
              <p className="text-muted-foreground">Track your progress</p>
            </div>
          </div>

          <Button variant="outline">
            <Download className="mr-2 w-4 h-4" />
            Export Report
          </Button>
        </div>

        {/* Monthly Summary */}
        <Card className="glass-card p-8 mb-8 animate-scale-in">
          <h2 className="text-2xl font-bold mb-6">This Month Summary</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <Route className="w-8 h-8 mx-auto mb-2 text-primary" />
              <p className="text-3xl font-bold">245</p>
              <p className="text-sm text-muted-foreground">Total Trips</p>
            </div>
            <div className="text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <p className="text-3xl font-bold text-primary">OMR 1,450</p>
              <p className="text-sm text-muted-foreground">Total Earnings</p>
            </div>
            <div className="text-center">
              <Award className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <p className="text-3xl font-bold">4.8</p>
              <p className="text-sm text-muted-foreground">Average Rating</p>
            </div>
            <div className="text-center">
              <Target className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <p className="text-3xl font-bold">94%</p>
              <p className="text-sm text-muted-foreground">On-Time</p>
            </div>
          </div>
        </Card>

        {/* Achievements */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Achievements Unlocked</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-6 rounded-xl border ${
                  achievement.unlocked
                    ? "border-primary bg-primary/5"
                    : "border-border bg-secondary/5"
                }`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold">{achievement.name}</h3>
                      {achievement.unlocked && (
                        <Badge className="bg-green-500">Unlocked</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {achievement.description}
                    </p>
                    <p className="text-sm text-yellow-500 font-semibold">
                      {achievement.reward}
                    </p>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Progress</span>
                    <span className="text-sm font-bold">{achievement.progress}%</span>
                  </div>
                  <Progress value={achievement.progress} className="h-2" />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Leaderboard */}
        <Card className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Top Drivers This Month</h2>
            <Button variant="outline" size="sm">
              View Full Leaderboard
            </Button>
          </div>
          <div className="space-y-4">
            {leaderboard.map((driver) => (
              <div
                key={driver.rank}
                className={`p-4 rounded-lg border ${
                  driver.name.includes("You")
                    ? "border-primary bg-primary/10"
                    : "border-border"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex items-center justify-center w-12 h-12 rounded-full ${
                        driver.rank === 1
                          ? "bg-yellow-500"
                          : driver.rank === 2
                          ? "bg-gray-400"
                          : driver.rank === 3
                          ? "bg-orange-500"
                          : "bg-secondary"
                      }`}
                    >
                      <span className="text-2xl font-bold">#{driver.rank}</span>
                    </div>
                    <div>
                      <p className="font-bold text-lg">{driver.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {driver.trips} trips
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-primary">
                      {driver.earnings}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Additional Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card p-6">
            <Users className="w-8 h-8 mb-3 text-primary" />
            <p className="text-3xl font-bold mb-1">4,890</p>
            <p className="text-sm text-muted-foreground">Passengers Served</p>
          </Card>
          <Card className="glass-card p-6">
            <Clock className="w-8 h-8 mb-3 text-secondary" />
            <p className="text-3xl font-bold mb-1">22</p>
            <p className="text-sm text-muted-foreground">Active Days</p>
          </Card>
          <Card className="glass-card p-6">
            <Route className="w-8 h-8 mb-3 text-accent" />
            <p className="text-3xl font-bold mb-1">1,850 km</p>
            <p className="text-sm text-muted-foreground">Total Distance</p>
          </Card>
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Stats;
