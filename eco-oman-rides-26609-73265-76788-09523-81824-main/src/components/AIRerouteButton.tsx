import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Loader2, CheckCircle } from "lucide-react";

interface AIRerouteButtonProps {
  routeId: string;
  attendance: Array<{
    id: string;
    student_id: string;
    status: "present" | "absent" | "pending";
    pickup_location: string;
  }>;
}

export const AIRerouteButton = ({ routeId, attendance }: AIRerouteButtonProps) => {
  const { toast } = useToast();
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [optimization, setOptimization] = useState<any>(null);

  const handleOptimizeRoute = async () => {
    setIsOptimizing(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-reroute', {
        body: { routeId, attendance }
      });

      if (error) throw error;

      setOptimization(data);
      toast({
        title: "Route Optimized! ✨",
        description: `Time saved: ${data.timeSaved}, Distance saved: ${data.distanceSaved}`,
      });
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: "Optimization Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Button
        onClick={handleOptimizeRoute}
        disabled={isOptimizing}
        className="w-full"
        variant="hero"
        size="lg"
      >
        {isOptimizing ? (
          <>
            <Loader2 className="mr-2 w-5 h-5 animate-spin" />
            AI Optimizing Route...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 w-5 h-5" />
            AI Optimize Route
          </>
        )}
      </Button>

      {optimization && (
        <Card className="glass-card p-6 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-bold">Optimized Route</h3>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Time Saved</p>
              <p className="text-2xl font-bold text-green-500">{optimization.timeSaved}</p>
            </div>
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Distance Saved</p>
              <p className="text-2xl font-bold text-blue-500">{optimization.distanceSaved}</p>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-semibold">New Route Order:</p>
            {optimization.optimizedRoute?.map((location: string, index: number) => (
              <div key={index} className="flex items-center gap-3 p-2 bg-background/50 rounded">
                <Badge variant="secondary">{index + 1}</Badge>
                <span>{location}</span>
              </div>
            ))}
          </div>

          {optimization.recommendations && optimization.recommendations.length > 0 && (
            <div className="mt-4 p-4 bg-primary/10 rounded-lg">
              <p className="font-semibold mb-2">AI Recommendations:</p>
              <ul className="space-y-1 text-sm">
                {optimization.recommendations.map((rec: string, index: number) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
