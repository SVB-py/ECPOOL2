import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, XCircle, Clock } from "lucide-react";

interface AttendanceMarkerProps {
  routeId: string;
  routeName: string;
  pickupTime: string;
}

export const AttendanceMarker = ({ routeId, routeName, pickupTime }: AttendanceMarkerProps) => {
  const { toast } = useToast();
  const [status, setStatus] = useState<'present' | 'absent' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    let isMounted = true;

    const fetchExistingAttendance = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          return;
        }

        const { data, error } = await supabase
          .from('attendance')
          .select('status')
          .eq('route_id', routeId)
          .eq('student_id', user.id)
          .eq('date', today)
          .maybeSingle();

        if (error) {
          console.error('Failed to fetch attendance', error);
          return;
        }

        if (data?.status && isMounted) {
          setStatus(data.status as 'present' | 'absent');
        }
      } catch (error) {
        console.error('Attendance prefetch failed', error);
      }
    };

    fetchExistingAttendance();

    return () => {
      isMounted = false;
    };
  }, [routeId, today]);

  const markAttendance = async (attendanceStatus: 'present' | 'absent') => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('attendance')
        .upsert({
          student_id: user.id,
          route_id: routeId,
          date: today,
          status: attendanceStatus,
          marked_at: new Date().toISOString(),
        });

      if (error) throw error;

      setStatus(attendanceStatus);
      
      // Trigger AI rerouting in background
      toast({
        title: "Attendance Marked",
        description: "Optimizing route based on attendance...",
      });

      // Get all attendance for this route today
      const { data: allAttendance } = await supabase
        .from('attendance')
        .select('*, routes!inner(driver_id)')
        .eq('route_id', routeId)
  .eq('date', today);

      if (allAttendance && allAttendance.length > 0) {
        // Call AI reroute function
        const { data: optimized, error: rerouteError } = await supabase.functions.invoke('ai-reroute', {
          body: { 
            routeId, 
            attendance: allAttendance 
          }
        });

        if (!rerouteError && optimized) {
          toast({
            title: "Route Optimized!",
            description: `Time saved: ${optimized.timeSaved}, Distance saved: ${optimized.distanceSaved}`,
          });
        }
      }

    } catch (error) {
      console.error('Error marking attendance:', error);
      toast({
        title: "Error",
        description: "Failed to mark attendance. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">{routeName}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pickup at {pickupTime}
          </p>
        </div>
        {status && (
          <Badge variant={status === 'present' ? 'default' : 'secondary'}>
            {status === 'present' ? '✓ Present' : '✗ Absent'}
          </Badge>
        )}
      </div>

      {!status ? (
        <div className="flex gap-3">
          <Button
            onClick={() => markAttendance('present')}
            disabled={isLoading}
            className="flex-1"
            variant="default"
          >
            <CheckCircle className="mr-2 w-4 h-4" />
            I'll Be There
          </Button>
          <Button
            onClick={() => markAttendance('absent')}
            disabled={isLoading}
            className="flex-1"
            variant="outline"
          >
            <XCircle className="mr-2 w-4 h-4" />
            Can't Make It
          </Button>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center">
          You can change your attendance status anytime before the ride.
        </p>
      )}
    </Card>
  );
};
