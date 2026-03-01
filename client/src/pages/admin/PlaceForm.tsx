import { useEffect } from "react";
import { useLocation, useParams, Link } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAdmin } from "@/hooks/useAdmin";
import { insertPlaceSchema, PLACE_CATEGORIES, DOG_POLICIES, DAYS_OF_WEEK } from "@shared/schema";
import type { Place, DayOfWeek, OpeningHours } from "@shared/schema";
import { ArrowLeft } from "lucide-react";

const formSchema = insertPlaceSchema.extend({
  rating: z.coerce.number().min(0).max(5),
  reviewCount: z.coerce.number().min(0),
  latitude: z.coerce.number(),
  longitude: z.coerce.number(),
});

type FormValues = z.infer<typeof formSchema>;

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

const POLICY_LABELS: Record<string, string> = {
  dogs_inside: "Dogs Welcome Inside",
  dogs_outside: "Dogs Welcome Outside",
  dogs_both: "Fully Dog Friendly (Inside & Outside)",
  dogs_hotel_only: "Dogs Welcome in Hotel Only",
};

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: "Monday",
  tuesday: "Tuesday",
  wednesday: "Wednesday",
  thursday: "Thursday",
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};

const DEFAULT_OPENING_HOURS: OpeningHours = {
  monday:    { open: "09:00", close: "17:00", closed: false },
  tuesday:   { open: "09:00", close: "17:00", closed: false },
  wednesday: { open: "09:00", close: "17:00", closed: false },
  thursday:  { open: "09:00", close: "17:00", closed: false },
  friday:    { open: "09:00", close: "17:00", closed: false },
  saturday:  { open: "10:00", close: "16:00", closed: false },
  sunday:    { open: "10:00", close: "16:00", closed: false },
};

export default function PlaceForm() {
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isLoading: authLoading } = useAdmin();

  const { data: existing, isLoading: placeLoading } = useQuery<Place>({
    queryKey: ["/api/places", id],
    enabled: isEditing,
  });

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      address2: "",
      town: "",
      postcode: "",
      category: [],
      description: "",
      importantInfo: "",
      phone: "",
      website: "",
      imageUrl: "",
      dogPolicy: "dogs_both",
      waterBowls: false,
      dogTreats: false,
      dogMenu: false,
      latitude: 51.5,
      longitude: -1.8,
      rating: 4.0,
      reviewCount: 0,
      openingHours: DEFAULT_OPENING_HOURS,
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        name: existing.name,
        address: existing.address,
        address2: existing.address2 ?? "",
        town: existing.town,
        postcode: existing.postcode,
        category: existing.category,
        description: existing.description,
        importantInfo: existing.importantInfo ?? "",
        phone: existing.phone ?? "",
        website: existing.website ?? "",
        imageUrl: existing.imageUrl ?? "",
        dogPolicy: existing.dogPolicy,
        waterBowls: existing.waterBowls ?? false,
        dogTreats: existing.dogTreats ?? false,
        dogMenu: existing.dogMenu ?? false,
        latitude: existing.latitude,
        longitude: existing.longitude,
        rating: existing.rating,
        reviewCount: existing.reviewCount,
        openingHours: existing.openingHours ?? DEFAULT_OPENING_HOURS,
      });
    }
  }, [existing, form]);

  const createMutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest("POST", "/api/admin/places", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      toast({ title: "Listing created" });
      setLocation("/admin/places");
    },
    onError: () => toast({ title: "Failed to create listing", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: FormValues) => apiRequest("PATCH", `/api/admin/places/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/places"] });
      queryClient.invalidateQueries({ queryKey: ["/api/places", id] });
      toast({ title: "Listing updated" });
      setLocation("/admin/places");
    },
    onError: () => toast({ title: "Failed to update listing", variant: "destructive" }),
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  function onSubmit(values: FormValues) {
    if (isEditing) {
      updateMutation.mutate(values);
    } else {
      createMutation.mutate(values);
    }
  }

  const openingHours = form.watch("openingHours") ?? DEFAULT_OPENING_HOURS;

  function updateDay(day: DayOfWeek, patch: Partial<{ open: string; close: string; closed: boolean }>) {
    const current = openingHours ?? DEFAULT_OPENING_HOURS;
    form.setValue("openingHours", {
      ...current,
      [day]: { ...current[day], ...patch },
    });
  }

  if (authLoading || (isEditing && placeLoading)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-6 py-4 flex items-center gap-4">
        <Link href="/admin/places">
          <Button data-testid="button-back-admin" variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEditing ? "Edit Listing" : "Add New Listing"}
          </h1>
          <p className="text-sm text-muted-foreground">Houndsabout Admin</p>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground">Basic Details</h2>

              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input data-testid="input-name" placeholder="e.g. The Crown & Hound" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem>
                  <FormLabel>Category * <span className="text-muted-foreground font-normal">(select all that apply)</span></FormLabel>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {PLACE_CATEGORIES.map(c => {
                      const checked = (field.value ?? []).includes(c);
                      return (
                        <label
                          key={c}
                          data-testid={`check-category-${c}`}
                          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border cursor-pointer transition-colors text-sm font-medium select-none ${checked ? "border-zinc-700 bg-zinc-50 text-zinc-900" : "border-border bg-background text-muted-foreground hover:border-zinc-400"}`}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(v) => {
                              const current = field.value ?? [];
                              field.onChange(v ? [...current, c] : current.filter(x => x !== c));
                            }}
                          />
                          {CATEGORY_LABELS[c]}
                        </label>
                      );
                    })}
                  </div>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea data-testid="input-description" placeholder="Describe the place and its dog-friendliness…" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="importantInfo" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-destructive font-semibold">⚠ Important Information <span className="font-normal text-muted-foreground">(optional)</span></FormLabel>
                  <FormControl>
                    <Textarea
                      data-testid="input-important-info"
                      placeholder="e.g. Dogs permitted in garden only. Not allowed inside during food service hours."
                      rows={3}
                      maxLength={300}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">{(field.value ?? "").length}/300 characters</p>
                  <FormMessage />
                </FormItem>
              )} />
            </section>

            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground">Location</h2>

              <FormField control={form.control} name="address" render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address *</FormLabel>
                  <FormControl>
                    <Input data-testid="input-address" placeholder="e.g. 12 High Street" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="address2" render={({ field }) => (
                <FormItem>
                  <FormLabel>Address Line 2 <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                  <FormControl>
                    <Input data-testid="input-address2" placeholder="e.g. Stanton Business Park" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="town" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Town / City *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-town" placeholder="Oxford" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="postcode" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Postcode *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-postcode" placeholder="OX1 1AB" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="latitude" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Latitude *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-latitude" type="number" step="any" placeholder="51.7520" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="longitude" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Longitude *</FormLabel>
                    <FormControl>
                      <Input data-testid="input-longitude" type="number" step="any" placeholder="-1.2577" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
              <p className="text-xs text-muted-foreground">
                Find coordinates at{" "}
                <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="underline">
                  Google Maps
                </a>{" "}
                — right-click a location and copy the numbers shown.
              </p>
            </section>

            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground">Dog Policy</h2>

              <FormField control={form.control} name="dogPolicy" render={({ field }) => (
                <FormItem>
                  <FormLabel>Dog Access *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-dog-policy">
                        <SelectValue placeholder="Select policy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {DOG_POLICIES.map(p => (
                        <SelectItem key={p} value={p}>{POLICY_LABELS[p]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <div className="space-y-3">
                <FormField control={form.control} name="waterBowls" render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox data-testid="check-water-bowls" checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Water bowls provided</FormLabel>
                  </FormItem>
                )} />

                <FormField control={form.control} name="dogTreats" render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox data-testid="check-dog-treats" checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Dog treats available</FormLabel>
                  </FormItem>
                )} />

                <FormField control={form.control} name="dogMenu" render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox data-testid="check-dog-menu" checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">Dog menu available</FormLabel>
                  </FormItem>
                )} />
              </div>
            </section>

            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <div>
                <h2 className="font-semibold text-foreground">Opening Hours</h2>
                <p className="text-xs text-muted-foreground mt-0.5">Set hours for each day. Tick "Closed" if the place is shut that day.</p>
              </div>

              <div className="space-y-2">
                {DAYS_OF_WEEK.map((day) => {
                  const dayData = openingHours[day] ?? { open: "09:00", close: "17:00", closed: false };
                  return (
                    <div key={day} className="flex flex-wrap items-center gap-3 py-1.5 border-b border-border last:border-0">
                      <span className="w-24 text-sm font-medium text-foreground shrink-0">{DAY_LABELS[day]}</span>

                      <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                        <Checkbox
                          data-testid={`check-closed-${day}`}
                          checked={dayData.closed}
                          onCheckedChange={(v) => updateDay(day, { closed: !!v })}
                        />
                        <span className="text-xs text-muted-foreground">Closed</span>
                      </label>

                      {!dayData.closed && (
                        <div className="flex items-center gap-2">
                          <Input
                            data-testid={`input-open-${day}`}
                            type="time"
                            className="h-8 w-28 text-sm"
                            value={dayData.open}
                            onChange={(e) => updateDay(day, { open: e.target.value })}
                          />
                          <span className="text-xs text-muted-foreground">to</span>
                          <Input
                            data-testid={`input-close-${day}`}
                            type="time"
                            className="h-8 w-28 text-sm"
                            value={dayData.close}
                            onChange={(e) => updateDay(day, { close: e.target.value })}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground">Contact & Links</h2>

              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input data-testid="input-phone" placeholder="01865 000000" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="website" render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input data-testid="input-website" placeholder="https://example.com" {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="imageUrl" render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input data-testid="input-image-url" placeholder="https://..." {...field} value={field.value ?? ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </section>

            <div className="flex gap-3 justify-end">
              <Link href="/admin/places">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button
                data-testid="button-save-place"
                type="submit"
                disabled={isPending}
                style={{ backgroundColor: "#ff9900", color: "white" }}
              >
                {isPending ? "Saving…" : isEditing ? "Save Changes" : "Add Listing"}
              </Button>
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
}
