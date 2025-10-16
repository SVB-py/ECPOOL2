import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Clock, Users, TrendingUp, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AttendanceRecord {
  id: string;
  student_id: string;
  route_id: string;
  date: string;
  status: 'present' | 'absent';
  marked_at: string;
  location?: any;
}

interface RouteWithAttendance {
  id: string;
  route_name: string;
  start_location: string;
  end_location: string;
  start_time: string;
  passenger_count: number;
  attendance: AttendanceRecord[];
}

const Attendance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [routes, setRoutes] = useState<RouteWithAttendance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendanceData();
  }, [selectedDate]);

  const fetchAttendanceData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/driver-login");
        return;
      }

      // Get driver's info
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!driver) return;

      // Get driver's routes with attendance
      const { data: routesData, error } = await supabase
        .from('routes')
        .select(`
          *,
          attendance!inner(*)
        `)
        .eq('driver_id', driver.id)
        .eq('attendance.date', selectedDate);

      if (error) throw error;

      // Group attendance by route
      const routesWithAttendance: RouteWithAttendance[] = [];
      const routeMap = new Map();

      routesData?.forEach((item: any) => {
        if (!routeMap.has(item.id)) {
          routeMap.set(item.id, {
            id: item.id,
            route_name: item.route_name,
            start_location: item.start_location,
            end_location: item.end_location,
            start_time: item.start_time,
            passenger_count: item.passenger_count,
            attendance: []
          });
        }
        
        if (item.attendance) {
          routeMap.get(item.id).attendance.push(item.attendance);
        }
      });

      setRoutes(Array.from(routeMap.values()));
    } catch (error) {
      console.error('Error fetching attendance:', error);
      toast({
        title: "Error",
        description: "Failed to load attendance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const triggerReroute = async (routeId: string) => {
    try {
      toast({
        title: "Optimizing Route",
        description: "AI is analyzing attendance to optimize your route...",
      });

      const route = routes.find(r => r.id === routeId);
      if (!route) return;

      const { data, error } = await supabase.functions.invoke('ai-reroute', {
        body: { 
          routeId, 
          attendance: route.attendance 
        }
      });

      if (error) throw error;

      toast({
        title: "Route Optimized!",
        description: `Time saved: ${data.timeSaved}, Distance saved: ${data.distanceSaved}`,
      });
    } catch (error) {
      console.error('Error optimizing route:', error);
      toast({
        title: "Error",
        description: "Failed to optimize route",
        variant: "destructive",
      });
    }
  };

  const getAttendanceStats = (attendance: AttendanceRecord[]) => {
    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const total = attendance.length;
    const rate = total > 0 ? Math.round((present / total) * 100) : 0;
    
    return { present, absent, total, rate };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading attendance...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/driver")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Student Attendance</h1>
              <p className="text-muted-foreground">Track and manage daily attendance</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 rounded-lg border bg-card text-foreground"
            />
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {routes.map(route => {
            const stats = getAttendanceStats(route.attendance);
            return (
              <Card key={route.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-2">
                  <Users className="w-5 h-5 text-primary" />
                  <Badge variant={stats.rate >= 80 ? "default" : "secondary"}>
                    {stats.rate}%
                  </Badge>
                </div>
                <h3 className="font-semibold text-sm">{route.route_name}</h3>
                <p className="text-xs text-muted-foreground">
                  {stats.present} present, {stats.absent} absent
                </p>
              </Card>
            );
          })}
        </div>

        {/* Routes with Attendance */}
        <Tabs defaultValue={routes[0]?.id} className="w-full">
          <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${routes.length}, 1fr)` }}>
            {routes.map(route => (
              <TabsTrigger key={route.id} value={route.id}>
                {route.route_name}
              </TabsTrigger>
            ))}
          </TabsList>

          {routes.map(route => {
            const stats = getAttendanceStats(route.attendance);
            
            return (
              <TabsContent key={route.id} value={route.id} className="space-y-4">
                {/* Route Info Card */}
                <Card className="glass-card p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold">{route.route_name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {route.start_location} → {route.end_location}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        <Clock className="inline w-3 h-3 mr-1" />
                        Departure: {new Date(route.start_time).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button variant="hero" onClick={() => triggerReroute(route.id)}>
                      <TrendingUp className="mr-2 w-4 h-4" />
                      Optimize Route
                    </Button>
                  </div>

                  {/* Attendance Stats */}
                  <div className="grid grid-cols-3 gap-4 p-4 rounded-lg bg-card/50 border">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-500">{stats.present}</p>
                      <p className="text-xs text-muted-foreground">Present</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-500">{stats.absent}</p>
                      <p className="text-xs text-muted-foreground">Absent</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold">{stats.rate}%</p>
                      <p className="text-xs text-muted-foreground">Rate</p>
                    </div>
                  </div>
                </Card>

                {/* Attendance List */}
                <div className="space-y-3">
                  <h4 className="font-semibold">Student Attendance Details</h4>
                  {route.attendance.length === 0 ? (
                    <Card className="glass-card p-6 text-center">
                      <Calendar className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                      <p className="text-muted-foreground">No attendance marked yet</p>
                    </Card>
                  ) : (
                    route.attendance.map((record) => (
                      <Card key={record.id} className="glass-card p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            {record.status === 'present' ? (
                              <CheckCircle className="w-5 h-5 text-green-500" />
                            ) : (
                              <XCircle className="w-5 h-5 text-red-500" />
                            )}
                            <div>
                              <p className="font-medium">Student ID: {record.student_id.slice(0, 8)}...</p>
                              <p className="text-sm text-muted-foreground">
                                Marked at {new Date(record.marked_at).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={record.status === 'present' ? "default" : "secondary"}
                            className={record.status === 'present' 
                              ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                              : 'bg-red-500/10 text-red-500 border-red-500/20'
                            }
                          >
                            {record.status === 'present' ? 'Present' : 'Absent'}
                          </Badge>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>
            );
          })}
        </Tabs>
      </div>
    </div>
  );
};

export default Attendance;