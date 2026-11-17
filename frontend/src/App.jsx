import React, { useState, useEffect, useMemo } from 'react';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Sparkles, 
  Footprints, 
  Coffee, 
  Utensils, 
  GlassWater, 
  Landmark, 
  Trees, 
  BookOpen, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  Heart,
  Users,
  Smile,
  CloudRain,
  Sun,
  Moon,
  Cloud,
  CloudSun,
  Share2,
  ChevronLeft,
  ChevronUp,
  ChevronDown,
  Menu,
  Music,
  IceCream,
  Wine,
  User,
  Check,
  X,
  Mail,
  Lock,
  Calendar,
  CreditCard,
  Dog,
  Salad,
  Info,
  Bookmark,
  Gamepad2,
  Plus
} from 'lucide-react';
import RondaMap from './components/RondaMap';
import RecommendedScreen from './components/RecommendedScreen';
import ProfileModal from './components/ProfileModal';
import LOCAL_PLACES_CATALOG from './data/places_caba.json';

const API_BASE_URL = (() => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, '');
  }
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return '';
  }
  return 'http://localhost:8000';
})();

const BARRIOS = [
  { id: 'Palermo', label: 'Palermo', sub: 'Diseño & Vanguardia' },
  { id: 'San Telmo', label: 'San Telmo', sub: 'Bohemio & Bares Notables' },
  { id: 'Recoleta', label: 'Recoleta', sub: 'Arte & Belle Époque' },
  { id: 'Chacarita', label: 'Chacarita', sub: 'Neo-bodegones & Vermut' },
  { id: 'Colegiales', label: 'Colegiales', sub: 'Café & Mercado de Pulgas' },
  { id: 'Belgrano', label: 'Belgrano', sub: 'Bajo Belgrano & Vía Viva' },
  { id: 'San Nicolás', label: 'San Nicolás', sub: 'Teatro Colón & El Bajo' },
  { id: 'Puerto Madero', label: 'Puerto Madero', sub: 'Reserva & Paseo Ribereño' },
  { id: 'Caballito', label: 'Caballito', sub: 'Tranvía Histórico & Parques' },
  { id: 'Almagro', label: 'Almagro', sub: 'Tango & Confiterías Notables' },
  { id: 'Villa Crespo', label: 'Villa Crespo', sub: 'El San Ber & Club Atlanta' },
  { id: 'Cualquiera', label: 'Sorpréndeme', sub: 'Lo mejor de CABA' },
];

const ACTIVITIES_BY_SLOT = {
  morning: [
    { id: 'coffee', label: 'Café de especialidad', icon: Coffee, techado: 'si' },
    { id: 'bakery', label: 'Panadería & Medialunas de culto', icon: Coffee, techado: 'si' },
    { id: 'walk_historic', label: 'Recorrido a pie por pasajes', icon: Footprints, techado: 'no' },
    { id: 'culture', label: 'Museo o visita arquitectónica', icon: Landmark, techado: 'si' },
    { id: 'park', label: 'Parque arbolado / Botánico', icon: Trees, techado: 'no' },
    { id: 'reading', label: 'Lectura o café tranquilo', icon: BookOpen, techado: 'si' },
  ],
  lunch: [
    { id: 'bodegon', label: 'Bodegón porteño o pastas', icon: Utensils, techado: 'si' },
    { id: 'parrilla', label: 'Parrilla clásica porteña', icon: Utensils, techado: 'si' },
    { id: 'outdoor', label: 'Mesas al sol o patio', icon: Sun, techado: 'no' },
    { id: 'walk', label: 'Caminata de sobremesa', icon: Footprints, techado: 'no' },
    { id: 'dessert', label: 'Helado artesanal de postre', icon: IceCream, techado: 'mixto' },
    { id: 'coffee', label: 'Café de especialidad al final', icon: Coffee, techado: 'si' },
  ],
  afternoon: [
    { id: 'coffee', label: 'Café de especialidad & Merienda', icon: Coffee, techado: 'si' },
    { id: 'books', label: 'Librería con encanto o vinilos', icon: BookOpen, techado: 'si' },
    { id: 'culture', label: 'Museo o galería de arte', icon: Landmark, techado: 'si' },
    { id: 'park', label: 'Plaza o parque para caminar', icon: Trees, techado: 'no' },
    { id: 'walk_historic', label: 'Paseo por esquinas históricas', icon: Footprints, techado: 'no' },
    { id: 'vermut_early', label: 'Tapeo o Vermut al atardecer', icon: Wine, techado: 'mixto' },
  ],
  night: [
    { id: 'dinner', label: 'Cena porteña (Bodegón o Autor)', icon: Utensils, techado: 'si' },
    { id: 'drinks', label: 'Coctelería & Speakeasy', icon: GlassWater, techado: 'si' },
    { id: 'music', label: 'Música en vivo o Jazz', icon: Music, techado: 'si' },
    { id: 'night_walk', label: 'Caminata nocturna por el barrio', icon: Footprints, techado: 'no' },
    { id: 'dessert', label: 'Heladería artesanal de noche', icon: IceCream, techado: 'mixto' },
    { id: 'beer', label: 'Cervecería o vermutería', icon: Wine, techado: 'mixto' },
  ],
  late_night: [
    { id: 'drinks', label: 'Barra de cócteles / Tragos de autor', icon: GlassWater, techado: 'si' },
    { id: 'beer', label: 'Cervecería o vermutería', icon: Wine, techado: 'mixto' },
    { id: 'late_food', label: 'Bajón nocturno / Pizza al corte', icon: Utensils, techado: 'si' },
    { id: 'conversation', label: 'Sobremesa tranquila con amigos', icon: Users, techado: 'si' },
  ],
};

const TIME_SLOT_OPTIONS = [
  {
    id: 'morning',
    title: '🥐 Desayuno / Mañana',
    shortTitle: 'Desayuno',
    timeRange: '09:00 a 12:00',
    description: 'Cafés de culto, medialunas y parques',
    isPast: (h) => h >= 12,
  },
  {
    id: 'lunch',
    title: '🍝 Almuerzo / Mediodía',
    shortTitle: 'Almuerzo',
    timeRange: '12:30 a 15:30',
    description: 'Bodegones, pastas caseras y mesas al sol',
    isPast: (h) => h >= 16,
  },
  {
    id: 'afternoon',
    title: '☕ Merienda / Tarde',
    shortTitle: 'Merienda',
    timeRange: '16:00 a 19:30',
    description: 'Librerías, cafés de autor y galerías',
    isPast: (h) => h >= 20,
  },
  {
    id: 'night',
    title: '🍷 Cena / Noche',
    shortTitle: 'Cena',
    timeRange: '20:30 a 00:00',
    description: 'Gastronomía porteña, vermut y copas',
    isPast: (h) => h >= 0 && h < 5,
  },
];

const QUICK_IDEAS = [
  'Recorrido a pie por pasajes históricos',
  'Lugar pet friendly',
  'Mesas en la vereda / Aire libre',
  'Plan tranquilo para charlar',
  'Con música suave de fondo',
  'Rincón con buena luz para leer'
];

const BUDGET_OPTIONS = [
  {
    id: 'economico',
    tierCode: '$',
    label: 'Económico',
    amount: '$ 10.000',
    usd: '~USD $9'
  },
  {
    id: 'clasico',
    tierCode: '$$',
    label: 'Clásico',
    amount: '$ 25.000',
    usd: '~USD $22'
  },
  {
    id: 'especial',
    tierCode: '$$$',
    label: 'Especial',
    amount: '$ 55.000',
    usd: '~USD $48'
  },
  {
    id: 'otro',
    tierCode: '$$',
    label: 'Otro monto',
    amount: 'Clásico Porteño',
    usd: '~USD $30'
  }
];

const WMO_WEATHER_MAP = {
  0: { label: 'Cielo despejado', isRain: false },
  1: { label: 'Mayormente despejado', isRain: false },
  2: { label: 'Parcialmente nublado', isRain: false },
  3: { label: 'Nublado', isRain: false },
  45: { label: 'Neblina matinal', isRain: false },
  48: { label: 'Neblina', isRain: false },
  51: { label: 'Llovizna leve', isRain: true },
  53: { label: 'Llovizna', isRain: true },
  55: { label: 'Llovizna persistente', isRain: true },
  61: { label: 'Lluvia ligera', isRain: true },
  63: { label: 'Lluvia moderada', isRain: true },
  65: { label: 'Lluvia intensa', isRain: true },
  80: { label: 'Chubascos aislados', isRain: true },
  81: { label: 'Chubascos', isRain: true },
  82: { label: 'Chubascos fuertes', isRain: true },
  95: { label: 'Tormenta eléctrica', isRain: true },
};

// ==========================================
// HELPER DINÁMICO DE CLIMA: LUNA (NOCHE), NUBE, LLUVIA O SOL
// ==========================================
function getWeatherVisual(weather, currentHour) {
  if (!weather) {
    return {
      Icon: Moon,
      iconColor: 'text-[#E06D28]',
      text: '22°C · Noche despejada',
      label: 'Noche despejada'
    };
  }

  const isNight = currentHour >= 20 || currentHour < 7;
  const labelLower = (weather.label || '').toLowerCase();
  const isRain = weather.isRain || labelLower.includes('lluvia') || labelLower.includes('llovizna') || labelLower.includes('tormenta');
  const isCloudy = labelLower.includes('nublado') || labelLower.includes('neblina') || labelLower.includes('cubierto');

  if (isRain) {
    return {
      Icon: CloudRain,
      iconColor: 'text-sky-600',
      text: `${weather.temp}°C · Lluvia`,
      label: weather.label || 'Lluvia'
    };
  }
  if (isNight) {
    return {
      Icon: Moon,
      iconColor: 'text-[#E06D28]',
      text: `${weather.temp}°C · Noche ${isCloudy ? 'nublada' : 'despejada'}`,
      label: `Noche ${isCloudy ? 'nublada' : 'despejada'}`
    };
  }
  if (isCloudy) {
    return {
      Icon: Cloud,
      iconColor: 'text-slate-500',
      text: `${weather.temp}°C · ${weather.label || 'Nublado'}`,
      label: weather.label || 'Nublado'
    };
  }
  return {
    Icon: Sun,
    iconColor: 'text-[#E06D28]',
    text: `${weather.temp}°C · ${weather.label || 'Soleado'}`,
    label: weather.label || 'Cielo despejado'
  };
}

// ==========================================
// COMPONENTE: Ventana de espera / Transición idéntica a la apertura inicial
// ==========================================
function RondaSplashWaitingScreen({ subtitle = "Buenos Aires a tu ritmo", hint = null, onDismiss = null }) {
  return (
    <aside 
      onClick={onDismiss}
      className="fixed inset-0 z-50 ronda-canvas flex flex-col items-center justify-center p-6 cursor-pointer select-none transition-colors duration-300 animate-fade-in"
      aria-label="Cargando"
    >
      <div className="flex flex-col items-center animate-fade-in">
        <div className="relative w-24 h-24 flex items-center justify-center mb-6">
          <div className="absolute inset-0 rounded-full ronda-tag animate-ping opacity-60"></div>
          <div className="absolute inset-2 rounded-full border border-[var(--border-card)]"></div>
          <div className="w-14 h-14 rounded-full bg-[#182A24] dark:bg-[#1E3328] border border-[var(--border-card)] flex items-center justify-center shadow-lg">
            <Compass className="w-7 h-7 text-white animate-pulse" />
          </div>
        </div>

        <h1 className="font-editorial text-5xl sm:text-6xl font-bold tracking-tight text-[var(--text-main)] mb-2">
          ronda<span className="text-[#E06D28]">.</span>
        </h1>

        <p className="text-xs uppercase tracking-widest ronda-text-muted font-semibold">
          {subtitle}
        </p>
      </div>

      {hint && (
        <div className="absolute bottom-8 text-[11px] ronda-text-muted">
          {hint}
        </div>
      )}
    </aside>
  );
}

// ==========================================
// HELPERS SENSORIALES: HÁPTICO & CHISPEO DORADO
// ==========================================
const triggerHaptic = (ms = 8) => {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(ms);
    } catch {
      // Ignorar si no está soportado o permitido
    }
  }
};

function SparkleBurst({ active }) {
  if (!active) return null;
  return (
    <span className="absolute inset-0 pointer-events-none flex items-center justify-center z-20">
      <span className="absolute w-1.5 h-1.5 rounded-full bg-[#E06D28] animate-particle" style={{ '--tx': '-16px', '--ty': '-16px' }} />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-[#E06D28] animate-particle" style={{ '--tx': '16px', '--ty': '-16px' }} />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-[#E06D28] animate-particle" style={{ '--tx': '-16px', '--ty': '16px' }} />
      <span className="absolute w-1.5 h-1.5 rounded-full bg-[#E06D28] animate-particle" style={{ '--tx': '16px', '--ty': '16px' }} />
    </span>
  );
}

// ==========================================
// COMPONENTE: Menú lateral de escritorio (se abre al pasar el cursor)
// ==========================================
function DesktopSidebar({ isOpen, setIsOpen, screen, onNavigate, setShowProfileModal, currentUser }) {
  return (
    <>
      {/* Telón sutil para cerrar al hacer clic afuera y evitar superposición */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="hidden lg:block fixed inset-0 z-40 bg-black/15 backdrop-blur-[1px] transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Zona de detección de cursor en el borde izquierdo de la pantalla */}
      <div 
        onMouseEnter={() => setIsOpen(true)}
        className="hidden lg:block fixed top-0 left-0 w-3.5 h-screen z-40 pointer-events-auto"
        aria-hidden="true"
      />

      {/* Drawer del menú lateral con monograma 'r.' */}
      <aside
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        className={`hidden lg:flex fixed top-0 left-0 w-64 ronda-sidebar border-r flex-col justify-between p-6 h-screen z-50 shadow-2xl transition-all duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menú principal de navegación"
      >
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-2xl bg-[#182A24] dark:bg-[#1E3328] border border-white/10 text-white flex items-center justify-center font-editorial font-bold text-xl shadow-xs">
                r<span className="text-[#E06D28]">.</span>
              </div>
              <span className="font-editorial text-xl font-bold text-[var(--text-main)]">
                ronda<span className="text-[#E06D28]">.</span>
              </span>
            </div>
            <button 
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl ronda-text-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--text-main)] transition cursor-pointer btn-latido"
              title="Cerrar menú"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5">
            <button 
              type="button"
              onClick={() => { triggerHaptic(8); onNavigate('config', 'quick'); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm cursor-pointer transition btn-latido ${
                screen === 'config' ? 'ronda-tag border font-bold shadow-xs text-[var(--text-main)]' : 'ronda-text-muted hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Compass className={`w-4 h-4 ${screen === 'config' ? 'text-[#E06D28]' : 'ronda-text-muted'}`} />
              <span>Crear recorrido</span>
            </button>
            <button 
              type="button"
              onClick={() => { triggerHaptic(8); onNavigate('recommended'); setIsOpen(false); }}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl font-semibold text-sm cursor-pointer transition btn-latido ${
                screen === 'recommended' ? 'ronda-tag border font-bold shadow-xs text-[var(--text-main)]' : 'ronda-text-muted hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 font-medium'
              }`}
            >
              <Sparkles className={`w-4 h-4 ${screen === 'recommended' ? 'text-[#E06D28]' : 'ronda-text-muted'}`} />
              <span>Recomendados</span>
            </button>
          </nav>
        </div>

        {/* Tarjeta de perfil con avatar o inicial (Adaptada a modo claro y oscuro) */}
        <button 
          type="button"
          onClick={() => { triggerHaptic(8); setShowProfileModal(true); setIsOpen(false); }}
          className="ronda-card border hover:border-[#E06D28] transition rounded-2xl p-3 flex items-center gap-3 w-full text-left cursor-pointer btn-latido shadow-2xs"
        >
          <div className="w-9 h-9 rounded-full bg-[#182A24] dark:bg-[#243B30] text-white flex items-center justify-center font-bold text-xs shrink-0">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-4 h-4 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] ronda-text-muted leading-none mb-1">
              {currentUser?.neighborhood || 'Cuenta'}
            </p>
            <p className="text-sm font-semibold text-[var(--text-main)] truncate">
              {currentUser?.name || 'Mi Perfil'}
            </p>
          </div>
          <span className="text-xs ronda-text-muted">···</span>
        </button>
      </aside>
    </>
  );
}

// ==========================================
// COMPONENTE: Barra inferior móvil (ocultable hacia abajo)
// ==========================================
function MobileBottomNav({ isVisible, setIsVisible, screen, onNavigate, setShowProfileModal, currentUser }) {
  return (
    <>
      {/* Botón flotante para desocultar el menú cuando está minimizado */}
      {!isVisible && (
        <button
          type="button"
          onClick={() => { triggerHaptic(8); setIsVisible(true); }}
          className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 z-40 bg-[#182A24]/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg border border-[#30483E] flex items-center gap-2 active:scale-95 transition cursor-pointer btn-latido"
          aria-label="Mostrar menú"
        >
          <ChevronUp className="w-4 h-4 text-[#E06D28]" />
          <span>Menú</span>
        </button>
      )}

      {/* Barra inferior */}
      <nav 
        className={`lg:hidden fixed bottom-0 left-0 right-0 z-40 ronda-header backdrop-blur-md border-t px-4 py-2 flex items-center justify-around shadow-lg transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : 'translate-y-full pointer-events-none'
        }`}
      >
        <button 
          type="button" 
          onClick={() => { triggerHaptic(8); onNavigate('config', 'quick'); }}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition cursor-pointer btn-latido ${
            screen === 'config' ? 'text-[var(--text-main)] font-bold' : 'ronda-text-muted'
          }`}
        >
          <Compass className={`w-5 h-5 ${screen === 'config' ? 'text-[#E06D28]' : 'ronda-text-muted'}`} />
          <span>Crear</span>
        </button>

        <button 
          type="button" 
          onClick={() => { triggerHaptic(8); onNavigate('recommended'); }}
          className={`flex flex-col items-center gap-1 text-[11px] font-medium transition cursor-pointer btn-latido ${
            screen === 'recommended' ? 'text-[var(--text-main)] font-bold' : 'ronda-text-muted'
          }`}
        >
          <Sparkles className={`w-5 h-5 ${screen === 'recommended' ? 'text-[#E06D28]' : 'ronda-text-muted'}`} />
          <span>Recomendados</span>
        </button>

        <button 
          type="button" 
          onClick={() => { triggerHaptic(8); setShowProfileModal(true); }}
          className="flex flex-col items-center gap-1 text-[11px] font-medium ronda-text-muted hover:text-[var(--text-main)] transition cursor-pointer btn-latido"
        >
          <div className="w-6 h-6 rounded-full bg-[#182A24] dark:bg-[#243B30] text-white flex items-center justify-center text-[10px] font-bold">
            {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-white" />}
          </div>
          <span>{currentUser?.name ? currentUser.name.split(' ')[0] : 'Perfil'}</span>
        </button>

        {/* Opción para ocultar hacia abajo */}
        <button 
          type="button" 
          onClick={() => { triggerHaptic(8); setIsVisible(false); }}
          className="flex flex-col items-center gap-1 text-[11px] font-medium ronda-text-muted hover:text-[var(--text-main)] transition cursor-pointer btn-latido"
          title="Ocultar menú"
        >
          <ChevronDown className="w-5 h-5 ronda-text-muted" />
          <span>Ocultar</span>
        </button>
      </nav>
    </>
  );
}

// ==========================================
// COMPONENTE: Sugerencia flotante de ronda activa (lado derecho abajo)
// ==========================================
function ActivePlanSuggestion({ plan, onClick, mobileNavVisible, configView }) {
  const [dismissed, setDismissed] = useState(false);
  if (!plan || dismissed) return null;

  // Si está la barra fija inferior en vista 'adjust' ("Armar mi recorrido"),
  // elevamos la posición para que NUNCA se superpongan ("no se pisen").
  const bottomPositionClass = configView === 'adjust'
    ? (mobileNavVisible ? 'bottom-40 lg:bottom-24' : 'bottom-24 lg:bottom-20')
    : (mobileNavVisible ? 'bottom-20 lg:bottom-6' : 'bottom-6');

  return (
    <aside 
      aria-label="Sugerencia de ronda activa"
      className={`fixed right-4 sm:right-6 z-40 transition-all duration-300 ${bottomPositionClass}`}
    >
      <div className="relative group">
        <button
          type="button"
          onClick={onClick}
          className="bg-[#182A24] hover:bg-[#223931] text-white p-3 sm:px-4 sm:py-3 pr-8 rounded-2xl shadow-2xl border border-[#30483E] flex items-center gap-3 transition-all duration-200 active:scale-95 cursor-pointer max-w-xs animate-fade-in hover:shadow-emerald-950/20"
        >
          <div className="w-8 h-8 rounded-xl bg-[#2A4B3D] flex items-center justify-center shrink-0 text-[#E06D28]">
            <Compass className="w-4 h-4" />
          </div>
          <div className="text-left min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] block leading-none mb-1">
              Ronda generada · {plan.schedule?.length || 2} paradas
            </span>
            <p className="text-xs sm:text-sm font-semibold text-white leading-tight truncate">
              Volver a tu ronda en {plan.neighborhood} →
            </p>
          </div>
        </button>

        {/* Botón para cerrar la sugerencia si el usuario no desea verla */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setDismissed(true); }}
          className="absolute top-2.5 right-2.5 p-1 rounded-full text-[#A2B3AA] hover:text-white hover:bg-white/10 transition cursor-pointer"
          title="Descartar sugerencia"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}

// ==========================================
// COMPONENTE: Modal Carta Translúcida con Detalle del Lugar y Actividades
// ==========================================
function PlaceDetailModal({ place, onClose, getPlaceGoogleMapsUrl, onPlanFromHere, isFavorite, onToggleFavorite, isVisited, onToggleVisited }) {
  if (!place) return null;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Si no viene image_url en el item del itinerario, intentar inferir del ID o nombre
  const placePhotoUrl = place.image_url || (place.id ? `/places/${place.id}.jpg` : null);

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/55 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 transition-all duration-300"
      onClick={onClose}
    >
      <div 
        className="ronda-card border backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.35)] rounded-3xl p-5 sm:p-7 max-w-lg w-full relative max-h-[92vh] overflow-y-auto transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Botón Cerrar Flotante */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full ronda-card hover:bg-black/5 dark:hover:bg-white/10 text-[var(--text-main)] border shadow-md transition cursor-pointer"
          title="Cerrar detalle"
        >
          <X className="w-4 h-4" />
        </button>

        {/* 1. HERO FOTOGRÁFICO NORMALIZADO (Opción A: Postal enmarcada con aspect-ratio 16:9) */}
        {placePhotoUrl && (
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden mb-4 shadow-sm border border-[#E2E8F0]/80 bg-[#F1F5F9]">
            <img 
              src={placePhotoUrl} 
              alt={place.place_name || place.name} 
              className="w-full h-full object-cover object-center transition duration-300 hover:scale-[1.02]"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
              }}
            />
            {/* Gradiente sutil para integrar la foto con la paleta */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 pointer-events-none" />
            
            {/* Badges Flotantes sobre la Imagen */}
            <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1.5 flex-wrap">
              {place.price_tier && (
                <span className="text-[11px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                  {place.price_tier}
                </span>
              )}
              {place.neighborhood && (
                <span className="text-[11px] font-semibold text-white/95 bg-black/60 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/20">
                  {place.neighborhood}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Badges de horario y duración */}
        <div className="flex flex-wrap items-center gap-2 mb-2 pr-8">
          {place.time_slot && (
            <span className="text-xs font-bold uppercase tracking-wider text-[#2A4B3D] bg-[#EBF2EC] dark:bg-[#1A2E24] dark:text-[#A7D8BD] px-3 py-1 rounded-full border border-[#D5E3D8] dark:border-[#2C483A]">
              {place.time_slot}
            </span>
          )}
          {place.duration_minutes && (
            <span className="text-xs ronda-text-muted font-medium ronda-card-inner px-2.5 py-0.5 rounded-full border">
              ~ {place.duration_minutes} min sugeridos
            </span>
          )}
        </div>

        {/* Nombre del Lugar */}
        <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--text-main)] mb-1.5 leading-tight">
          {place.place_name || place.name}
        </h3>

        {/* Dirección */}
        <div className="flex items-center gap-1.5 text-xs ronda-text-muted mb-4">
          <MapPin className="w-3.5 h-3.5 text-[#E06D28] shrink-0" />
          <span>{place.address}</span>
        </div>

        {/* 2. CHIPS DE CONVIVENCIA & SERVICIOS (Opción 1: Badge + Detalle extendido) */}
        {(place.pet_friendly !== undefined || place.vegetarian_friendly !== undefined || place.payment_methods) && (
          <div className="mb-5 p-3.5 ronda-card-inner border rounded-2xl shadow-xs space-y-2.5">
            {/* Fila de Badges */}
            <div className="flex flex-wrap items-center gap-2">
              {place.pet_friendly !== undefined && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  place.pet_friendly 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40' 
                    : 'ronda-card text-[var(--text-muted)] border-stone-200 dark:border-stone-800'
                }`}>
                  <Dog className="w-3.5 h-3.5" />
                  <span>{place.pet_friendly ? 'Pet Friendly' : 'No pet friendly'}</span>
                </span>
              )}

              {place.vegetarian_friendly !== undefined && (
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  place.vegetarian_friendly 
                    ? 'bg-lime-50 dark:bg-lime-950/40 text-lime-900 dark:text-lime-300 border-lime-200 dark:border-lime-800/40' 
                    : 'ronda-card text-[var(--text-muted)] border-stone-200 dark:border-stone-800'
                }`}>
                  <Salad className="w-3.5 h-3.5" />
                  <span>{place.vegetarian_friendly ? 'Apto Vegetariano' : 'Sin carta veggie'}</span>
                </span>
              )}

              {place.payment_methods && (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium ronda-card text-[var(--text-main)] border px-2.5 py-1 rounded-full">
                  <CreditCard className="w-3.5 h-3.5 text-[#E06D28]" />
                  <span>Pagos: Tarjetas / MP</span>
                </span>
              )}
            </div>

            {/* Detalle extendido según Opción 1 */}
            <div className="pt-1.5 border-t ronda-border text-[11px] sm:text-xs ronda-text-muted space-y-1">
              {place.pet_friendly_details && (
                <p className="flex items-start gap-1.5 leading-snug">
                  <span className="font-semibold text-[var(--text-main)] shrink-0">🐾 Mascotas:</span>
                  <span>{place.pet_friendly_details}</span>
                </p>
              )}
              {place.vegetarian_details && (
                <p className="flex items-start gap-1.5 leading-snug">
                  <span className="font-semibold text-[var(--text-main)] shrink-0">🥗 Opciones veggie:</span>
                  <span>{place.vegetarian_details}</span>
                </p>
              )}
              {place.payment_methods && (
                <p className="flex items-start gap-1.5 leading-snug">
                  <span className="font-semibold text-[var(--text-main)] shrink-0">💳 Medios aceptados:</span>
                  <span>{place.payment_methods}</span>
                </p>
              )}
            </div>
          </div>
        )}

        {/* 3. ACERCA DE ESTE LUGAR (Curaduría auténtica) */}
        <div className="mb-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-2 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#E06D28]" />
            <span>Sobre este lugar</span>
          </h4>
          <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed ronda-card-inner border p-4 rounded-2xl shadow-xs font-normal">
            {place.about || place.description || "Un rincón emblemático seleccionado por su autenticidad y encanto porteño."}
          </p>
        </div>

        {/* BLOQUE EDITORIAL UNIFICADO: EXPERIENCIAS & TOQUE PORTEÑO */}
        {((place.activities && place.activities.length > 0) || (place.features && place.features.length > 0) || place.porteño_tip) && (
          <div className="ronda-card border rounded-3xl p-5 sm:p-6 mb-6 shadow-xs">
            {/* Header del bloque editorial */}
            <div className="flex items-center gap-2 pb-3 mb-4 border-b ronda-border">
              <span className="text-base">✨</span>
              <h4 className="font-editorial text-lg sm:text-xl font-bold text-[var(--text-main)]">
                Experiencias
              </h4>
            </div>

            {/* Lista tipográfica fluida (minimalista, sin números de tarjeta) */}
            {place.activities && place.activities.length > 0 ? (
              <div className="space-y-2.5 mb-4">
                {place.activities.map((act, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[#E06D28] text-sm leading-none mt-1 shrink-0">•</span>
                    <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-normal">
                      {act}
                    </p>
                  </div>
                ))}
              </div>
            ) : place.features && place.features.length > 0 ? (
              <div className="space-y-2 mb-4">
                {place.features.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <span className="text-[#E06D28] text-sm leading-none mt-1 shrink-0">•</span>
                    <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-normal">
                      {feat}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}

            {/* Toque Porteño integrado al pie como cita de autor */}
            {place.porteño_tip && (
              <div className="pt-3.5 mt-3 border-t ronda-border">
                <div className="relative pl-3.5 border-l-2 border-[#E06D28] py-0.5">
                  <div className="flex items-center gap-1.5 mb-1 text-[10px] font-bold uppercase tracking-wider text-[#E06D28]">
                    <Sparkles className="w-3 h-3 text-[#E06D28]" />
                    <span>Toque Porteño</span>
                  </div>
                  <p className="font-editorial italic text-sm sm:text-base text-[var(--text-main)] leading-relaxed">
                    "{place.porteño_tip}"
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t ronda-border">
          <div className="flex items-center gap-2">
            <a
              href={getPlaceGoogleMapsUrl(place.place_name || place.name, place.address)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)] hover:text-[#E06D28] ronda-card-inner border hover:bg-[var(--bg-card)] px-3.5 py-2.5 rounded-xl transition cursor-pointer btn-latido"
            >
              <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
              <span>Maps</span>
              <ArrowRight className="w-3.5 h-3.5 opacity-70" />
            </a>

            {onToggleFavorite && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(14);
                  onToggleFavorite(place.id || (place.place_name || place.name)?.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl transition cursor-pointer text-xs font-semibold btn-latido border ${
                  isFavorite 
                    ? 'bg-rose-500/15 border-rose-500/40 text-rose-500' 
                    : 'ronda-card-inner ronda-border text-[var(--text-main)] hover:bg-[var(--bg-card)]'
                }`}
                title={isFavorite ? "Quitar de favoritos" : "Guardar en favoritos"}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-rose-600 text-rose-600 animate-chispeo' : 'ronda-text-muted'}`} />
                <span className="hidden sm:inline">{isFavorite ? 'Favorito' : 'Me gusta'}</span>
              </button>
            )}

            {onToggleVisited && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(14);
                  onToggleVisited(place.id || (place.place_name || place.name)?.toLowerCase().replace(/[^a-z0-9]/g, '_'));
                }}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl transition cursor-pointer text-xs font-semibold btn-latido border ${
                  isVisited
                    ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-700 dark:text-emerald-300'
                    : 'ronda-card-inner ronda-border text-[var(--text-main)] hover:border-[#E06D28]'
                }`}
                title={isVisited ? "Quitar de lugares visitados" : "Marcar que ya visitaste este lugar"}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isVisited ? 'Visitado' : 'Ya fui'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {onPlanFromHere && (
              <button
                type="button"
                onClick={() => {
                  triggerHaptic(8);
                  onPlanFromHere(place);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 bg-[#182A24] dark:bg-[#243B30] hover:bg-[#2A4B3D] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer shadow-xs btn-latido"
              >
                <Compass className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>Armar ronda</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="ronda-card-inner hover:bg-[var(--bg-card)] text-[var(--text-main)] border text-xs font-semibold px-4 py-2.5 rounded-xl transition cursor-pointer btn-latido"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PLAY_CATEGORIES = [
  { id: 'all', label: 'Todos' },
  { id: 'pool', label: '🎱 Pool' },
  { id: 'arcade', label: '🕹️ Fichines' },
  { id: 'pingpong', label: '🏓 Ping-Pong' },
  { id: 'bowling', label: '🎳 Bowling' },
  { id: 'boardgames', label: '🎲 Juegos' },
  { id: 'claw', label: '🧸 Peluches' },
];

const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const DAY_SPANISH_MAP = {
  sunday: ['domingo', 'domingos'],
  monday: ['lunes'],
  tuesday: ['martes'],
  wednesday: ['miércoles', 'miercoles'],
  thursday: ['jueves'],
  friday: ['viernes'],
  saturday: ['sábado', 'sabado', 'sábados', 'sabados']
};

function getSmartOpenBadge(p, dayKey) {
  if (p.is_24h || (p.horarios_detallados && p.horarios_detallados.toLowerCase().includes('24 horas'))) {
    return '🟢 Abierto 24 hs';
  }
  if (p.schedule_by_day && p.schedule_by_day[dayKey]) {
    const dayInfo = p.schedule_by_day[dayKey];
    if (dayInfo.is_closed) {
      return '🔴 Cerrado hoy';
    }
    if (dayInfo.close) {
      return `🟢 Abierto hoy hasta las ${dayInfo.close} hs`;
    }
  }
  const text = p.horarios_detallados || '';
  const targetWords = DAY_SPANISH_MAP[dayKey] || [];
  const clauses = text.split(/[;.]+/);
  for (const clause of clauses) {
    const lower = clause.toLowerCase();
    const matchesDay = targetWords.some(w => lower.includes(w));
    if (matchesDay) {
      const match = clause.match(/a\s+([0-2]?[0-9]:[0-9]{2})/i);
      if (match) {
        return `🟢 Abierto hoy hasta las ${match[1]} hs`;
      }
    }
  }
  const generalMatch = text.match(/a\s+([0-2]?[0-9]:[0-9]{2})/i);
  if (generalMatch) {
    return `🟢 Abierto hoy hasta las ${generalMatch[1]} hs`;
  }
  return '🟢 Abierto hoy';
}

function getClosingSoonAlert(item, catalogPlace, dayKey) {
  if (item.closing_soon_warning) {
    return item.closing_soon_warning;
  }
  const place = catalogPlace || item;
  if (!place) return null;
  const daySched = place.schedule_by_day ? place.schedule_by_day[dayKey] : null;
  if (!daySched || daySched.is_closed) return null;

  let closeH = daySched.close_hour;
  if (closeH === undefined || closeH === null) return null;
  if (closeH <= 7.0) closeH += 24.0;

  const slotMatch = (item.time_slot || '').match(/([0-2]?[0-9]):([0-9]{2})/);
  if (!slotMatch) return null;
  let slotH = parseInt(slotMatch[1], 10) + parseInt(slotMatch[2], 10) / 60.0;
  if (slotH < 6.0) slotH += 24.0;

  const diffHours = closeH - slotH;
  if (diffHours >= 0.5 && diffHours <= 1.25) {
    const closeStr = daySched.close || `${Math.floor(closeH % 24).toString().padStart(2, '0')}:00`;
    return `⚠️ Cierra a las ${closeStr} hs · Te conviene entrar ya`;
  }
  return null;
}

function getPlayCategoryLabel(cat) {
  switch (cat) {
    case 'pool': return 'Partida de Pool & Brindis';
    case 'arcade': return 'Fichines Arcade & Nostalgia';
    case 'pingpong': return 'Retas de Ping-Pong';
    case 'bowling': return 'Líneas de Bowling & Tragos';
    case 'boardgames': return 'Juegos de Mesa & Copas';
    case 'claw': return 'Peluches & Grúas Japonesas';
    default: return 'Juegos & Trasnoche';
  }
}

function calculateAlargueTimeSlot(lastStop) {
  if (!lastStop || !lastStop.time_slot) return '23:30 - 01:00';
  const match = lastStop.time_slot.match(/-\s*([0-2]?[0-9]):([0-9]{2})/);
  if (!match) return '23:30 - 01:00';
  let h = parseInt(match[1], 10);
  let m = parseInt(match[2], 10);
  
  // Agregar 15 min de traslado
  m += 15;
  if (m >= 60) {
    h = (h + Math.floor(m / 60)) % 24;
    m = m % 60;
  }
  const startStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  
  // Permanencia de 75 min
  let endM = m + 75;
  let endH = h;
  if (endM >= 60) {
    endH = (endH + Math.floor(endM / 60)) % 24;
    endM = endM % 60;
  }
  const endStr = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
  return `${startStr} - ${endStr}`;
}

// Cálculo de distancia planar aproximada en CABA (km)
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const dLat = (lat2 - lat1) * 111.0;
  const dLon = (lon2 - lon1) * 85.0;
  return Math.hypot(dLat, dLon);
}

// Recalcula los tránsitos y minutos a pie o en auto con distancias físicas exactas
function updateScheduleTransits(schedule) {
  if (!schedule || schedule.length === 0) return schedule;
  const updated = [...schedule];
  for (let i = 0; i < updated.length - 1; i++) {
    const cur = updated[i];
    const nxt = updated[i + 1];
    const curLat = cur.lat || -34.5888;
    const curLng = cur.lng || -58.4300;
    const nxtLat = nxt.lat || -34.5888;
    const nxtLng = nxt.lng || -58.4300;
    const distKm = calculateDistanceKm(curLat, curLng, nxtLat, nxtLng) || 0.6;

    if (distKm <= 1.8) {
      const mins = Math.max(5, Math.round(distKm * 10));
      updated[i] = {
        ...cur,
        transit_to_next: {
          mode: 'a pie',
          duration_minutes: mins,
          notes: `Caminata tranquila de ${mins} min (~${Math.round(distKm * 1000)} m) por el barrio.`
        }
      };
    } else {
      const mins = Math.max(8, Math.round(distKm * 2.5 + 4));
      updated[i] = {
        ...cur,
        transit_to_next: {
          mode: 'en auto / taxi',
          duration_minutes: mins,
          notes: `Traslado en auto/taxi de ~${mins} min (${distKm.toFixed(1)} km).`
        }
      };
    }
  }
  if (updated.length > 0) {
    updated[updated.length - 1] = {
      ...updated[updated.length - 1],
      transit_to_next: null
    };
  }
  return updated;
}

// Búsqueda inteligente de reemplazo lúdico (pool, fichines, bowling) para paradas de bares
function getPlayfulSwapCandidate(stop, plan, catalogPlaces, currentDayKey, stopIndex) {
  if (!stop || stop.is_alargue || !plan) return null;
  if (stop.is_swapped_playful) return null;

  // RULE-DOM-07: Solo ofrecer swap en la última parada de la ronda o tramo nocturno
  const baseSchedule = (plan.schedule || []).filter((s) => !s.is_alargue);
  if (stopIndex !== undefined && stopIndex < baseSchedule.length - 1) {
    return null; // Nunca ofrecer swap en la parada 1 si hay parada posterior
  }

  const act = (stop.activity_type || '').toLowerCase();
  const desc = (stop.description || '').toLowerCase();
  const name = (stop.place_name || '').toLowerCase();

  // Descartar taxativamente cafeterías, desayunos, meriendas, libros o paseos diurnos
  if (
    act.includes('café') || act.includes('cafe') || act.includes('desayuno') ||
    act.includes('merienda') || act.includes('lectura') || act.includes('librería') ||
    act.includes('parque') || act.includes('museo') || desc.includes('café de especialidad') ||
    desc.includes('café filtrado') || desc.includes('repostería') || name.includes('café') ||
    name.includes('cafe')
  ) {
    return null;
  }

  const isNightlifeStop =
    act.includes('bar') ||
    act.includes('trago') ||
    act.includes('cerve') ||
    act.includes('cocktail') ||
    act.includes('coctel') ||
    act.includes('pub') ||
    act.includes('trasnoche') ||
    desc.includes('cóctel') ||
    desc.includes('coctel') ||
    desc.includes('cerveza') ||
    desc.includes('trago');

  if (!isNightlifeStop) return null;
  if (act.includes('pool') || act.includes('fichin') || act.includes('arcade') || act.includes('bowling') || act.includes('juego')) {
    return null;
  }

  const sourceList = catalogPlaces && catalogPlaces.length > 0 ? catalogPlaces : LOCAL_PLACES_CATALOG;
  const currentStopsNames = new Set((plan.schedule || []).map((s) => (s.place_name || '').toLowerCase()));

  const openPlayful = sourceList.filter((p) => {
    if (!p.play_category || p.play_category.length === 0) return false;
    const daySched = p.schedule_by_day ? p.schedule_by_day[currentDayKey] : null;
    if (daySched) {
      if (daySched.is_closed) return false;
    } else if (p.days_open && !p.days_open.includes(currentDayKey)) {
      return false;
    }
    if (currentStopsNames.has((p.name || '').toLowerCase())) return false;
    return true;
  });

  if (openPlayful.length === 0) return null;

  const stopLat = stop.lat || -34.5888;
  const stopLng = stop.lng || -58.4300;

  // Priorizar pool primero, luego otros juegos
  const poolPlaces = openPlayful.filter((p) => p.play_category.includes('pool'));
  const candidatePool = poolPlaces.length > 0 ? poolPlaces : openPlayful;

  // REGLA ESTRICTA: El swap DEBE estar en el MISMO barrio que la ronda
  const sameBarrio = candidatePool.filter((p) => p.neighborhood.toLowerCase() === plan.neighborhood.toLowerCase());
  if (sameBarrio.length === 0) {
    // Si no hay opción lúdica en el mismo barrio, NO saltar a otro barrio
    return null;
  }

  const chosen = sameBarrio[0];
  const distKm = calculateDistanceKm(stopLat, stopLng, chosen.lat, chosen.lng) || 0.4;
  const estMin = Math.max(4, Math.round(distKm * 10));
  const distText = distKm < 1 ? `a ~${Math.round(distKm * 1000)} m · ~${estMin} min a pie` : `a ~${distKm.toFixed(1)} km`;

  return {
    place: chosen,
    isSameBarrio: true,
    distanceText: `En ${plan.neighborhood} · ${distText}`,
    distKm
  };
}

export default function App() {
  // Splash inicial de apertura de la app
  const [isSplashActive, setIsSplashActive] = useState(true);

  // Tema: 'light' (Lino & Bruma Bosque) | 'dark' (Carbon Esmeralda)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('ronda_theme') || 'light';
  });

  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, [theme]);

  const toggleTheme = () => {
    triggerHaptic(8);
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('ronda_theme', next);
    const isDark = next === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  };

  // Estados de navegación: 'config' | 'loading' | 'itinerary'
  const [screen, setScreen] = useState('config');
  // Sub-vista en pantalla de configuración: 'quick' (Plan primero) | 'adjust' (Decisiones detalladas)
  const [configView, setConfigView] = useState('quick');

  // Transición de espera idéntica al inicio al tocar botones (Crear, Recomendados, etc.)
  const [isNavigating, setIsNavigating] = useState(false);
  const [navigatingSubtitle, setNavigatingSubtitle] = useState('Buenos Aires a tu ritmo');

  const handleNavigate = (targetScreen, targetConfigView = null) => {
    setIsNavigating(true);
    setNavigatingSubtitle('Buenos Aires a tu ritmo');

    setTimeout(() => {
      setScreen(targetScreen);
      if (targetConfigView) {
        setConfigView(targetConfigView);
      }
      window.scrollTo({ top: 0, behavior: 'instant' });
      setTimeout(() => {
        setIsNavigating(false);
      }, 350);
    }, 550);
  };

  // Menú colapsable en desktop (se abre al pasar el cursor)
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(false);
  // Menú inferior en móvil (ocultable hacia abajo con opción de desocultar)
  const [mobileNavVisible, setMobileNavVisible] = useState(false);

  // Modal de perfil / Login / Usuario
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [planSavedToast, setPlanSavedToast] = useState(false);
  const [authToast, setAuthToast] = useState(null);
  const [favoriteBurstId, setFavoriteBurstId] = useState(null);

  // Estados de configuración de la ronda
  const [neighborhood, setNeighborhood] = useState('Cualquiera');
  const [selectedSlot, setSelectedSlot] = useState('now'); // 'now' | 'morning' | 'lunch' | 'afternoon' | 'night' | 'other_day'
  const [showPastSlots, setShowPastSlots] = useState(false);
  const [subSlot, setSubSlot] = useState('morning'); // para 'other_day'
  const [otherDayDate, setOtherDayDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2);
    return d.toISOString().split('T')[0];
  });

  const [timeOfDay, setTimeOfDay] = useState('night');
  const [mood, setMood] = useState('amigos'); // 'tranquilo' | 'foodie' | 'cultural' | 'amigos'
  const [showCustomPrefs, setShowCustomPrefs] = useState(false);
  const [selectedExtras, setSelectedExtras] = useState(['drinks']);
  const [customActivityNote, setCustomActivityNote] = useState('');
  const [allowNeighboringBarrio, setAllowNeighboringBarrio] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState('clasico');
  const [priceTier, setPriceTier] = useState('$$');
  const [copied, setCopied] = useState(false);
  const [originActivity, setOriginActivity] = useState(null);

  // Estado del Clima en tiempo real (Open-Meteo CABA)
  const [weather, setWeather] = useState({
    temp: 22,
    label: 'Despejado',
    isRain: false,
    loading: true
  });

  // Hora actual formateada y franja horaria real
  const [currentHour, setCurrentHour] = useState(20);
  const [currentTimeStr, setCurrentTimeStr] = useState('20:30');

  // Helper visual del clima dinámico (Luna de noche, nube, lluvia, sol)
  const currentWeatherVisual = useMemo(
    () => getWeatherVisual(weather, currentHour),
    [weather, currentHour]
  );

  // Filtrado de franjas horarias según el horario actual (descarte inteligente + menú fuera de rango)
  const activeSlots = TIME_SLOT_OPTIONS.filter((slot) => !slot.isPast(currentHour));
  const pastSlots = TIME_SLOT_OPTIONS.filter((slot) => slot.isPast(currentHour));
  const isPastSlotSelected = pastSlots.some((slot) => slot.id === selectedSlot);

  // Plan generado
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);

  // Modal translúcido con detalle del lugar seleccionado y cosas para hacer
  const [selectedPlaceModal, setSelectedPlaceModal] = useState(null);
  const [catalogPlaces, setCatalogPlaces] = useState(LOCAL_PLACES_CATALOG || []);

  // Índice para rotar entre opciones sugeridas en "¿La estiramos?" (1-tap)
  const [alargueIndex, setAlargueIndex] = useState(0);

  const alargueDayKey = useMemo(() => {
    return DAY_NAMES[new Date().getDay()];
  }, []);

  const alargueCandidates = useMemo(() => {
    if (!plan) return [];
    const targetBarrio = plan.neighborhood;
    const baseSchedule = plan.schedule?.filter((item) => !item.is_alargue) || [];
    const lastStop = baseSchedule[baseSchedule.length - 1] || plan.schedule?.[plan.schedule.length - 1];
    const targetLat = lastStop?.lat || -34.5888;
    const targetLng = lastStop?.lng || -58.4300;

    const sourceList = catalogPlaces && catalogPlaces.length > 0 ? catalogPlaces : LOCAL_PLACES_CATALOG;

    // Obtener nombres ya en la ronda para NUNCA duplicar lugares
    const currentScheduleNames = new Set((plan.schedule || []).map((s) => (s.place_name || '').toLowerCase()));

    // Solo lugares con play_category que abran hoy y NO estén ya en la ronda
    const openPlayful = sourceList.filter(
      (p) =>
        p.play_category &&
        p.play_category.length > 0 &&
        p.days_open &&
        p.days_open.includes(alargueDayKey) &&
        !currentScheduleNames.has((p.name || '').toLowerCase())
    );

    // Mismo barrio primero
    const sameBarrio = openPlayful.filter((p) => p.neighborhood.toLowerCase() === targetBarrio.toLowerCase());
    if (sameBarrio.length > 0) {
      return sameBarrio;
    }

    // Si el usuario habilitó barrio lindero, buscar únicamente en barrios vecinos inmediatos
    if (allowNeighboringBarrio) {
      const adjacentList = {
        'San Telmo': ['San Nicolás', 'Puerto Madero'],
        'Palermo': ['Colegiales', 'Chacarita', 'Recoleta'],
        'Recoleta': ['Palermo', 'San Nicolás'],
        'Chacarita': ['Colegiales', 'Palermo'],
        'Colegiales': ['Chacarita', 'Palermo', 'Belgrano'],
        'Belgrano': ['Colegiales'],
        'San Nicolás': ['San Telmo', 'Recoleta'],
        'Puerto Madero': ['San Telmo']
      }[targetBarrio] || [];

      return openPlayful
        .filter((p) => adjacentList.includes(p.neighborhood))
        .sort((a, b) => {
          const da = calculateDistanceKm(targetLat, targetLng, a.lat, a.lng) || 5;
          const db = calculateDistanceKm(targetLat, targetLng, b.lat, b.lng) || 5;
          return da - db;
        });
    }

    return [];
  }, [plan, catalogPlaces, alargueDayKey, allowNeighboringBarrio]);

  const handleAddAlargue = (place) => {
    if (!plan || !plan.schedule || plan.schedule.length === 0) return;
    triggerHaptic(15);

    // Remover alargue previo si existía
    const baseSchedule = plan.schedule.filter((item) => !item.is_alargue);
    const lastStop = baseSchedule[baseSchedule.length - 1];

    const timeSlot = calculateAlargueTimeSlot(lastStop);
    const playLabel = getPlayCategoryLabel(place.play_category?.[0]);

    const alargueItem = {
      id: place.id,
      time_slot: timeSlot,
      place_name: place.name,
      address: place.address,
      activity_type: `El Alargue · ${playLabel}`,
      duration_minutes: place.typical_duration_minutes || 75,
      porteño_tip: place.game_highlight || place.highlight,
      lat: place.lat,
      lng: place.lng,
      description: place.description,
      activities: place.activities || [],
      image_url: place.image_url,
      about: place.about,
      is_alargue: true,
      category: place.category || 'nightlife',
      transit_to_next: null
    };

    const newSchedule = updateScheduleTransits([...baseSchedule, alargueItem]);

    setPlan({
      ...plan,
      schedule: newSchedule
    });
  };

  const handleRemoveAlargue = (placeId) => {
    if (!plan || !plan.schedule) return;
    triggerHaptic(10);
    const newSchedule = updateScheduleTransits(
      plan.schedule.filter((item) => !item.is_alargue && item.id !== placeId)
    );
    setPlan({
      ...plan,
      schedule: newSchedule
    });
  };

  // Cambio de plan lúdico 1-tap (intercambia un bar tradicional por un bar con pool o fichines)
  const handleSwapToPlayful = (stopIndex, playfulOption) => {
    if (!plan || !plan.schedule || !playfulOption) return;
    triggerHaptic(18);

    const targetStop = plan.schedule[stopIndex];
    if (!targetStop) return;

    const originalData = targetStop.original_stop || {
      id: targetStop.id,
      place_name: targetStop.place_name,
      address: targetStop.address,
      activity_type: targetStop.activity_type,
      duration_minutes: targetStop.duration_minutes,
      porteño_tip: targetStop.porteño_tip,
      lat: targetStop.lat,
      lng: targetStop.lng,
      description: targetStop.description,
      activities: targetStop.activities,
      image_url: targetStop.image_url,
      about: targetStop.about,
      category: targetStop.category
    };

    const place = playfulOption.place;
    const playType = place.play_category?.includes('pool')
      ? 'Pool & Tragos'
      : place.play_category?.includes('arcade')
      ? 'Fichines Arcade & Tragos'
      : 'Juegos de Noche';

    const updatedStop = {
      ...targetStop,
      id: place.id,
      place_name: place.name,
      address: place.address,
      activity_type: `Bar con ${playType} · Alternativa lúdica`,
      duration_minutes: Math.max(targetStop.duration_minutes || 60, 75),
      porteño_tip:
        place.game_highlight ||
        place.highlight ||
        place.porteño_tip ||
        'Ideal para meter partida de pool y picar algo.',
      lat: place.lat,
      lng: place.lng,
      description: place.description,
      activities: place.activities || targetStop.activities,
      image_url: place.image_url,
      about: place.about,
      category: place.category || 'nightlife',
      is_swapped_playful: true,
      original_stop: originalData,
      swap_note: `En ${place.neighborhood} (mismo barrio)`
    };

    const newSchedule = [...plan.schedule];
    newSchedule[stopIndex] = updatedStop;

    setPlan({
      ...plan,
      schedule: updateScheduleTransits(newSchedule)
    });
  };

  // Revertir el cambio y volver al bar original del plan
  const handleRevertPlayfulSwap = (stopIndex) => {
    if (!plan || !plan.schedule) return;
    triggerHaptic(12);

    const targetStop = plan.schedule[stopIndex];
    if (!targetStop || !targetStop.original_stop) return;

    const restored = {
      ...targetStop,
      ...targetStop.original_stop,
      is_swapped_playful: false,
      original_stop: null,
      swap_note: null
    };

    const newSchedule = [...plan.schedule];
    newSchedule[stopIndex] = restored;

    setPlan({
      ...plan,
      schedule: updateScheduleTransits(newSchedule)
    });
  };

  // Helper para persistir y recuperar datos de rondas y favoritos por usuario en el navegador (soporte web/serverless + backend)
  const persistLocalUserProfile = (userObj) => {
    if (!userObj || !userObj.id) return;
    try {
      const storeKey = `ronda_user_store_${userObj.id}`;
      const toStore = {
        id: userObj.id,
        neighborhood: userObj.neighborhood,
        pet_friendly: Boolean(userObj.pet_friendly),
        vegetarian_friendly: Boolean(userObj.vegetarian_friendly),
        budget_preference: userObj.budget_preference || '$$',
        saved_plans: Array.isArray(userObj.saved_plans) ? userObj.saved_plans : [],
        favorite_place_ids: Array.isArray(userObj.favorite_place_ids) ? userObj.favorite_place_ids : [],
        visited_place_ids: Array.isArray(userObj.visited_place_ids) ? userObj.visited_place_ids : []
      };
      localStorage.setItem(storeKey, JSON.stringify(toStore));
      localStorage.setItem('ronda_offline_user', JSON.stringify(userObj));
    } catch {
      // ignore storage quota errors
    }
  };

  // Helper para fusionar los datos visuales y las rondas guardadas en el navegador con el perfil anónimo del backend
  const mergeWithLocalGoogleProfile = (serverProfile, overrideLocal = null) => {
    let localMeta = overrideLocal;
    if (!localMeta) {
      try {
        const raw = localStorage.getItem('ronda_google_profile');
        if (raw) localMeta = JSON.parse(raw);
      } catch {
        localMeta = null;
      }
    }

    const userId = serverProfile?.id || 'g_web_default';
    let localStore = null;
    try {
      const rawStore = localStorage.getItem(`ronda_user_store_${userId}`);
      if (rawStore) localStore = JSON.parse(rawStore);
    } catch {
      localStore = null;
    }

    // Combinar rondas guardadas del servidor y del navegador sin duplicar IDs
    const serverPlans = Array.isArray(serverProfile?.saved_plans) ? serverProfile.saved_plans : [];
    const storedPlans = Array.isArray(localStore?.saved_plans) ? localStore.saved_plans : [];
    const seenPlanIds = new Set();
    const mergedPlans = [];
    [...storedPlans, ...serverPlans].forEach((p) => {
      const pid = p?.id || p?.plan?.id;
      if (pid && !seenPlanIds.has(pid)) {
        seenPlanIds.add(pid);
        mergedPlans.push(p);
      } else if (!pid) {
        mergedPlans.push(p);
      }
    });

    // Combinar favoritos
    const serverFavs = Array.isArray(serverProfile?.favorite_place_ids) ? serverProfile.favorite_place_ids : [];
    const storedFavs = Array.isArray(localStore?.favorite_place_ids) ? localStore.favorite_place_ids : [];
    const mergedFavs = Array.from(new Set([...storedFavs, ...serverFavs]));

    // Combinar lugares visitados ("✓ Ya fui")
    const serverVisited = Array.isArray(serverProfile?.visited_place_ids) ? serverProfile.visited_place_ids : [];
    const storedVisited = Array.isArray(localStore?.visited_place_ids) ? localStore.visited_place_ids : [];
    const mergedVisited = Array.from(new Set([...storedVisited, ...serverVisited]));

    const mergedUser = {
      ...serverProfile,
      id: userId,
      name: localMeta?.displayName || serverProfile?.name || 'Viajero Porteño',
      email: localMeta?.emailHint || serverProfile?.email || '',
      picture: localMeta?.picture || null,
      auth_provider: 'google',
      neighborhood: localStore?.neighborhood || serverProfile?.neighborhood || 'San Telmo',
      pet_friendly: localStore?.pet_friendly ?? serverProfile?.pet_friendly ?? false,
      vegetarian_friendly: localStore?.vegetarian_friendly ?? serverProfile?.vegetarian_friendly ?? false,
      budget_preference: localStore?.budget_preference || serverProfile?.budget_preference || '$$',
      saved_plans: mergedPlans,
      favorite_place_ids: mergedFavs,
      visited_place_ids: mergedVisited
    };

    persistLocalUserProfile(mergedUser);
    return mergedUser;
  };

  // Cargar catálogo de lugares enriquecido desde el backend para fallback completo
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/places`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setCatalogPlaces(data);
      })
      .catch((err) => console.warn('No se pudo precargar catálogo completo:', err));
  }, []);

  // Verificar sesión existente al iniciar
  useEffect(() => {
    const token = localStorage.getItem('ronda_token');
    if (!token) return;

    fetch(`${API_BASE_URL}/api/auth/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token expirado o inválido');
        return res.json();
      })
      .then((userData) => {
        if (userData && userData.id) {
          const merged = mergeWithLocalGoogleProfile(userData);
          setCurrentUser(merged);
          if (merged.neighborhood && merged.neighborhood !== 'Cualquiera') {
            setNeighborhood(merged.neighborhood);
          }
          const budget = merged.budget_preference || merged.preferences?.budget_preference;
          if (budget) {
            setPriceTier(budget);
          }
        }
      })
      .catch(() => {
        // Si está en modo web o la instancia serverless reinició, restaurar desde el navegador
        try {
          const rawOffline = localStorage.getItem('ronda_offline_user');
          if (rawOffline) {
            const parsed = mergeWithLocalGoogleProfile(JSON.parse(rawOffline));
            setCurrentUser(parsed);
            if (parsed.neighborhood && parsed.neighborhood !== 'Cualquiera') {
              setNeighborhood(parsed.neighborhood);
            }
            if (parsed.budget_preference) {
              setPriceTier(parsed.budget_preference);
            }
            return;
          }
        } catch {
          // ignore
        }
        localStorage.removeItem('ronda_token');
      });
  }, []);

  // Ingreso exclusivo con Google (Gmail) bajo arquitectura Zero-PII
  const handleGoogleLogin = async (googlePayload) => {
    let displayName = googlePayload.displayName || 'Viajero Porteño';
    let emailHint = googlePayload.emailHint || googlePayload.google_sub || '';
    let picture = googlePayload.picture || null;

    // Si viene un JWT oficial de Google Identity Services, extraer nombre/email solo en el navegador
    if (googlePayload.credential) {
      try {
        const parts = googlePayload.credential.split('.');
        if (parts.length === 3) {
          const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = JSON.parse(atob(b64));
          displayName = jsonPayload.name || jsonPayload.given_name || displayName;
          emailHint = jsonPayload.email || emailHint;
          picture = jsonPayload.picture || picture;
        }
      } catch {
        // Ignorar si no se puede decodificar localmente
      }
    }

    const localMeta = { displayName, emailHint, picture };
    localStorage.setItem('ronda_google_profile', JSON.stringify(localMeta));

    let serverUser = null;
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: googlePayload.credential || null,
          google_sub: googlePayload.google_sub || emailHint || 'google_user',
          neighborhood: googlePayload.neighborhood || 'San Telmo',
          pet_friendly: Boolean(googlePayload.pet_friendly),
          vegetarian_friendly: Boolean(googlePayload.vegetarian_friendly),
          budget_preference: googlePayload.budget_preference || '$$'
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'No se pudo autenticar con Google');
      }
      serverUser = data.user || data;
    } catch (err) {
      // Fallback limpio en navegador si el backend no está activo en entorno estático web
      console.warn('Usando sesión Google Zero-PII en modo web autónomo:', err);
      const cleanSub = (googlePayload.google_sub || emailHint || 'google_user').trim().toLowerCase();
      const anonHash = 'g_web_' + btoa(cleanSub).replace(/[^a-zA-Z0-9]/g, '').slice(0, 12).toLowerCase();
      serverUser = {
        id: anonHash,
        auth_provider: 'google',
        token: `tok_web_${Date.now()}`,
        neighborhood: googlePayload.neighborhood || 'San Telmo',
        pet_friendly: Boolean(googlePayload.pet_friendly),
        vegetarian_friendly: Boolean(googlePayload.vegetarian_friendly),
        budget_preference: googlePayload.budget_preference || '$$',
        saved_plans: [],
        favorite_place_ids: []
      };
      localStorage.setItem('ronda_offline_user', JSON.stringify(serverUser));
    }

    const finalUser = mergeWithLocalGoogleProfile(serverUser, localMeta);
    localStorage.setItem('ronda_token', finalUser.token || 'tok_google_active');
    setCurrentUser(finalUser);

    if (finalUser.neighborhood && finalUser.neighborhood !== 'Cualquiera') {
      setNeighborhood(finalUser.neighborhood);
    }
    const budget = finalUser.budget_preference || finalUser.preferences?.budget_preference;
    if (budget) {
      setPriceTier(budget);
    }
    setShowProfileModal(false);
    setAuthToast({
      title: `¡Hola, ${finalUser.name.split(' ')[0]}!`,
      message: `Pasaporte Porteño conectado.`
    });
    setTimeout(() => setAuthToast(null), 4000);
  };

  const handleLogout = () => {
    localStorage.removeItem('ronda_token');
    localStorage.removeItem('ronda_google_profile');
    localStorage.removeItem('ronda_offline_user');
    setCurrentUser(null);
    setShowProfileModal(false);
    setAuthToast({
      title: 'Sesión finalizada',
      message: 'Has desconectado tu cuenta en este navegador.'
    });
    setTimeout(() => setAuthToast(null), 3000);
  };

  const handleUpdatePreferences = async (newPrefs) => {
    if (!currentUser) return;
    const token = localStorage.getItem('ronda_token');

    // 1. Actualización instantánea en estado y almacenamiento local del navegador
    const optimisticUser = {
      ...currentUser,
      ...(newPrefs.neighborhood !== undefined ? { neighborhood: newPrefs.neighborhood } : {}),
      ...(newPrefs.pet_friendly !== undefined ? { pet_friendly: newPrefs.pet_friendly } : {}),
      ...(newPrefs.vegetarian_friendly !== undefined ? { vegetarian_friendly: newPrefs.vegetarian_friendly } : {}),
      ...(newPrefs.budget_preference !== undefined ? { budget_preference: newPrefs.budget_preference } : {})
    };
    setCurrentUser(optimisticUser);
    persistLocalUserProfile(optimisticUser);

    if (optimisticUser.neighborhood && optimisticUser.neighborhood !== 'Cualquiera') {
      setNeighborhood(optimisticUser.neighborhood);
    }
    if (optimisticUser.budget_preference) {
      setPriceTier(optimisticUser.budget_preference);
    }
    setAuthToast({
      title: 'Preferencias actualizadas',
      message: 'Tus cambios se guardaron correctamente en tu perfil.'
    });
    setTimeout(() => setAuthToast(null), 3500);

    // 2. Sincronización con el backend si está disponible
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrefs)
      });
      if (res.ok) {
        const updated = mergeWithLocalGoogleProfile(await res.json());
        setCurrentUser(updated);
      }
    } catch (err) {
      console.warn('Preferencias guardadas localmente (modo web):', err);
    }
  };

  const handleSavePlan = async (planToSave) => {
    const targetPlan = planToSave || plan;
    if (!targetPlan) return;

    const token = localStorage.getItem('ronda_token');
    if (!token || !currentUser) {
      setShowProfileModal(true);
      return;
    }

    // Asegurar un ID único para la ronda (evitar colisión si tenía 'ronda_demo_01')
    const stopSignature = (targetPlan.schedule || []).map((s) => s.place_name || s.id).join('|');
    const resolvedId =
      targetPlan.id && targetPlan.id !== 'ronda_demo_01'
        ? targetPlan.id
        : `ronda_${(targetPlan.neighborhood || 'caba').toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;

    const nowFormatted = new Date().toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const planWithId = {
      ...targetPlan,
      id: resolvedId,
      saved_at: targetPlan.saved_at || nowFormatted
    };

    // Actualizar también el plan en pantalla si tenía el ID genérico
    if (plan && (!plan.id || plan.id === 'ronda_demo_01')) {
      setPlan(planWithId);
    }

    // 1. Guardado inmediato en el perfil del usuario (estado + localStorage)
    const currentSaved = Array.isArray(currentUser.saved_plans) ? currentUser.saved_plans : [];
    const alreadyExists = currentSaved.some((p) => {
      const pData = p.plan || p;
      const existingSig = (pData.schedule || []).map((s) => s.place_name || s.id).join('|');
      return (
        pData.id === resolvedId ||
        (stopSignature && existingSig === stopSignature && pData.neighborhood === planWithId.neighborhood)
      );
    });

    const nextSavedPlans = alreadyExists ? currentSaved : [planWithId, ...currentSaved];
    const updatedLocalUser = {
      ...currentUser,
      saved_plans: nextSavedPlans
    };

    setCurrentUser(updatedLocalUser);
    persistLocalUserProfile(updatedLocalUser);
    triggerHaptic(14);
    setPlanSavedToast(true);
    setTimeout(() => setPlanSavedToast(false), 3000);

    // 2. Sincronizar en segundo plano con el backend si responde
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/saved-plans`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ plan: planWithId })
      });
      if (res.ok) {
        const updated = mergeWithLocalGoogleProfile(await res.json());
        setCurrentUser(updated);
      }
    } catch (err) {
      console.warn('Ronda guardada en almacenamiento local del navegador:', err);
    }
  };

  const handleRemoveSavedPlan = async (planId) => {
    if (!currentUser) return;
    const token = localStorage.getItem('ronda_token');

    // 1. Eliminación inmediata en el estado y almacenamiento local
    const currentSaved = Array.isArray(currentUser.saved_plans) ? currentUser.saved_plans : [];
    const nextSaved = currentSaved.filter((p) => {
      const pData = p.plan || p;
      return p.id !== planId && pData.id !== planId;
    });

    const updatedLocalUser = {
      ...currentUser,
      saved_plans: nextSaved
    };
    setCurrentUser(updatedLocalUser);
    persistLocalUserProfile(updatedLocalUser);

    // 2. Sincronizar con el backend si está disponible
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/saved-plans/${planId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await res.json();
      }
    } catch (err) {
      console.warn('Ronda eliminada localmente:', err);
    }
  };

  const handleToggleFavorite = async (placeId) => {
    if (!placeId) return;

    const token = localStorage.getItem('ronda_token');
    if (!token || !currentUser) {
      setShowProfileModal(true);
      return;
    }

    // 1. Alternar favorito inmediatamente en estado y almacenamiento local
    const currentFavs = new Set(Array.isArray(currentUser.favorite_place_ids) ? currentUser.favorite_place_ids : []);
    if (currentFavs.has(placeId)) {
      currentFavs.delete(placeId);
    } else {
      currentFavs.add(placeId);
    }

    const updatedLocalUser = {
      ...currentUser,
      favorite_place_ids: Array.from(currentFavs)
    };
    setCurrentUser(updatedLocalUser);
    persistLocalUserProfile(updatedLocalUser);

    // 2. Sincronizar con el backend si responde
    try {
      const res = await fetch(`${API_BASE_URL}/api/user/favorites/${placeId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const updated = mergeWithLocalGoogleProfile(await res.json());
        setCurrentUser(updated);
      }
    } catch (err) {
      console.warn('Favorito actualizado localmente:', err);
    }
  };

  const handleToggleVisited = (placeId) => {
    if (!placeId) return;

    const token = localStorage.getItem('ronda_token');
    if (!token || !currentUser) {
      setShowProfileModal(true);
      return;
    }

    const currentVisited = new Set(Array.isArray(currentUser.visited_place_ids) ? currentUser.visited_place_ids : []);
    const wasVisited = currentVisited.has(placeId);
    if (wasVisited) {
      currentVisited.delete(placeId);
    } else {
      currentVisited.add(placeId);
    }

    const updatedLocalUser = {
      ...currentUser,
      visited_place_ids: Array.from(currentVisited)
    };
    setCurrentUser(updatedLocalUser);
    persistLocalUserProfile(updatedLocalUser);
    triggerHaptic(12);

    if (!wasVisited) {
      const foundPlace = catalogPlaces.find((p) => p.id === placeId) || LOCAL_PLACES_CATALOG.find((p) => p.id === placeId);
      setAuthToast({
        title: `✓ ${foundPlace?.name || 'Lugar'} marcado como visitado`,
        message: 'Se actualizó el progreso de tus insignias y barrios en tu Pasaporte.'
      });
      setTimeout(() => setAuthToast(null), 3200);
    }
  };

  const handleLoadSavedPlan = (savedPlanWrapper) => {
    const planToLoad = savedPlanWrapper?.plan || savedPlanWrapper;
    if (planToLoad) {
      setPlan(planToLoad);
      setShowProfileModal(false);
      handleNavigate('itinerary');
    }
  };

  const openPlaceModal = (item) => {
    // Buscar en el catálogo enriquecido por coincidencia de nombre
    const found = catalogPlaces.find(
      (p) =>
        p.name?.toLowerCase() === item.place_name?.toLowerCase() ||
        item.place_name?.toLowerCase().includes(p.name?.toLowerCase()) ||
        p.name?.toLowerCase().includes(item.place_name?.toLowerCase())
    );

    setSelectedPlaceModal({
      ...item,
      description:
        item.description ||
        found?.description ||
        'Un rincón emblemático seleccionado por su autenticidad y encanto porteño.',
      activities:
        item.activities && item.activities.length > 0
          ? item.activities
          : found?.activities || [
              'Disfrutar de la atmósfera y propuesta gastronómica del lugar',
              'Hacer una pausa relajada observando el movimiento del barrio',
              'Apreciar la identidad arquitectónica y cultural porteña'
            ],
      price_tier: found?.price_tier || item.price_tier || plan?.estimated_cost || '$$',
      category: found?.category || item.category || ''
    });
  };

  // Armar un recorrido anclando un lugar o actividad elegida desde Recomendados
  const handlePlanFromHere = (item) => {
    if (item.neighborhood || item.barrio) {
      setNeighborhood(item.neighborhood || item.barrio);
    }
    if (item.title) {
      setOriginActivity(item);
      setCustomActivityNote(`Quiero sumar la actividad: ${item.title}`);
    } else {
      setOriginActivity(null);
      setCustomActivityNote(`Quiero arrancar o pasar por ${item.name}`);
    }
    handleNavigate('config', 'adjust');
  };

  // Inicialización de splash, hora y clima
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsSplashActive(false);
    }, 1800);

    const now = new Date();
    const h = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    setCurrentHour(h);
    setCurrentTimeStr(`${h.toString().padStart(2, '0')}:${minutes}`);

    if (h >= 0 && h < 6) {
      // Madrugada: 'Ahora' es un trago de trasnoche
      setTimeOfDay('night');
      setSelectedSlot('now');
      setSelectedExtras(['drinks']);
    } else if (h >= 20) {
      setTimeOfDay('night');
      setSelectedSlot('now');
      setSelectedExtras(['dinner', 'drinks']);
    } else if (h >= 16) {
      setTimeOfDay('afternoon');
      setSelectedSlot('now');
      setSelectedExtras(['coffee']);
    } else if (h >= 12) {
      setTimeOfDay('afternoon');
      setSelectedSlot('now');
      setSelectedExtras(['bodegon']);
    } else {
      setTimeOfDay('morning');
      setSelectedSlot('now');
      setSelectedExtras(['coffee']);
    }

    // Consulta de clima a Open-Meteo para CABA
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          'https://api.open-meteo.com/v1/forecast?latitude=-34.6037&longitude=-58.3816&current=temperature_2m,weather_code,precipitation&timezone=America%2FArgentina%2FBuenos_Aires'
        );
        if (res.ok) {
          const data = await res.json();
          const temp = Math.round(data.current?.temperature_2m ?? 22);
          const code = data.current?.weather_code ?? 0;
          const precipitation = data.current?.precipitation ?? 0;
          const mapped = WMO_WEATHER_MAP[code] || { label: 'Despejado', isRain: false };
          const isRaining = mapped.isRain || precipitation > 0.1;

          setWeather({
            temp,
            label: mapped.label,
            isRain: isRaining,
            loading: false
          });
        }
      } catch (err) {
        console.warn('No se pudo conectar a Open-Meteo, utilizando clima de referencia.', err);
        setWeather({ temp: 22, label: 'Noche fresca', isRain: false, loading: false });
      }
    };

    fetchWeather();

    return () => clearTimeout(timer);
  }, []);

  // Manejo de cambio de franja horaria / momento
  const handleSlotSelect = (slotId) => {
    triggerHaptic(8);
    setSelectedSlot(slotId);
    if (slotId === 'now') {
      const now = new Date();
      const h = now.getHours();
      const m = now.getMinutes();
      const isEveningOrNight = h > 19 || (h === 19 && m >= 15) || h < 6;
      setTimeOfDay(isEveningOrNight ? 'night' : h >= 12 ? 'afternoon' : 'morning');
      setSelectedExtras(isEveningOrNight ? ['drinks', 'dinner'] : h >= 12 ? ['coffee', 'walk_historic'] : ['coffee']);
    } else if (slotId === 'morning') {
      setTimeOfDay('morning');
      setSelectedExtras(['coffee', 'walk_historic']);
    } else if (slotId === 'lunch') {
      setTimeOfDay('afternoon');
      setSelectedExtras(['bodegon', 'outdoor']);
    } else if (slotId === 'afternoon') {
      setTimeOfDay('afternoon');
      setSelectedExtras(['coffee', 'books']);
    } else if (slotId === 'night') {
      setTimeOfDay('night');
      setSelectedExtras(['dinner', 'drinks']);
    } else if (slotId === 'other_day') {
      setTimeOfDay(subSlot === 'lunch' ? 'afternoon' : subSlot);
      setSelectedExtras(subSlot === 'morning' ? ['coffee'] : subSlot === 'lunch' ? ['bodegon'] : subSlot === 'afternoon' ? ['coffee'] : ['dinner']);
    }
  };

  const handleSubSlotChange = (slot) => {
    triggerHaptic(8);
    setSubSlot(slot);
    setTimeOfDay(slot === 'lunch' ? 'afternoon' : slot);
    setSelectedExtras(slot === 'morning' ? ['coffee'] : slot === 'lunch' ? ['bodegon'] : slot === 'afternoon' ? ['coffee'] : ['dinner']);
  };

  const toggleExtra = (id) => {
    triggerHaptic(6);
    setSelectedExtras(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBudgetSelect = (opt) => {
    triggerHaptic(8);
    setSelectedBudget(opt.id);
    setPriceTier(opt.tierCode);
  };

  const currentBudgetObj = BUDGET_OPTIONS.find(b => b.id === selectedBudget) || BUDGET_OPTIONS[1];

  const getSelectedMomentSummary = () => {
    if (selectedSlot === 'now') {
      if (currentHour >= 0 && currentHour < 6) return 'Trasnoche';
      if (currentHour >= 20) return 'Cena';
      if (currentHour >= 16) return 'Merienda';
      if (currentHour >= 12) return 'Almuerzo';
      return 'Desayuno';
    }
    if (selectedSlot === 'morning') return 'Desayuno';
    if (selectedSlot === 'lunch') return 'Almuerzo';
    if (selectedSlot === 'afternoon') return 'Merienda';
    if (selectedSlot === 'night') return 'Cena';
    if (selectedSlot === 'other_day') {
      if (subSlot === 'morning') return 'Desayuno';
      if (subSlot === 'lunch') return 'Almuerzo';
      if (subSlot === 'afternoon') return 'Merienda';
      return 'Cena';
    }
    return 'Salida';
  };

  const getSelectedNeighborhoodSummary = () => {
    if (neighborhood === 'Cualquiera') return 'Sorpréndeme';
    return neighborhood;
  };

  const budgetSummary = currentBudgetObj.amount === 'Clásico Porteño' ? '$ 25.000' : currentBudgetObj.amount;
  const selectedSummaryText = `${getSelectedMomentSummary()} · ${getSelectedNeighborhoodSummary()} · ${budgetSummary}`;

  const handleGeneratePlan = async () => {
    setScreen('loading');
    setError(null);

    const allActivities = [
      ...ACTIVITIES_BY_SLOT.morning,
      ...ACTIVITIES_BY_SLOT.lunch,
      ...ACTIVITIES_BY_SLOT.afternoon,
      ...ACTIVITIES_BY_SLOT.night,
      ...ACTIVITIES_BY_SLOT.late_night
    ];

    const extraLabels = selectedExtras.map(e => {
      const match = allActivities.find(x => x.id === e);
      return match ? match.label : e;
    });

    let contextNotes = [];
    if (selectedSlot === 'lunch' || (selectedSlot === 'other_day' && subSlot === 'lunch')) {
      contextNotes.push('Momento de Almuerzo & Mediodía porteño');
    } else if (selectedSlot === 'morning' || (selectedSlot === 'other_day' && subSlot === 'morning')) {
      contextNotes.push('Momento de Desayuno & Mañana');
    } else if (selectedSlot === 'other_day') {
      contextNotes.push(`Planificado para la fecha ${otherDayDate}`);
    }

    if (extraLabels.length > 0) {
      contextNotes.push(`Actividades deseadas: ${extraLabels.join(', ')}`);
    }
    if (customActivityNote.trim()) {
      contextNotes.push(`Preferencia o actividad puntual del usuario: ${customActivityNote.trim()}`);
    }
    if (weather.isRain) {
      contextNotes.push('Está lloviendo en CABA, seleccionar paradas 100% bajo techo');
    }

    // Preferencias del perfil de usuario
    if (currentUser) {
      const isPet = currentUser.pet_friendly ?? currentUser.preferences?.pet_friendly;
      if (isPet) {
        contextNotes.push('El usuario va con mascota: priorizar opciones Pet Friendly');
      }
      const isVeggie = currentUser.vegetarian_friendly ?? currentUser.preferences?.vegetarian_friendly ?? currentUser.preferences?.apt_veggie;
      if (isVeggie) {
        contextNotes.push('El usuario busca opciones vegetarianas / apto veggie');
      }
    }

    const now = new Date();
    const currentH = now.getHours().toString().padStart(2, '0');
    const currentM = now.getMinutes().toString().padStart(2, '0');
    const currentTimeFormatted = `${currentH}:${currentM}`;

    // Determinar start_time y is_now
    let calculatedStartTime = currentTimeFormatted;
    let isNowVal = false;
    let effectiveTimeOfDay = timeOfDay;

    if (selectedSlot === 'now') {
      isNowVal = true;
      calculatedStartTime = currentTimeFormatted;
      const h = now.getHours();
      const m = now.getMinutes();
      if (h > 19 || (h === 19 && m >= 15) || h < 6) {
        effectiveTimeOfDay = 'night';
      } else if (h >= 12) {
        effectiveTimeOfDay = 'afternoon';
      } else {
        effectiveTimeOfDay = 'morning';
      }
    } else if (selectedSlot === 'morning') {
      calculatedStartTime = '10:00';
    } else if (selectedSlot === 'lunch') {
      calculatedStartTime = '13:00';
    } else if (selectedSlot === 'afternoon') {
      calculatedStartTime = '16:30';
    } else if (selectedSlot === 'night') {
      calculatedStartTime = '20:45';
    } else if (selectedSlot === 'other_day') {
      calculatedStartTime = subSlot === 'morning' ? '10:00' : subSlot === 'lunch' ? '13:00' : subSlot === 'afternoon' ? '16:30' : '20:45';
    }

    const daysMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDayOfWeek = daysMap[now.getDay()];

    const payload = {
      neighborhood,
      time_of_day: effectiveTimeOfDay,
      mood: mood || 'amigos',
      price_tier: priceTier,
      custom_notes: contextNotes.join('. '),
      start_time: calculatedStartTime,
      is_now: isNowVal,
      day_of_week: currentDayOfWeek,
      allow_neighboring_barrio: allowNeighboringBarrio
    };

    const minAnimationPromise = new Promise(resolve => setTimeout(resolve, 1400));

    try {
      const fetchPromise = fetch(`${API_BASE_URL}/api/plans/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const [response] = await Promise.all([fetchPromise, minAnimationPromise]);

      if (!response.ok) {
        throw new Error(`Error en el servidor: código ${response.status}`);
      }

      const data = await response.json();
      setPlan(data);
      setScreen('itinerary');
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      console.warn('Backend local no disponible. Generando itinerario curado con respaldo inteligente.', err);
      await minAnimationPromise;
      
      const coreBarrios = ['San Telmo', 'Palermo', 'Chacarita', 'Recoleta', 'Colegiales', 'Belgrano'];
      const fallbackNeighborhood = neighborhood === 'Cualquiera'
        ? coreBarrios[Math.floor(Math.random() * coreBarrios.length)]
        : neighborhood;
      const allPool = catalogPlaces && catalogPlaces.length > 0 ? catalogPlaces : LOCAL_PLACES_CATALOG;
      const barrioPlaces = allPool.filter(p => p.neighborhood.toLowerCase() === fallbackNeighborhood.toLowerCase());
      const safePool = barrioPlaces.length >= 2 
        ? barrioPlaces 
        : allPool.filter(p => p.neighborhood.toLowerCase() === 'san telmo');

      // Cálculo de horarios dinámicos en tiempo real según la hora de consulta
      const pad = (n) => n.toString().padStart(2, '0');
      const fmt = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;

      let startDt = new Date();
      if (selectedSlot === 'now') {
        startDt.setMinutes(startDt.getMinutes() + 15);
        const rem = startDt.getMinutes() % 5;
        if (rem !== 0) startDt.setMinutes(startDt.getMinutes() + (5 - rem));
      } else if (selectedSlot === 'morning') {
        startDt.setHours(10, 0, 0, 0);
      } else if (selectedSlot === 'lunch') {
        startDt.setHours(12, 45, 0, 0);
      } else if (selectedSlot === 'afternoon') {
        startDt.setHours(16, 30, 0, 0);
      } else if (selectedSlot === 'night') {
        startDt.setHours(20, 30, 0, 0);
      } else if (selectedSlot === 'other_day') {
        if (subSlot === 'morning') startDt.setHours(10, 0, 0, 0);
        else if (subSlot === 'lunch') startDt.setHours(12, 45, 0, 0);
        else if (subSlot === 'afternoon') startDt.setHours(16, 30, 0, 0);
        else startDt.setHours(20, 30, 0, 0);
      }

      const curH = startDt.getHours();
      const isLateNight = curH >= 0 && curH < 6;
      const effectiveSlot = selectedSlot === 'now' 
        ? (isLateNight || curH >= 20 ? 'night' : curH >= 16 ? 'afternoon' : curH >= 12 ? 'lunch' : 'morning')
        : (selectedSlot === 'other_day' ? subSlot : selectedSlot);

      let p1 = null;
      let p2 = null;

      if (effectiveSlot === 'night') {
        p1 = safePool.find(p => p.category === 'dining' || (p.subcategories || []).includes('bodegon')) ||
             safePool.find(p => p.category === 'nightlife') || safePool[0];
        p2 = safePool.find(p => p.id !== p1.id && (p.category === 'nightlife' || (p.subcategories || []).includes('cocteleria'))) ||
             safePool.find(p => p.id !== p1.id) || safePool[1 % safePool.length];
      } else if (effectiveSlot === 'lunch') {
        p1 = safePool.find(p => p.category === 'dining' || (p.subcategories || []).includes('bodegon')) || safePool[0];
        p2 = safePool.find(p => p.id !== p1.id && (p.category === 'cafe' || p.category === 'park' || p.category === 'culture')) ||
             safePool.find(p => p.id !== p1.id) || safePool[1 % safePool.length];
      } else if (effectiveSlot === 'afternoon') {
        p1 = safePool.find(p => p.category === 'cafe') || safePool[0];
        p2 = safePool.find(p => p.id !== p1.id && (p.category === 'bookstore' || p.category === 'culture' || p.category === 'park' || p.category === 'nightlife')) ||
             safePool.find(p => p.id !== p1.id) || safePool[1 % safePool.length];
      } else {
        // morning
        p1 = safePool.find(p => p.category === 'cafe') || safePool[0];
        p2 = safePool.find(p => p.id !== p1.id && (p.category === 'culture' || p.category === 'park' || p.category === 'bookstore')) ||
             safePool.find(p => p.id !== p1.id) || safePool[1 % safePool.length];
      }

      const dur1 = p1.typical_duration_minutes || 75;
      const end1 = new Date(startDt.getTime() + dur1 * 60000);
      const slot1 = `${fmt(startDt)} - ${fmt(end1)}`;

      const distKm = calculateDistanceKm(p1.lat, p1.lng, p2.lat, p2.lng) || 0.5;
      const transitMins = Math.max(5, Math.min(15, Math.round(distKm * 10)));
      const start2 = new Date(end1.getTime() + transitMins * 60000);
      const dur2 = p2.typical_duration_minutes || 75;
      const end2 = new Date(start2.getTime() + dur2 * 60000);
      const slot2 = `${fmt(start2)} - ${fmt(end2)}`;

      const rawFallbackSchedule = [
        {
          id: p1.id,
          time_slot: slot1,
          place_name: p1.name,
          address: p1.address,
          activity_type: effectiveSlot === 'night' ? (isLateNight ? 'Coctelería de autor' : 'Cena Porteña') : effectiveSlot === 'lunch' ? 'Almuerzo Porteño' : 'Café & Merienda',
          duration_minutes: dur1,
          porteño_tip: p1.highlight || 'Disfrutar la atmósfera única del lugar y pedir la recomendación de la casa.',
          lat: p1.lat,
          lng: p1.lng,
          description: p1.description,
          activities: p1.activities || [],
          image_url: p1.image_url,
          about: p1.about,
          category: p1.category
        },
        {
          id: p2.id,
          time_slot: slot2,
          place_name: p2.name,
          address: p2.address,
          activity_type: effectiveSlot === 'night' ? 'Tragos & Sobremesa' : effectiveSlot === 'afternoon' ? 'Paseo & Cultura' : 'Sobremesa & Recorrido',
          duration_minutes: dur2,
          porteño_tip: p2.highlight || 'Relajarse y coronar la ronda a tu propio ritmo.',
          lat: p2.lat,
          lng: p2.lng,
          description: p2.description,
          activities: p2.activities || [],
          image_url: p2.image_url,
          about: p2.about,
          category: p2.category
        }
      ];

      const fallbackSchedule = updateScheduleTransits(rawFallbackSchedule);

      setPlan({
        id: `ronda_${fallbackNeighborhood.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
        title: `Una ronda por ${fallbackNeighborhood}.`,
        neighborhood: fallbackNeighborhood,
        mood: mood || 'amigos',
        estimated_cost: priceTier,
        narrative_summary: selectedSlot === 'now' 
          ? `Ronda espontánea saliendo a las ${slot1.split(' - ')[0]} por ${fallbackNeighborhood}. Paradas conectadas a pie y sincronizadas con la movida porteña en este momento.`
          : `Una ronda pensada para disfrutar a tu ritmo por ${fallbackNeighborhood}. Conectamos cada parada de manera caminable y respetando los tiempos de sobremesa porteña.`,
        schedule: fallbackSchedule
      });
      setScreen('itinerary');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPlaceGoogleMapsUrl = (placeName, address) => {
    const query = encodeURIComponent(`${placeName}, ${address}, Buenos Aires`);
    return `https://www.google.com/maps/search/?api=1&query=${query}`;
  };

  const shareViaWhatsApp = () => {
    if (!plan) return;
    const text = `🍷 *Mi Ronda en ${plan.neighborhood}*\n_${plan.title}_\n\n` +
      plan.schedule.map((s, idx) => 
        `📍 *${idx + 1}. ${s.place_name}* (${s.time_slot})\n   _${s.activity_type}_\n   Dirección: ${s.address}\n   Cómo llegar: ${getPlaceGoogleMapsUrl(s.place_name, s.address)}\n   💡 Tip: ${s.porteño_tip}`
      ).join('\n\n') +
      `\n\n_Armado con Ronda (Buenos Aires)_`;
    
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const copyPlanToClipboard = () => {
    if (!plan) return;
    triggerHaptic(12);
    const text = `🧭 Mi Ronda en ${plan.neighborhood}:\n${plan.title}\n\n` +
      plan.schedule.map((s, idx) => 
        `• ${idx + 1}. ${s.time_slot}: ${s.place_name} (${s.address})\n  Maps: ${getPlaceGoogleMapsUrl(s.place_name, s.address)}\n  Tip: ${s.porteño_tip}`
      ).join('\n\n') +
      `\nArmado con Ronda (Buenos Aires)`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ==========================================
  // PANTALLA 0: SPLASH SCREEN INICIAL DE APERTURA
  // ==========================================
  if (isSplashActive) {
    return (
      <RondaSplashWaitingScreen 
        subtitle="Buenos Aires a tu ritmo"
        hint="Toca la pantalla para comenzar"
        onDismiss={() => setIsSplashActive(false)}
      />
    );
  }

  // ==========================================
  // PANTALLA 2: PANTALLA DE ESPERA (DURANTE LA GENERACIÓN)
  // ==========================================
  if (screen === 'loading') {
    return (
      <RondaSplashWaitingScreen 
        subtitle="Buenos Aires a tu ritmo"
      />
    );
  }

  // ==========================================
  // PANTALLA 3: EL RECORRIDO HECHO (ITINERARIO)
  // ==========================================
  if (screen === 'itinerary' && plan) {
    const currentStopSig = (plan.schedule || []).map((s) => s.place_name || s.id).join('|');
    const isCurrentPlanSaved = Boolean(
      currentUser &&
        Array.isArray(currentUser.saved_plans) &&
        currentUser.saved_plans.some((p) => {
          const pData = p.plan || p;
          const sig = (pData.schedule || []).map((s) => s.place_name || s.id).join('|');
          return (
            (plan.id && plan.id !== 'ronda_demo_01' && pData.id === plan.id) ||
            (currentStopSig && sig === currentStopSig && pData.neighborhood === plan.neighborhood)
          );
        })
    );

    return (
      <div className="min-h-screen ronda-canvas flex flex-col relative transition-colors duration-300">
        {/* Ventana de espera/transición idéntica a la inicial */}
        {isNavigating && (
          <RondaSplashWaitingScreen subtitle={navigatingSubtitle} />
        )}

        {/* Menú lateral de escritorio (se abre al pasar el cursor) */}
        <DesktopSidebar 
          isOpen={desktopMenuOpen} 
          setIsOpen={setDesktopMenuOpen} 
          screen={screen} 
          onNavigate={handleNavigate} 
          setShowProfileModal={setShowProfileModal} 
          currentUser={currentUser}
        />

        {/* Contenido principal del itinerario */}
        <div className="flex-1 min-w-0 flex flex-col min-h-screen">
          <header className="ronda-header backdrop-blur-md border-b sticky top-0 z-30 transition-colors">
            <div className="max-w-4xl mx-auto px-5 h-16 flex items-center justify-between">
              <div className="flex items-center gap-2.5 sm:gap-4">
                {/* Botón monograma 'r.' para desplegar al pasar el cursor en pantalla grande */}
                <button
                  type="button"
                  onMouseEnter={() => setDesktopMenuOpen(true)}
                  onClick={() => setDesktopMenuOpen(prev => !prev)}
                  className="hidden lg:flex items-center justify-center w-8 h-8 rounded-xl bg-[#182A24] dark:bg-[#243B30] text-white border ronda-border cursor-pointer transition shadow-2xs"
                  title="Abrir menú"
                >
                  <span className="font-editorial text-lg font-bold leading-none select-none">
                    r<span className="text-[#E06D28]">.</span>
                  </span>
                </button>

                <button 
                  onClick={() => setScreen('config')}
                  className="flex items-center gap-1.5 text-sm font-medium text-[var(--text-main)] hover:text-[#E06D28] transition cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                  <span>Modificar ronda</span>
                </button>
              </div>

              {/* Centro sin logo duplicado: el logo permanece a la izquierda */}

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSavePlan(plan)}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    isCurrentPlanSaved
                      ? 'bg-[#E06D28]/15 text-[#E06D28]'
                      : 'text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10'
                  }`}
                  title={isCurrentPlanSaved ? "Ronda guardada en tu perfil" : "Guardar en mi perfil"}
                >
                  <Bookmark className={`w-4 h-4 text-[#E06D28] ${isCurrentPlanSaved ? 'fill-[#E06D28]' : ''}`} />
                </button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="p-2 rounded-xl text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
                  title={theme === 'dark' ? "Modo dia" : "Modo noche"}
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F07E34]" /> : <Moon className="w-4 h-4 text-[var(--text-main)]" />}
                </button>

                {/* Chip de Perfil en Desktop */}
                <button
                  type="button"
                  onClick={() => setShowProfileModal(true)}
                  className="hidden sm:inline-flex items-center gap-2 ronda-card border hover:border-[#E06D28] text-[var(--text-main)] px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ml-2 shadow-2xs"
                  title={currentUser ? `Perfil de ${currentUser.name}` : "Iniciar sesión o registrarse"}
                >
                  <div className="w-5 h-5 rounded-full bg-[#182A24] dark:bg-[#243B30] text-white flex items-center justify-center text-[9px] font-bold">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3 h-3 text-white" />}
                  </div>
                  <span className="font-semibold text-xs text-[var(--text-main)] truncate max-w-[85px]">
                    {currentUser?.name ? currentUser.name.split(' ')[0] : 'Perfil'}
                  </span>
                </button>
              </div>
            </div>
          </header>

        <main className="flex-1 max-w-4xl w-full mx-auto px-5 pt-8 pb-28 lg:pb-16">
          <div className="mb-6">
            <div className="mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider ronda-tag px-3 py-1 rounded-full border">
                Tu recorrido personalizado
              </span>
            </div>

            <h1 className="font-editorial text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--text-main)] leading-tight mb-2.5">
              Una ronda por <span className="italic">{plan.neighborhood}</span><span className="text-[#E06D28]">.</span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-[#5E6F66] font-medium mb-3.5">
              <span className="font-semibold text-[var(--text-main)]">{plan.neighborhood}</span>
              <span className="text-[#C5BEB3]">·</span>
              <span>{plan.schedule.length} paradas a pie</span>
              <span className="text-[#C5BEB3]">·</span>
              <span>Presupuesto {plan.estimated_cost}</span>
              {currentWeatherVisual && (
                <>
                  <span className="text-[#C5BEB3]">·</span>
                  <span className="inline-flex items-center gap-1">
                    <currentWeatherVisual.Icon className={`w-3.5 h-3.5 ${currentWeatherVisual.iconColor}`} />
                    <span>{currentWeatherVisual.text}</span>
                  </span>
                </>
              )}
            </div>

            <p className="ronda-text-muted text-sm sm:text-base leading-relaxed max-w-3xl">
              {plan.narrative_summary}
            </p>
          </div>

          {/* Mapa Interactivo con todos los puntos del recorrido */}
          <RondaMap schedule={plan.schedule} neighborhood={plan.neighborhood} />

          <div className="space-y-3 mb-10">
            {plan.schedule.map((item, idx) => {
              const catalogPlace = LOCAL_PLACES_CATALOG.find(
                (p) => (item.id && p.id === item.id) || p.name?.toLowerCase() === item.place_name?.toLowerCase()
              );
              const photoUrl = item.image_url || catalogPlace?.image_url || (catalogPlace?.id ? `/places/${catalogPlace.id}.jpg` : null);
              const pid = item.id || catalogPlace?.id || item.place_name?.toLowerCase().replace(/[^a-z0-9]/g, '_');
              const isFav = (currentUser?.favorite_place_ids || currentUser?.favorites || []).includes(pid);
              const isVis = (currentUser?.visited_place_ids || []).includes(pid);

              return (
                <React.Fragment key={idx}>
                  <div 
                    onClick={() => openPlaceModal(item)}
                    className="ronda-card border hover:border-[#E06D28] rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden"
                    title="Toca para ver la descripción completa y qué podés hacer acá"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-5">
                      {/* Miniatura de foto con número de parada flotante */}
                      <div className="w-full sm:w-28 h-36 sm:h-28 rounded-2xl overflow-hidden bg-[#182A24] shrink-0 border border-[#E2E8F0] relative">
                        {photoUrl ? (
                          <img 
                            src={photoUrl} 
                            alt={item.place_name} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#2A4B3D] to-[#182A24] flex items-center justify-center text-white text-xl font-bold">
                            {idx + 1}
                          </div>
                        )}
                        <span className="absolute top-2.5 left-2.5 w-6 h-6 rounded-full bg-[#182A24]/90 backdrop-blur-xs text-white text-xs font-bold flex items-center justify-center shadow-xs">
                          {idx + 1}
                        </span>
                      </div>

                      {/* Contenido principal */}
                      <div className="flex-1 min-w-0">
                        {/* Fila superior: Time Slot + Duración + Ya fui / Favoritos */}
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider ronda-tag px-2.5 py-0.5 rounded-full border">
                              {item.time_slot}
                            </span>
                            <span className="text-xs ronda-text-muted font-medium hidden sm:inline">
                              ~ {item.duration_minutes} min
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleVisited(pid);
                              }}
                              className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 btn-latido ${
                                isVis
                                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                                  : 'ronda-card-inner text-[var(--text-main)] hover:border-[#E06D28]'
                              }`}
                              title={isVis ? "Quitar de lugares visitados" : "Marcar que ya visitaste este lugar"}
                            >
                              <Check className="w-3 h-3" />
                              <span>{isVis ? 'Visitado' : 'Ya fui'}</span>
                            </button>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFavoriteBurstId(pid);
                                triggerHaptic(14);
                                handleToggleFavorite(pid);
                                setTimeout(() => setFavoriteBurstId(null), 400);
                              }}
                              className={`p-1.5 rounded-full transition cursor-pointer relative btn-latido ${
                                isFav
                                  ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100'
                                  : 'ronda-text-muted hover:text-rose-500 hover:bg-rose-500/10'
                              }`}
                              title={isFav ? "Quitar de tus favoritos" : "Guardar en tus favoritos"}
                            >
                              <SparkleBurst active={favoriteBurstId === pid} />
                              <Heart className={`w-4 h-4 ${isFav ? 'fill-rose-600' : ''} ${favoriteBurstId === pid ? 'animate-chispeo' : ''}`} />
                            </button>
                          </div>
                        </div>

                        {/* Alerta de Cierre Próximo */}
                        {(() => {
                          const closingMsg = getClosingSoonAlert(item, catalogPlace, plan.day_of_week || alargueDayKey);
                          if (!closingMsg) return null;
                          return (
                            <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-900 bg-amber-100/90 border border-amber-300 px-2.5 py-1 rounded-xl mb-2 shadow-2xs">
                              <span>⏰</span>
                              <span>{closingMsg}</span>
                            </div>
                          );
                        })()}

                        {/* Nombre del lugar */}
                        <h3 className="font-editorial text-2xl font-bold text-[var(--text-main)] mb-1 group-hover:text-[#E06D28] transition leading-snug">
                          {item.place_name}
                        </h3>

                        {/* Dirección y categoría en una sola línea sutil */}
                        <p className="text-xs ronda-text-muted flex items-center gap-1.5 mb-2.5">
                          <MapPin className="w-3.5 h-3.5 text-[#2A4B3D] shrink-0" />
                          <span className="truncate">{item.address}</span>
                          <span className="text-[#C5BEB3]">·</span>
                          <span className="text-[#2A4B3D] font-medium truncate">{item.activity_type}</span>
                        </p>

                        {/* El Toque Porteño integrado fluidamente sin caja beige pesada */}
                        {item.porteño_tip && (
                          <p className="text-xs sm:text-sm ronda-text-muted italic leading-relaxed mb-3.5">
                            <span className="not-italic mr-1.5">💡</span>
                            {item.porteño_tip}
                          </p>
                        )}

                        {/* Barra de acción inferior compacta y alineada */}
                        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#EDF2F7]">
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)] ronda-card-inner hover:bg-[var(--bg-card)] border group-hover:border-[#E06D28] px-3.5 py-2 rounded-xl transition shadow-2xs">
                            <span>Ver qué hacer</span>
                            <ArrowRight className="w-3.5 h-3.5 text-[#E06D28] group-hover:translate-x-0.5 transition-transform" />
                          </span>

                          <a
                            href={getPlaceGoogleMapsUrl(item.place_name, item.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-main)] hover:text-[#E06D28] ronda-card-inner hover:bg-[var(--bg-card)] border px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs"
                            title="Abrir este lugar en Google Maps"
                          >
                            <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
                            <span>Cómo llegar en Maps</span>
                          </a>
                        </div>

                        {/* Propuesta de cambio de plan 1-tap (si es un bar y hay opción de pool/juegos) */}
                        {(() => {
                          const currentDayForPlan = plan.day_of_week || alargueDayKey;
                          const playfulSwapOption = getPlayfulSwapCandidate(
                            item,
                            plan,
                            catalogPlaces,
                            currentDayForPlan,
                            idx
                          );

                          if (playfulSwapOption && !item.is_swapped_playful) {
                            return (
                              <div className="mt-3 pt-2.5 border-t border-[var(--border-card)]">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSwapToPlayful(idx, playfulSwapOption);
                                  }}
                                  className="w-full group/swap flex items-center justify-between gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-orange-500/10 dark:bg-[#20150F] border border-orange-500/35 hover:border-orange-500/70 transition shadow-sm text-left cursor-pointer"
                                  title="Cambiar este bar por una opción lúdica con pool, fichines o juegos"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <span className="text-lg shrink-0 p-1.5 ronda-card-inner rounded-xl border border-amber-500/40">
                                      🎱
                                    </span>
                                    <div className="min-w-0">
                                      <p className="text-xs font-bold text-[var(--text-main)] flex items-center gap-1.5 flex-wrap">
                                        <span>¿Pinta pool o fichines?</span>
                                        <span className="text-[#E06D28] dark:text-[#F07E34] underline underline-offset-2">
                                          Cambiar por {playfulSwapOption.place.name}
                                        </span>
                                      </p>
                                      <p className="text-[11px] ronda-text-muted truncate">
                                        {playfulSwapOption.distanceText}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="shrink-0 text-xs font-bold text-[var(--text-main)] ronda-card group-hover/swap:bg-[#E06D28] group-hover/swap:text-white px-2.5 py-1.5 rounded-xl border border-amber-500/40 transition shadow-2xs">
                                    Cambiar ⚡
                                  </span>
                                </button>
                              </div>
                            );
                          }

                          if (item.is_swapped_playful && item.original_stop) {
                            return (
                              <div className="mt-3 pt-2.5 border-t border-[#EDF2F7]">
                                <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs">
                                  <div className="flex items-center gap-2 min-w-0">
                                    <span className="text-base shrink-0">🎱</span>
                                    <div className="min-w-0">
                                      <p className="font-bold text-emerald-900 truncate">
                                        ¡Cambio lúdico aplicado!
                                      </p>
                                      <p className="text-[11px] text-emerald-700 truncate">
                                        {item.swap_note || 'Reemplazaste el bar clásico por pool/juegos'}
                                      </p>
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRevertPlayfulSwap(idx);
                                    }}
                                    className="font-semibold text-xs text-[var(--text-main)] ronda-card-inner hover:bg-[var(--bg-card)] border border-emerald-500/40 px-2.5 py-1 rounded-xl transition cursor-pointer shrink-0"
                                  >
                                    ↩️ Volver a {item.original_stop.place_name}
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return null;
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Conector vertical continuo de caminata (Timeline) */}
                  {item.transit_to_next && (
                    <div className="flex items-center gap-3 my-1.5 px-4 sm:px-6">
                      <div className="w-px h-6 border-l-2 border-dashed border-[#2A4B3D]/30 shrink-0 ml-4 sm:ml-5" />
                      <div className="inline-flex items-center gap-1.5 text-xs ronda-text-muted font-medium py-0.5">
                        <span className="text-sm">🚶</span>
                        <span className="font-semibold text-[var(--text-main)]">{item.transit_to_next.duration_minutes} min</span>
                        <span>a pie</span>
                        {item.transit_to_next.notes && (
                          <>
                            <span className="text-[#C5BEB3]">·</span>
                            <span className="italic ronda-text-muted truncate max-w-xs sm:max-w-md">{item.transit_to_next.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ======================================================== */}
          {/* SECCIÓN: ¿LA ESTIRAMOS? (PARADA LÚDICA 1-TAP RECOMENDADA) */}
          {/* ======================================================== */}
          {(() => {
            if (!alargueCandidates || alargueCandidates.length === 0) return null;
            const currentCandidate = alargueCandidates[alargueIndex % alargueCandidates.length];
            if (!currentCandidate) return null;

            const isAdded = plan.schedule.some(
              (item) => item.is_alargue && (item.id === currentCandidate.id || item.place_name === currentCandidate.name)
            );
            const smartBadge = getSmartOpenBadge(currentCandidate, alargueDayKey);
            const isSameNeighborhood = currentCandidate.neighborhood === plan.neighborhood;
            const photoUrl = currentCandidate.image_url || `/places/${currentCandidate.id}.jpg`;
            const playLabel = getPlayCategoryLabel(currentCandidate.play_category?.[0]);

            return (
              <div className={`mb-10 rounded-3xl border p-5 sm:p-6 transition shadow-xs ${
                isAdded
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600/60 ring-2 ring-emerald-500/20 shadow-md'
                  : 'ronda-card border shadow-lg'
              }`}>
                {/* Header compacto */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">🎱</span>
                    <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[var(--text-main)] tracking-tight">
                      ¿La estiramos?
                    </h3>
                  </div>
                  {isAdded ? (
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-900/60 px-2.5 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-700">
                      ✓ En tu ronda
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider ronda-text-muted ronda-card-inner px-2.5 py-0.5 rounded-full border shadow-2xs">
                      Parada lúdica sugerida
                    </span>
                  )}
                </div>

                <p className="text-xs ronda-text-muted mb-3.5">
                  Una opción cercana y verificada para no cortar la noche.
                </p>

                {/* Tarjeta única recomendada */}
                <div className="ronda-card-inner rounded-2xl border p-4 mb-3.5 shadow-sm transition-colors">
                  <div className="flex items-start gap-3.5 mb-2.5">
                    {/* Miniatura */}
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-[#182A24] shrink-0 border border-[#E2E8F0]">
                      <img
                        src={photoUrl}
                        alt={currentCandidate.name}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-100/90 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/40">
                          {smartBadge}
                        </span>
                        <span className="text-[10px] font-bold ronda-text-muted uppercase">
                          {isSameNeighborhood ? `📍 ${currentCandidate.neighborhood}` : currentCandidate.neighborhood}
                        </span>
                        {playLabel && (
                          <span className="text-[10px] font-medium text-[var(--text-main)] ronda-card-inner border px-2 py-0.5 rounded-full">
                            {playLabel}
                          </span>
                        )}
                      </div>

                      <h4 className="font-editorial text-base sm:text-lg font-bold text-[var(--text-main)] leading-snug truncate">
                        {currentCandidate.name}
                      </h4>
                      <p className="text-[11px] ronda-text-muted truncate">
                        {currentCandidate.address}
                      </p>
                    </div>
                  </div>

                  {/* Detalle lúdico */}
                  {(currentCandidate.game_highlight || currentCandidate.highlight) && (
                    <p className="text-xs ronda-text-muted italic leading-relaxed line-clamp-2 pt-2 border-t border-[#EDF2F7]">
                      <span className="not-italic mr-1">🎱</span>
                      {currentCandidate.game_highlight || currentCandidate.highlight}
                    </p>
                  )}
                </div>

                {/* Acciones 1-tap: Sumar + Rotar opción + Ficha */}
                <div className="flex flex-wrap items-center gap-2">
                  {isAdded ? (
                    <button
                      type="button"
                      onClick={() => handleRemoveAlargue(currentCandidate.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold bg-emerald-700 hover:bg-rose-700 text-white rounded-xl transition cursor-pointer shadow-xs group/btn"
                    >
                      <Check className="w-4 h-4 group-hover/btn:hidden" />
                      <X className="w-4 h-4 hidden group-hover/btn:inline" />
                      <span className="group-hover/btn:hidden">✓ Sumado a tu ronda</span>
                      <span className="hidden group-hover/btn:inline">Quitar de tu ronda</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleAddAlargue(currentCandidate)}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold bg-[#E06D28] hover:bg-[#C95B1D] text-white rounded-xl transition cursor-pointer shadow-md btn-latido"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>+ Sumar a mi ronda</span>
                    </button>
                  )}

                  {alargueCandidates.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic(6);
                        setAlargueIndex((prev) => (prev + 1) % alargueCandidates.length);
                      }}
                      className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3.5 text-xs font-semibold text-[var(--text-main)] hover:text-[#E06D28] ronda-card-inner hover:bg-[var(--bg-card)] border rounded-xl transition cursor-pointer shadow-2xs btn-latido"
                      title="Probar otra opción cercana"
                    >
                      <span>🎲</span>
                      <span>Otra opción ({((alargueIndex % alargueCandidates.length) + 1)}/{alargueCandidates.length})</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => openPlaceModal(currentCandidate)}
                    className="py-2.5 px-3 text-xs font-medium text-[var(--text-main)] hover:text-[#E06D28] ronda-card-inner hover:bg-[var(--bg-card)] border rounded-xl transition cursor-pointer btn-latido"
                  >
                    Ver ficha
                  </button>
                </div>
              </div>
            );
          })()}

          {/* ACTIVIDAD O FERIA RECOMENDADA (Primero la ronda, luego la actividad) */}
          {(plan.suggested_activity || originActivity) && (
            <div className="mb-10 ronda-card border rounded-3xl p-6 sm:p-7 shadow-md transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] ronda-tag px-3 py-1 rounded-full border">
                  Plan complementario del barrio
                </span>
                <span className="text-xs ronda-text-muted font-medium hidden sm:inline">
                  Para completar tu salida
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
                {/* Foto 16:9 en miniatura/hero */}
                {(originActivity?.photo || plan.suggested_activity?.photo) && (
                  <div className="w-full sm:w-48 aspect-video rounded-2xl overflow-hidden bg-[#F1F5F9] shrink-0 border border-[#E2E8F0]">
                    <img 
                      src={originActivity?.photo || plan.suggested_activity?.photo} 
                      alt={originActivity?.title || plan.suggested_activity?.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const fallback = originActivity?.fallbackPhoto || plan.suggested_activity?.fallbackPhoto;
                        if (fallback && e.target.src !== fallback) {
                          e.target.src = fallback;
                        } else {
                          e.target.style.display = 'none';
                        }
                      }}
                    />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#E06D28] mb-1">
                    <Calendar className="w-3.5 h-3.5 text-[#E06D28]" />
                    <span>{originActivity?.days || plan.suggested_activity?.days}</span>
                  </div>

                  <h3 className="font-editorial text-xl sm:text-2xl font-bold text-[var(--text-main)] mb-1.5 leading-snug">
                    {originActivity?.title || plan.suggested_activity?.title}
                  </h3>

                  <p className="text-xs sm:text-sm ronda-text-muted leading-relaxed mb-3">
                    {originActivity?.description || plan.suggested_activity?.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/40">
                      🎟️ Entrada libre y gratuita
                    </span>
                    {(originActivity?.location || plan.suggested_activity?.location) && (
                      <span className="text-[10px] ronda-text-muted flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#E06D28]" />
                        <span>{originActivity?.location || plan.suggested_activity?.location}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-12">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Botón Guardar en mi perfil */}
              <button
                onClick={() => handleSavePlan(plan)}
                className={`flex-1 font-semibold py-3.5 px-6 rounded-2xl transition text-center text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer btn-latido ${
                  isCurrentPlanSaved
                    ? 'bg-[#213D30] hover:bg-[#284B3B] text-white border border-emerald-500/40'
                    : 'bg-[#182A24] hover:bg-[#223931] text-white'
                }`}
              >
                <Bookmark className={`w-4 h-4 text-[#E06D28] ${isCurrentPlanSaved ? 'fill-[#E06D28]' : ''}`} />
                <span>{isCurrentPlanSaved ? '✓ Ronda guardada en tu perfil' : 'Guardar en mi perfil'}</span>
              </button>

              {/* Botón Mandar por WhatsApp */}
              <button
                onClick={shareViaWhatsApp}
                className="flex-1 bg-[#128C7E] hover:bg-[#075E54] text-white font-semibold py-3.5 px-6 rounded-2xl transition text-center text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>Mandar por WhatsApp</span>
              </button>

              {/* Botón Copiar resumen */}
              <button
                onClick={copyPlanToClipboard}
                className="flex-1 ronda-card-inner border hover:border-[#E06D28] text-[var(--text-main)] font-semibold py-3.5 px-6 rounded-2xl transition text-center text-sm flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <CheckCircle2 className={`w-4 h-4 ${copied ? 'text-green-600' : 'text-[#5E6F66]'}`} />
                <span>{copied ? '¡Recorrido copiado!' : 'Copiar texto'}</span>
              </button>
            </div>

            <button
              onClick={() => handleNavigate('config', 'adjust')}
              className="w-full text-center text-xs font-semibold text-[#5E6F66] hover:text-[#182A24] py-2 transition cursor-pointer"
            >
              ← Volver y ajustar preferencias
            </button>
          </div>
        </main>
      </div>

      {/* Barra inferior en móviles con opción de ocultar/desocultar por debajo */}
      <MobileBottomNav 
        isVisible={mobileNavVisible} 
        setIsVisible={setMobileNavVisible} 
        screen={screen} 
        onNavigate={handleNavigate} 
        setShowProfileModal={setShowProfileModal} 
        currentUser={currentUser}
      />

      {/* MODAL DE PERFIL / INICIAR SESIÓN / REGISTRO */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onGoogleLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onUpdatePreferences={handleUpdatePreferences}
        onLoadSavedPlan={handleLoadSavedPlan}
        onRemoveSavedPlan={handleRemoveSavedPlan}
        onToggleVisited={handleToggleVisited}
        allPlaces={catalogPlaces}
        onOpenPlaceDetail={(place) => openPlaceModal(place)}
        onPlanFromHere={handlePlanFromHere}
        theme={theme}
      />

      {/* Toast Flotante de Ronda Guardada */}
      {planSavedToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#182A24] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-[#30483E]">
          <Bookmark className="w-4 h-4 text-[#E06D28]" />
          <span>¡Ronda guardada en tu perfil!</span>
        </div>
      )}

      {/* Toast Flotante de Autenticación / Bienvenida */}
      {authToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#182A24] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in border border-[#30483E]">
          <div className="w-6 h-6 rounded-full bg-[#E06D28] text-[#182A24] flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </div>
          <div>
            <p className="font-bold text-sm text-[#FAF8F5]">{authToast.title}</p>
            <p className="text-[11px] text-[#A6C0B2] font-normal">{authToast.message}</p>
          </div>
        </div>
      )}

      {/* Modal Translúcido de Detalle del Lugar y Actividades */}
      {selectedPlaceModal && (
        <PlaceDetailModal 
          place={selectedPlaceModal} 
          onClose={() => setSelectedPlaceModal(null)} 
          getPlaceGoogleMapsUrl={getPlaceGoogleMapsUrl} 
          onPlanFromHere={handlePlanFromHere}
          isFavorite={(currentUser?.favorite_place_ids || currentUser?.favorites || []).includes(selectedPlaceModal?.id || (selectedPlaceModal?.place_name || selectedPlaceModal?.name)?.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
          onToggleFavorite={handleToggleFavorite}
          isVisited={(currentUser?.visited_place_ids || []).includes(selectedPlaceModal?.id || (selectedPlaceModal?.place_name || selectedPlaceModal?.name)?.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
          onToggleVisited={handleToggleVisited}
        />
      )}
    </div>
  );
}

  // ==========================================
  // PANTALLA 4: RECOMENDADOS (CATÁLOGO & AGENDA)
  // ==========================================
  if (screen === 'recommended') {
    return (
      <div className="min-h-screen ronda-canvas flex flex-col relative transition-colors duration-300">
        {/* Ventana de espera/transición idéntica a la inicial */}
        {isNavigating && (
          <RondaSplashWaitingScreen subtitle={navigatingSubtitle} />
        )}

        {/* Menú lateral de escritorio (se abre al pasar el cursor) */}
        <DesktopSidebar 
          isOpen={desktopMenuOpen} 
          setIsOpen={setDesktopMenuOpen} 
          screen={screen} 
          onNavigate={handleNavigate} 
          setShowProfileModal={setShowProfileModal} 
          currentUser={currentUser}
        />

        {/* Botón flotante 'r.' para abrir el menú en desktop al pasar el cursor */}
        <button
          type="button"
          onMouseEnter={() => setDesktopMenuOpen(true)}
          onClick={() => setDesktopMenuOpen(prev => !prev)}
          className="hidden lg:flex items-center justify-center w-10 h-10 rounded-2xl ronda-card border hover:border-[#E06D28] shadow-xs cursor-pointer fixed top-4 left-5 z-40 transition-all hover:scale-105 active:scale-95"
          aria-label="Abrir menú"
          title="Abrir menú"
        >
          <span className="font-editorial text-2xl font-bold text-[var(--text-main)] leading-none select-none">
            r<span className="text-[#E06D28]">.</span>
          </span>
        </button>

        {/* Pantalla del Catálogo y Recomendados con Agenda */}
        <RecommendedScreen
          theme={theme}
          onToggleTheme={toggleTheme}
          catalogPlaces={catalogPlaces}
          onSelectPlace={(place) => openPlaceModal(place)}
          onPlanFromHere={handlePlanFromHere}
          onBackToCreator={() => handleNavigate('config', 'quick')}
          weather={weather}
          currentHour={currentHour}
          currentUser={currentUser}
          onOpenProfileModal={() => setShowProfileModal(true)}
        />

        {/* Sugerencia flotante para volver a la ronda si ya hay un plan generado */}
        <ActivePlanSuggestion 
          plan={plan} 
          onClick={() => handleNavigate('itinerary')} 
          mobileNavVisible={mobileNavVisible} 
          configView={configView}
        />

        {/* Menú inferior para móviles */}
        <MobileBottomNav 
          isVisible={mobileNavVisible} 
          setIsVisible={setMobileNavVisible} 
          screen={screen} 
          onNavigate={handleNavigate} 
          setShowProfileModal={setShowProfileModal} 
          currentUser={currentUser}
        />

        {/* Modal de perfil / autenticación */}
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          currentUser={currentUser}
          onGoogleLogin={handleGoogleLogin}
          onLogout={handleLogout}
          onUpdatePreferences={handleUpdatePreferences}
          onLoadSavedPlan={handleLoadSavedPlan}
          onRemoveSavedPlan={handleRemoveSavedPlan}
          onToggleVisited={handleToggleVisited}
          allPlaces={catalogPlaces}
          onOpenPlaceDetail={(place) => openPlaceModal(place)}
          onPlanFromHere={handlePlanFromHere}
          theme={theme}
        />

        {/* Modal Translúcido de Detalle del Lugar y Actividades */}
        {selectedPlaceModal && (
          <PlaceDetailModal 
            place={selectedPlaceModal} 
            onClose={() => setSelectedPlaceModal(null)} 
            getPlaceGoogleMapsUrl={getPlaceGoogleMapsUrl} 
            onPlanFromHere={handlePlanFromHere}
            isFavorite={(currentUser?.favorite_place_ids || currentUser?.favorites || []).includes(selectedPlaceModal?.id || (selectedPlaceModal?.place_name || selectedPlaceModal?.name)?.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
            onToggleFavorite={handleToggleFavorite}
            isVisited={(currentUser?.visited_place_ids || []).includes(selectedPlaceModal?.id || (selectedPlaceModal?.place_name || selectedPlaceModal?.name)?.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
            onToggleVisited={handleToggleVisited}
          />
        )}

        {/* Toast Flotante de Ronda Guardada */}
        {planSavedToast && (
          <div className="fixed top-5 right-5 z-50 bg-[#182A24] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-[#30483E]">
            <Bookmark className="w-4 h-4 text-[#E06D28]" />
            <span>¡Ronda guardada en tu perfil!</span>
          </div>
        )}

        {/* Toast Flotante de Autenticación / Bienvenida */}
        {authToast && (
          <div className="fixed top-5 right-5 z-50 bg-[#182A24] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in border border-[#30483E]">
            <div className="w-6 h-6 rounded-full bg-[#E06D28] text-[#182A24] flex items-center justify-center font-bold text-xs shrink-0">
              ✓
            </div>
            <div>
              <p className="font-bold text-sm text-[#FAF8F5]">{authToast.title}</p>
              <p className="text-[11px] text-[#A6C0B2] font-normal">{authToast.message}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // PANTALLA 1: CREADOR INTELIGENTE (HOME)
  // ==========================================
  return (
    <div className="min-h-screen ronda-canvas flex flex-col relative transition-colors duration-300">
      {/* Ventana de espera/transición idéntica a la inicial al tocar botones */}
      {isNavigating && (
        <RondaSplashWaitingScreen subtitle={navigatingSubtitle} />
      )}

      {/* Menú lateral de escritorio (colapsable al pasar el cursor o tocar el logo 'r.') */}
      <DesktopSidebar 
        isOpen={desktopMenuOpen} 
        setIsOpen={setDesktopMenuOpen} 
        screen={screen} 
        onNavigate={handleNavigate} 
        setShowProfileModal={setShowProfileModal} 
        currentUser={currentUser}
      />

      {/* Contenido Principal */}
      <main className={`flex-1 max-w-4xl w-full mx-auto px-5 py-8 sm:py-12 ${configView === 'adjust' ? 'pb-44 lg:pb-32' : 'pb-28 lg:pb-12'}`}>
        <div className="lg:hidden flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#182A24] dark:bg-[#243B30] text-white flex items-center justify-center font-editorial font-bold text-sm">
              r<span className="text-[#E06D28]">.</span>
            </div>
            <span className="font-editorial text-2xl font-bold text-[var(--text-main)]">
              ronda<span className="text-[#E06D28]">.</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 rounded-full ronda-card border text-[var(--text-main)] transition cursor-pointer shadow-2xs"
              title={theme === 'dark' ? "Modo dia" : "Modo noche"}
            >
              {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-[#F07E34]" /> : <Moon className="w-3.5 h-3.5 text-[var(--text-main)]" />}
            </button>
            <div className="inline-flex items-center gap-1.5 ronda-card-inner border text-[var(--text-main)] px-3 py-1 rounded-full text-xs font-semibold">
              <currentWeatherVisual.Icon className={`w-3.5 h-3.5 ${currentWeatherVisual.iconColor}`} />
              <span>{currentWeatherVisual.text}</span>
            </div>
          </div>
        </div>

        {/* Cabecera superior exclusiva para Desktop en Config (Un único logo 'r.' que abre el menú lateral) */}
        <div className="hidden lg:flex items-center justify-between pb-6 mb-8 border-b ronda-border">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onMouseEnter={() => setDesktopMenuOpen(true)}
              onClick={() => setDesktopMenuOpen(prev => !prev)}
              className="group flex items-center gap-2.5 cursor-pointer text-left focus:outline-none"
              aria-label="Abrir menú lateral"
              title="Abrir menú lateral"
            >
              <div className="w-9 h-9 rounded-xl bg-[#182A24] dark:bg-[#243B30] border border-[#2F493B] flex items-center justify-center shadow-xs group-hover:border-[#E06D28] transition">
                <span className="font-editorial text-lg font-bold text-white leading-none">
                  r<span className="text-[#E06D28]">.</span>
                </span>
              </div>
              <span className="font-editorial text-2xl font-bold text-[var(--text-main)]">
                ronda<span className="text-[#E06D28]">.</span>
              </span>
            </button>

            {/* Botón directo de acceso al menú lateral / Recomendados visible en la primera ventana */}
            <button
              type="button"
              onClick={() => setDesktopMenuOpen(prev => !prev)}
              className="ml-1 inline-flex items-center gap-1.5 ronda-card-inner border hover:border-[#E06D28] text-[var(--text-main)] px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
              title="Abrir menú de navegación"
            >
              <Menu className="w-3.5 h-3.5 text-[#E06D28]" />
              <span>Menú</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 ronda-card-inner text-[var(--text-main)] px-3.5 py-1.5 rounded-xl text-xs font-semibold border">
              <currentWeatherVisual.Icon className={`w-3.5 h-3.5 ${currentWeatherVisual.iconColor}`} />
              <span>{currentWeatherVisual.text}</span>
            </div>

            {/* Botón selector de modo día / noche */}
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-xl ronda-card border text-[var(--text-main)] hover:text-[#E06D28] dark:hover:text-[#F07E34] transition cursor-pointer shadow-2xs"
              title={theme === 'dark' ? "Cambiar a modo dia" : "Cambiar a modo noche"}
              aria-label="Cambiar tema"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F07E34]" /> : <Moon className="w-4 h-4 text-[var(--text-main)]" />}
            </button>

            {/* Chip de Perfil en Desktop (Contraste corregido en modo claro y oscuro) */}
            <button
              type="button"
              onClick={() => setShowProfileModal(true)}
              className="inline-flex items-center gap-2.5 ronda-card border hover:border-[#E06D28] text-[var(--text-main)] px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer shadow-2xs"
              title={currentUser ? `Perfil de ${currentUser.name}` : "Iniciar sesión o registrarse"}
            >
              <div className="w-6 h-6 rounded-full bg-[#182A24] dark:bg-[#243B30] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-3.5 h-3.5 text-white" />}
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-semibold text-xs text-[var(--text-main)] truncate max-w-[110px]">
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'Mi Perfil'}
                </span>
                <span className="text-[10px] ronda-text-muted leading-none mt-0.5">
                  {currentUser?.neighborhood || 'Ingresar'}
                </span>
              </div>
            </button>
          </div>
        </div>

        {configView !== 'quick' && (
          <div className="mb-3">
            <span className="inline-block ronda-tag border text-xs font-bold tracking-wider px-3.5 py-1.5 rounded-full uppercase shadow-2xs">
              PASO 1 DE 2
            </span>
          </div>
        )}

        <h1 className="font-editorial text-4xl sm:text-5xl lg:text-6xl font-bold text-[var(--text-main)] leading-tight mb-8">
          Empieza por acá<span className="text-[#E06D28]">..</span>
        </h1>

        {weather.isRain && (
          <div className="mb-8 bg-blue-50/80 dark:bg-sky-950/40 border border-blue-200/80 dark:border-sky-800/50 rounded-2xl p-4 flex items-center gap-3 text-blue-900 dark:text-sky-200 text-sm">
            <CloudRain className="w-5 h-5 text-blue-600 dark:text-sky-400 shrink-0" />
            <p>
              <strong>Está lloviendo en Buenos Aires:</strong> Ronda adaptará automáticamente cafés, bodegones y refugios bajo techo para que disfrutes sin mojarte.
            </p>
          </div>
        )}

        {configView === 'quick' ? (
          <div className="space-y-6">
            <section className="ronda-card border rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="flex items-center justify-between pb-5 border-b ronda-border mb-6">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider ronda-text-muted block mb-1">
                    Tu salida espontánea
                  </span>
                  <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
                    Ronda sugerida para este momento
                  </h2>
                </div>
                <div className="hidden sm:flex items-center gap-1.5 ronda-tag border px-3.5 py-1.5 rounded-full text-xs font-semibold">
                  <Sparkles className="w-4 h-4 text-[#E06D28]" />
                  <span>Listo en 1 clic</span>
                </div>
              </div>

              {/* Grilla con los 4 datos clave: Hora actual, Clima, Barrio sugerido, Presupuesto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-7">
                {/* 1. Hora actual */}
                <div className="ronda-card-inner border rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-colors">
                  <div className="w-10 h-10 rounded-xl ronda-icon-box border flex items-center justify-center shrink-0 shadow-xs transition-colors">
                    <Clock className="w-5 h-5 text-[#2A4B3D] dark:text-[#68B692]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium ronda-text-muted block">Hora actual</span>
                    <p className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate">
                      {currentTimeStr} hs
                    </p>
                  </div>
                </div>

                {/* 2. Clima */}
                <div className="ronda-card-inner border rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-colors">
                  <div className="w-10 h-10 rounded-xl ronda-icon-box border flex items-center justify-center shrink-0 shadow-xs transition-colors">
                    <currentWeatherVisual.Icon className={`w-5 h-5 ${currentWeatherVisual.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium ronda-text-muted block">Clima en CABA</span>
                    <p className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate">
                      {currentWeatherVisual.text}
                    </p>
                  </div>
                </div>

                {/* 3. Barrio sugerido */}
                <div className="ronda-card-inner border rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-colors">
                  <div className="w-10 h-10 rounded-xl ronda-icon-box border flex items-center justify-center shrink-0 shadow-xs transition-colors">
                    <MapPin className="w-5 h-5 text-[#2A4B3D] dark:text-[#68B692]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium ronda-text-muted block">Barrio sugerido</span>
                    <p className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate">
                      {neighborhood === 'Cualquiera' ? 'Sorpréndeme (Lo mejor de CABA)' : neighborhood}
                    </p>
                  </div>
                </div>

                {/* 4. Presupuesto por defecto */}
                <div className="ronda-card-inner border rounded-2xl p-4 flex items-center gap-3.5 shadow-xs transition-colors">
                  <div className="w-10 h-10 rounded-xl ronda-icon-box border flex items-center justify-center shrink-0 shadow-xs transition-colors">
                    <Sparkles className="w-5 h-5 text-[#E06D28]" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-medium ronda-text-muted block">Presupuesto</span>
                    <p className="text-sm sm:text-base font-bold text-[var(--text-main)] truncate">
                      {currentBudgetObj.label} · {currentBudgetObj.amount}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botones: Armar ya y Ajustar */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { triggerHaptic(12); handleGeneratePlan(); }}
                  className="flex-1 bg-[#182A24] hover:bg-[#223931] text-white font-semibold text-base rounded-2xl py-4 px-6 shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer glow-dore btn-latido"
                >
                  <span>Armar ya</span>
                  <ArrowRight className="w-5 h-5 text-[#E06D28]" />
                </button>
                <button
                  type="button"
                  onClick={() => { triggerHaptic(8); setConfigView('adjust'); }}
                  className="flex-1 ronda-card hover:bg-black/5 dark:hover:bg-white/5 ronda-text border font-semibold text-base rounded-2xl py-4 px-6 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs btn-latido"
                >
                  <span>Ajustar</span>
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between -mt-2 mb-2">
              <button
                type="button"
                onClick={() => setConfigView('quick')}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-main)] ronda-card border px-3.5 py-2 rounded-xl transition cursor-pointer shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Volver a sugerencia rápida</span>
              </button>
            </div>

            {/* SECCIÓN 1: ¿CUÁNDO SALÍS? (MINIMALISTA Y HORIZONTAL) */}
            <section className="ronda-card border rounded-3xl p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] block mb-0.5">
                    Paso 1 · Horario
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                    ¿Cuándo salís?
                  </h2>
                </div>
                <span className="text-xs font-semibold ronda-tag border px-3 py-1 rounded-full">
                  Hora actual: {currentTimeStr} hs
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {/* 1. Ahora */}
                <button
                  type="button"
                  onClick={() => handleSlotSelect('now')}
                  className={`p-3.5 rounded-2xl text-left transition border cursor-pointer flex flex-col justify-between min-h-[88px] ${
                    selectedSlot === 'now'
                      ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                      : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base">⚡</span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full ${
                      selectedSlot === 'now' ? 'bg-[#E06D28] text-white' : 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                    }`}>
                      Ya
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Salir ahora</div>
                    <div className={`text-[10px] truncate ${selectedSlot === 'now' ? 'text-white/80' : 'ronda-text-muted'}`}>
                      {currentTimeStr} hs
                    </div>
                  </div>
                </button>

                {/* 2. Desayuno */}
                <button
                  type="button"
                  onClick={() => handleSlotSelect('morning')}
                  className={`p-3.5 rounded-2xl text-left transition border cursor-pointer flex flex-col justify-between min-h-[88px] ${
                    selectedSlot === 'morning'
                      ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                      : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                  }`}
                >
                  <span className="text-base">🥐</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Desayuno</div>
                    <div className={`text-[10px] truncate ${selectedSlot === 'morning' ? 'text-white/80' : 'ronda-text-muted'}`}>
                      09:30 - 12:00
                    </div>
                  </div>
                </button>

                {/* 3. Almuerzo */}
                <button
                  type="button"
                  onClick={() => handleSlotSelect('lunch')}
                  className={`p-3.5 rounded-2xl text-left transition border cursor-pointer flex flex-col justify-between min-h-[88px] ${
                    selectedSlot === 'lunch'
                      ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                      : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                  }`}
                >
                  <span className="text-base">🍝</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Almuerzo</div>
                    <div className={`text-[10px] truncate ${selectedSlot === 'lunch' ? 'text-white/80' : 'ronda-text-muted'}`}>
                      12:30 - 15:30
                    </div>
                  </div>
                </button>

                {/* 4. Merienda */}
                <button
                  type="button"
                  onClick={() => handleSlotSelect('afternoon')}
                  className={`p-3.5 rounded-2xl text-left transition border cursor-pointer flex flex-col justify-between min-h-[88px] ${
                    selectedSlot === 'afternoon'
                      ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                      : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                  }`}
                >
                  <span className="text-base">☕</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Merienda</div>
                    <div className={`text-[10px] truncate ${selectedSlot === 'afternoon' ? 'text-white/80' : 'ronda-text-muted'}`}>
                      16:00 - 19:30
                    </div>
                  </div>
                </button>

                {/* 5. Cena */}
                <button
                  type="button"
                  onClick={() => handleSlotSelect('night')}
                  className={`p-3.5 rounded-2xl text-left transition border cursor-pointer flex flex-col justify-between min-h-[88px] ${
                    selectedSlot === 'night'
                      ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                      : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                  }`}
                >
                  <span className="text-base">🍷</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Cena & Noche</div>
                    <div className={`text-[10px] truncate ${selectedSlot === 'night' ? 'text-white/80' : 'ronda-text-muted'}`}>
                      20:00 - 02:00
                    </div>
                  </div>
                </button>

                {/* 6. Otra fecha */}
                <button
                  type="button"
                  onClick={() => handleSlotSelect('other_day')}
                  className={`p-3.5 rounded-2xl text-left transition border cursor-pointer flex flex-col justify-between min-h-[88px] ${
                    selectedSlot === 'other_day'
                      ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                      : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                  }`}
                >
                  <span className="text-base">📅</span>
                  <div>
                    <div className="font-bold text-xs sm:text-sm">Otra fecha</div>
                    <div className={`text-[10px] truncate ${selectedSlot === 'other_day' ? 'text-white/80' : 'ronda-text-muted'}`}>
                      Elegir día
                    </div>
                  </div>
                </button>
              </div>

              {/* Panel colapsable para otra fecha */}
              {selectedSlot === 'other_day' && (
                <div className="mt-4 p-4 rounded-2xl ronda-card-inner border space-y-3.5 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-[var(--text-main)] mb-1.5 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#E06D28]" />
                        <span>Fecha de salida:</span>
                      </label>
                      <input
                        type="date"
                        value={otherDayDate}
                        onChange={(e) => setOtherDayDate(e.target.value)}
                        className="ronda-card border rounded-xl px-3.5 py-2 text-xs font-semibold text-[var(--text-main)] focus:outline-none focus:border-[#E06D28] w-full cursor-pointer"
                      />
                    </div>

                    <div className="flex-1">
                      <label className="text-[11px] font-bold text-[var(--text-main)] mb-1.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#E06D28]" />
                        <span>Momento del día:</span>
                      </label>
                      <div className="grid grid-cols-4 gap-1.5">
                        {['morning', 'lunch', 'afternoon', 'night'].map((sub) => {
                          const label = sub === 'morning' ? '🥐 Mañ.' : sub === 'lunch' ? '🍝 Almu.' : sub === 'afternoon' ? '☕ Mer.' : '🍷 Cena';
                          return (
                            <button
                              key={sub}
                              type="button"
                              onClick={() => handleSubSlotChange(sub)}
                              className={`py-2 px-1 rounded-xl text-xs font-semibold border transition text-center cursor-pointer ${
                                subSlot === sub
                                  ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-sm'
                                  : 'ronda-card border text-[var(--text-main)]'
                              }`}
                            >
                              {label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* SECCIÓN 2: ¿EN QUÉ BARRIO? */}
            <section className="ronda-card border rounded-3xl p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] block mb-0.5">
                    Paso 2 · Barrio
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                    ¿Por qué barrio te gustaría moverte?
                  </h2>
                </div>
                <span className="text-xs text-[var(--text-muted)]">6 zonas curadas</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {BARRIOS.map((b) => {
                  const isSelected = neighborhood === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => { triggerHaptic(8); setNeighborhood(b.id); }}
                      className={`p-3.5 rounded-2xl text-left transition border cursor-pointer btn-latido ${
                        isSelected
                          ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                          : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                      }`}
                    >
                      <div className="font-bold text-sm">
                        {b.label}
                      </div>
                      <div className={`text-[11px] truncate mt-0.5 ${isSelected ? 'text-white/80' : 'ronda-text-muted'}`}>
                        {b.sub}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Toggle para conectar con barrio vecino */}
              {neighborhood !== 'Cualquiera' && (
                <div className="mt-4 pt-3.5 border-t border-[var(--border-card)]">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(8);
                      setAllowNeighboringBarrio(prev => !prev);
                    }}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition cursor-pointer text-left ${
                      allowNeighboringBarrio
                        ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                        : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-lg">🔄</span>
                      <div>
                        <div className="text-xs sm:text-sm font-bold flex items-center gap-2">
                          <span>Permitir conectar con barrio vecino</span>
                          {allowNeighboringBarrio && (
                            <span className="text-[10px] bg-[#E06D28] text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                              Activo
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] mt-0.5 ${allowNeighboringBarrio ? 'text-white/80' : 'ronda-text-muted'}`}>
                          Si enriquece el recorrido, conecta la 3ra parada con un rincón imperdible de un barrio lindero a pie.
                        </p>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                      allowNeighboringBarrio ? 'border-[#E06D28] bg-[#E06D28] text-white font-bold' : 'border-stone-400'
                    }`}>
                      {allowNeighboringBarrio ? '✓' : ''}
                    </div>
                  </button>
                </div>
              )}
            </section>

            {/* SECCIÓN 3: VIBE & PRESUPUESTO (UNIFICADO Y MINIMALISTA) */}
            <section className="ronda-card border rounded-3xl p-5 sm:p-7 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] block mb-0.5">
                    Paso 3 · Vibe & Presupuesto
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-[var(--text-main)]">
                    ¿Qué onda buscás?
                  </h2>
                </div>
              </div>

              {/* 4 Vibes principales */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
                {[
                  { id: 'tranquilo', label: 'Tranqui', icon: '✨', desc: 'Cafés, lectura & calma' },
                  { id: 'foodie', label: 'Foodie', icon: '🍴', desc: 'Bodegón & sobremesa' },
                  { id: 'cultural', label: 'Cultura', icon: '🏛️', desc: 'Arquitectura & galerías' },
                  { id: 'amigos', label: 'Tragos', icon: '🍸', desc: 'Bares notables & noche' }
                ].map((v) => {
                  const isSelected = mood === v.id;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => { triggerHaptic(8); setMood(v.id); }}
                      className={`p-3.5 rounded-2xl text-left transition border cursor-pointer flex flex-col justify-between min-h-[82px] ${
                        isSelected
                          ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                          : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                      }`}
                    >
                      <span className="text-lg">{v.icon}</span>
                      <div>
                        <div className="font-bold text-xs sm:text-sm">{v.label}</div>
                        <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'ronda-text-muted'}`}>
                          {v.desc}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Presupuesto */}
              <div className="border-t border-[var(--border-card)] pt-4 mb-4">
                <span className="text-xs font-bold text-[var(--text-main)] block mb-2">
                  Presupuesto estimado por persona:
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  {BUDGET_OPTIONS.map((opt) => {
                    const isSelected = selectedBudget === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleBudgetSelect(opt)}
                        className={`p-3 rounded-2xl text-center transition border cursor-pointer ${
                          isSelected
                            ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#14241F] dark:border-[#385C4A] shadow-md ring-2 ring-[#E06D28]/40'
                            : 'ronda-card border text-[var(--text-main)] hover:border-[#E06D28] shadow-xs'
                        }`}
                      >
                        <div className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-[var(--text-main)]'}`}>
                          {opt.amount}
                        </div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/70' : 'ronda-text-muted'}`}>
                          {opt.label} ({opt.tierCode})
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Preferencia especial colapsable sutil */}
              <div className="border-t border-[var(--border-card)] pt-3.5">
                <button
                  type="button"
                  onClick={() => setShowCustomPrefs(prev => !prev)}
                  className="text-xs font-semibold text-[var(--text-muted)] hover:text-[#E06D28] flex items-center gap-1.5 transition cursor-pointer"
                >
                  <span>{showCustomPrefs ? '− Ocultar preferencias especiales' : '+ ¿Alguna preferencia especial? (pet friendly, aire libre...)'}</span>
                </button>

                {showCustomPrefs && (
                  <div className="mt-3 space-y-2.5 animate-fade-in">
                    <div className="relative">
                      <input
                        type="text"
                        value={customActivityNote}
                        onChange={(e) => setCustomActivityNote(e.target.value)}
                        placeholder="Ej: quiero un lugar con patio al aire libre, voy con perro..."
                        className="w-full ronda-card-inner border rounded-xl px-3.5 py-2.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[#E06D28] transition"
                      />
                      {customActivityNote && (
                        <button
                          type="button"
                          onClick={() => setCustomActivityNote('')}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] cursor-pointer"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[10px] ronda-text-muted">Ideas:</span>
                      {['Pet Friendly', 'Patio al aire libre', 'Sin alcohol', 'Caminata corta'].map((idea, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            if (customActivityNote.includes(idea)) return;
                            setCustomActivityNote(prev => prev ? `${prev}, ${idea}` : idea);
                          }}
                          className="text-[10px] font-medium ronda-card-inner border hover:border-[#E06D28] text-[var(--text-main)] px-2.5 py-1 rounded-full transition cursor-pointer"
                        >
                          + {idea}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* BARRA INFERIOR FLOTANTE CON RESUMEN Y BOTÓN (solo en Vista 2 - Decisiones) */}
      {configView === 'adjust' && (
        <div className={`fixed ${mobileNavVisible ? 'bottom-[54px]' : 'bottom-0'} left-0 right-0 z-30 bg-[#F8FAF9]/95 dark:bg-[#121E19]/95 backdrop-blur-md border-t border-[var(--border-card)] px-4 py-3 sm:py-3.5 shadow-lg`}>
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
            {/* Resumen dinámico de lo elegido */}
            <div className="min-w-0 pr-2">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-[var(--text-muted)] font-semibold block leading-none mb-1">
                Tu selección
              </span>
              <p className="text-xs sm:text-sm font-bold text-[var(--text-main)] truncate">
                {selectedSummaryText}
              </p>
            </div>

            {/* Botón Armar mi recorrido */}
            <button
              type="button"
              onClick={() => { triggerHaptic(12); handleGeneratePlan(); }}
              className="bg-[#E06D28] hover:bg-[#C95B1D] text-white font-bold text-xs sm:text-sm md:text-base rounded-2xl py-3 px-4 sm:px-6 shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 glow-dore btn-latido"
            >
              <span>Armar mi recorrido</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Sugerencia flotante para volver a la ronda generada (elevada si está la barra de decisión para no pisarse) */}
      <ActivePlanSuggestion 
        plan={plan} 
        onClick={() => handleNavigate('itinerary')} 
        mobileNavVisible={mobileNavVisible} 
        configView={configView}
      />

      {/* BARRA DE NAVEGACIÓN INFERIOR PARA MÓVILES (ocultable por debajo con opción de desocultar) */}
      <MobileBottomNav 
        isVisible={mobileNavVisible} 
        setIsVisible={setMobileNavVisible} 
        screen={screen} 
        onNavigate={handleNavigate} 
        setShowProfileModal={setShowProfileModal} 
        currentUser={currentUser}
      />

      {/* MODAL DE PERFIL / INICIAR SESIÓN / REGISTRO */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        currentUser={currentUser}
        onGoogleLogin={handleGoogleLogin}
        onLogout={handleLogout}
        onUpdatePreferences={handleUpdatePreferences}
        onLoadSavedPlan={handleLoadSavedPlan}
        onRemoveSavedPlan={handleRemoveSavedPlan}
        onToggleVisited={handleToggleVisited}
        allPlaces={catalogPlaces}
        onOpenPlaceDetail={(place) => openPlaceModal(place)}
        onPlanFromHere={handlePlanFromHere}
        theme={theme}
      />

      {/* Toast Flotante de Ronda Guardada */}
      {planSavedToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#182A24] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in border border-[#30483E]">
          <Bookmark className="w-4 h-4 text-[#E06D28]" />
          <span>¡Ronda guardada en tu perfil!</span>
        </div>
      )}

      {/* Toast Flotante de Autenticación / Bienvenida */}
      {authToast && (
        <div className="fixed top-5 right-5 z-50 bg-[#182A24] text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 text-xs font-semibold animate-fade-in border border-[#30483E]">
          <div className="w-6 h-6 rounded-full bg-[#E06D28] text-[#182A24] flex items-center justify-center font-bold text-xs shrink-0">
            ✓
          </div>
          <div>
            <p className="font-bold text-sm text-[#FAF8F5]">{authToast.title}</p>
            <p className="text-[11px] text-[#A6C0B2] font-normal">{authToast.message}</p>
          </div>
        </div>
      )}

      {/* Modal Translúcido de Detalle del Lugar y Actividades */}
      {selectedPlaceModal && (
        <PlaceDetailModal 
          place={selectedPlaceModal} 
          onClose={() => setSelectedPlaceModal(null)} 
          getPlaceGoogleMapsUrl={getPlaceGoogleMapsUrl} 
          onPlanFromHere={handlePlanFromHere}
          isFavorite={(currentUser?.favorite_place_ids || currentUser?.favorites || []).includes(selectedPlaceModal?.id || (selectedPlaceModal?.place_name || selectedPlaceModal?.name)?.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
          onToggleFavorite={handleToggleFavorite}
          isVisited={(currentUser?.visited_place_ids || []).includes(selectedPlaceModal?.id || (selectedPlaceModal?.place_name || selectedPlaceModal?.name)?.toLowerCase().replace(/[^a-z0-9]/g, '_'))}
          onToggleVisited={handleToggleVisited}
        />
      )}
    </div>
  );
}
