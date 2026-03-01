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
import { insertPlaceSchema, PLACE_CATEGORIES, DOG_POLICIES } from "@shared/schema";
import type { Place } from "@shared/schema";
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
      town: "",
      postcode: "",
      category: "restaurant",
      description: "",
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
    },
  });

  useEffect(() => {
    if (existing) {
      form.reset({
        name: existing.name,
        address: existing.address,
        town: existing.town,
        postcode: existing.postcode,
        category: existing.category,
        description: existing.description,
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
                  <FormLabel>Category *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PLACE_CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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

            <section className="bg-card border border-border rounded-xl p-5 space-y-4">
              <h2 className="font-semibold text-foreground">Rating</h2>
              <div className="grid grid-cols-2 gap-4">
                <FormField control={form.control} name="rating" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rating (0–5)</FormLabel>
                    <FormControl>
                      <Input data-testid="input-rating" type="number" step="0.1" min="0" max="5" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />

                <FormField control={form.control} name="reviewCount" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Review Count</FormLabel>
                    <FormControl>
                      <Input data-testid="input-review-count" type="number" min="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
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
