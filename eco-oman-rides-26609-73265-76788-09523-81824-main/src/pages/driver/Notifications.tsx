import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverBottomNav from "@/components/DriverBottomNav";
import {
  Bell,
  MapPin,
  DollarSign,
  Star,
  AlertTriangle,
  Wrench,
  Calendar,
  ArrowLeft,
  Check,
  Trash2,
} from "lucide-react";

const Notifications = () => {
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: "route",
      icon: MapPin,
      title: "New route assigned",
      description: "Route for tomorrow 7:00 AM",
      time: "5 mins ago",
      read: false,
    },
    {
      id: 2,
      type: "passenger",
      icon: Bell,
      title: "Ahmed is waiting",
      description: "At pickup point",
      time: "10 mins ago",
      read: false,
    },
    {
      id: 3,
      type: "payment",
      icon: DollarSign,
      title: "Payment received",
      description: "OMR 18.50 added to your wallet",
      time: "30 mins ago",
      read: true,
    },
    {
      id: 4,
      type: "rating",
      icon: Star,
      title: "New 5-star rating",
      description: "From Sarah Mohammed",
      time: "1 hour ago",
      read: true,
    },
    {
      id: 5,
      type: "alert",
      icon: AlertTriangle,
      title: "Route changed",
      description: "Due to traffic on Al Khuwair",
      time: "2 hours ago",
      read: true,
    },
    {
      id: 6,
      type: "maintenance",
      icon: Wrench,
      title: "Service reminder",
      description: "Vehicle service due in 15 days",
      time: "Today",
      read: true,
    },
    {
      id: 7,
      type: "schedule",
      icon: Calendar,
      title: "Schedule update",
      description: "New shift available Saturday",
      time: "Yesterday",
      read: true,
    },
  ];

  const getIconColor = (type: string) => {
    switch (type) {
      case "route":
        return "text-primary bg-primary/10";
      case "payment":
        return "text-green-500 bg-green-500/10";
      case "rating":
        return "text-yellow-500 bg-yellow-500/10";
      case "alert":
        return "text-red-500 bg-red-500/10";
      case "maintenance":
        return "text-orange-500 bg-orange-500/10";
      default:
        return "text-secondary bg-secondary/10";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto max-w-4xl p-6">
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
              <h1 className="text-4xl font-bold">Notifications</h1>
              <p className="text-muted-foreground">Stay updated</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Check className="mr-2 w-4 h-4" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              <Trash2 className="mr-2 w-4 h-4" />
              Clear All
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="routes">Routes</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
            <TabsTrigger value="ratings">Ratings</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Notifications List */}
        <div className="space-y-4">
          {notifications.map((notification, index) => {
            const Icon = notification.icon;
            return (
              <Card
                key={notification.id}
                className={`glass-card p-4 hover-scale animate-slide-up cursor-pointer ${
                  !notification.read ? "border-primary" : ""
                }`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-full ${getIconColor(notification.type)}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="font-bold text-lg">{notification.title}</h3>
                      {!notification.read && (
                        <Badge variant="default" className="ml-2">
                          New
                        </Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground mb-2">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {notification.time}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Notifications;
