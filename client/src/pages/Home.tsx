import { useState, useCallback } from "react";
import bannerImg from "@assets/Banner_Test_1770164588183.jpg";
import { useQuery } from "@tanstack/react-query";
import type { Place, PlaceCategory } from "@shared/schema";
import { PLACE_CATEGORIES } from "@shared/schema";
import { PlaceCard } from "@/components/PlaceCard";
import { MapView } from "@/components/MapView";
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
  LayoutGrid,
  Map,
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
  const [geocoding, setGeocoding] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [postcodeLabel, setPostcodeLabel] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

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

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const query = searchInput.trim();
    if (!query) return;

    const isPostcode = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i.test(query) ||
      /^[A-Z]{1,2}[0-9][0-9A-Z]?$/i.test(query);

    if (isPostcode) {
      const normalised = query.replace(/\s+/g, "").toUpperCase();
      setGeocoding(true);
      setLocationError(null);
      try {
        const res = await fetch(`https://api.postcodes.io/postcodes/${normalised}`);
        const data = await res.json();
        if (data.status === 200 && data.result) {
          setLocationCoords({ lat: data.result.latitude, lon: data.result.longitude });
          setPostcodeLabel(query.toUpperCase());
          setSearchMode("location");
          setSubmittedQuery("");
        } else {
          setLocationError("Postcode not found. Please check and try again.");
        }
      } catch {
        setLocationError("Could not look up postcode. Please check your connection and try again.");
      } finally {
        setGeocoding(false);
      }
    } else {
      setGeocoding(true);
      setLocationError(null);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=gb&format=json&limit=1`,
          { headers: { "Accept-Language": "en" } }
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocationCoords({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
          setPostcodeLabel(query);
          setSearchMode("location");
          setSubmittedQuery("");
        } else {
          setLocationError("Town not found. Please check the spelling or try a nearby postcode instead.");
        }
      } catch {
        setLocationError("Could not look up that location. Please check your connection and try again.");
      } finally {
        setGeocoding(false);
      }
    }
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
        setPostcodeLabel(null);
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
    setPostcodeLabel(null);
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
    if (searchMode === "location" && locationCoords) {
      const label = postcodeLabel ?? "your location";
      return `Within ${radius} mile${radius === "1" ? "" : "s"} of ${label}`;
    }
    if (searchMode === "text" && submittedQuery) return `Results for "${submittedQuery}"`;
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden min-h-[460px] md:min-h-[520px] flex items-center">
        <img
          src={bannerImg}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/80 via-orange-800/50 to-black/70" />
        <div className="relative w-full max-w-3xl mx-auto px-4 py-10 flex flex-col items-center gap-6">

          <img
            src="/houndsabout-logo2.png"
            alt="Houndsabout"
            className="h-16 md:h-20 w-auto object-contain drop-shadow-lg"
          />

          <div className="text-center space-y-3">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white drop-shadow-md leading-tight tracking-tight">
              Find your next dog-friendly adventure.
            </h1>
            <p className="text-white/90 text-lg md:text-xl drop-shadow">
              Restaurants, pubs, cafés, hotels, shops and more
            </p>
          </div>

          <form onSubmit={handleSearch} className="w-full flex flex-col items-center gap-3">
            <div className="relative w-full max-w-2xl">
              <Input
                data-testid="input-search"
                type="search"
                placeholder="Town, city or postcode..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-6 pr-16 h-16 text-base bg-white text-foreground placeholder:text-muted-foreground border-0 rounded-full shadow-2xl focus-visible:ring-2 focus-visible:ring-primary"
              />
              <button
                data-testid="button-search"
                type="submit"
                disabled={geocoding}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-opacity hover:opacity-90 active:opacity-75 shadow-md disabled:opacity-70"
                style={{ backgroundColor: "#ff9900" }}
              >
                {geocoding
                  ? <Loader2 className="w-5 h-5 text-white animate-spin" />
                  : <Search className="w-5 h-5 text-white" />
                }
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                data-testid="button-use-location"
                type="button"
                onClick={handleUseLocation}
                disabled={locating}
                className="h-9 px-4 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 text-white border border-white/40 flex items-center gap-1.5 transition-colors backdrop-blur-sm disabled:opacity-60"
              >
                {locating ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <MapPin className="w-3.5 h-3.5" />
                )}
                {locating ? "Locating..." : "Near Me"}
              </button>

              {searchMode === "location" && (
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-white/70" />
                  <Select value={radius} onValueChange={setRadius}>
                    <SelectTrigger
                      data-testid="select-radius"
                      className="h-9 w-32 text-sm bg-white/20 border-white/40 text-white backdrop-blur-sm rounded-full"
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
                <button
                  type="button"
                  onClick={handleClearSearch}
                  data-testid="button-clear-search"
                  className="h-9 px-4 rounded-full text-sm font-medium bg-white/20 hover:bg-white/30 text-white border border-white/40 flex items-center gap-1.5 transition-colors backdrop-blur-sm"
                >
                  <X className="w-3.5 h-3.5" /> Clear
                </button>
              )}
            </div>

            {locationError && (
              <p className="text-sm text-white bg-red-600/70 border border-red-400/50 px-4 py-2 rounded-full backdrop-blur-sm">{locationError}</p>
            )}
          </form>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-4">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border py-4 -mx-4 px-4 flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                {searchDescription() && (
                  <h2 className="text-lg font-semibold text-foreground">{searchDescription()}</h2>
                )}
                {places && (
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {places.length} {places.length === 1 ? "place" : "places"} found
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  data-testid="button-view-grid"
                  onClick={() => setViewMode("grid")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "grid"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white dark:bg-zinc-800 border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" /> Grid
                </button>
                <button
                  data-testid="button-view-map"
                  onClick={() => setViewMode("map")}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    viewMode === "map"
                      ? "bg-primary text-primary-foreground"
                      : "bg-white dark:bg-zinc-800 border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                  }`}
                >
                  <Map className="w-4 h-4" /> Map
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                data-testid="button-filter-all"
                onClick={() => setSelectedCategory("all")}
                className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-white dark:bg-zinc-800 border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                }`}
              >
                All
              </button>
              {PLACE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  data-testid={`button-filter-${cat}`}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-white dark:bg-zinc-800 border border-border text-foreground hover:border-primary hover:text-primary transition-colors"
                  }`}
                >
                  {categoryLabel(cat)}
                </button>
              ))}
            </div>
          </div>

          <div className="py-6">
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
          ) : viewMode === "map" ? (
            <div className="relative">
              <MapView places={places ?? []} />
              <button
                data-testid="button-back-to-list"
                onClick={() => setViewMode("grid")}
                className="absolute top-3 right-3 z-[1000] bg-white text-gray-800 shadow-md rounded-full px-4 py-2 text-sm font-medium flex items-center gap-1.5 hover:bg-gray-50 transition-colors border border-gray-200"
              >
                <LayoutGrid className="w-4 h-4" /> List view
              </button>
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
