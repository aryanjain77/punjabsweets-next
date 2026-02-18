'use client';

import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SHOP_CONFIG } from '@/config/shop';

interface AddressLocation {
  latitude: number;
  longitude: number;
  address?: string;
}

interface MapSelectorProps {
  onLocationSelect: (location: AddressLocation) => void;
  initialLocation?: AddressLocation;
}

export function MapSelector({ onLocationSelect, initialLocation }: MapSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const marker = useRef<L.Marker | null>(null);
  const [location, setLocation] = useState<AddressLocation>(
    initialLocation || { latitude: SHOP_CONFIG.shopLatitude, longitude: SHOP_CONFIG.shopLongitude } 
  );
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    map.current = L.map(mapContainer.current).setView([location.latitude, location.longitude], 13);

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Replace default marker with custom pointer icon
    const customIcon = L.icon({
      iconUrl: 'https://res.cloudinary.com/do6jsro3v/image/upload/v1771414768/location_djncsm.png', // Place your icon in public folder
      iconSize: [25, 35],
      iconAnchor: [12, 35],
      popupAnchor: [0, -35],
    });

    // Add draggable marker
    marker.current = L.marker([location.latitude, location.longitude], {
      draggable: true,
      icon: customIcon,
    }).addTo(map.current);

    // Handle marker drag
    const handleDragEnd = () => {
      if (!marker.current) return;
      const pos = marker.current.getLatLng();
      const newLocation = { latitude: pos.lat, longitude: pos.lng };
      setLocation(newLocation);
      onLocationSelect(newLocation);
    };

    marker.current.on('dragend', handleDragEnd);

    // Handle map click to place marker
    const handleMapClick = (e: L.LeafletMouseEvent) => {
      const newLocation = { latitude: e.latlng.lat, longitude: e.latlng.lng };
      setLocation(newLocation);
      marker.current?.setLatLng([newLocation.latitude, newLocation.longitude]);
      onLocationSelect(newLocation);
    };

    map.current.on('click', handleMapClick);

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-gray-900">📍 Select Delivery Location</label>
        <button
          type="button"
          onClick={() => {
            if (navigator.geolocation) {
              setIsLoading(true);
              navigator.geolocation.getCurrentPosition(
                (position) => {
                  const newLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                  };
                  setLocation(newLocation);
                  map.current?.setView([newLocation.latitude, newLocation.longitude], 13);
                  marker.current?.setLatLng([newLocation.latitude, newLocation.longitude]);
                  onLocationSelect(newLocation);
                  setIsLoading(false);
                },
                () => {
                  setIsLoading(false);
                  alert('Could not get your location');
                }
              );
            }
          }}
          className="text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-50"
          disabled={isLoading}
        >
          {isLoading ? 'Getting location...' : '📍 Use my location'}
        </button>
      </div>

      <div
        ref={mapContainer}
        className="h-64 rounded-xl border-2 border-amber-200 overflow-hidden shadow-md hover:shadow-lg transition"
      />

      <div className="bg-blue-50/80 backdrop-blur-sm p-3 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-900">
          <span className="font-semibold">💡 Tip:</span> Click on the map or drag the marker to select your exact delivery location.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs bg-gray-100/50 p-3 rounded-lg">
        <div>
          <p className="text-gray-600">Latitude</p>
          <p className="font-semibold text-gray-900">{location.latitude.toFixed(6)}</p>
        </div>
        <div>
          <p className="text-gray-600">Longitude</p>
          <p className="font-semibold text-gray-900">{location.longitude.toFixed(6)}</p>
        </div>
      </div>
    </div>
  );
}
