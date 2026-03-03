import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import type { Place } from "@shared/schema";
import { DAYS_OF_WEEK } from "@shared/schema";
import type { DayOfWeek } from "@shared/schema";
import { dogPolicyLabel, categoryLabel } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  MapPin,
  Phone,
  Globe,
  PawPrint,
  Dog,
  Utensils,
  Coffee,
  Beer,
  ShoppingBag,
  BedDouble,
  Trees,
  Waves,
  Ticket,
  Clock,
  ShieldCheck,
  CreditCard,
  type LucideIcon,
} from "lucide-react";

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

function getTodayKey(): DayOfWeek {
  const days: DayOfWeek[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[new Date().getDay()];
}

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

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      {children}
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon?: LucideIcon; children: React.ReactNode }) {
  return (
    <h2 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </h2>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <Skeleton className="h-8 w-24 mb-4" />
      <Skeleton className="h-[420px] w-full rounded-xl mb-4" />
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
      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
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

  const categories = Array.isArray(place.category) ? place.category : [place.category];
  const isHotel = categories.includes("hotel");
  const allPhotos = (place.photos && place.photos.length > 0)
    ? place.photos
    : place.imageUrl ? [place.imageUrl] : [];
  const mainPhoto = allPhotos[0];
  const extraPhotos = allPhotos.slice(1);

  return (
    <div className="min-h-screen bg-background pb-12">
      <div className="max-w-5xl mx-auto px-4 pt-6">

        {/* Back button */}
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

        {/* Hero: image with overlapping info card */}
        <div className="relative mb-6">
          {/* Main image */}
          <div className="relative h-72 md:h-[420px] w-full rounded-xl overflow-hidden bg-muted">
            {mainPhoto ? (
              <img
                src={mainPhoto}
                alt={place.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PawPrint className="w-16 h-16 text-muted-foreground/30" />
              </div>
            )}
            {/* Category badges — bottom left */}
            <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5">
              {categories.map((cat) => {
                const Icon = categoryIcons[cat];
                return (
                  <span
                    key={cat}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md bg-white/90 text-zinc-700 shadow-sm"
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    {categoryLabel(cat as any)}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Floating info card — overlaps image on desktop */}
          <div className="md:absolute md:top-8 md:right-6 md:w-72 md:z-10 mt-4 md:mt-0">
            <div className="bg-card border border-border rounded-xl shadow-lg p-5 flex flex-col gap-4">
              <div>
                <h1 data-testid="text-place-name" className="text-xl font-bold leading-snug mb-1">
                  {place.name}
                </h1>
                <div className="flex items-start gap-1.5 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                  <span>{place.address}{place.address2 ? `, ${place.address2}` : ""}, {place.town}, {place.postcode}</span>
                </div>
              </div>

              {/* Dog policy */}
              <div>
                <p className="text-xs text-muted-foreground mb-1.5 font-medium">Dog Policy</p>
                <span
                  data-testid="badge-dog-policy"
                  className={`inline-block font-semibold px-3 py-1 rounded-lg text-sm ${policyColors[place.dogPolicy] ?? "bg-muted text-muted-foreground"}`}
                >
                  {dogPolicyLabel(place.dogPolicy as any)}
                </span>
              </div>

              {/* Verified */}
              {place.verified && place.verifiedAt && (
                <div data-testid="badge-verified" className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified {new Date(place.verifiedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </div>
              )}

              {/* Contact */}
              <div className="flex flex-col gap-2 pt-1 border-t border-border">
                {place.phone && (
                  <a
                    data-testid="link-phone"
                    href={`tel:${place.phone}`}
                    className="flex items-center gap-2 text-sm text-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    {place.phone}
                  </a>
                )}
                {place.website && (
                  <a
                    data-testid="link-website"
                    href={place.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline underline-offset-2 transition-colors"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {place.website.replace(/^https?:\/\//, "")}
                  </a>
                )}
                <a
                  data-testid="link-directions"
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address} ${place.postcode}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="outline" size="sm" className="w-full mt-1 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5" />
                    Get Directions
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Extra photos strip */}
        {extraPhotos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1 mb-6">
            {extraPhotos.map((src, i) => (
              <div key={i} className="shrink-0 h-20 w-28 rounded-lg overflow-hidden bg-muted">
                <img
                  src={src}
                  alt={`${place.name} photo ${i + 2}`}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
              </div>
            ))}
          </div>
        )}

        {/* Content sections — left-aligned, below the hero */}
        <div className="md:max-w-[calc(100%-18rem)] flex flex-col gap-5">

          {/* About */}
          <div>
            <h2 className="font-semibold text-base mb-2">About</h2>
            <p className="text-muted-foreground leading-relaxed">{place.description}</p>
          </div>

          {/* Dog Welcome Policy */}
          <SectionCard>
            <SectionTitle icon={Dog}>Dog Welcome Policy</SectionTitle>
            <span
              data-testid="badge-dog-policy-section"
              className={`inline-block font-semibold px-3 py-1 rounded-lg text-sm ${policyColors[place.dogPolicy] ?? "bg-muted text-muted-foreground"}`}
            >
              {dogPolicyLabel(place.dogPolicy as any)}
            </span>
          </SectionCard>

          {/* Hotel Stay Policy */}
          {isHotel && (place.hotelInfo || place.dogCharge || place.dogChargeAmount != null || place.maxDogs != null) && (
            <SectionCard>
              <div data-testid="section-hotel-policy">
                <SectionTitle icon={BedDouble}>Hotel Stay Policy</SectionTitle>
                {place.hotelInfo && (
                  <p className="text-sm text-foreground leading-relaxed mb-4">{place.hotelInfo}</p>
                )}
                <div className="flex flex-wrap gap-3">
                  {(place.dogCharge || place.dogChargeAmount != null) && (
                    <div
                      data-testid="badge-dog-charge"
                      className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg px-3 py-2"
                    >
                      <CreditCard className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span className="text-sm font-medium text-amber-800 dark:text-amber-300">
                        {place.dogChargeAmount != null
                          ? `£${place.dogChargeAmount % 1 === 0 ? place.dogChargeAmount : place.dogChargeAmount.toFixed(2)} per dog, per night`
                          : "Additional charge per dog applies"}
                      </span>
                    </div>
                  )}
                  {place.maxDogs != null && (
                    <div
                      data-testid="badge-max-dogs"
                      className="flex items-center gap-2 bg-muted border border-border rounded-lg px-3 py-2"
                    >
                      <PawPrint className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">
                        Maximum {place.maxDogs} {place.maxDogs === 1 ? "dog" : "dogs"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          )}

          {/* Important Information */}
          {place.importantInfo && (
            <div
              data-testid="section-important-info"
              className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-xl p-5"
            >
              <h2 className="font-semibold text-sm text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                <span>⚠</span> Important Information
              </h2>
              <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">{place.importantInfo}</p>
            </div>
          )}

          {/* Opening Hours */}
          {place.openingHours && (
            <SectionCard>
              <SectionTitle icon={Clock}>Opening Hours</SectionTitle>
              <div className="divide-y divide-border">
                {DAYS_OF_WEEK.map((day) => {
                  const hours = place.openingHours![day];
                  const isToday = getTodayKey() === day;
                  return (
                    <div
                      key={day}
                      data-testid={`hours-row-${day}`}
                      className={`flex justify-between items-center py-2 text-sm ${isToday ? "font-semibold text-foreground" : "text-muted-foreground"}`}
                    >
                      <span className="flex items-center gap-2">
                        {isToday && <span className="w-1.5 h-1.5 rounded-full bg-primary inline-block" />}
                        {DAY_LABELS[day]}
                      </span>
                      <span className={hours.closed ? "text-rose-500 dark:text-rose-400 font-medium" : ""}>
                        {hours.closed ? "Closed" : `${hours.open} – ${hours.close}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* Location */}
          <SectionCard>
            <SectionTitle icon={MapPin}>Location</SectionTitle>
            <p className="text-sm text-muted-foreground mb-3">
              {place.address}{place.address2 ? `, ${place.address2}` : ""}, {place.town}, {place.postcode}
            </p>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${place.name} ${place.address} ${place.postcode}`)}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5" />
                Get Directions
              </Button>
            </a>
          </SectionCard>

        </div>
      </div>
    </div>
  );
}
