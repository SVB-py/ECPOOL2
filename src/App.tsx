import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Splash from "./pages/Splash";
import RoleSelection from "./pages/RoleSelection";
import Onboarding from "./pages/Onboarding";
import Auth from "./pages/Auth";
import Driver from "./pages/Driver";
import Student from "./pages/Student";
import OldDriverProfile from "./pages/DriverProfile";
import StudentProfile from "./pages/StudentProfile";
import StudentAttendance from "./pages/StudentAttendance";
import Analytics from "./pages/Analytics";
import DriverVerification from "./pages/DriverVerification";
import Tracking from "./pages/Tracking";
import LiveTracking from "./pages/LiveTracking";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ModeSelection from "./pages/ModeSelection";
import Leaderboard from "./pages/Leaderboard";
import RequestRide from "./pages/RequestRide";
import OfferRide from "./pages/OfferRide";
import MyVehicles from "./pages/MyVehicles";
import Wallet from "./pages/Wallet";
import DriverLogin from "./pages/DriverLogin";
import DriverDashboard from "./pages/driver/Dashboard";
import DriverRoutes from "./pages/driver/Routes";
import DriverEarnings from "./pages/driver/Earnings";
import DriverPassengers from "./pages/driver/Passengers";
import DriverVehicle from "./pages/driver/Vehicle";
import DriverNavigation from "./pages/driver/Navigation";
import DriverStats from "./pages/driver/Stats";
import DriverNotifications from "./pages/driver/Notifications";
import DriverProfile from "./pages/driver/Profile";
import DriverEmergency from "./pages/driver/Emergency";
import DriverMessages from "./pages/driver/Messages";
import DriverSchedule from "./pages/driver/Schedule";
import DriverAttendance from "./pages/driver/Attendance";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/splash" element={<Splash />} />
          <Route path="/role-selection" element={<RoleSelection />} />
          <Route path="/onboarding" element={<Onboarding />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/driver" element={<Driver />} />
          <Route path="/student" element={<Student />} />
          <Route path="/student-attendance" element={<StudentAttendance />} />
          <Route path="/driver-profile" element={<OldDriverProfile />} />
          <Route path="/student-profile" element={<StudentProfile />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/driver-verification" element={<DriverVerification />} />
          <Route path="/live-tracking" element={<LiveTracking />} />
          <Route path="/tracking" element={<Tracking />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/mode-selection" element={<ModeSelection />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/request-ride" element={<RequestRide />} />
          <Route path="/offer-ride" element={<OfferRide />} />
          <Route path="/my-vehicles" element={<MyVehicles />} />
          <Route path="/wallet" element={<Wallet />} />
          <Route path="/driver-login" element={<DriverLogin />} />
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/routes" element={<DriverRoutes />} />
          <Route path="/driver/earnings" element={<DriverEarnings />} />
          <Route path="/driver/passengers" element={<DriverPassengers />} />
          <Route path="/driver/vehicle" element={<DriverVehicle />} />
          <Route path="/driver/navigation" element={<DriverNavigation />} />
          <Route path="/driver/stats" element={<DriverStats />} />
          <Route path="/driver/notifications" element={<DriverNotifications />} />
          <Route path="/driver/profile" element={<DriverProfile />} />
          <Route path="/driver/emergency" element={<DriverEmergency />} />
          <Route path="/driver/messages" element={<DriverMessages />} />
          <Route path="/driver/schedule" element={<DriverSchedule />} />
          <Route path="/driver/attendance" element={<DriverAttendance />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
