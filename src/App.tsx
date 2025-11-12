import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Flights from "./pages/Flights";
import Gates from "./pages/Gates";
import Airports from "./pages/Airports";
import Staff from "./pages/Staff";
import Maintenance from "./pages/Maintenance";
import Incidents from "./pages/Incidents";
import Audit from "./pages/Audit";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator', 'airline_staff', 'gate_agent', 'maintenance', 'security']}>
                  <Index />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flights"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator', 'airline_staff', 'gate_agent']}>
                  <Flights />
                </ProtectedRoute>
              }
            />
            <Route
              path="/gates"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator', 'gate_agent']}>
                  <Gates />
                </ProtectedRoute>
              }
            />
            <Route
              path="/airports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator']}>
                  <Airports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airline_staff']}>
                  <Staff />
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'maintenance', 'airport_operator']}>
                  <Maintenance />
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents"
              element={
                <ProtectedRoute allowedRoles={['admin', 'security', 'airport_operator']}>
                  <Incidents />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Audit />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
