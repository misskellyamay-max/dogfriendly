import { useEffect, useRef } from "react";
import type { Place } from "@shared/schema";
import { categoryLabel, dogPolicyLabel } from "@/lib/utils";
import "leaflet/dist/leaflet.css";

interface MapViewProps {
  places: Place[];
  onPlaceClick?: (id: string) => void;
}

export function MapView({ places, onPlaceClick }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    // Dynamic import to avoid SSR issues
    import("leaflet").then((L) => {
      const leaflet = L.default ?? L;

      // Fix default marker icons broken by bundlers
      delete (leaflet.Icon.Default.prototype as any)._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      if (!containerRef.current || mapRef.current) return;

      // Calculate center from places, or default to England center
      const validPlaces = places.filter(p => p.latitude && p.longitude);
      let center: [number, number] = [52.5, -1.5];
      let zoom = 7;

      if (validPlaces.length === 1) {
        center = [validPlaces[0].latitude, validPlaces[0].longitude];
        zoom = 14;
      } else if (validPlaces.length > 1) {
        const avgLat = validPlaces.reduce((s, p) => s + p.latitude, 0) / validPlaces.length;
        const avgLon = validPlaces.reduce((s, p) => s + p.longitude, 0) / validPlaces.length;
        center = [avgLat, avgLon];
        zoom = 10;
      }

      const map = leaflet.map(containerRef.current, {
        center,
        zoom,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Custom orange marker icon
      const orangeIcon = leaflet.divIcon({
        html: `<div style="
          width: 28px; height: 28px;
          background: #ff9900;
          border: 2.5px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      validPlaces.forEach((place) => {
        const categories = Array.isArray(place.category) ? place.category : [place.category];
        const marker = leaflet.marker([place.latitude, place.longitude], { icon: orangeIcon });

        marker.bindPopup(`
          <div style="min-width:180px; font-family: system-ui, sans-serif;">
            <div style="font-weight:700; font-size:14px; margin-bottom:4px; color:#111;">${place.name}</div>
            <div style="font-size:12px; color:#666; margin-bottom:6px;">${place.town}, ${place.postcode}</div>
            <div style="font-size:11px; color:#888; margin-bottom:8px;">${categories.map(c => categoryLabel(c as any)).join(" · ")}</div>
            <div style="font-size:11px; margin-bottom:8px; color:#555;">${dogPolicyLabel(place.dogPolicy as any)}</div>
            <a href="/place/${place.id}" style="
              display:inline-block;
              background:#ff9900;
              color:white;
              font-size:12px;
              font-weight:600;
              padding:5px 12px;
              border-radius:6px;
              text-decoration:none;
            ">View listing</a>
          </div>
        `, { maxWidth: 240 });

        if (onPlaceClick) {
          marker.on("click", () => onPlaceClick(place.id));
        }

        marker.addTo(map);
      });

      // Fit map to all markers if multiple
      if (validPlaces.length > 1) {
        const bounds = leaflet.latLngBounds(validPlaces.map(p => [p.latitude, p.longitude]));
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      }

      mapRef.current = map;
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when places change
  useEffect(() => {
    if (!mapRef.current || places.length === 0) return;

    import("leaflet").then((L) => {
      const leaflet = L.default ?? L;

      // Clear existing layers (except tile layer)
      mapRef.current.eachLayer((layer: any) => {
        if (layer instanceof leaflet.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });

      const validPlaces = places.filter(p => p.latitude && p.longitude);

      const orangeIcon = leaflet.divIcon({
        html: `<div style="
          width: 28px; height: 28px;
          background: #ff9900;
          border: 2.5px solid white;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 2px 6px rgba(0,0,0,0.3);
        "></div>`,
        className: "",
        iconSize: [28, 28],
        iconAnchor: [14, 28],
        popupAnchor: [0, -30],
      });

      validPlaces.forEach((place) => {
        const categories = Array.isArray(place.category) ? place.category : [place.category];
        const marker = leaflet.marker([place.latitude, place.longitude], { icon: orangeIcon });

        marker.bindPopup(`
          <div style="min-width:180px; font-family: system-ui, sans-serif;">
            <div style="font-weight:700; font-size:14px; margin-bottom:4px; color:#111;">${place.name}</div>
            <div style="font-size:12px; color:#666; margin-bottom:6px;">${place.town}, ${place.postcode}</div>
            <div style="font-size:11px; color:#888; margin-bottom:8px;">${categories.map(c => categoryLabel(c as any)).join(" · ")}</div>
            <div style="font-size:11px; margin-bottom:8px; color:#555;">${dogPolicyLabel(place.dogPolicy as any)}</div>
            <a href="/place/${place.id}" style="
              display:inline-block;
              background:#ff9900;
              color:white;
              font-size:12px;
              font-weight:600;
              padding:5px 12px;
              border-radius:6px;
              text-decoration:none;
            ">View listing</a>
          </div>
        `, { maxWidth: 240 });

        marker.addTo(mapRef.current);
      });

      if (validPlaces.length > 1) {
        const bounds = leaflet.latLngBounds(validPlaces.map(p => [p.latitude, p.longitude] as [number, number]));
        mapRef.current.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      } else if (validPlaces.length === 1) {
        mapRef.current.setView([validPlaces[0].latitude, validPlaces[0].longitude], 14);
      }
    });
  }, [places]);

  return (
    <div
      ref={containerRef}
      data-testid="map-view"
      className="w-full rounded-xl overflow-hidden border border-border"
      style={{ height: "520px" }}
    />
  );
}
