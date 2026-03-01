import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAdmin } from "@/hooks/useAdmin";
import type { Place } from "@shared/schema";
import { PlusCircle, Pencil, Trash2, LogOut } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  restaurant: "Restaurant",
  cafe: "Café",
  pub: "Pub",
  retail: "Retail",
  hotel: "Hotel",
  park: "Park",
  beach: "Beach",
  attraction: "Attraction",
};

export default function AdminPlaces() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isLoading: authLoading } = useAdmin();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: places = [], isLoading } = useQuery<Place[]>({
    queryKey: ["/api/places"],
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/admin/places/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      toast({ title: "Listing deleted" });
      setDeletingId(null);
    },
    onError: () => {
      toast({ title: "Failed to delete listing", variant: "destructive" });
      setDeletingId(null);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/admin/logout"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/session"] });
      setLocation("/admin");
    },
  });

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Houndsabout Admin</h1>
          <p className="text-sm text-muted-foreground">Manage dog-friendly listings</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/places/new">
            <Button data-testid="button-add-place" style={{ backgroundColor: "#ff9900", color: "white" }}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Listing
            </Button>
          </Link>
          <Button
            data-testid="button-logout"
            variant="outline"
            size="sm"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="w-4 h-4 mr-1" />
            Log out
          </Button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <p className="text-sm text-muted-foreground mb-4">{places.length} listing{places.length !== 1 ? "s" : ""}</p>
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="border-b border-border bg-muted/40">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Town</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Rating</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {places.map((place, i) => (
                <tr
                  key={place.id}
                  data-testid={`row-place-${place.id}`}
                  className={`border-b border-border last:border-0 ${i % 2 === 0 ? "" : "bg-muted/20"}`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">{place.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{place.town}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(Array.isArray(place.category) ? place.category : [place.category]).map(c => (
                        <Badge key={c} variant="outline">{CATEGORY_LABELS[c] ?? c}</Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{place.rating.toFixed(1)} ★</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link href={`/admin/places/${place.id}/edit`}>
                        <Button
                          data-testid={`button-edit-${place.id}`}
                          variant="ghost"
                          size="sm"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </Link>
                      {deletingId === place.id ? (
                        <div className="flex items-center gap-1">
                          <Button
                            data-testid={`button-confirm-delete-${place.id}`}
                            variant="destructive"
                            size="sm"
                            onClick={() => deleteMutation.mutate(place.id)}
                            disabled={deleteMutation.isPending}
                          >
                            Confirm
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeletingId(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          data-testid={`button-delete-${place.id}`}
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(place.id)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {places.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                    No listings yet. Add your first one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
