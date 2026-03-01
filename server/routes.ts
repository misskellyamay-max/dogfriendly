import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertPlaceSchema } from "@shared/schema";
import { z } from "zod";

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
        places = places.filter(p => p.category === type);
      }

      res.json(places);
    } catch (err) {
      res.status(500).json({ error: "Search failed" });
    }
  });

  return httpServer;
}
