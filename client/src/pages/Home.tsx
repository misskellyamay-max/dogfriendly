import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Place, PlaceCategory } from "@shared/schema";
import { PLACE_CATEGORIES } from "@shared/schema";
import { PlaceCard } from "@/components/PlaceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { categoryLabel, haversineDistanceMiles } from "@/lib/utils";
import {
  Search,
  MapPin,
  SlidersHorizontal,
  PawPrint,
  X,
  Loader2,
} from "lucide-react";


const RADIUS_OPTIONS = [
  { label: "1 mile", value: "1" },
  { label: "5 miles", value: "5" },
  { label: "10 miles", value: "10" },
  { label: "25 miles", value: "25" },
  { label: "50 miles", value: "50" },
];

type SearchMode = "text" | "location" | "browse";

function PlaceCardSkeleton() {
  return (
    <div className="flex flex-col rounded-lg border bg-card overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <div className="flex gap-1.5 mt-auto">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [locationCoords, setLocationCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [radius, setRadius] = useState("5");
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | "all">("all");
  const [searchMode, setSearchMode] = useState<SearchMode>("browse");
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const buildSearchUrl = useCallback(() => {
    const params = new URLSearchParams();
    if (searchMode === "location" && locationCoords) {
      params.set("lat", locationCoords.lat.toString());
      params.set("lon", locationCoords.lon.toString());
      params.set("radius", radius);
    } else if (searchMode === "text" && submittedQuery) {
      params.set("q", submittedQuery);
    }
    if (selectedCategory !== "all") params.set("type", selectedCategory);
    return `/api/search?${params.toString()}`;
  }, [searchMode, locationCoords, radius, submittedQuery, selectedCategory]);

  const { data: places, isLoading, error } = useQuery<Place[]>({
    queryKey: ["places", searchMode, submittedQuery, locationCoords, radius, selectedCategory],
    queryFn: async () => {
      const res = await fetch(buildSearchUrl());
      if (!res.ok) throw new Error("Search failed");
      return res.json();
    },
  });

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchInput.trim()) return;
    setLocationCoords(null);
    setSubmittedQuery(searchInput.trim());
    setSearchMode("text");
    setLocationError(null);
  }

  function handleUseLocation() {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        setSearchMode("location");
        setSubmittedQuery("");
        setSearchInput("");
        setLocating(false);
      },
      (err) => {
        setLocationError("Unable to get your location. Please check your browser permissions.");
        setLocating(false);
      }
    );
  }

  function handleClearSearch() {
    setSearchInput("");
    setSubmittedQuery("");
    setLocationCoords(null);
    setSearchMode("browse");
    setLocationError(null);
  }

  const isSearchActive = searchMode !== "browse" || selectedCategory !== "all";

  const placesWithDistance = places?.map(p => ({
    place: p,
    distance: locationCoords
      ? haversineDistanceMiles(locationCoords.lat, locationCoords.lon, p.latitude, p.longitude)
      : undefined,
  }));

  const searchDescription = () => {
    if (searchMode === "location" && locationCoords) return `Within ${radius} mile${radius === "1" ? "" : "s"} of your location`;
    if (searchMode === "text" && submittedQuery) return `Results for "${submittedQuery}"`;
    return "All dog-friendly places";
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="relative bg-white dark:bg-card border-b border-border">
        <div className="relative max-w-4xl mx-auto px-4 py-10 md:py-14">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src="/logo.png" alt="Houndsabout logo" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Houndsabout</h1>
          </div>
          <p className="text-lg md:text-xl font-medium mb-1 text-foreground">Find places that welcome your dog</p>
          <p className="text-sm text-muted-foreground mb-7">
            Search restaurants, cafes, pubs, shops and more — all verified dog-friendly
          </p>

          <form onSubmit={handleSearch} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40 pointer-events-none" />
                <Input
                  data-testid="input-search"
                  type="search"
                  placeholder="Town, city or postcode..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className="pl-9 pr-4 h-11 bg-background text-foreground placeholder:text-muted-foreground border-border"
                />
              </div>
              <Button
                data-testid="button-search"
                type="submit"
                size="lg"
                className="h-11 px-5 font-semibold"
              >
                Search
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                data-testid="button-use-location"
                type="button"
                variant="outline"
                size="sm"
                onClick={handleUseLocation}
                disabled={locating}
                className="h-9 font-medium flex items-center gap-1.5"
              >
                {locating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                {locating ? "Locating..." : "Near Me"}
              </Button>

              {(searchMode === "location") && (
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground" />
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger
                      data-testid="select-radius"
                      className="h-9 w-32 text-sm"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RADIUS_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isSearchActive && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSearch}
                  className="h-9 flex items-center gap-1"
                  data-testid="button-clear-search"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </Button>
              )}
            </div>

            {locationError && (
              <p className="text-sm text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 px-3 py-2 rounded-md">{locationError}</p>
            )}
          </form>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{searchDescription()}</h2>
              {places && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {places.length} {places.length === 1 ? "place" : "places"} found
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                data-testid="button-filter-all"
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="h-8 text-sm"
              >
                All
              </Button>
              {PLACE_CATEGORIES.map((cat) => (
                <Button
                  key={cat}
                  data-testid={`button-filter-${cat}`}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(cat)}
                  className="h-8 text-sm"
                >
                  {categoryLabel(cat)}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <PlaceCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
              <p className="text-muted-foreground text-sm">We couldn't complete your search. Please try again.</p>
            </div>
          ) : places && places.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <PawPrint className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No places found</h3>
              <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                We couldn't find any dog-friendly places matching your search. Try a different town, postcode or radius.
              </p>
              <Button onClick={handleClearSearch} variant="outline" size="sm" className="mt-4">
                Browse all places
              </Button>
            </div>
          ) : (
            <div
              data-testid="grid-places"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {placesWithDistance?.map(({ place, distance }) => (
                <PlaceCard key={place.id} place={place} distance={distance} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
