import type { Place } from "@shared/schema";
import { categoryLabel, dogPolicyLabel, formatRating } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Star, MapPin, Phone, Globe, Droplets, Cookie, UtensilsCrossed } from "lucide-react";
import { Link } from "wouter";

const categoryColors: Record<string, string> = {
  restaurant: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
  cafe: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  pub: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  retail: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  hotel: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  park: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  beach: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300",
  attraction: "bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300",
};

const policyColors: Record<string, string> = {
  dogs_inside: "bg-primary/10 text-primary dark:bg-primary/20",
  dogs_outside: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  dogs_both: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
};

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

interface PlaceCardProps {
  place: Place;
  distance?: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`w-3.5 h-3.5 ${
            star <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted"
          }`}
        />
      ))}
    </div>
  );
}

export function PlaceCard({ place, distance }: PlaceCardProps) {
  return (
    <Link href={`/place/${place.id}`}>
      <Card
        data-testid={`card-place-${place.id}`}
        className="cursor-pointer hover-elevate transition-all duration-200 h-full flex flex-col"
      >
        <div className="relative h-44 w-full overflow-hidden rounded-t-lg bg-muted flex-shrink-0">
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
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-muted/30 to-muted/70">
            <span className="text-5xl opacity-70">{categoryEmoji[place.category] ?? "📍"}</span>
          </div>
          <div className="absolute top-2 left-2">
            <span
              className={`text-xs font-semibold px-2.5 py-1 rounded-md ${categoryColors[place.category] ?? "bg-muted text-muted-foreground"}`}
            >
              {categoryLabel(place.category as any)}
            </span>
          </div>
          {distance !== undefined && (
            <div className="absolute top-2 right-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-background/80 text-foreground backdrop-blur-sm">
                {distance < 0.1 ? "< 0.1 mi" : `${distance.toFixed(1)} mi`}
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4 flex flex-col flex-1 gap-2">
          <div>
            <h3 data-testid={`text-place-name-${place.id}`} className="font-semibold text-base leading-tight line-clamp-1">
              {place.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{place.town}, {place.postcode}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <StarRating rating={place.rating} />
            <span className="text-sm font-medium">{formatRating(place.rating)}</span>
            <span className="text-xs text-muted-foreground">({place.reviewCount})</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{place.description}</p>

          <div className="flex flex-wrap gap-1.5 mt-auto pt-1">
            <span
              data-testid={`badge-policy-${place.id}`}
              className={`text-xs font-medium px-2 py-0.5 rounded-md ${policyColors[place.dogPolicy] ?? "bg-muted text-muted-foreground"}`}
            >
              {dogPolicyLabel(place.dogPolicy as any)}
            </span>
            {place.waterBowls && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 font-medium">
                <Droplets className="w-3 h-3" /> Water
              </span>
            )}
            {place.dogTreats && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300 font-medium">
                <Cookie className="w-3 h-3" /> Treats
              </span>
            )}
            {place.dogMenu && (
              <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 font-medium">
                <UtensilsCrossed className="w-3 h-3" /> Dog Menu
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
