import { Leaf, Trophy, TrendingUp } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface EcoWalletProps {
  credits: number;
  tier: "Bronze" | "Silver" | "Gold";
  co2Saved: number;
}

export const EcoWallet = ({ credits, tier, co2Saved }: EcoWalletProps) => {
  const tierColors = {
    Bronze: "text-accent",
    Silver: "text-muted-foreground",
    Gold: "text-accent",
  };

  const progress = (credits % 1000) / 10;

  return (
    <Card className="glass-card p-6 glow-primary animate-scale-in">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20 animate-glow-pulse">
              <Leaf className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">EcoCredits</p>
              <p className="text-3xl font-bold">{credits}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <Trophy className={`w-5 h-5 ${tierColors[tier]}`} />
              <span className={`text-lg font-semibold ${tierColors[tier]}`}>{tier}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Next tier progress</span>
            <span className="text-foreground font-medium">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="flex items-center gap-2 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
          <TrendingUp className="w-5 h-5 text-secondary" />
          <div>
            <p className="text-sm font-medium">CO₂ Saved</p>
            <p className="text-2xl font-bold text-secondary">{co2Saved} kg</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
