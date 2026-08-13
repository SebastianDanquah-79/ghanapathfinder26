import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import Index from "./pages/Index.tsx";
import Auth from "./pages/Auth.tsx";
import Onboarding from "./pages/Onboarding.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Matcher from "./pages/Matcher.tsx";
import Compare from "./pages/Compare.tsx";
import Scholarships from "./pages/Scholarships.tsx";
import CompareScholarships from "./pages/CompareScholarships.tsx";
import ApplicationTracker from "./pages/ApplicationTracker.tsx";
import Preferences from "./pages/Preferences.tsx";
import ParentView from "./pages/ParentView.tsx";
import Inspiration from "./pages/Inspiration.tsx";
import OAuthConsent from "./pages/OAuthConsent.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/matcher" element={<Matcher />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/scholarships" element={<Scholarships />} />
            <Route path="/compare-scholarships" element={<CompareScholarships />} />
            <Route path="/inspiration" element={<Inspiration />} />
            <Route path="/applications" element={<ApplicationTracker />} />
            <Route path="/preferences" element={<Preferences />} />
            <Route path="/parent" element={<ParentView />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
