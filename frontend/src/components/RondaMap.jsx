import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

// Fallback de coordenadas para CABA
const KNOWN_COORDINATES = {
  "lab tostadores de café": { lat: -34.5843, lng: -58.4373 },
  "cuervo café": { lat: -34.5901, lng: -58.4239 },
  "libros del pasaje": { lat: -34.5888, lng: -58.4289 },
  "jardín botánico carlos thays": { lat: -34.5828, lng: -58.4173 },
  "el rosedal de palermo": { lat: -34.5711, lng: -58.4172 },
  "niño gordo": { lat: -34.5885, lng: -58.4300 },
  "tres monos bar": { lat: -34.5869, lng: -58.4259 },
  "bar 878": { lat: -34.5947, lng: -58.4414 },
  "obrador florida": { lat: -34.5927, lng: -58.4184 },
  "plaza cortázar (serrano) & calles de diseño": { lat: -34.5882, lng: -58.4304 },
  "mercado de san telmo": { lat: -34.6186, lng: -58.3718 },
  "bar británico": { lat: -34.6277, lng: -58.3705 },
  "el federal": { lat: -34.6190, lng: -58.3745 },
  "museo de arte moderno (mamba)": { lat: -34.6225, lng: -58.3708 },
  "parque lezama": { lat: -34.6280, lng: -58.3697 },
  "pulpería quilapán": { lat: -34.6247, lng: -58.3712 },
  "parrilla la brigada": { lat: -34.6178, lng: -58.3725 },
  "pasaje de la defensa (casa de los ezeiza)": { lat: -34.6219, lng: -58.3715 },
  "el ateneo grand splendid": { lat: -34.5959, lng: -58.3923 },
  "museo nacional de bellas artes (mnba)": { lat: -34.5839, lng: -58.3930 },
  "la biela": { lat: -34.5878, lng: -58.3908 },
  "centro cultural recoleta (ccr)": { lat: -34.5875, lng: -58.3924 },
  "cumaná": { lat: -34.5976, lng: -58.3887 },
  "plaza francia & cementerio de la recoleta": { lat: -34.5862, lng: -58.3912 },
  "los salones del piano nobile & jardín del palacio duhau": { lat: -34.5898, lng: -58.3872 },
  "sifón sodería": { lat: -34.5861, lng: -58.4507 },
  "bar la fuerza": { lat: -34.5872, lng: -58.4447 },
  "georgie's": { lat: -34.5855, lng: -58.4519 },
  "donnet": { lat: -34.5852, lng: -58.4485 },
  "falena librería & cava": { lat: -34.5880, lng: -58.4533 },
  "parque los andes": { lat: -34.5889, lng: -58.4496 },
  "anafe": { lat: -34.5772, lng: -58.4552 },
  "strange brewing": { lat: -34.5804, lng: -58.4509 },
  "sântal café & listening bar": { lat: -34.5724, lng: -58.4538 },
  "tres tostadores": { lat: -34.5746, lng: -58.4486 },
  "mercado de las pulgas": { lat: -34.5843, lng: -58.4443 },
  "corte comedor": { lat: -34.5574, lng: -58.4491 },
  "paseo vía viva & barrio chino": { lat: -34.5583, lng: -58.4502 },
  "museo de arte español enrique larreta": { lat: -34.5619, lng: -58.4578 },
  "barrancas de belgrano & glorieta de tango": { lat: -34.5601, lng: -58.4506 },
  "el torreón de belgrano r": { lat: -34.5729, lng: -58.4682 },
  "pizzería burgio": { lat: -34.5627, lng: -58.4593 }
};

const NEIGHBORHOOD_CENTERS = {
  "Palermo": { lat: -34.5888, lng: -58.4300 },
  "San Telmo": { lat: -34.6219, lng: -58.3715 },
  "Recoleta": { lat: -34.5878, lng: -58.3908 },
  "Chacarita": { lat: -34.5861, lng: -58.4507 },
  "Colegiales": { lat: -34.5772, lng: -58.4552 },
  "Belgrano": { lat: -34.5601, lng: -58.4506 }
};

export const getPlaceGoogleMapsUrl = (placeName, address) => {
  const query = encodeURIComponent(`${placeName}, ${address}, Buenos Aires`);
  return `https://www.google.com/maps/search/?api=1&query=${query}`;
};

export default function RondaMap({ schedule = [], neighborhood = 'Palermo' }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Resolver coordenadas para cada parada
    const validPoints = schedule.map((item, idx) => {
      let lat = item.lat;
      let lng = item.lng;

      if (!lat || !lng) {
        const key = item.place_name.toLowerCase().trim();
        const found = KNOWN_COORDINATES[key];
        if (found) {
          lat = found.lat;
          lng = found.lng;
        } else {
          // Búsqueda por coincidencia parcial
          const matchedKey = Object.keys(KNOWN_COORDINATES).find(k => k.includes(key) || key.includes(k));
          if (matchedKey) {
            lat = KNOWN_COORDINATES[matchedKey].lat;
            lng = KNOWN_COORDINATES[matchedKey].lng;
          }
        }
      }

      // Si no se encuentra, usar centro del barrio con desplazamiento mínimo
      if (!lat || !lng) {
        const center = NEIGHBORHOOD_CENTERS[neighborhood] || { lat: -34.5888, lng: -58.4300 };
        lat = center.lat + (idx * 0.002);
        lng = center.lng + (idx * 0.002);
      }

      return {
        ...item,
        lat,
        lng,
        index: idx + 1
      };
    });

    if (validPoints.length === 0) return;

    // Destruir mapa previo si existe
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    // Inicializar mapa de Leaflet
    const defaultCenter = [validPoints[0].lat, validPoints[0].lng];
    const map = L.map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      scrollWheelZoom: false,
      zoomControl: true,
      attributionControl: false
    });

    mapInstanceRef.current = map;

    // Capa de mosaicos 100% libre y gratuita de OpenStreetMap (sin API key requerida ni costos)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
    }).addTo(map);

    // Trazar línea de recorrido a pie (polilínea)
    const latLngs = validPoints.map(p => [p.lat, p.lng]);
    L.polyline(latLngs, {
      color: '#C25E3E', // Terracota cálido de Ronda
      weight: 3.5,
      opacity: 0.85,
      dashArray: '6, 8',
      lineCap: 'round',
      lineJoin: 'round'
    }).addTo(map);

    // Añadir marcadores personalizados para cada punto
    const bounds = L.latLngBounds();

    validPoints.forEach((point) => {
      bounds.extend([point.lat, point.lng]);

      const gmapsUrl = getPlaceGoogleMapsUrl(point.place_name, point.address);

      // Icono HTML numerado estilo Ronda
      const customIcon = L.divIcon({
        className: 'ronda-custom-marker',
        html: `
          <div style="
            background: linear-gradient(135deg, #182A24 0%, #2A4B3D 100%);
            color: #FDFBF7;
            width: 32px;
            height: 32px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 14px;
            border: 2.5px solid #FFFFFF;
            box-shadow: 0 4px 12px rgba(24, 42, 36, 0.35);
            font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
            transition: transform 0.2s ease;
          ">
            ${point.index}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
        popupAnchor: [0, -18]
      });

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', system-ui, sans-serif; padding: 4px; min-width: 190px;">
          <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--accent-orange, #E06D28); margin-bottom: 2px;">
            Parada ${point.index} · ${point.time_slot || ''}
          </div>
          <div style="font-size: 14px; font-weight: 700; color: var(--text-main, #182A24); margin-bottom: 4px;">
            ${point.place_name}
          </div>
          <div style="font-size: 11px; color: var(--text-muted, #5E6F66); margin-bottom: 8px;">
            ${point.address}
          </div>
          <a 
            href="${gmapsUrl}" 
            target="_blank" 
            rel="noopener noreferrer"
            style="
              display: inline-flex;
              align-items: center;
              gap: 4px;
              font-size: 11px;
              font-weight: 600;
              color: var(--text-main, #182A24);
              background-color: var(--bg-card-inner, #EBF2EC);
              padding: 5px 9px;
              border-radius: 8px;
              text-decoration: none;
              border: 1px solid var(--border-card, #D5E3D8);
            "
          >
            <span>Abrir en Google Maps</span>
            <span style="font-size: 13px;">↗</span>
          </a>
        </div>
      `;

      L.marker([point.lat, point.lng], { icon: customIcon })
        .bindPopup(popupContent, { maxWidth: 260, className: 'ronda-map-popup' })
        .addTo(map);
    });

    // Ajustar el zoom automáticamente para que todos los puntos sean visibles
    if (validPoints.length > 1) {
      map.fitBounds(bounds, { padding: [35, 35], maxZoom: 16 });
    } else {
      map.setView([validPoints[0].lat, validPoints[0].lng], 15);
    }

    // Invalida el tamaño para re-renderizado correcto si el contenedor cambió
    setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 250);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [schedule, neighborhood]);

  return (
    <div className="ronda-card border rounded-3xl p-4 sm:p-5 shadow-xs mb-8 transition-colors">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl ronda-icon-box border flex items-center justify-center">
            <Navigation className="w-4 h-4 text-[#E06D28]" />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)]">
              Mapa del Recorrido
            </h4>
            <p className="text-[11px] ronda-text-muted">
              {schedule.length} paradas conectadas a pie en {neighborhood}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-medium ronda-text-muted ronda-card-inner border px-2.5 py-1 rounded-lg">
          Toca cada pin para ver detalles
        </span>
      </div>

      {/* Contenedor del mapa */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-64 sm:h-72 rounded-2xl overflow-hidden z-10 border ronda-border"
        style={{ minHeight: '260px' }}
      />
    </div>
  );
}
