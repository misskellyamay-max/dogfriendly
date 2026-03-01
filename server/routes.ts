import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlaceSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    adminAuthenticated?: boolean;
  }
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.session?.adminAuthenticated) return next();
  res.status(401).json({ error: "Unauthorized" });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/api/places", async (req, res) => {
    try {
      const places = await storage.getAllPlaces();
      res.json(places);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch places" });
    }
  });

  app.get("/api/places/:id", async (req, res) => {
    try {
      const place = await storage.getPlaceById(req.params.id);
      if (!place) return res.status(404).json({ error: "Place not found" });
      res.json(place);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch place" });
    }
  });

  app.get("/api/search", async (req, res) => {
    try {
      const { q, lat, lon, radius = "5", type } = req.query;

      let places;

      if (lat && lon) {
        const latitude = parseFloat(lat as string);
        const longitude = parseFloat(lon as string);
        const radiusMiles = parseFloat(radius as string);
        if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMiles)) {
          return res.status(400).json({ error: "Invalid coordinates or radius" });
        }
        places = await storage.getPlacesNearLocation(latitude, longitude, radiusMiles);
      } else if (q) {
        const query = (q as string).trim();
        const isPostcode = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s?[0-9][A-Z]{2}$/i.test(query) ||
          /^[A-Z]{1,2}[0-9][0-9A-Z]?$/i.test(query);

        if (isPostcode) {
          places = await storage.searchPlacesByPostcode(query);
        } else {
          places = await storage.searchPlacesByTown(query);
        }
      } else {
        places = await storage.getAllPlaces();
      }

      if (type && type !== "all") {
        places = places.filter(p => p.category.includes(type as string));
      }

      res.json(places);
    } catch (err) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  // ── Admin auth ───────────────────────────────────────────────────────────────

  app.get("/api/admin/session", (req, res) => {
    res.json({ authenticated: req.session?.adminAuthenticated === true });
  });

  app.post("/api/admin/login", (req, res) => {
    const { password } = req.body;
    if (!password || password !== process.env.ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid password" });
    }
    req.session.adminAuthenticated = true;
    res.json({ authenticated: true });
  });

  app.post("/api/admin/logout", (req, res) => {
    req.session.destroy(() => {
      res.json({ authenticated: false });
    });
  });

  // ── Admin CRUD ───────────────────────────────────────────────────────────────

  app.post("/api/admin/places", requireAdmin, async (req, res) => {
    try {
      const data = insertPlaceSchema.parse(req.body);
      const place = await storage.createPlace(data);
      res.status(201).json(place);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
      res.status(500).json({ error: "Failed to create place" });
    }
  });

  app.patch("/api/admin/places/:id", requireAdmin, async (req, res) => {
    try {
      const data = insertPlaceSchema.partial().parse(req.body);
      const place = await storage.updatePlace(req.params.id, data);
      if (!place) return res.status(404).json({ error: "Place not found" });
      res.json(place);
    } catch (err) {
      if (err instanceof z.ZodError) return res.status(400).json({ error: err.errors });
      res.status(500).json({ error: "Failed to update place" });
    }
  });

  app.delete("/api/admin/places/:id", requireAdmin, async (req, res) => {
    try {
      const ok = await storage.deletePlace(req.params.id);
      if (!ok) return res.status(404).json({ error: "Place not found" });
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ error: "Failed to delete place" });
    }
  });

  app.post("/api/admin/places/bulk", requireAdmin, async (req, res) => {
    try {
      const rows: unknown[] = Array.isArray(req.body?.places) ? req.body.places : [];
      let created = 0;
      const errors: { row: number; message: string }[] = [];

      for (let i = 0; i < rows.length; i++) {
        const result = insertPlaceSchema.safeParse(rows[i]);
        if (!result.success) {
          errors.push({ row: i + 1, message: result.error.errors.map(e => e.message).join("; ") });
          continue;
        }
        try {
          await storage.createPlace(result.data);
          created++;
        } catch {
          errors.push({ row: i + 1, message: "Database error inserting row" });
        }
      }

      res.status(201).json({ created, errors });
    } catch (err) {
      res.status(500).json({ error: "Bulk import failed" });
    }
  });

  return httpServer;
}
