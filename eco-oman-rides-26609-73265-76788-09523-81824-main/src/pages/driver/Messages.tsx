import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import DriverBottomNav from "@/components/DriverBottomNav";
import {
  MessageCircle,
  Phone,
  Send,
  ArrowLeft,
  HelpCircle,
  FileText,
  AlertCircle,
  Clock,
} from "lucide-react";

const Messages = () => {
  const navigate = useNavigate();
  const [messageText, setMessageText] = useState("");

  const chats = [
    {
      id: 1,
      name: "Support Team",
      lastMessage: "Your issue is resolved",
      time: "10m ago",
      unread: 0,
      avatar: "🛠️",
    },
    {
      id: 2,
      name: "Ahmed (Passenger)",
      lastMessage: "I'm running 5 mins late",
      time: "30m ago",
      unread: 1,
      avatar: "👨‍🎓",
    },
    {
      id: 3,
      name: "Sarah (Passenger)",
      lastMessage: "Thank you for the ride!",
      time: "1h ago",
      unread: 0,
      avatar: "👩‍🎓",
    },
    {
      id: 4,
      name: "Admin",
      lastMessage: "New route assigned",
      time: "2h ago",
      unread: 0,
      avatar: "👤",
    },
  ];

  const quickReplies = [
    "On my way",
    "Arrived",
    "Running late",
    "Thank you",
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto max-w-6xl p-6">
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
              <h1 className="text-4xl font-bold">Messages & Support</h1>
              <p className="text-muted-foreground">Chat and get help</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Chat List */}
          <div className="md:col-span-1">
            <Card className="glass-card p-4">
              <h2 className="text-xl font-bold mb-4">Chats</h2>
              <div className="space-y-2">
                {chats.map((chat) => (
                  <button
                    key={chat.id}
                    className="w-full p-4 rounded-lg border border-border hover:bg-secondary/10 transition-colors text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-4xl">{chat.avatar}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold truncate">{chat.name}</p>
                          {chat.unread > 0 && (
                            <Badge variant="default" className="ml-2">
                              {chat.unread}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {chat.lastMessage}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {chat.time}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Chat Window */}
          <div className="md:col-span-2">
            <Card className="glass-card p-6">
              {/* Chat Header */}
              <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-4xl">🛠️</div>
                  <div>
                    <p className="font-bold text-lg">Support Team</p>
                    <p className="text-sm text-green-500">Online</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Phone className="w-4 h-4" />
                </Button>
              </div>

              {/* Messages */}
              <div className="space-y-4 mb-4 min-h-[400px] max-h-[400px] overflow-y-auto">
                <div className="flex justify-start">
                  <div className="bg-secondary/20 rounded-lg p-3 max-w-[80%]">
                    <p>Hello! How can we help you today?</p>
                    <p className="text-xs text-muted-foreground mt-1">2:30 PM</p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <div className="bg-primary/20 rounded-lg p-3 max-w-[80%]">
                    <p>I need help with my route schedule</p>
                    <p className="text-xs text-muted-foreground mt-1">2:32 PM</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-secondary/20 rounded-lg p-3 max-w-[80%]">
                    <p>
                      I can help you with that! Let me check your current schedule.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">2:33 PM</p>
                  </div>
                </div>

                <div className="flex justify-start">
                  <div className="bg-secondary/20 rounded-lg p-3 max-w-[80%]">
                    <p>Your issue has been resolved. Is there anything else?</p>
                    <p className="text-xs text-muted-foreground mt-1">2:45 PM</p>
                  </div>
                </div>
              </div>

              {/* Quick Replies */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {quickReplies.map((reply, index) => (
                  <Button key={index} variant="outline" size="sm">
                    {reply}
                  </Button>
                ))}
              </div>

              {/* Message Input */}
              <div className="flex gap-2">
                <Input
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
                <Button size="icon" variant="hero">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>

            {/* Support Section */}
            <Card className="glass-card p-6 mt-6">
              <h2 className="text-xl font-bold mb-4">Support</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" size="lg" className="h-auto p-4 justify-start">
                  <HelpCircle className="w-6 h-6 mr-3 text-primary" />
                  <div className="text-left">
                    <p className="font-semibold">FAQs</p>
                    <p className="text-xs text-muted-foreground">
                      Find quick answers
                    </p>
                  </div>
                </Button>

                <Button variant="outline" size="lg" className="h-auto p-4 justify-start">
                  <FileText className="w-6 h-6 mr-3 text-secondary" />
                  <div className="text-left">
                    <p className="font-semibold">Report a Problem</p>
                    <p className="text-xs text-muted-foreground">
                      Get technical help
                    </p>
                  </div>
                </Button>

                <Button variant="outline" size="lg" className="h-auto p-4 justify-start">
                  <Clock className="w-6 h-6 mr-3 text-accent" />
                  <div className="text-left">
                    <p className="font-semibold">Schedule Change</p>
                    <p className="text-xs text-muted-foreground">
                      Request updates
                    </p>
                  </div>
                </Button>

                <Button variant="outline" size="lg" className="h-auto p-4 justify-start">
                  <AlertCircle className="w-6 h-6 mr-3 text-orange-500" />
                  <div className="text-left">
                    <p className="font-semibold">Technical Issue</p>
                    <p className="text-xs text-muted-foreground">
                      Report bugs
                    </p>
                  </div>
                </Button>
              </div>

              <div className="mt-6 p-4 bg-primary/10 rounded-lg text-center">
                <p className="font-semibold mb-2">Need immediate help?</p>
                <Button variant="hero">
                  <Phone className="mr-2 w-4 h-4" />
                  Call Support: +968 2456 7890
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Messages;
