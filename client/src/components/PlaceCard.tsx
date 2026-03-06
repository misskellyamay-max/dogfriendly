import type { Place } from "@shared/schema";
import { categoryLabel, dogPolicyLabel } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin, Droplets, Cookie, UtensilsCrossed,
  Utensils, Coffee, Beer, ShoppingBag, BedDouble, Trees, Waves, Ticket, CreditCard, type LucideIcon
} from "lucide-react";
import { Link } from "wouter";

const categoryIcons: Record<string, LucideIcon> = {
  restaurant: Utensils,
  cafe: Coffee,
  pub: Beer,
  retail: ShoppingBag,
  hotel: BedDouble,
  park: Trees,
  beach: Waves,
  attraction: Ticket,
};

const policyColors: Record<string, string> = {
  dogs_inside: "bg-primary/10 text-primary dark:bg-primary/20",
  dogs_outside: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300",
  dogs_both: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
  dogs_hotel_only: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

interface PlaceCardProps {
  place: Place;
  distance?: number;
}


export function PlaceCard({ place, distance }: PlaceCardProps) {
  const categories = Array.isArray(place.category) ? place.category : [place.category];

  return (
    <Link href={`/place/${place.id}`}>
      <Card
        data-testid={`card-place-${place.id}`}
        className="cursor-pointer rounded-2xl overflow-hidden border-0 shadow-md hover:shadow-xl transition-shadow duration-200 h-full flex flex-col"
      >
        <div className="relative h-52 w-full overflow-hidden bg-muted flex-shrink-0">
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
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <span
                  key={cat}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-white/95 text-zinc-700 shadow-sm"
                >
                  {Icon && <Icon className="w-3 h-3" />}
                  {categoryLabel(cat as any)}
                </span>
              );
            })}
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
            <h3 data-testid={`text-place-name-${place.id}`} className="font-bold text-lg leading-tight line-clamp-1">
              {place.name}
            </h3>
            <div className="flex items-center gap-1 mt-1 text-muted-foreground text-sm">
              <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="line-clamp-1">{place.town}, {place.postcode}</span>
            </div>
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
            {categories.includes("hotel") && place.dogChargeAmount != null && (
              <span
                data-testid={`badge-pet-fee-${place.id}`}
                className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 font-medium"
              >
                <CreditCard className="w-3 h-3" />
                Pet fee: £{place.dogChargeAmount % 1 === 0 ? place.dogChargeAmount : place.dogChargeAmount.toFixed(2)} per dog/night
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
