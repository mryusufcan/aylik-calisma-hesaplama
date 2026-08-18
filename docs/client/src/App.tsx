/**
 * Çalışma Saati Hesaplayıcı: sakin indigo hiyerarşisi, doğrudan sonuç bilgisi
 * ve erişilebilir aylık çalışma süresi hesaplama akışı.
 */
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Router as WouterRouter, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";

function AppRouter() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const routeBase = import.meta.env.BASE_URL.replace(/\/$/, "");

  const routedContent = routeBase ? (
    <WouterRouter base={routeBase}>
      <AppRouter />
    </WouterRouter>
  ) : (
    <AppRouter />
  );

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster richColors position="top-right" />
          {routedContent}
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
