import { db } from "./db";
import { places, users } from "@shared/schema";
import type { Place, InsertPlace, User, InsertUser } from "@shared/schema";
import { eq, ilike, or, sql } from "drizzle-orm";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllPlaces(): Promise<Place[]>;
  getPlaceById(id: string): Promise<Place | undefined>;
  searchPlacesByTown(town: string): Promise<Place[]>;
  searchPlacesByPostcode(postcode: string): Promise<Place[]>;
  getPlacesNearLocation(lat: number, lon: number, radiusMiles: number): Promise<Place[]>;
  createPlace(place: InsertPlace): Promise<Place>;
  updatePlace(id: string, place: Partial<InsertPlace>): Promise<Place | undefined>;
  deletePlace(id: string): Promise<boolean>;
  getPlaceCount(): Promise<number>;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3958.8;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllPlaces(): Promise<Place[]> {
    return db.select().from(places);
  }

  async getPlaceById(id: string): Promise<Place | undefined> {
    const [place] = await db.select().from(places).where(eq(places.id, id));
    return place;
  }

  async searchPlacesByTown(town: string): Promise<Place[]> {
    return db.select().from(places).where(
      or(
        ilike(places.town, `%${town}%`),
        ilike(places.address, `%${town}%`)
      )
    );
  }

  async searchPlacesByPostcode(postcode: string): Promise<Place[]> {
    const normalised = postcode.replace(/\s+/g, "").toUpperCase();
    const district = normalised.slice(0, Math.max(2, normalised.length - 3));
    return db.select().from(places).where(
      or(
        ilike(places.postcode, `${district}%`),
        ilike(places.postcode, `%${normalised}%`)
      )
    );
  }

  async getPlacesNearLocation(lat: number, lon: number, radiusMiles: number): Promise<Place[]> {
    const all = await db.select().from(places);
    return all
      .map(p => ({ place: p, distance: haversineDistance(lat, lon, p.latitude, p.longitude) }))
      .filter(({ distance }) => distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance)
      .map(({ place }) => place);
  }

  async createPlace(place: InsertPlace): Promise<Place> {
    const [created] = await db.insert(places).values(place).returning();
    return created;
  }

  async updatePlace(id: string, place: Partial<InsertPlace>): Promise<Place | undefined> {
    const [updated] = await db.update(places).set(place).where(eq(places.id, id)).returning();
    return updated;
  }

  async deletePlace(id: string): Promise<boolean> {
    const result = await db.delete(places).where(eq(places.id, id)).returning();
    return result.length > 0;
  }

  async getPlaceCount(): Promise<number> {
    const [{ count }] = await db.select({ count: sql<number>`count(*)` }).from(places);
    return Number(count);
  }
}

export const storage = new DatabaseStorage();
