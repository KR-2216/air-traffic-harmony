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
import Passengers from './pages/Passengers';
import Baggage from './pages/Baggage';
import FlightCrew from './pages/FlightCrew';
import RunwayAssignments from './pages/RunwayAssignments';
import GateAssignments from './pages/GateAssignments';
import GroundVehicles from './pages/GroundVehicles';
import StaffCertifications from './pages/StaffCertifications';
import { Layout } from '@/components/Layout';

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
                  <Layout>
                    <Index />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/flights"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator', 'airline_staff', 'gate_agent']}>
                  <Layout>
                    <Flights />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gates"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator', 'gate_agent']}>
                  <Layout>
                    <Gates />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/airports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator']}>
                  <Layout>
                    <Airports />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/passengers"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airline_staff', 'gate_agent']}>
                  <Layout>
                    <Passengers />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/baggage"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airline_staff', 'gate_agent']}>
                  <Layout>
                    <Baggage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/flight-crew"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airline_staff']}>
                  <Layout>
                    <FlightCrew />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/runway-assignments"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator', 'gate_agent']}>
                  <Layout>
                    <RunwayAssignments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/gate-assignments"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator', 'gate_agent']}>
                  <Layout>
                    <GateAssignments />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ground-vehicles"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airport_operator']}>
                  <Layout>
                    <GroundVehicles />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airline_staff']}>
                  <Layout>
                    <Staff />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/staff-certifications"
              element={
                <ProtectedRoute allowedRoles={['admin', 'airline_staff']}>
                  <Layout>
                    <StaffCertifications />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/maintenance"
              element={
                <ProtectedRoute allowedRoles={['admin', 'maintenance', 'airport_operator']}>
                  <Layout>
                    <Maintenance />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents"
              element={
                <ProtectedRoute allowedRoles={['admin', 'security', 'airport_operator']}>
                  <Layout>
                    <Incidents />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <Layout>
                    <Audit />
                  </Layout>
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
