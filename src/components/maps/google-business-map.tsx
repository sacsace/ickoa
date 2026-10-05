"use client";

import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";
import { MapPin } from "lucide-react";

type Business = {
  id: string;
  name: string;
  category: string;
  lat: number | null;
  lng: number | null;
};

const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };
const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

export function GoogleBusinessMap({
  businesses,
  onSelect,
  selectedId,
}: {
  businesses: Business[];
  onSelect?: (id: string) => void;
  selectedId?: string;
}) {
  const withCoords = businesses.filter((b) => b.lat && b.lng);

  if (!API_KEY) {
    return (
      <div className="relative flex aspect-[16/10] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 lg:min-h-[480px]">
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?w=1200&q=80')",
          backgroundSize: "cover",
        }} />
        {withCoords.map((biz, i) => (
          <button
            key={biz.id}
            onClick={() => onSelect?.(biz.id)}
            className="absolute transition-transform hover:scale-125"
            style={{
              left: `${15 + ((i * 17) % 70)}%`,
              top: `${20 + ((i * 13) % 60)}%`,
            }}
          >
            <MapPin className={`h-8 w-8 drop-shadow-lg ${selectedId === biz.id ? "fill-foreground text-foreground" : "fill-white/90 text-white/90"}`} />
          </button>
        ))}
        <p className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-2 text-xs text-white/70">
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY 설정 시 Google Maps 활성화
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl">
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultCenter={CHENNAI_CENTER}
          defaultZoom={7}
          mapId="ickoa-business-map"
          style={{ width: "100%", height: "480px" }}
        >
          {withCoords.map((biz) => (
            <AdvancedMarker
              key={biz.id}
              position={{ lat: biz.lat!, lng: biz.lng! }}
              onClick={() => onSelect?.(biz.id)}
            />
          ))}
        </Map>
      </APIProvider>
    </div>
  );
}
