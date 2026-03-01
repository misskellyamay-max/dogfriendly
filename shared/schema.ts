import { sql } from "drizzle-orm";
import { pgTable, text, varchar, real, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const PLACE_CATEGORIES = [
  "restaurant",
  "cafe",
  "pub",
  "retail",
  "hotel",
  "park",
  "beach",
  "attraction",
] as const;
export type PlaceCategory = typeof PLACE_CATEGORIES[number];

export const DOG_POLICIES = [
  "dogs_inside",
  "dogs_outside",
  "dogs_both",
] as const;
export type DogPolicy = typeof DOG_POLICIES[number];

export const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;
export type DayOfWeek = typeof DAYS_OF_WEEK[number];

export const dayHoursSchema = z.object({
  open: z.string(),
  close: z.string(),
  closed: z.boolean(),
});
export type DayHours = z.infer<typeof dayHoursSchema>;

export const openingHoursSchema = z.object({
  monday: dayHoursSchema,
  tuesday: dayHoursSchema,
  wednesday: dayHoursSchema,
  thursday: dayHoursSchema,
  friday: dayHoursSchema,
  saturday: dayHoursSchema,
  sunday: dayHoursSchema,
});
export type OpeningHours = z.infer<typeof openingHoursSchema>;

export const places = pgTable("places", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  address2: text("address2"),
  town: text("town").notNull(),
  postcode: text("postcode").notNull(),
  category: text("category").array().notNull().$type<PlaceCategory[]>(),
  description: text("description").notNull(),
  phone: text("phone"),
  website: text("website"),
  imageUrl: text("image_url"),
  dogPolicy: text("dog_policy").notNull().$type<DogPolicy>(),
  waterBowls: boolean("water_bowls").default(false),
  dogTreats: boolean("dog_treats").default(false),
  dogMenu: boolean("dog_menu").default(false),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  rating: real("rating").notNull().default(4.0),
  reviewCount: integer("review_count").notNull().default(0),
  openingHours: jsonb("opening_hours").$type<OpeningHours>(),
});

export const insertPlaceSchema = createInsertSchema(places).omit({ id: true }).extend({
  category: z.array(z.enum(PLACE_CATEGORIES)).min(1, "Select at least one category"),
  openingHours: openingHoursSchema.nullable().optional(),
});
export type InsertPlace = z.infer<typeof insertPlaceSchema>;
export type Place = typeof places.$inferSelect;
