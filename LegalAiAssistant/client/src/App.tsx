import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import FirGenerator from "@/pages/fir-generator";
import CaseTracker from "@/pages/case-tracker";
import LegalLibrary from "@/pages/legal-library";
import LawyerDirectory from "@/pages/lawyer-directory";
import NotFound from "@/pages/not-found";
import { I18nextProvider } from 'react-i18next';
import i18n from '@/lib/i18n';

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/fir-generator" component={FirGenerator} />
          <Route path="/case-tracker" component={CaseTracker} />
          <Route path="/legal-library" component={LegalLibrary} />
          <Route path="/lawyer-directory" component={LawyerDirectory} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
