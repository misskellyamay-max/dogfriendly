import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import PlaceDetail from "@/pages/PlaceDetail";
import AdminLogin from "@/pages/admin/AdminLogin";
import AdminPlaces from "@/pages/admin/AdminPlaces";
import PlaceForm from "@/pages/admin/PlaceForm";
import AdminImport from "@/pages/admin/AdminImport";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/place/:id" component={PlaceDetail} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/places" component={AdminPlaces} />
      <Route path="/admin/places/new" component={PlaceForm} />
      <Route path="/admin/import" component={AdminImport} />
      <Route path="/admin/places/:id/edit" component={PlaceForm} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
