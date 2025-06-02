import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Candidate from "./pages/Candidate";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import JobApplicants from './pages/JobApplicants';
import CandidateProfile from './pages/CandidateProfile';
import RootRedirect from './pages/RootRedirect';

const queryClient = new QueryClient();

const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute requiredRole="recruiter">
                  <Index />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/candidate" 
              element={
                <ProtectedRoute requiredRole="candidate">
                  <Candidate />
                </ProtectedRoute>
              } 
            />
            <Route path="/jobs/:jobId/applicants" element={<JobApplicants />} />
            <Route path="/candidates/:candidateId" element={<CandidateProfile />} />
            <Route path="/" element={<RootRedirect />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
