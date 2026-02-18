'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface OrderLocation {
  id: string;
  customerName: string;
  phone: string;
  latitude: number;
  longitude: number;
  address: string;
  status: string;
}

interface MapViewerProps {
  orders: OrderLocation[];
}

export function MapViewer({ orders }: MapViewerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<(L.Marker | L.CircleMarker)[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Initialize map
    const bounds = orders.length > 0 
      ? L.latLngBounds(orders.map(o => [o.latitude, o.longitude]))
      : L.latLngBounds([[31.5, 74.3], [31.6, 74.4]]);

    map.current = L.map(mapContainer.current).fitBounds(bounds, { padding: [50, 50] });

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map.current);

    // Clear existing markers
    markers.current.forEach(marker => marker.remove());
    markers.current = [];

    // Add markers for each order
    orders.forEach((order) => {
      const marker = L.circleMarker([order.latitude, order.longitude], {
        radius: 6,
        fillColor: order.status === 'confirmed' ? '#10b981' : '#f59e0b',
        color: '#fff',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8,
      }).addTo(map.current!);

      const popupContent = `
        <div class="text-sm">
          <p class="font-bold">${order.customerName}</p>
          <p class="text-xs text-gray-600">${order.phone}</p>
          <p class="text-xs">${order.address}</p>
          <p class="text-xs mt-1">
            <span class="px-2 py-0.5 rounded text-white text-[10px] font-semibold ${
              order.status === 'confirmed' 
                ? 'bg-green-500' 
                : 'bg-amber-500'
            }">
              ${order.status}
            </span>
          </p>
        </div>
      `;

      marker.bindPopup(popupContent);
      markers.current.push(marker);
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [orders]);

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2">📍 Delivery Locations</h3>
        <p className="text-xs text-gray-600">
          {orders.length} order{orders.length !== 1 ? 's' : ''} shown on map
        </p>
      </div>

      <div
        ref={mapContainer}
        className="h-96 rounded-xl border-2 border-amber-200 overflow-hidden shadow-md"
      />

      {/* Legend */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-gray-100/50 p-3 rounded-lg">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <span className="text-gray-700">New Orders</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-gray-700">Confirmed</span>
        </div>
      </div>
    </div>
  );
}
