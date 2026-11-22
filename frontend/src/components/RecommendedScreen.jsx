import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  MapPin, 
  Clock, 
  Sun, 
  Moon,
  Cloud,
  CloudSun,
  CloudRain, 
  Compass, 
  ArrowRight, 
  Calendar,
  X,
  Check,
  ChevronRight,
  ChevronLeft,
  Info,
  Lightbulb,
  Dog,
  Salad,
  CreditCard,
  Ticket,
  Gamepad2,
  ArrowLeft
} from 'lucide-react';

import { BARRIO_GUIDES, WEEKEND_AGENDA_ACTIVITIES } from '../data/neighborhoodActivities';
import LOCAL_PLACES_CATALOG from '../data/places_caba.json';


const DAY_SPANISH_MAP = {
  sunday: ['domingo', 'domingos'],
  monday: ['lunes'],
  tuesday: ['martes'],
  wednesday: ['miércoles', 'miercoles'],
  thursday: ['jueves'],
  friday: ['viernes'],
  saturday: ['sábado', 'sabado', 'sábados', 'sabados']
};

function getPlayfulOpenStatus(place, currentDayKey, hour) {
  if (!place || !place.schedule_by_day) return { isOpenToday: true, label: '🟢 Abierto hoy' };
  const sched = place.schedule_by_day[currentDayKey];
  if (!sched || sched.is_closed) {
    return { isOpenToday: false, label: '🔴 Cerrado hoy' };
  }
  if (sched.open_hour != null && sched.close_hour != null) {
    const effectiveHour = hour < 6 ? hour + 24 : hour;
    if (effectiveHour >= sched.open_hour && effectiveHour < sched.close_hour) {
      return { isOpenToday: true, label: `🟢 Abierto hasta las ${sched.close} hs` };
    } else if (effectiveHour < sched.open_hour) {
      return { isOpenToday: true, label: `🟡 Abre hoy a las ${sched.open} hs` };
    } else {
      return { isOpenToday: false, label: `🔴 Cerró a las ${sched.close} hs` };
    }
  }
  return { isOpenToday: true, label: '🟢 Abierto hoy' };
}

function getPlayBadges(place) {
  const cats = place.play_category || [];
  const badges = [];
  if (cats.includes('pool')) badges.push({ id: 'pool', label: '🎱 Pool & Billar', bg: 'bg-emerald-950/80 text-emerald-200 border-emerald-500/40' });
  if (cats.includes('arcade')) badges.push({ id: 'arcade', label: '🕹️ Fichines', bg: 'bg-purple-950/80 text-purple-200 border-purple-500/40' });
  if (cats.includes('bowling')) badges.push({ id: 'bowling', label: '🎳 Bowling', bg: 'bg-blue-950/80 text-blue-200 border-blue-500/40' });
  if (cats.includes('pingpong')) badges.push({ id: 'pingpong', label: '🏓 Ping-Pong', bg: 'bg-amber-950/80 text-amber-200 border-amber-500/40' });
  if (cats.includes('boardgames')) badges.push({ id: 'boardgames', label: '🎲 Juegos de Mesa', bg: 'bg-indigo-950/80 text-indigo-200 border-indigo-500/40' });
  if (cats.includes('claw')) badges.push({ id: 'claw', label: '🧸 Peluches', bg: 'bg-pink-950/80 text-pink-200 border-pink-500/40' });
  return badges;
}

const BARRIOS_LIST = [
  'Palermo',
  'San Telmo',
  'Recoleta',
  'Chacarita',
  'Colegiales',
  'Belgrano'
];

export default function RecommendedScreen({ 
  catalogPlaces = [], 
  onSelectPlace, 
  onPlanFromHere, 
  onBackToCreator,
  weather,
  currentHour = 19,
  theme = "light",
  onToggleTheme
}) {
  // Pestaña principal: 'by_barrio' (Guía por Barrio) | 'weekend_agenda' (Agenda Finde & Ferias)
  const [activeTab, setActiveTab] = useState('by_barrio');
  const [selectedBarrio, setSelectedBarrio] = useState('San Telmo');

  // Filtros para la Agenda Finde
  const [agendaSearch, setAgendaSearch] = useState('');
  const [agendaDayFilter, setAgendaDayFilter] = useState('all'); // 'all' | 'sabado' | 'domingo'
  const [agendaWeatherFilter, setAgendaWeatherFilter] = useState('all'); // 'all' | 'cultura_abierta' | 'outdoor' | 'indoor'
  const [agendaBarrioFilter, setAgendaBarrioFilter] = useState('all');
  const [selectedAgendaActivity, setSelectedAgendaActivity] = useState(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Datos del barrio seleccionado
  const currentGuide = BARRIO_GUIDES[selectedBarrio] || BARRIO_GUIDES['San Telmo'];

  // Filtro de Vibra para Juegos & Pool: 'billar' | 'arcade' | 'bowling' | 'all'
  const [selectedPlayVibe, setSelectedPlayVibe] = useState('billar');

  // Actividad Hero (Spot de Portada) y el resto de actividades tipo boleto cultural
  const heroActivity = useMemo(() => {
    return currentGuide.whatToDo.find(a => a.isHero) || currentGuide.whatToDo[0];
  }, [currentGuide]);

  const ticketActivities = useMemo(() => {
    if (!heroActivity) return currentGuide.whatToDo;
    return currentGuide.whatToDo.filter(a => a.id !== heroActivity.id);
  }, [currentGuide, heroActivity]);

  const effectivePlaces = useMemo(() => {
    return catalogPlaces && catalogPlaces.length > 0 ? catalogPlaces : LOCAL_PLACES_CATALOG;
  }, [catalogPlaces]);

  const playfulPlaces = useMemo(() => {
    return effectivePlaces.filter(p => p.play_category && p.play_category.length > 0);
  }, [effectivePlaces]);

  const currentDayKey = useMemo(() => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  }, []);

  const playfulGroups = useMemo(() => {
    const billarIds = ['villacrespo_cafe_san_bernardo', 'sannicolas_bar_la_academia', 'santelmo_the_gibraltar', 'palermo_jobs_arcade'];
    const arcadeIds = ['palermo_el_destello', 'sannicolas_full_suerte', 'chacarita_doda_ludoteca', 'palermo_geek_out', 'villacrespo_chebonche'];
    const bowlingIds = ['almagro_acatraz', 'belgrano_memphis_bowling', 'colegiales_paloko_bowling', 'caballito_sobek_bowling'];

    return [
      {
        id: 'billar',
        title: 'Templos de Billar & Bodegón Porteño Clásico',
        shortTitle: 'Billar & Vermut',
        icon: '🎱',
        badge: 'Mesas de paño verde & Vermut',
        tagline: 'Cafés centenarios, mozos con chaleco, paño verde profesional, dados y ajedrez para arrancar o estirar la noche.',
        heroId: 'villacrespo_cafe_san_bernardo',
        places: playfulPlaces.filter(p => billarIds.includes(p.id))
      },
      {
        id: 'arcade',
        title: 'Arcades Retro, Fichines & Neón',
        shortTitle: 'Arcades & Fichines',
        icon: '🕹️',
        badge: 'Fichas de metal & Tragos',
        tagline: 'Máquinas arcade originales de los 80s y 90s, cócteles de autor, ludotecas gigantes y luces de neón.',
        heroId: 'palermo_el_destello',
        places: playfulPlaces.filter(p => arcadeIds.includes(p.id))
      },
      {
        id: 'bowling',
        title: 'Salones de Bowling & Trasnoche',
        shortTitle: 'Bowling & Pistas',
        icon: '🎳',
        badge: 'Pistas profesionales & Grupos',
        tagline: 'Pistas de bowling automatizadas de madera lustrada, pizza de molde, tejo de aire y espacio para grupos grandes.',
        heroId: 'almagro_acatraz',
        places: playfulPlaces.filter(p => bowlingIds.includes(p.id))
      }
    ];
  }, [playfulPlaces]);

  // Grupos filtrados según el Selector de Vibra
  const groupsToDisplay = useMemo(() => {
    if (selectedPlayVibe === 'all') return playfulGroups;
    return playfulGroups.filter(g => g.id === selectedPlayVibe);
  }, [selectedPlayVibe, playfulGroups]);

  // Obtener las 3 joyitas reales del catálogo de lugares para este barrio
  const top3Places = useMemo(() => {
    const ids = currentGuide.top3PlaceIds || [];
    return ids
      .map(id => effectivePlaces.find(p => p.id === id))
      .filter(Boolean);
  }, [currentGuide, effectivePlaces]);

  // Filtrado de la Agenda de Finde
  const filteredAgenda = useMemo(() => {
    return WEEKEND_AGENDA_ACTIVITIES.filter((item) => {
      // Búsqueda por texto
      if (agendaSearch.trim()) {
        const q = agendaSearch.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchBarrio = item.barrio.toLowerCase().includes(q);
        const matchHighlight = item.highlight.toLowerCase().includes(q);
        if (!matchTitle && !matchBarrio && !matchHighlight) return false;
      }

      // Filtro de Barrio
      if (agendaBarrioFilter !== 'all') {
        if (!item.barrio.toLowerCase().includes(agendaBarrioFilter.toLowerCase())) {
          return false;
        }
      }

      // Filtro de Clima / Cultura Abierta
      if (agendaWeatherFilter === 'cultura_abierta') {
        const isCA = item.badge?.toLowerCase().includes('cultura abierta');
        if (!isCA) return false;
      } else if (agendaWeatherFilter === 'outdoor' && item.weather !== 'outdoor') {
        return false;
      } else if (agendaWeatherFilter === 'indoor' && item.weather !== 'indoor') {
        return false;
      }

      // Filtro de Día
      if (agendaDayFilter === 'domingo' && !item.daysLabel.toLowerCase().includes('domingo')) return false;
      if (agendaDayFilter === 'sabado' && !item.daysLabel.toLowerCase().includes('sábado') && !item.daysLabel.toLowerCase().includes('sabado')) return false;

      return true;
    });
  }, [agendaSearch, agendaBarrioFilter, agendaWeatherFilter, agendaDayFilter]);

  // Determinar icono y estado dinámico del clima (día / noche / nubes / lluvia)
  const weatherVisual = useMemo(() => {
    if (!weather) return null;
    const isNight = currentHour >= 20 || currentHour < 7;
    const labelLower = (weather.label || '').toLowerCase();
    const isRain = weather.isRain || labelLower.includes('lluvia') || labelLower.includes('llovizna') || labelLower.includes('tormenta');
    const isCloudy = labelLower.includes('nublado') || labelLower.includes('neblina') || labelLower.includes('cubierto');

    if (isRain) {
      return {
        Icon: CloudRain,
        iconColor: 'text-sky-600',
        text: `${weather.temp}°C · Lluvia`,
        detail: 'Planes techados recomendados'
      };
    }
    if (isNight) {
      return {
        Icon: Moon,
        iconColor: 'text-[#E06D28]',
        text: `${weather.temp}°C · Noche ${isCloudy ? 'nublada' : 'despejada'}`,
        detail: 'Ideal para barras, copas y bodegones'
      };
    }
    if (isCloudy) {
      return {
        Icon: Cloud,
        iconColor: 'text-slate-500',
        text: `${weather.temp}°C · ${weather.label || 'Nublado'}`,
        detail: 'Agradable para caminar'
      };
    }
    return {
      Icon: Sun,
      iconColor: 'text-[#E06D28]',
      text: `${weather.temp}°C · ${weather.label || 'Soleado'}`,
      detail: 'Clima ideal al aire libre y plazas'
    };
  }, [weather, currentHour]);

  // Función para armar ronda empezando desde una actividad o lugar
  const handleStartFromActivity = (activity) => {
    // Buscar si hay un lugar vinculado
    const place = effectivePlaces.find(p => p.id === activity.startingPlaceId);
    if (place) {
      onPlanFromHere(place);
    } else {
      // Fallback creando objeto sintético
      onPlanFromHere({
        name: activity.title,
        neighborhood: activity.barrio || selectedBarrio
      });
    }
  };

  return (
    <div className="min-h-screen ronda-canvas pb-24 lg:pb-12 transition-colors duration-300">
      {/* HEADER SUPERIOR MINIMALISTA (2 FILAS LIMPIAS) */}
      <header className="ronda-header backdrop-blur-md border-b sticky top-0 z-30 shadow-xs transition-colors">
        {/* FILA 1: MARCA, CLIMA DINÁMICO & CTA */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToCreator}
              className="p-1.5 -ml-1.5 rounded-xl ronda-text-muted hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
              title="Volver al armador de ronda"
            >
              <ChevronLeft className="w-5 h-5 text-[var(--text-main)]" />
            </button>
            <div className="flex items-baseline gap-2">
              <h1 className="font-editorial text-2xl font-bold tracking-tight text-[var(--text-main)]">
                ronda<span className="text-[#E06D28]">.</span>
              </h1>
              <span className="text-[11px] font-semibold ronda-text-muted hidden sm:inline">
                Guías & Agenda
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* BOTÓN SELECTOR DE MODO DÍA / NOCHE */}
            {onToggleTheme && (
              <button
                type="button"
                onClick={onToggleTheme}
                className="p-2 rounded-xl bg-white dark:bg-[#1C2822] border border-[#D9E2DC] dark:border-[#25382E] text-[#182A24] dark:text-[#F1F5F3] hover:text-[#E06D28] dark:hover:text-[#F07E34] transition cursor-pointer shadow-2xs"
                title={theme === 'dark' ? "Cambiar a modo dia" : "Cambiar a modo noche"}
                aria-label="Cambiar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-[#F07E34]" /> : <Moon className="w-4 h-4 text-[#182A24]" />}
              </button>
            )}
            {/* PÍLDORA DINÁMICA DE CLIMA (LUNA / SOL / NUBE / LLUVIA) */}
            {weatherVisual && (
              <div 
                className="ronda-card-inner border px-2.5 py-1.5 rounded-xl text-xs font-semibold text-[var(--text-main)] flex items-center gap-1.5 shadow-2xs select-none"
                title={`Buenos Aires: ${weatherVisual.detail}`}
              >
                <weatherVisual.Icon className={`w-3.5 h-3.5 ${weatherVisual.iconColor} shrink-0`} />
                <span>{weatherVisual.text}</span>
              </div>
            )}

            <button
              type="button"
              onClick={onBackToCreator}
              className="inline-flex items-center gap-1.5 bg-[#182A24] hover:bg-[#223931] text-white font-semibold text-xs sm:text-sm px-3.5 py-2 rounded-xl transition shadow-xs cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-[#E06D28]" />
              <span className="hidden sm:inline">Armar recorrido</span>
              <span className="sm:hidden">Ronda</span>
            </button>
          </div>
        </div>

        {/* FILA 2: SEGMENTED CONTROL (PASTILLAS CÁPSULA SUAVES) */}
        <div className="border-t ronda-border ronda-header px-4 sm:px-6 py-2">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="ronda-card-inner p-1 rounded-2xl inline-flex items-center gap-1 border shadow-xs">
              <button
                type="button"
                onClick={() => {
                  setSelectedAgendaActivity(null);
                  setActiveTab('by_barrio');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 btn-latido ${
                  activeTab === 'by_barrio'
                    ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#E06D28]/60 chip-barrio-active shadow-md ring-2 ring-[#E06D28]/40'
                    : 'ronda-text-muted hover:text-[var(--text-main)]'
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>Por Barrio</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAgendaActivity(null);
                  setActiveTab('weekend_agenda');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 btn-latido ${
                  activeTab === 'weekend_agenda'
                    ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#E06D28]/60 chip-barrio-active shadow-md ring-2 ring-[#E06D28]/40'
                    : 'ronda-text-muted hover:text-[var(--text-main)]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>Agenda Finde</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedAgendaActivity(null);
                  setActiveTab('games_pool');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-1.5 btn-latido ${
                  activeTab === 'games_pool'
                    ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#E06D28]/60 chip-barrio-active shadow-md ring-2 ring-[#E06D28]/40'
                    : 'ronda-text-muted hover:text-[var(--text-main)]'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>Juegos & Pool</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO SEGÚN PESTAÑA */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-6">

        {/* ======================================================== */}
        {/* PESTAÑA 1: GUÍA & QUÉ HACER POR BARRIO (LA PROTAGONISTA) */}
        {/* ======================================================== */}
        {activeTab === 'by_barrio' && (
          <div>
            {/* SELECTOR HORIZONTAL DE BARRIOS */}
            <div className="mb-6 overflow-x-auto pb-2 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
              <div className="flex items-center gap-2 min-w-max">
                {BARRIOS_LIST.map((b) => {
                  const isSelected = selectedBarrio === b;
                  return (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSelectedBarrio(b)}
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition cursor-pointer border btn-latido flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-[#14241F] dark:bg-[#1E3328] text-white border-[#E06D28]/60 chip-barrio-active shadow-md ring-2 ring-[#E06D28]/40'
                          : 'ronda-card border ronda-text-muted hover:border-[var(--text-main)] hover:text-[var(--text-main)] shadow-xs'
                      }`}
                    >
                      {isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#E06D28] pulse-slow shrink-0 inline-block" />
                      )}
                      <span>{b}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* BANNER / PRESENTACIÓN EDITORIAL DEL BARRIO */}
            <div 
              key={`banner-${selectedBarrio}`}
              className="ronda-card rounded-3xl border p-4 sm:p-5 mb-6 shadow-md relative overflow-hidden transition-all duration-300 animate-fade-in"
            >
              {/* Barrido de luz dorada muy suave al cambiar de barrio */}
              <div className="shimmer-golden" />

              <div className="max-w-2xl relative z-10">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#E06D28] block mb-0.5 animate-hero-sub">
                  Guía de Barrio
                </span>
                <h2 className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--text-main)] mb-1 leading-tight animate-hero-title">
                  {currentGuide.name}
                  <span className="text-[#E06D28] animate-punto-destello">.</span>
                </h2>
                <p className="text-xs sm:text-sm font-semibold text-[#2A4B3D] dark:text-[#6EE7B7] mb-1.5 animate-hero-sub">
                  {currentGuide.tagline}
                </p>
                <p className="text-xs sm:text-sm ronda-text-muted leading-relaxed animate-hero-sub" style={{ animationDelay: '0.28s' }}>
                  {currentGuide.vibe}
                </p>
              </div>
            </div>

            {/* SECCIÓN A: QUÉ HACER EN ESTE BARRIO (Spot de Portada + Boletos Culturales) */}
            <section className="mb-12">
              <div 
                key={`section-title-${selectedBarrio}`}
                className="flex items-center justify-between mb-5"
              >
                <div>
                  <h3 className="font-editorial text-2xl font-bold text-[var(--text-main)] animate-hero-title">
                    Qué hacer & vivir en {currentGuide.name}
                    <span className="text-[#E06D28] animate-punto-destello">.</span>
                  </h3>
                  <p className="text-xs ronda-text-muted animate-hero-sub">
                    El plan estrella del barrio y pases de fin de semana recomendados
                  </p>
                </div>
              </div>

              {/* 1. ARQUETIPO: SPOT DE PORTADA (HERO BANNER) */}
              {heroActivity && (
                <article className="relative w-full rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-[#E2E8F0] dark:border-[#2E4A3B] mb-6 group bg-[#182A24] transition-all duration-500">
                  {/* Foto Full-Bleed Inmersiva con Zoom suave al hover y barrido dorado */}
                  <div className="relative w-full h-80 sm:h-[380px] overflow-hidden bg-[#182A24]">
                    <img
                      src={heroActivity.photo}
                      alt={heroActivity.title}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
                      onError={(e) => {
                        if (heroActivity.fallbackPhoto && e.target.src !== heroActivity.fallbackPhoto) {
                          e.target.src = heroActivity.fallbackPhoto;
                        }
                      }}
                    />
                    {/* Barrido de luz dorada estilo atardecer porteño (Golden Hour Sweep) */}
                    <div className="shimmer-golden" />

                    {/* Degradé oscuro cinemático para máxima legibilidad */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/45 to-black/20 pointer-events-none" />

                    {/* Badges superiores flotantes */}
                    <div className="absolute top-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 z-10">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-200 bg-amber-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-amber-400/40 flex items-center gap-1.5 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-slow shrink-0 inline-block" />
                          <span>Spot de Portada</span>
                        </span>
                        {heroActivity.badge === 'Cultura Abierta' ? (
                          <span className="text-[10px] font-bold bg-[#133E32]/90 text-[#D1F2E0] border border-[#2E6B58] backdrop-blur-md px-2.5 py-1 rounded-full inline-flex items-center gap-1 shadow-sm">
                            🏛️ Cultura Abierta
                          </span>
                        ) : heroActivity.badge && (
                          <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                            {heroActivity.badge}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold text-white backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm ${
                          heroActivity.weather === 'outdoor' ? 'bg-emerald-700/85' : 'bg-slate-800/85'
                        }`}>
                          {heroActivity.weather === 'outdoor' ? '☀️ Aire libre' : '☔ Bajo techo'}
                        </span>
                        {heroActivity.isFree && (
                          <span className="text-[10px] font-bold text-white bg-emerald-800/85 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 shadow-sm">
                            🎟️ Entrada Libre
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Contenido en la base de la portada */}
                    <div className="absolute bottom-0 inset-x-0 p-5 sm:p-7 text-white flex flex-col sm:flex-row sm:items-end justify-between gap-4 z-10">
                      <div className="max-w-xl">
                        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-amber-300 mb-1.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{heroActivity.days}</span>
                          </span>
                          <span className="text-stone-400">·</span>
                          <span className="flex items-center gap-1 text-stone-200">
                            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="truncate">{heroActivity.location}</span>
                          </span>
                        </div>
                        <h4 className="font-editorial text-2xl sm:text-3xl font-bold leading-tight mb-2 text-white drop-shadow-sm">
                          {heroActivity.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-stone-200 line-clamp-2 leading-relaxed">
                          {heroActivity.description}
                        </p>
                      </div>

                      <div className="shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartFromActivity(heroActivity)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#E06D28] hover:bg-[#c95b1d] text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-lg hover:shadow-xl btn-latido glow-dore"
                        >
                          <Compass className="w-4 h-4 text-white" />
                          <span>Armar ronda desde acá</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Franja de Tip Clave de Ronda */}
                  {heroActivity.tips && (
                    <div className="ronda-card-inner px-5 py-3 border-t ronda-border text-xs ronda-text-muted flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-[#E06D28] shrink-0" />
                      <span><strong>Dato clave de Ronda:</strong> {heroActivity.tips}</span>
                    </div>
                  )}
                </article>
              )}

              {/* 2. ARQUETIPO: BOLETOS CULTURALES (TICKET STYLE) */}
              {ticketActivities.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider ronda-text-muted pt-2">
                    <Ticket className="w-4 h-4 text-[#E06D28]" />
                    <span>Pases Culturales & Actividades del Barrio</span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {ticketActivities.map((act) => (
                      <article
                        key={act.id}
                        className="ronda-card rounded-3xl border hover:border-[#E06D28]/70 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col sm:flex-row relative group shadow-sm"
                      >
                        {/* Talón Izquierdo del Boleto / Fecha & Horario */}
                        <div className="w-full sm:w-44 ronda-card-inner border-b sm:border-b-0 sm:border-r border-dashed border-[var(--border-card)] p-4 flex sm:flex-col items-center justify-between sm:justify-center text-center relative shrink-0 transition-colors shadow-xs">
                          {/* Troquelados circulares visuales de boleto de tren/teatro */}
                          <div className="hidden sm:block absolute -top-3 -right-3 w-6 h-6 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)]" />
                          <div className="hidden sm:block absolute -bottom-3 -right-3 w-6 h-6 rounded-full bg-[var(--bg-app)] border border-[var(--border-card)]" />

                          <div className="flex sm:flex-col items-center gap-1.5">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A5E]">
                              Pase Cultural
                            </span>
                            <div className="flex items-center gap-1 text-xs font-bold text-[var(--text-main)] ronda-card px-2.5 py-1 rounded-xl border shadow-2xs">
                              <Calendar className="w-3.5 h-3.5 text-[#E06D28]" />
                              <span className="leading-tight">{act.days.split(' ')[0]}</span>
                            </div>
                            <span className="text-[11px] ronda-text-muted font-medium mt-0.5 max-w-[140px] sm:max-w-none">
                              {act.days}
                            </span>
                          </div>

                          {act.isFree && (
                            <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full sm:mt-2">
                              Gratis
                            </span>
                          )}
                        </div>

                        {/* Cuerpo del Boleto */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between relative">
                          {/* Sello de Tinta Porteño troquelado */}
                          <div className="absolute top-3.5 right-3.5 sm:top-4 sm:right-5">
                            <span className={`ticket-stamp ${
                              act.isFree 
                                ? 'text-emerald-700 dark:text-emerald-400 border-emerald-600/60 dark:border-emerald-400/60 bg-emerald-500/10'
                                : 'text-[#E06D28] border-[#E06D28]/60 bg-[#E06D28]/10'
                            }`}>
                              {act.isFree ? 'ENTRADA LIBRE' : (act.badge === 'Cultura Abierta' ? 'CULTURA ABIERTA' : 'JOYA OCULTA')}
                            </span>
                          </div>

                          <div>
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pr-28">
                              <div className="flex items-center gap-1.5">
                                {act.badge === 'Cultura Abierta' ? (
                                  <span className="text-[10px] font-bold bg-[#133E32] text-[#D1F2E0] border border-[#2E6B58] px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 shadow-2xs">
                                    🏛️ Cultura Abierta
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold bg-[#FAF6EC] text-[#8C6D2B] border border-[#E9DFCE] px-2.5 py-0.5 rounded-full">
                                    {act.badge}
                                  </span>
                                )}
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  act.weather === 'outdoor'
                                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                    : 'bg-slate-100 text-slate-800 border-slate-200'
                                }`}>
                                  {act.weather === 'outdoor' ? '☀️ Aire libre' : '☔ Bajo techo'}
                                </span>
                              </div>
                            </div>

                            <h4 className="font-editorial text-lg sm:text-xl font-bold text-[var(--text-main)] mb-1.5 leading-snug">
                              {act.title}
                            </h4>

                            <p className="flex items-center gap-1.5 text-xs ronda-text-muted mb-2.5">
                              <MapPin className="w-3.5 h-3.5 text-[#2A4B3D] shrink-0" />
                              <span>{act.location}</span>
                            </p>

                            <p className="text-xs sm:text-sm text-[#3E5248] dark:text-[#A8BAAF] leading-relaxed mb-3">
                              {act.description}
                            </p>

                            {act.tips && (
                              <div className="ronda-card-inner border rounded-xl p-2.5 text-xs ronda-text-muted flex items-start gap-2 mb-3">
                                <Lightbulb className="w-3.5 h-3.5 text-[#E06D28] shrink-0 mt-0.5" />
                                <span><strong>Dato clave:</strong> {act.tips}</span>
                              </div>
                            )}
                          </div>

                          <div className="pt-2 border-t border-[var(--border-subtle)] flex items-center justify-end">
                            <button
                              type="button"
                              onClick={() => handleStartFromActivity(act)}
                              className="inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-[#182A24] dark:bg-[#1E3328] hover:bg-[#E06D28] text-white text-xs font-semibold transition cursor-pointer shadow-2xs btn-latido"
                            >
                              <Compass className="w-3.5 h-3.5 text-[#E06D28] group-hover:text-white transition-colors" />
                              <span>Armar ronda desde este pase</span>
                            </button>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              )}
            </section>

            {/* SECCIÓN B: 3 JOYITAS IMPERDIBLES (CÁPSULAS TRANSLÚCIDAS / GLASS CARDS) */}
            <section className="border-t border-[#E2E8F0] pt-8">
              <div 
                key={`joyitas-title-${selectedBarrio}`}
                className="flex items-center justify-between mb-5"
              >
                <div>
                  <h3 className="font-editorial text-2xl font-bold text-[var(--text-main)] flex items-center gap-2 animate-hero-title">
                    <Sparkles className="w-5 h-5 text-[#E06D28]" />
                    <span>3 Joyitas Imperdibles de {currentGuide.name}</span>
                    <span className="text-[#E06D28] animate-punto-destello">.</span>
                  </h3>
                  <p className="text-xs ronda-text-muted animate-hero-sub">
                    Nuestra curaduría de culto: fotografía inmersiva y cápsula con el plato/trago insignia
                  </p>
                </div>
              </div>

              {/* GRILLA DE CÁPSULAS TRANSLÚCIDAS (GLASS CARDS) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {top3Places.map((place) => {
                  const photoUrl = place.image_url || `/places/${place.id}.jpg`;
                  const insignia = place.highlight || (place.activities && place.activities[0]) || place.vibe;

                  return (
                    <article
                      key={place.id}
                      className="relative rounded-3xl overflow-hidden border ronda-border hover:border-[#E06D28]/70 joyita-glass-card flex flex-col justify-end aspect-[4/5] group bg-[#182A24] cursor-pointer shadow-md"
                    >
                      {/* Foto de fondo full-bleed con zoom sutil */}
                      <img
                        src={photoUrl}
                        alt={place.name}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 opacity-90"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                      {/* Degradé oscuro vertical para contraste */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10 pointer-events-none" />

                      {/* Badges superiores flotantes */}
                      <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-1 pointer-events-none z-10">
                        <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20 capitalize shadow-xs flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 pulse-slow shrink-0 inline-block" />
                          <span>{place.category === 'cafe' ? '☕ Café de Culto' : place.category === 'dining' ? '🍽️ Bodegón Porteño' : '🍸 Barra & Coctelería'}</span>
                        </span>
                        {place.price_tier && (
                          <span className="text-[10px] font-bold text-white bg-black/60 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/20 shadow-xs">
                            {place.price_tier}
                          </span>
                        )}
                      </div>

                      {/* Cápsula Flotante Integrada con Paleta Ronda */}
                      <div className="relative z-10 m-3 p-4 rounded-2xl ronda-card border shadow-lg text-[var(--text-main)] flex flex-col justify-between transition-transform duration-300">
                        <div>
                          <h4 className="font-editorial text-lg font-bold text-[var(--text-main)] leading-snug truncate mb-0.5">
                            {place.name}
                          </h4>
                          <p className="text-[11px] ronda-text-muted truncate flex items-center gap-1 mb-2">
                            <MapPin className="w-3 h-3 text-[#E06D28] shrink-0" />
                            <span>{place.address}</span>
                          </p>

                          {/* Micro-dato sensorial / Plato o Trago insignia */}
                          <div className="ronda-card-inner border rounded-xl px-2.5 py-1.5 mb-3 text-[11px] text-[var(--text-main)] flex items-center gap-1.5 group-hover:border-[#E06D28]/40 transition-colors">
                            <Sparkles className="w-3.5 h-3.5 text-[#E06D28] shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                            <span className="line-clamp-1 font-medium"><strong className="text-[#E06D28]">Insignia:</strong> {insignia}</span>
                          </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="flex items-center gap-2 pt-1 border-t ronda-border">
                          <button
                            type="button"
                            onClick={() => onSelectPlace(place)}
                            className="flex-1 py-2 px-2 text-center text-xs font-semibold text-[var(--text-main)] ronda-card-inner hover:bg-[var(--bg-card)] rounded-xl border transition cursor-pointer btn-latido"
                          >
                            Ver ficha
                          </button>
                          <button
                            type="button"
                            onClick={() => onPlanFromHere(place)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-2 text-xs font-bold bg-[#14241F] dark:bg-[#1E3328] hover:bg-[#E06D28] text-white rounded-xl transition-all cursor-pointer shadow-xs border ronda-border btn-latido glow-dore"
                            title="Armar ronda con este lugar"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#E06D28] group-hover:text-white transition-colors" />
                            <span>Ronda</span>
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            {/* ======================================================== */}
            </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 2: AGENDA FINDE & FERIAS (CONSOLIDADA CABA)       */}
        {/* ======================================================== */}
        {/* ======================================================== */}
        {/* PESTAÑA 2: AGENDA FINDE (GRILLA O DETALLE INMERSIVO)     */}
        {/* ======================================================== */}
        {activeTab === 'weekend_agenda' && selectedAgendaActivity && (() => {
          const activityPhotos = (selectedAgendaActivity.photos && selectedAgendaActivity.photos.length > 0)
            ? selectedAgendaActivity.photos
            : [selectedAgendaActivity.photo];
          const currentPhoto = activityPhotos[activePhotoIndex] || activityPhotos[0] || selectedAgendaActivity.photo;

          return (
            <div className="space-y-6 pb-12 animate-fadeIn">
              {/* Botón Volver */}
              <button
                type="button"
                onClick={() => {
                  setSelectedAgendaActivity(null);
                  setActivePhotoIndex(0);
                }}
                className="inline-flex items-center gap-2 text-xs font-bold text-[#E06D28] hover:text-[#C95B1D] transition cursor-pointer btn-latido"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver a la Agenda de Fin de Semana</span>
              </button>

              {/* Cabecera Gran Formato para la Foto con corte y encuadre perfecto */}
              <div className="space-y-3">
                <div className="relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[420px] rounded-3xl overflow-hidden bg-[#182A24] border ronda-border shadow-md group postcard-glow">
                  <img
                    src={currentPhoto}
                    alt={selectedAgendaActivity.title}
                    className="w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-104"
                    onError={(e) => {
                      if (selectedAgendaActivity.fallbackPhoto && e.target.src !== selectedAgendaActivity.fallbackPhoto) {
                        e.target.src = selectedAgendaActivity.fallbackPhoto;
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/15 pointer-events-none" />
                  <div className="shimmer-golden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Badges superiores flotantes */}
                  <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 pointer-events-none z-10">
                    <span className="text-xs font-bold text-white bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/25 shadow-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
                      <span>{selectedAgendaActivity.barrio}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      {activityPhotos.length > 1 && (
                        <span className="text-xs font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/25 shadow-sm">
                          📷 {activePhotoIndex + 1} de {activityPhotos.length}
                        </span>
                      )}
                      <span className="text-xs font-bold text-emerald-100 bg-emerald-900/85 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/35 shadow-sm flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-slow" />
                        <span>{selectedAgendaActivity.isFree ? 'Entrada libre' : selectedAgendaActivity.badge}</span>
                      </span>
                    </div>
                  </div>

                  {/* Flechas táctiles para pasar fotos */}
                  {activityPhotos.length > 1 && (
                    <div className="absolute inset-y-0 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : activityPhotos.length - 1));
                        }}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition cursor-pointer border border-white/25 shadow-md btn-latido"
                        title="Foto anterior"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActivePhotoIndex((prev) => (prev < activityPhotos.length - 1 ? prev + 1 : 0));
                        }}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md pointer-events-auto transition cursor-pointer border border-white/25 shadow-md btn-latido"
                        title="Foto siguiente"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}

                  {/* Título en la base de la foto */}
                  <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none z-10">
                    <div className="flex items-center gap-2 text-xs text-[#E06D28] font-bold mb-1 drop-shadow">
                      <Calendar className="w-4 h-4" />
                      <span>{selectedAgendaActivity.daysLabel}</span>
                      <span>·</span>
                      <span className="text-white/90">{selectedAgendaActivity.hours}</span>
                    </div>
                    <h2 className="font-editorial text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md animate-hero-title">
                      {selectedAgendaActivity.title}
                      <span className="text-[#E06D28] animate-punto-destello">.</span>
                    </h2>
                  </div>
                </div>

                {/* Tira de Miniaturas Interactivas (Galería recortada perfectamente) */}
                {activityPhotos.length > 1 && (
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar pt-1">
                    {activityPhotos.map((photoSrc, idx) => (
                      <button
                        key={photoSrc}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`relative w-24 sm:w-32 h-16 sm:h-20 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 btn-latido ${
                          idx === activePhotoIndex
                            ? 'border-[#E06D28] ring-2 ring-[#E06D28]/50 scale-105 shadow-md chip-barrio-active'
                            : 'border-transparent opacity-65 hover:opacity-100 hover:border-white/40 hover:scale-102'
                        }`}
                      >
                        <img
                          src={photoSrc}
                          alt={`Foto ${idx + 1}`}
                          className="w-full h-full object-cover object-center"
                          onError={(e) => {
                            if (selectedAgendaActivity.fallbackPhoto && e.target.src !== selectedAgendaActivity.fallbackPhoto) {
                              e.target.src = selectedAgendaActivity.fallbackPhoto;
                            }
                          }}
                        />
                      </button>
                    ))}
                    <span className="text-[11px] font-semibold text-[var(--text-muted)] ml-2 whitespace-nowrap">
                      Toca cualquier foto para ampliarla
                    </span>
                  </div>
                )}
              </div>

              {/* Crónica & Qué pasa acá */}
              <div className="ronda-card rounded-2xl border p-6 sm:p-8 space-y-5 shadow-xs">
                <div>
                  <h3 className="text-xs uppercase font-bold tracking-wider text-[#E06D28] mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>La Mística & Qué vas a encontrar</span>
                  </h3>
                  <p className="text-sm sm:text-base text-[var(--text-main)] leading-relaxed">
                    {selectedAgendaActivity.story || selectedAgendaActivity.highlight}
                  </p>
                </div>

                {/* Dato al paso / La Posta del Baqueano */}
                {selectedAgendaActivity.tip && (
                  <div className="ronda-card-inner border border-[#E06D28]/30 dark:border-[#E06D28]/35 bg-gradient-to-r from-[#E06D28]/10 via-[#E06D28]/5 to-transparent rounded-2xl p-4 sm:p-5 flex items-start gap-3 shadow-xs">
                    <div className="p-2 rounded-xl bg-[#E06D28]/15 border border-[#E06D28]/30 shrink-0 mt-0.5">
                      <Lightbulb className="w-5 h-5 text-[#E06D28]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#E06D28] mb-1">
                        El Dato del Baqueano (Para no fallar)
                      </h4>
                      <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed font-medium">
                        {selectedAgendaActivity.tip}
                      </p>
                    </div>
                  </div>
                )}

                {/* Maridaje a pie / Continuidad en Ronda */}
                <div className="pt-4 border-t ronda-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)] mb-1">
                      ¿Cómo armar tu salida?
                    </h4>
                    <p className="text-xs ronda-text-muted">
                      Podés arrancar el recorrido en {selectedAgendaActivity.title} y Ronda te conecta automáticamente los cafés, bodegones o copas a pie en {selectedAgendaActivity.barrio}.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleStartFromActivity(selectedAgendaActivity)}
                    className="inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-gradient-to-r from-[#14241F] to-[#1F3A2E] dark:from-[#1E3328] dark:to-[#2B4B39] hover:from-[#2A4B3D] hover:to-[#366350] text-white text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_4px_18px_rgba(224,109,40,0.25)] border border-[#E06D28]/40 shrink-0 btn-latido hover:scale-[1.02]"
                  >
                    <Compass className="w-4 h-4 text-[#E06D28]" />
                    <span>Armar ronda desde acá</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {activeTab === 'weekend_agenda' && !selectedAgendaActivity && (
          <div>
            <div className="mb-6">
              <h2 className="font-editorial text-3xl font-bold text-[var(--text-main)] mb-1 animate-hero-title">
                Agenda de Fin de Semana & Ferias<span className="text-[#E06D28] animate-punto-destello">.</span>
              </h2>
              <p className="text-xs sm:text-sm ronda-text-muted animate-hero-sub">
                Todas las ferias de antigüedades, diseño, recitales al aire libre y pases de Cultura Abierta en CABA
              </p>
            </div>

            {/* BUSCADOR Y FILTROS RÁPIDOS */}
            <div className="ronda-card rounded-2xl border shadow-sm p-4 mb-6 shadow-xs space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 ronda-text-muted absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={agendaSearch}
                  onChange={(e) => setAgendaSearch(e.target.value)}
                  placeholder="Buscar feria, milonga, parque o recital..."
                  className="w-full ronda-card-inner border rounded-xl py-2 pl-9 pr-8 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#E06D28]"
                />
                {agendaSearch && (
                  <button
                    type="button"
                    onClick={() => setAgendaSearch('')}
                    className="absolute right-2.5 top-2.5 p-0.5 ronda-text-muted hover:text-[var(--text-main)] cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {/* Filtro de Día */}
                <div className="flex items-center gap-1 ronda-card-inner p-1 rounded-xl border">
                  <button
                    type="button"
                    onClick={() => setAgendaDayFilter('all')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer btn-latido ${
                      agendaDayFilter === 'all'
                        ? 'bg-[#14241F] dark:bg-[#1E3328] text-white shadow-xs ring-2 ring-[#E06D28]/40 chip-barrio-active'
                        : 'ronda-text-muted hover:text-[var(--text-main)]'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaDayFilter('sabado')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer btn-latido ${
                      agendaDayFilter === 'sabado'
                        ? 'bg-[#14241F] dark:bg-[#1E3328] text-white shadow-xs ring-2 ring-[#E06D28]/40 chip-barrio-active'
                        : 'ronda-text-muted hover:text-[var(--text-main)]'
                    }`}
                  >
                    Sábados
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaDayFilter('domingo')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer btn-latido ${
                      agendaDayFilter === 'domingo'
                        ? 'bg-[#14241F] dark:bg-[#1E3328] text-white shadow-xs ring-2 ring-[#E06D28]/40 chip-barrio-active'
                        : 'ronda-text-muted hover:text-[var(--text-main)]'
                    }`}
                  >
                    Domingos
                  </button>
                </div>

                {/* Filtro de Categoría / Clima / Cultura Abierta */}
                <div className="flex flex-wrap items-center gap-1 ronda-card-inner p-1 rounded-xl border">
                  <button
                    type="button"
                    onClick={() => setAgendaWeatherFilter('all')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer btn-latido ${
                      agendaWeatherFilter === 'all'
                        ? 'bg-[#14241F] dark:bg-[#1E3328] text-white shadow-xs ring-2 ring-[#E06D28]/40 chip-barrio-active'
                        : 'ronda-text-muted hover:text-[var(--text-main)]'
                    }`}
                  >
                    ✨ Todo
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaWeatherFilter('cultura_abierta')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer btn-latido ${
                      agendaWeatherFilter === 'cultura_abierta'
                        ? 'bg-[#133E32] text-[#D1F2E0] shadow-xs ring-2 ring-[#2E6B58] chip-barrio-active'
                        : 'ronda-text-muted hover:text-[var(--text-main)]'
                    }`}
                  >
                    🏛️ Cultura Abierta
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaWeatherFilter('outdoor')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer btn-latido ${
                      agendaWeatherFilter === 'outdoor'
                        ? 'bg-[#14241F] dark:bg-[#1E3328] text-white shadow-xs ring-2 ring-[#E06D28]/40 chip-barrio-active'
                        : 'ronda-text-muted hover:text-[var(--text-main)]'
                    }`}
                  >
                    ☀️ Aire Libre
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaWeatherFilter('indoor')}
                    className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all cursor-pointer btn-latido ${
                      agendaWeatherFilter === 'indoor'
                        ? 'bg-[#14241F] dark:bg-[#1E3328] text-white shadow-xs ring-2 ring-[#E06D28]/40 chip-barrio-active'
                        : 'ronda-text-muted hover:text-[var(--text-main)]'
                    }`}
                  >
                    ☔ Bajo Techo
                  </button>
                </div>
              </div>
            </div>

            {/* GRILLA DE POSTALES CINEMÁTICAS FULL-BLEED (SIMPLIFICADA & DESPEJADA) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAgenda.map((item) => (
                <article
                  key={item.id}
                  onClick={() => {
                    setActivePhotoIndex(0);
                    setSelectedAgendaActivity(item);
                  }}
                  className="postcard-glow relative rounded-3xl overflow-hidden aspect-[16/11] sm:aspect-[16/10] lg:aspect-[16/11] min-h-[250px] border ronda-border shadow-md cursor-pointer group bg-[#182A24] flex flex-col justify-between p-5 sm:p-6"
                >
                  {/* Foto full-bleed de fondo con zoom suave */}
                  <img
                    src={item.photo}
                    alt={item.title}
                    className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 opacity-90"
                    onError={(e) => {
                      if (item.fallbackPhoto && e.target.src !== item.fallbackPhoto) {
                        e.target.src = item.fallbackPhoto;
                      }
                    }}
                  />
                  {/* Degradé cinemático suave concentrado en la base para máxima claridad */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none group-hover:via-black/40 transition-colors duration-500" />
                  
                  {/* Destello sutil de atardecer en hover */}
                  <div className="shimmer-golden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                  {/* Badges superiores flotantes */}
                  <div className="relative z-10 flex items-center justify-between gap-2 pointer-events-none">
                    <span className="text-xs font-bold text-white bg-black/70 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/25 shadow-sm flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
                      <span>{item.barrio}</span>
                    </span>
                    <span className="text-xs font-bold text-emerald-100 bg-emerald-950/85 backdrop-blur-md px-3 py-1 rounded-full border border-emerald-500/40 shadow-sm flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-slow" />
                      <span>{item.isFree ? 'Entrada libre' : item.badge}</span>
                    </span>
                  </div>

                  {/* Contenido en la base: limpio, sin descripción truncada que amontone */}
                  <div className="relative z-10 space-y-1.5 pointer-events-none">
                    <div className="flex items-center gap-1.5 text-xs text-[#E06D28] font-bold drop-shadow">
                      <Calendar className="w-3.5 h-3.5 shrink-0" />
                      <span>{item.daysLabel}</span>
                      <span className="text-white/60">·</span>
                      <span className="text-white/90 font-medium">{item.hours}</span>
                    </div>

                    <h3 className="font-editorial text-xl sm:text-2xl font-bold text-white leading-tight drop-shadow-md group-hover:text-[#E06D28] transition duration-300">
                      {item.title}
                    </h3>

                    <div className="pt-2 flex items-center text-xs font-bold text-[#E06D28]">
                      <span className="inline-flex items-center gap-1.5 group-hover:translate-x-2 transition-transform duration-300">
                        <span>Ver crónica & secretos</span>
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PESTAÑA 3: JUEGOS, POOL & TRASNOCHE EN CABA              */}
        {/* ======================================================== */}
        {activeTab === 'games_pool' && (
          <div className="space-y-10 pb-16 animate-fadeIn">
            {/* Cabecera general */}
            <div className="border-b ronda-border pb-6">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#2A4B3D] bg-[#EBF2EC] dark:bg-[#1A2E24] dark:text-[#A7D8BD] px-2.5 py-0.5 rounded-full border border-[#D5E3D8] dark:border-[#2C483A]">
                  Trasnoche Lúdica en CABA
                </span>
                <span className="text-xs ronda-text-muted">
                  13 templos verificados
                </span>
              </div>
              <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[var(--text-main)] mb-1 animate-hero-title">
                Juegos, Pool & El Alargue<span className="text-[#E06D28] animate-punto-destello">.</span>
              </h2>
              <p className="text-xs sm:text-sm ronda-text-muted max-w-2xl leading-relaxed animate-hero-sub">
                Elegí tu vibra para estirar la noche porteña: templos de paño verde centenarios, arcades retro con cócteles o salones de bowling para salir en banda.
              </p>
            </div>

            {/* SELECTOR DE VIBRA EN 1 TAP */}
            <div className="flex flex-wrap items-center gap-2 p-1.5 ronda-card-inner rounded-2xl border">
              {playfulGroups.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedPlayVibe(g.id)}
                  className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer btn-latido flex items-center gap-2 ${
                    selectedPlayVibe === g.id
                      ? 'bg-[#14241F] dark:bg-[#1E3328] text-white shadow-xs ring-2 ring-[#E06D28]/40 chip-barrio-active'
                      : 'ronda-text-muted hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5'
                  }`}
                >
                  <span className="text-sm">{g.icon}</span>
                  <span>{g.shortTitle}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedPlayVibe === g.id ? 'bg-[#E06D28] text-white' : 'bg-black/10 dark:bg-white/10'
                  }`}>
                    {g.places.length}
                  </span>
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedPlayVibe('all')}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer btn-latido flex items-center gap-1.5 ${
                  selectedPlayVibe === 'all'
                    ? 'bg-[#14241F] dark:bg-[#1E3328] text-white shadow-xs ring-2 ring-[#E06D28]/40 chip-barrio-active'
                    : 'ronda-text-muted hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5'
                }`}
              >
                <span>✨</span>
                <span>Ver Todos</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  selectedPlayVibe === 'all' ? 'bg-[#E06D28] text-white' : 'bg-black/10 dark:bg-white/10'
                }`}>
                  {playfulPlaces.length}
                </span>
              </button>
            </div>

            {/* SECCIONES SEGÚN VIBRA SELECCIONADA */}
            {groupsToDisplay.map((group) => {
              const heroPlace = group.places.find(p => p.id === group.heroId) || group.places[0];
              const otherPlaces = group.places.filter(p => p.id !== heroPlace?.id);
              const heroPhotoUrl = heroPlace?.image_url || `/places/${heroPlace?.id}.jpg`;
              const heroOpenStatus = heroPlace ? getPlayfulOpenStatus(heroPlace, currentDayKey, currentHour) : null;
              const heroBadges = heroPlace ? getPlayBadges(heroPlace) : [];

              return (
                <section key={group.id} className="space-y-6 pt-2">
                  {/* Cabecera de Categoría */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b ronda-border pb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xl">{group.icon}</span>
                        <span className="text-xs font-bold text-[#E06D28] tracking-wider uppercase">
                          {group.badge}
                        </span>
                      </div>
                      <h3 className="font-editorial text-2xl sm:text-3xl font-bold text-[var(--text-main)]">
                        {group.title}
                      </h3>
                      <p className="text-xs sm:text-sm ronda-text-muted mt-0.5 max-w-2xl leading-relaxed">
                        {group.tagline}
                      </p>
                    </div>
                    <span className="text-xs font-semibold ronda-text-muted shrink-0 self-start sm:self-auto">
                      {group.places.length} templos en CABA
                    </span>
                  </div>

                  {/* 👑 EL TEMPLO INSIGNIA (HERO LÚDICO EDITORIAL) */}
                  {heroPlace && (
                    <div className="ronda-card rounded-3xl border ronda-border overflow-hidden shadow-lg group postcard-glow">
                      <div className="relative aspect-[16/10] sm:aspect-[21/9] max-h-[380px] w-full overflow-hidden bg-[#182A24]">
                        <img
                          src={heroPhotoUrl}
                          alt={heroPlace.name}
                          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-700 opacity-90"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20 pointer-events-none" />
                        <div className="shimmer-golden opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                        {/* Badges superiores flotantes */}
                        <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
                          <span className="text-xs font-bold text-amber-200 bg-amber-950/85 backdrop-blur-md px-3.5 py-1 rounded-full border border-amber-500/40 shadow-sm flex items-center gap-1.5">
                            <span>👑</span>
                            <span>Templo Insignia</span>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white bg-black/70 backdrop-blur-md px-3 py-1 rounded-full border border-white/25 shadow-sm flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
                              <span>{heroPlace.neighborhood}</span>
                            </span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full backdrop-blur-md border shadow-sm flex items-center gap-1.5 ${
                              heroOpenStatus?.isOpenToday
                                ? 'text-emerald-100 bg-emerald-950/85 border-emerald-500/40'
                                : 'text-red-100 bg-red-950/85 border-red-500/40'
                            }`}>
                              {heroOpenStatus?.isOpenToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-slow" />}
                              <span>{heroOpenStatus?.label}</span>
                            </span>
                          </div>
                        </div>

                        {/* Título en la base de la foto */}
                        <div className="absolute bottom-4 left-4 right-4 text-white pointer-events-none z-10">
                          <div className="flex flex-wrap gap-1.5 mb-2">
                            {heroBadges.map((b) => (
                              <span
                                key={b.id}
                                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border shadow-xs ${b.bg}`}
                              >
                                {b.label}
                              </span>
                            ))}
                          </div>
                          <h4 className="font-editorial text-2xl sm:text-4xl font-bold leading-tight drop-shadow-md">
                            {heroPlace.name}
                          </h4>
                          <p className="text-xs text-white/80 flex items-center gap-1 mt-1 drop-shadow">
                            <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
                            <span>{heroPlace.address}</span>
                          </p>
                        </div>
                      </div>

                      {/* Cuerpo del Templo Insignia: Mística & Qué pedir */}
                      <div className="p-5 sm:p-6 space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="ronda-card-inner border rounded-2xl p-4 space-y-1.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#E06D28] flex items-center gap-1.5">
                              <Sparkles className="w-4 h-4" />
                              <span>La Mística & A qué se juega</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
                              {heroPlace.game_highlight}
                            </p>
                          </div>

                          <div className="ronda-card-inner border rounded-2xl p-4 space-y-1.5">
                            <div className="text-xs font-bold uppercase tracking-wider text-[#E06D28] flex items-center gap-1.5">
                              <Lightbulb className="w-4 h-4" />
                              <span>El Maridaje & Qué picar</span>
                            </div>
                            <p className="text-xs sm:text-sm text-[var(--text-main)] leading-relaxed">
                              {heroPlace.highlight}
                            </p>
                          </div>
                        </div>

                        {/* Acciones del Templo Insignia */}
                        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t ronda-border">
                          <span className="text-xs ronda-text-muted self-start sm:self-auto">
                            {heroPlace.features ? heroPlace.features.slice(0, 2).join(' · ') : 'El alargue clásico de la noche porteña'}
                          </span>
                          <div className="flex items-center gap-2.5 w-full sm:w-auto">
                            <button
                              type="button"
                              onClick={() => onSelectPlace(heroPlace)}
                              className="flex-1 sm:flex-none py-2.5 px-4 text-xs font-semibold text-[var(--text-main)] ronda-card-inner hover:bg-[var(--bg-card)] rounded-xl border transition cursor-pointer btn-latido"
                            >
                              Ver ficha completa
                            </button>
                            {heroOpenStatus?.isOpenToday ? (
                              <button
                                type="button"
                                onClick={() => onPlanFromHere(heroPlace, 'games_pool')}
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-[#14241F] to-[#1F3A2E] dark:from-[#1E3328] dark:to-[#2B4B39] hover:from-[#2A4B3D] hover:to-[#366350] text-white text-xs font-bold transition-all cursor-pointer shadow-[0_4px_18px_rgba(224,109,40,0.25)] border border-[#E06D28]/40 btn-latido hover:scale-[1.02]"
                              >
                                <Compass className="w-4 h-4 text-[#E06D28]" />
                                <span>+ Ronda desde este templo</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                disabled
                                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 py-2.5 px-4 text-xs font-semibold rounded-xl bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-400 cursor-not-allowed border opacity-60"
                              >
                                <Clock className="w-3.5 h-3.5" />
                                <span>No disponible hoy</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* EL RESTO DE LOS TEMPLOS: FICHAS DE TRASNOCHE / PASES LÚDICOS */}
                  {otherPlaces.length > 0 && (
                    <div className="space-y-3 pt-2">
                      <h4 className="text-xs uppercase font-bold tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                        <span>Más templos de {group.shortTitle} para la trasnoche:</span>
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                        {otherPlaces.map((place) => {
                          const photoUrl = place.image_url || `/places/${place.id}.jpg`;
                          const openStatus = getPlayfulOpenStatus(place, currentDayKey, currentHour);
                          const badges = getPlayBadges(place);

                          return (
                            <article
                              key={place.id}
                              className="ronda-card rounded-2xl border shadow-sm hover:border-[#E06D28]/60 hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col justify-between group postcard-glow"
                            >
                              <div>
                                {/* Foto del salón con luz ambiental */}
                                <div className="relative aspect-[16/9] overflow-hidden bg-[#182A24]">
                                  <img
                                    src={photoUrl}
                                    alt={place.name}
                                    className="w-full h-full object-cover group-hover:scale-106 transition-transform duration-500 opacity-90"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                                  {/* Badges superiores flotantes */}
                                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 z-10 pointer-events-none">
                                    <span className="text-[11px] font-bold text-white bg-black/75 backdrop-blur-md px-3 py-0.5 rounded-full border border-white/20 shadow-xs flex items-center gap-1">
                                      <MapPin className="w-3 h-3 text-[#E06D28]" />
                                      <span>{place.neighborhood}</span>
                                    </span>
                                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-md border shadow-xs flex items-center gap-1 ${
                                      openStatus.isOpenToday
                                        ? 'text-emerald-200 bg-emerald-950/85 border-emerald-500/40'
                                        : 'text-red-200 bg-red-950/85 border-red-500/40'
                                    }`}>
                                      {openStatus.isOpenToday && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 pulse-slow" />}
                                      <span>{openStatus.label}</span>
                                    </span>
                                  </div>

                                  {/* Disciplinas en la base de la foto */}
                                  <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-1.5 z-10 pointer-events-none">
                                    {badges.map((b) => (
                                      <span
                                        key={b.id}
                                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-md border shadow-xs ${b.bg}`}
                                      >
                                        {b.label}
                                      </span>
                                    ))}
                                  </div>
                                </div>

                                {/* Cuerpo de la Ficha */}
                                <div className="p-4 sm:p-5 space-y-3">
                                  <div>
                                    <h4 className="font-editorial text-lg sm:text-xl font-bold text-[var(--text-main)] leading-snug group-hover:text-[#E06D28] transition">
                                      {place.name}
                                    </h4>
                                    <p className="text-xs ronda-text-muted flex items-center gap-1 mt-0.5">
                                      <MapPin className="w-3 h-3 text-[#E06D28] shrink-0" />
                                      <span className="truncate">{place.address}</span>
                                    </p>
                                  </div>

                                  {/* Fila 1: A qué se juega */}
                                  <div className="ronda-card-inner border rounded-xl p-2.5 text-xs leading-relaxed space-y-1">
                                    <div className="text-[10px] font-bold text-[#E06D28] uppercase tracking-wider flex items-center gap-1">
                                      <span>🎯 A qué se juega:</span>
                                    </div>
                                    <p className="text-[var(--text-main)] text-xs line-clamp-2">
                                      {place.game_highlight}
                                    </p>
                                  </div>

                                  {/* Fila 2: Para tomar y picar */}
                                  {place.highlight && (
                                    <p className="text-xs ronda-text-muted flex items-start gap-1.5 leading-relaxed">
                                      <span className="text-sm shrink-0">🍻</span>
                                      <span className="line-clamp-2"><strong className="text-[var(--text-main)]">Para picar: </strong>{place.highlight}</span>
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Botones al pie */}
                              <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => onSelectPlace(place)}
                                  className="flex-1 py-2 px-3 text-center text-xs font-semibold text-[var(--text-main)] ronda-card-inner hover:bg-[var(--bg-card)] rounded-xl border transition cursor-pointer btn-latido"
                                >
                                  Ver ficha
                                </button>

                                {openStatus.isOpenToday ? (
                                  <button
                                    type="button"
                                    onClick={() => onPlanFromHere(place, 'games_pool')}
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold bg-[#14241F] dark:bg-[#1E3328] text-white hover:bg-[#2A4B3D] rounded-xl transition cursor-pointer shadow-xs border ronda-border btn-latido"
                                    title="Armar ronda con este lugar"
                                  >
                                    <Compass className="w-3.5 h-3.5 text-[#E06D28]" />
                                    <span>+ Ronda</span>
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    disabled
                                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl bg-neutral-200/50 dark:bg-neutral-800/60 text-neutral-400 cursor-not-allowed border opacity-60"
                                  >
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>No disponible</span>
                                  </button>
                                )}
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        )}

      </main>
    </div>
  );
}
