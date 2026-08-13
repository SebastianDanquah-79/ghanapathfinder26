import { Suspense, lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/useAuth";
import MobileTabBar from "@/components/MobileTabBar";
import OfflineBanner from "@/components/OfflineBanner";
import Index from "./pages/Index.tsx";

const Auth = lazy(() => import("./pages/Auth.tsx"));
const Onboarding = lazy(() => import("./pages/Onboarding.tsx"));
const Dashboard = lazy(() => import("./pages/Dashboard.tsx"));
const Matcher = lazy(() => import("./pages/Matcher.tsx"));
const AdmissionMatch = lazy(() => import("./pages/AdmissionMatch.tsx"));
const Compare = lazy(() => import("./pages/Compare.tsx"));
const Scholarships = lazy(() => import("./pages/Scholarships.tsx"));
const CompareScholarships = lazy(() => import("./pages/CompareScholarships.tsx"));
const ApplicationTracker = lazy(() => import("./pages/ApplicationTracker.tsx"));
const Preferences = lazy(() => import("./pages/Preferences.tsx"));
const ParentView = lazy(() => import("./pages/ParentView.tsx"));
const Inspiration = lazy(() => import("./pages/Inspiration.tsx"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent.tsx"));
const SearchPage = lazy(() => import("./pages/Search.tsx"));
const Saved = lazy(() => import("./pages/Saved.tsx"));
const UniversityProfile = lazy(() => import("./pages/UniversityProfile.tsx"));
const ResetPassword = lazy(() => import("./pages/ResetPassword.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 1000 * 60 * 60,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <Loader2 className="h-5 w-5 animate-spin text-primary" aria-label="Loading" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <OfflineBanner />
          <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            <Suspense fallback={<RouteFallback />}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/saved" element={<Saved />} />
                <Route path="/university/:slug" element={<UniversityProfile />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/matcher" element={<Matcher />} />
                <Route path="/admission-match" element={<AdmissionMatch />} />
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
            </Suspense>
          </div>
          <MobileTabBar />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
