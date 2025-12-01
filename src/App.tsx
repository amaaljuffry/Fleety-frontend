import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/contexts/AuthContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { Layout } from "@/components/Layout";
import { FAQAssistant } from "@/components/FAQAssistant";
import { DashboardHome } from "./pages/DashboardHome";
import { VehiclesPage } from "./pages/VehiclesPage";
import { MaintenancePage } from "./pages/MaintenancePage";
import { RemindersPage } from "./pages/RemindersPage";
import { ReportsPage } from "./pages/ReportsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { FAQPage } from "./pages/FAQPage";
import { ContactSupport } from "./pages/ContactSupport";
import { Terms } from "./pages/Terms";
import { Privacy } from "./pages/Privacy";
import VehicleDetails from "./pages/VehicleDetails";
import VehicleForm from "./pages/VehicleForm";
import MaintenanceForm from "./pages/MaintenanceForm";
import ReminderForm from "./pages/ReminderForm";
import { DriversPage } from "./pages/DriversPage";
import { DriverForm } from "./pages/DriverForm";
import { FuelTrackingPage } from "./pages/FuelTrackingPage";
import { FuelForm } from "./pages/FuelForm";
import { AddFuelLogPage } from "./pages/AddFuelLogPage";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/Login";
import SignupPage from "./pages/Auth";
import WelcomeDashboard from "./pages/WelcomeDashboard";
import ResetPasswordPage from "./pages/ResetPassword";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Careers from "./pages/Careers";
import Blog from "./pages/Blog";
import Contact from "./pages/Contact";
import Waitlist from "./pages/Waitlist";
import LiveTracking from "./pages/LiveTracking";
import CheckoutCancelled from "./pages/CheckoutCancelled";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import { BillingPage } from "./pages/BillingPage";
import Pricing from "./components/Pricing";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SubscriptionProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
            {/* Public Routes - Landing Page */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<About />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/waitlist" element={<Waitlist />} />
            <Route path="/checkout/cancelled" element={<CheckoutCancelled />} />
            <Route path="/checkout/success" element={<CheckoutSuccess />} />
            <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth" element={<SignupPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/welcome" element={<WelcomeDashboard />} />

          {/* Protected Routes with Layout - Requires Active Subscription */}
          <Route
            element={
              <ProtectedRoute requireSubscription>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<DashboardHome />} />
            <Route path="/vehicles" element={<VehiclesPage />} />
            <Route path="/vehicles/new" element={<VehicleForm />} />
            <Route path="/vehicles/:id" element={<VehicleDetails />} />
            <Route path="/vehicles/:id/edit" element={<VehicleForm />} />
            <Route path="/fuel" element={<FuelTrackingPage />} />
            <Route path="/fuel/new" element={<AddFuelLogPage />} />
            <Route path="/fuel/:fuelLogId/edit" element={<AddFuelLogPage />} />
            <Route path="/vehicles/:vehicleId/fuel" element={<FuelTrackingPage />} />
            <Route path="/vehicles/:vehicleId/fuel/new" element={<AddFuelLogPage />} />
            <Route path="/vehicles/:vehicleId/fuel/:fuelLogId/edit" element={<AddFuelLogPage />} />
            <Route path="/maintenance" element={<MaintenancePage />} />
            <Route path="/maintenance/new" element={<MaintenanceForm />} />
            <Route path="/maintenance/vehicle/:vehicleId" element={<MaintenanceForm />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/reminders/new" element={<ReminderForm />} />
            <Route path="/reminders/vehicle/:vehicleId" element={<ReminderForm />} />
            <Route path="/drivers" element={<DriversPage />} />
            <Route path="/drivers/new" element={<DriverForm />} />
            <Route path="/drivers/:id/edit" element={<DriverForm />} />
            <Route path="/live-tracking" element={<LiveTracking />} />
            <Route path="/tracking" element={<LiveTracking />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
          </Route>

          {/* Protected Routes - No Subscription Required (Settings & Billing) */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

        {/* Global FAQ Assistant */}
        <FAQAssistant />
      </BrowserRouter>
        </SubscriptionProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
