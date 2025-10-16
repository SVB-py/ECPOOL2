import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import DriverBottomNav from "@/components/DriverBottomNav";
import { useToast } from "@/hooks/use-toast";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Plus,
  Users,
} from "lucide-react";

const Schedule = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [date, setDate] = useState<Date | undefined>(new Date());

  const weeklySchedule = [
    {
      day: "Monday",
      date: "Oct 14",
      shifts: [
        {
          time: "7:00 AM - 3:00 PM",
          routes: 3,
          status: "completed",
          earnings: "OMR 42.30",
        },
      ],
    },
    {
      day: "Tuesday",
      date: "Oct 15",
      shifts: [
        {
          time: "7:00 AM - 3:00 PM",
          routes: 3,
          status: "completed",
          earnings: "OMR 38.90",
        },
      ],
    },
    {
      day: "Wednesday",
      date: "Oct 16",
      shifts: [
        {
          time: "7:00 AM - 3:00 PM",
          routes: 3,
          status: "active",
          earnings: "OMR 45.50",
        },
      ],
    },
    {
      day: "Thursday",
      date: "Oct 17",
      shifts: [],
      status: "off",
    },
    {
      day: "Friday",
      date: "Oct 18",
      shifts: [
        {
          time: "2:00 PM - 8:00 PM",
          routes: 2,
          status: "scheduled",
          earnings: "OMR 25.00 est.",
        },
      ],
    },
    {
      day: "Saturday",
      date: "Oct 19",
      shifts: [
        {
          time: "7:00 AM - 12:00 PM",
          routes: 2,
          status: "scheduled",
          earnings: "OMR 20.00 est.",
        },
      ],
    },
    {
      day: "Sunday",
      date: "Oct 20",
      shifts: [],
      status: "off",
    },
  ];

  const availableShifts = [
    {
      id: 1,
      day: "Thursday",
      date: "Oct 17",
      time: "7:00 AM - 2:00 PM",
      routes: 3,
      estimatedEarnings: "OMR 35.00",
    },
    {
      id: 2,
      day: "Sunday",
      date: "Oct 20",
      time: "8:00 AM - 1:00 PM",
      routes: 2,
      estimatedEarnings: "OMR 22.00",
    },
  ];

  const handleRequestDayOff = () => {
    toast({
      title: "Day Off Requested",
      description: "Your request has been submitted for approval",
    });
  };

  const handlePickupShift = (shiftId: number) => {
    toast({
      title: "Shift Added!",
      description: "New shift has been added to your schedule",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "active":
        return <Badge className="bg-blue-500">Active</Badge>;
      case "scheduled":
        return <Badge variant="secondary">Scheduled</Badge>;
      default:
        return null;
    }
  };

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
              <h1 className="text-4xl font-bold">Schedule Management</h1>
              <p className="text-muted-foreground">Manage your shifts and routes</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleRequestDayOff}>
              <CalendarIcon className="mr-2 w-4 h-4" />
              Request Day Off
            </Button>
            <Button variant="hero">
              <RefreshCw className="mr-2 w-4 h-4" />
              Swap Shift
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="glass-card p-6">
            <h2 className="text-xl font-bold mb-4">Calendar</h2>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </Card>

          {/* Weekly Schedule */}
          <div className="md:col-span-2 space-y-6">
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6">This Week's Schedule</h2>
              <div className="space-y-4">
                {weeklySchedule.map((daySchedule, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      daySchedule.day === "Wednesday"
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-bold text-lg">{daySchedule.day}</p>
                        <p className="text-sm text-muted-foreground">
                          {daySchedule.date}
                        </p>
                      </div>
                      {daySchedule.status === "off" ? (
                        <Badge variant="secondary">OFF</Badge>
                      ) : null}
                    </div>

                    {daySchedule.shifts.length > 0 ? (
                      <div className="space-y-3 mt-4">
                        {daySchedule.shifts.map((shift, shiftIndex) => (
                          <div
                            key={shiftIndex}
                            className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg"
                          >
                            <div className="flex items-center gap-4">
                              <Clock className="w-5 h-5 text-primary" />
                              <div>
                                <p className="font-semibold">{shift.time}</p>
                                <p className="text-sm text-muted-foreground">
                                  {shift.routes} routes
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-primary font-bold">
                                {shift.earnings}
                              </span>
                              {getStatusBadge(shift.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : daySchedule.status !== "off" ? (
                      <p className="text-sm text-muted-foreground mt-2">
                        No shifts scheduled
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </Card>

            {/* Available Shifts */}
            <Card className="glass-card p-6">
              <h2 className="text-2xl font-bold mb-6">Available Shifts to Pick Up</h2>
              <div className="space-y-4">
                {availableShifts.map((shift) => (
                  <div
                    key={shift.id}
                    className="p-4 rounded-lg border border-border hover:bg-secondary/5 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-bold text-lg">
                          {shift.day}, {shift.date}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {shift.time}
                          </span>
                          <span className="text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            {shift.routes} routes
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Estimated</p>
                        <p className="text-xl font-bold text-primary">
                          {shift.estimatedEarnings}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="hero"
                      size="sm"
                      className="w-full"
                      onClick={() => handlePickupShift(shift.id)}
                    >
                      <Plus className="mr-2 w-4 h-4" />
                      Pick Up This Shift
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Schedule;
