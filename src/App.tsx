 
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import EntrepreneurDashboard from "./pages/dashboards/EntrepreneurDashboard";
import InvestorDashboard from "./pages/dashboards/InvestorDashboard";
import CollaboratorDashboard from "./pages/dashboards/CollaboratorDashboard";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              
              {/* Protected Routes */}
              <Route path="/entrepreneur" element={
                <ProtectedRoute allowedRoles={['entrepreneur']}>
                  <EntrepreneurDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/investor" element={
                <ProtectedRoute allowedRoles={['investor']}>
                  <InvestorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/collaborator" element={
                <ProtectedRoute allowedRoles={['mentor', 'auditor', 'patent_officer']}>
                  <CollaboratorDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/admin" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute allowedRoles={['entrepreneur', 'investor', 'mentor', 'auditor', 'patent_officer', 'admin']}>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);
export default App;
