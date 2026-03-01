import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";

export function useAdmin(redirectIfUnauth = true) {
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<{ authenticated: boolean }>({
    queryKey: ["/api/admin/session"],
  });

  useEffect(() => {
    if (!isLoading && redirectIfUnauth && !data?.authenticated) {
      setLocation("/admin");
    }
  }, [data, isLoading, redirectIfUnauth, setLocation]);

  return { authenticated: data?.authenticated ?? false, isLoading };
}
