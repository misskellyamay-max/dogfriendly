import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import type { Place } from "@shared/schema";
import { dogPolicyLabel, categoryLabel, formatRating } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Star,
  MapPin,
  Phone,
  Globe,
  Droplets,
  Cookie,
  UtensilsCrossed,
  PawPrint,
  CheckCircle2,
  Dog,
} from "lucide-react";

const categoryEmoji: Record<string, string> = {
  restaurant: "🍽",
  cafe: "☕",
  pub: "🍺",
  retail: "🛍",
  hotel: "🏨",
  park: "🌳",
  beach: "🏖",
  attraction: "🎡",
};

const policyColors: Record<string, string> = {
  dogs_inside: "bg-primary/10 text-primary dark:bg-primary/20",
  dogs_outside: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  dogs_both: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-5 h-5 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Skeleton className="h-8 w-24 mb-6" />
      <Skeleton className="h-64 w-full rounded-xl mb-6" />
      <Skeleton className="h-8 w-3/4 mb-2" />
      <Skeleton className="h-5 w-1/2 mb-6" />
      <Skeleton className="h-24 w-full mb-4" />
    </div>
  );
}

export default function PlaceDetail() {
  const { id } = useParams<{ id: string }>();

  const { data: place, isLoading, error } = useQuery<Place>({
    queryKey: ["/api/places", id],
    queryFn: async () => {
      const res = await fetch(`/api/places/${id}`);
      if (!res.ok) throw new Error("Place not found");
      return res.json();
    },
  });

  if (isLoading) return <DetailSkeleton />;

  if (error || !place) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
          <PawPrint className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Place not found</h2>
        <p className="text-muted-foreground mb-6">We couldn't find that listing.</p>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to search
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">
        <Link href="/">
          <Button
            data-testid="button-back"
            variant="ghost"
            size="sm"
            className="mb-4 -ml-2 flex items-center gap-1.5 text-muted-foreground"
          >
            <ArrowLeft className="w-4 h-4" /> Back to results
          </Button>
        </Link>

        <div className="relative h-60 md:h-80 rounded-xl overflow-hidden bg-muted mb-6">
          {place.imageUrl ? (
            <img
              src={place.imageUrl}
              alt={place.name}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40 flex items-center justify-center">
            <span className="text-7xl opacity-60">{categoryEmoji[place.category] ?? "📍"}</span>
          </div>
          <div className="absolute bottom-4 left-4">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-white/90 dark:bg-black/70 text-foreground">
              {categoryLabel(place.category as any)}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div>
            <h1 data-testid="text-place-name" className="text-2xl md:text-3xl font-bold mb-2">{place.name}</h1>
            <div className="flex items-center gap-2 text-muted-foreground mb-3">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span>{place.address}, {place.town}, {place.postcode}</span>
            </div>
            <div className="flex items-center gap-3">
              <StarRating rating={place.rating} />
              <span className="font-semibold">{formatRating(place.rating)}</span>
              <span className="text-sm text-muted-foreground">({place.reviewCount} reviews)</span>
            </div>
          </div>

          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
              <Dog className="w-4 h-4" /> Dog Welcome Policy
            </h2>
            <div className="flex flex-wrap gap-2">
              <span
                data-testid="badge-dog-policy"
                className={`font-semibold px-3 py-1 rounded-lg text-sm ${policyColors[place.dogPolicy] ?? "bg-muted text-muted-foreground"}`}
              >
                {dogPolicyLabel(place.dogPolicy as any)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <div className={`flex items-center gap-2 p-3 rounded-lg border ${place.waterBowls ? "border-sky-200 bg-sky-50 dark:border-sky-800 dark:bg-sky-950/30" : "border-border bg-muted/40 opacity-50"}`}>
                <Droplets className={`w-4 h-4 ${place.waterBowls ? "text-sky-600 dark:text-sky-400" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">Water Bowls</p>
                  <p className="text-xs text-muted-foreground">{place.waterBowls ? "Provided" : "Not available"}</p>
                </div>
                {place.waterBowls && <CheckCircle2 className="w-4 h-4 text-sky-600 dark:text-sky-400 ml-auto" />}
              </div>

              <div className={`flex items-center gap-2 p-3 rounded-lg border ${place.dogTreats ? "border-rose-200 bg-rose-50 dark:border-rose-800 dark:bg-rose-950/30" : "border-border bg-muted/40 opacity-50"}`}>
                <Cookie className={`w-4 h-4 ${place.dogTreats ? "text-rose-600 dark:text-rose-400" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">Dog Treats</p>
                  <p className="text-xs text-muted-foreground">{place.dogTreats ? "Available" : "Not available"}</p>
                </div>
                {place.dogTreats && <CheckCircle2 className="w-4 h-4 text-rose-600 dark:text-rose-400 ml-auto" />}
              </div>

              <div className={`flex items-center gap-2 p-3 rounded-lg border ${place.dogMenu ? "border-violet-200 bg-violet-50 dark:border-violet-800 dark:bg-violet-950/30" : "border-border bg-muted/40 opacity-50"}`}>
                <UtensilsCrossed className={`w-4 h-4 ${place.dogMenu ? "text-violet-600 dark:text-violet-400" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-sm font-medium">Dog Menu</p>
                  <p className="text-xs text-muted-foreground">{place.dogMenu ? "Available" : "Not available"}</p>
                </div>
                {place.dogMenu && <CheckCircle2 className="w-4 h-4 text-violet-600 dark:text-violet-400 ml-auto" />}
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-semibold text-base mb-2">About</h2>
            <p className="text-muted-foreground leading-relaxed">{place.description}</p>
          </div>

          {(place.phone || place.website) && (
            <div className="bg-card border border-card-border rounded-xl p-5">
              <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">Contact</h2>
              <div className="flex flex-col gap-3">
                {place.phone && (
                  <a
                    data-testid="link-phone"
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-3 text-foreground group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{place.phone}</span>
                  </a>
                )}
                {place.website && (
                  <a
                    data-testid="link-website"
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-foreground group"
                  >
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                      <Globe className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm text-primary underline-offset-2 hover:underline">
                      {place.website.replace(/^https?:\/\//, "")}
                    </span>
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="bg-card border border-card-border rounded-xl p-5">
            <h2 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Location
              </div>
            </h2>
            <p className="text-sm text-foreground">{place.address}</p>
            <p className="text-sm text-muted-foreground">{place.town}</p>
            <p className="text-sm font-medium text-foreground">{place.postcode}</p>
            <a
              data-testid="link-directions"
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address} ${place.postcode}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block"
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2 mt-2">
                <MapPin className="w-3.5 h-3.5" />
                Get Directions
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
