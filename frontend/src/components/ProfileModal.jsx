import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  User, 
  X, 
  Mail, 
  Lock,
  MapPin, 
  Heart, 
  Compass, 
  Dog, 
  Salad, 
  CreditCard, 
  Share2, 
  Trash2, 
  Check, 
  LogOut, 
  Sparkles,
  ArrowRight,
  Bookmark,
  Award,
  ShieldCheck,
  Map as MapIcon,
  CheckCircle2,
  Flame,
  Coffee,
  Navigation,
  Search,
  Star,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

// Catálogo canónico de los 11 barrios porteños con coordenadas cartográficas relativas en CABA
const BARRIOS_DATA = [
  {
    id: 'San Telmo',
    label: 'San Telmo',
    sub: 'Bohemio & Bares Notables',
    description: 'Adoquines centenarios, anticuarios sobre Defensa, cafetines con mística y el espíritu tanguero de la ciudad vieja.',
    tagline: 'Cuna del tango y la bohemia histórica',
    cx: 295,
    cy: 315,
    polygon: '265,285 335,280 325,345 255,340'
  },
  {
    id: 'Palermo',
    label: 'Palermo',
    sub: 'Diseño, Bares & Vanguardia',
    description: 'Pasajes adoquinados arbolados, cafeterías de autor, tiendas de diseño y el polo gastronómico más vibrante de la noche.',
    tagline: 'Diseño independiente, cócteles y terrazas',
    cx: 255,
    cy: 95,
    polygon: '170,30 310,40 345,140 250,155 195,90'
  },
  {
    id: 'Recoleta',
    label: 'Recoleta',
    sub: 'Arte & Belle Époque',
    description: 'Palacetes aristocráticos franceses, museos de nivel continental, la feria de Plaza Francia y librerías legendarias.',
    tagline: 'Arquitectura señorial y museos clásicos',
    cx: 310,
    cy: 175,
    polygon: '255,155 350,140 360,205 275,215'
  },
  {
    id: 'Chacarita',
    label: 'Chacarita',
    sub: 'Neo-bodegones & Vermut',
    description: 'El nuevo epicentro gastronómico de culto: vermuterías al paso, platitos de autor con sodeado y vibra de barrio bohemio.',
    tagline: 'El templo del vermut y la cocina contemporánea',
    cx: 75,
    cy: 180,
    polygon: '25,140 105,160 90,215 15,195'
  },
  {
    id: 'Colegiales',
    label: 'Colegiales',
    sub: 'Café & Mercado de Pulgas',
    description: 'Calles apacibles y arboladas, cafeterías de especialidad de autor, anticuarios y el icónico Mercado de las Pulgas.',
    tagline: 'Tranquilidad residencial y tesoros de época',
    cx: 90,
    cy: 125,
    polygon: '55,80 120,105 110,155 45,130'
  },
  {
    id: 'Belgrano',
    label: 'Belgrano',
    sub: 'Bajo Belgrano & Vía Viva',
    description: 'Casonas señoriales, el nuevo corredor gastronómico bajo el viaducto Vía Viva, el Barrio Chino y parrillas históricas.',
    tagline: 'Vanguardia bajo el viaducto y tradición ribereña',
    cx: 120,
    cy: 60,
    polygon: '65,30 165,25 190,85 120,100 55,70'
  },
  {
    id: 'Villa Crespo',
    label: 'Villa Crespo',
    sub: 'El San Ber & Club Atlanta',
    description: 'Cuna del pool tradicional y billar porteño (Café San Bernardo), cafeterías de especialidad y vida barrial genuina.',
    tagline: 'Tiza en el paño, truco y café de culto',
    cx: 155,
    cy: 190,
    polygon: '110,160 200,155 185,215 95,215'
  },
  {
    id: 'Almagro',
    label: 'Almagro',
    sub: 'Tango & Confiterías Notables',
    description: 'Bares de tango vivo como El Boliche de Roberto, milongas tradicionales y confiterías señoriales como Las Violetas.',
    tagline: 'Pocillo de café y duendes tangueros',
    cx: 145,
    cy: 260,
    polygon: '95,225 195,225 185,290 85,290'
  },
  {
    id: 'Caballito',
    label: 'Caballito',
    sub: 'Tranvía Histórico & Centro',
    description: 'El corazón geométrico exacto de CABA, ferias de libros en Parque Rivadavia y el nostálgico tranvía a vapor.',
    tagline: 'El centro neurálgico y nostalgia sobre rieles',
    cx: 55,
    cy: 250,
    polygon: '20,205 90,225 80,290 10,270'
  },
  {
    id: 'San Nicolás',
    label: 'San Nicolás',
    sub: 'Teatro Colón & El Bajo',
    description: 'El latido cívico porteño, el mítico Teatro Colón, pizzerías al corte sobre la calle Corrientes y cafés centenarios.',
    tagline: 'Pizzerías de pie, ópera y la noche de Corrientes',
    cx: 305,
    cy: 250,
    polygon: '275,220 345,210 335,275 265,280'
  },
  {
    id: 'Puerto Madero',
    label: 'Puerto Madero',
    sub: 'Diques & Reserva Costera',
    description: 'Antiguos docks de ladrillo inglés convertidos en paseo costero, puentes peatonales y la inmensa Reserva Ecológica frente al río.',
    tagline: 'Paseo costanero y brisa del Río de la Plata',
    cx: 365,
    cy: 260,
    polygon: '350,210 395,200 385,315 340,320'
  }
];

function GoogleLogoSvg({ className = "w-5 h-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

async function hashBrowserSecret(text) {
  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text + '::ronda_local_pwd_v1');
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }
  return btoa(unescape(encodeURIComponent(text + '::ronda_local_pwd_v1')));
}

export default function ProfileModal({
  isOpen,
  onClose,
  currentUser,
  onGoogleLogin,
  onLogout,
  onUpdatePreferences,
  onLoadSavedPlan,
  onRemoveSavedPlan,
  onToggleVisited,
  allPlaces = [],
  onOpenPlaceDetail,
  onPlanFromHere,
  theme = 'light',
  authPromptMessage = '',
  onOpenGuide = null
}) {
  if (!isOpen) return null;

  const isDark =
    theme === 'dark' ||
    (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));

  // Estados de navegación dentro del perfil
  const [activeProfileTab, setActiveProfileTab] = useState('passport'); // 'passport' | 'saved_plans' | 'favorites' | 'preferences'
  const [passportSubView, setPassportSubView] = useState('map'); // 'map' | 'badges'
  const [selectedBarrioId, setSelectedBarrioId] = useState(() => currentUser?.neighborhood || 'San Telmo');
  const [expandedBadgeId, setExpandedBadgeId] = useState(null);

  // Estados de autenticación (Opción A: Google First + Acordeón Manual Discreto)
  const [showManualForm, setShowManualForm] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [neighborhood, setNeighborhood] = useState('San Telmo');
  const [petFriendly, setPetFriendly] = useState(false);
  const [vegetarianFriendly, setVegetarianFriendly] = useState(false);
  const [budgetPreference, setBudgetPreference] = useState('$$');
  const [authError, setAuthError] = useState('');
  const [googlePopupHint, setGooglePopupHint] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nameInputRef = useRef(null);

  const googleClientId =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    '587121353191-tbcfok5s726spqp4augfl7ohqf8mjmd7.apps.googleusercontent.com';

  // Autocompletar el nombre guardado localmente si el usuario escribe un correo ya conocido en su navegador
  const handleEmailChange = (val) => {
    setEmail(val);
    try {
      const accounts = JSON.parse(localStorage.getItem('ronda_local_accounts') || '{}');
      const clean = val.trim().toLowerCase();
      if (accounts[clean]?.name && !name) {
        setName(accounts[clean].name);
      }
    } catch {
      // ignore
    }
  };

  // Botón único principal: Abrir la ventana emergente oficial de Google (accounts.google.com)
  const handleOpenGooglePopup = () => {
    setAuthError('');
    setGooglePopupHint('');

    if (googleClientId && typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
      try {
        const tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'openid email profile',
          callback: async (tokenResponse) => {
            if (tokenResponse?.error) {
              setAuthError('Se canceló o cerró la ventana de Google.');
              return;
            }
            if (tokenResponse?.access_token && onGoogleLogin) {
              setIsSubmitting(true);
              try {
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
                });
                const info = await res.json();
                await onGoogleLogin({
                  google_sub: info.sub || info.email,
                  displayName: info.name || info.given_name || (info.email ? info.email.split('@')[0] : 'Viajero Porteño'),
                  emailHint: info.email || '',
                  picture: info.picture || null,
                  neighborhood,
                  pet_friendly: petFriendly,
                  vegetarian_friendly: vegetarianFriendly,
                  budget_preference: budgetPreference
                });
              } catch (err) {
                setAuthError(err.message || 'No se pudo obtener el perfil de Google.');
              } finally {
                setIsSubmitting(false);
              }
            }
          }
        });
        tokenClient.requestAccessToken({ prompt: 'select_account' });
        return;
      } catch (err) {
        console.warn('Error al abrir popup OAuth2 de Google:', err);
      }
    }

    // Si el script de Google está bloqueado por el navegador, abrir el acordeón manual
    setShowManualForm(true);
    setGooglePopupHint(
      'No se pudo abrir la ventana emergente de Google en este navegador. Podés ingresar directamente acá abajo con tu correo y contraseña.'
    );
  };

  // Acordeón secundario: Formulario con Correo y Contraseña bajo arquitectura Zero-PII
  const handleSubmitFormAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setGooglePopupHint('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Por favor ingresá un correo electrónico válido.');
      return;
    }
    if (!password || password.length < 4) {
      setAuthError('Por favor ingresá una contraseña de al menos 4 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      const pwdHash = await hashBrowserSecret(`${cleanEmail}::${password}`);
      let accounts = {};
      try {
        accounts = JSON.parse(localStorage.getItem('ronda_local_accounts') || '{}');
      } catch {
        accounts = {};
      }

      const existingLocal = accounts[cleanEmail];

      if (authMode === 'register') {
        if (!cleanName) {
          throw new Error('Por favor escribí tu nombre o apodo.');
        }
        accounts[cleanEmail] = {
          name: cleanName,
          pwdHash,
          neighborhood,
          pet_friendly: petFriendly,
          vegetarian_friendly: vegetarianFriendly,
          budget_preference: budgetPreference
        };
        localStorage.setItem('ronda_local_accounts', JSON.stringify(accounts));
      } else {
        if (existingLocal && existingLocal.pwdHash && existingLocal.pwdHash !== pwdHash) {
          throw new Error('Contraseña incorrecta para esta cuenta.');
        }
        const resolvedName = existingLocal?.name || cleanName || cleanEmail.split('@')[0];
        accounts[cleanEmail] = {
          ...(existingLocal || {}),
          name: resolvedName,
          pwdHash
        };
        localStorage.setItem('ronda_local_accounts', JSON.stringify(accounts));
      }

      const finalDisplayName =
        (authMode === 'register' ? cleanName : accounts[cleanEmail]?.name) ||
        cleanEmail.split('@')[0] ||
        'Viajero Porteño';
      const targetBarrio = authMode === 'register'
        ? neighborhood
        : (accounts[cleanEmail]?.neighborhood || neighborhood);

      if (onGoogleLogin) {
        await onGoogleLogin({
          google_sub: cleanEmail,
          displayName: finalDisplayName,
          emailHint: cleanEmail,
          neighborhood: targetBarrio,
          pet_friendly: petFriendly,
          vegetarian_friendly: vegetarianFriendly,
          budget_preference: budgetPreference
        });
      }
      setPassword('');
    } catch (err) {
      setAuthError(err.message || 'Ocurrió un error al iniciar sesión.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Lista de lugares marcados explícitamente con "✓ Ya fui"
  const visitedPlaceIds = useMemo(() => {
    return Array.isArray(currentUser?.visited_place_ids) ? currentUser.visited_place_ids : [];
  }, [currentUser]);

  // Cálculo de barrios explorados en base a los lugares realmente visitados ("✓ Ya fui")
  const visitedBarrios = useMemo(() => {
    const set = new Set();
    visitedPlaceIds.forEach((id) => {
      const found = allPlaces.find((pl) => pl.id === id);
      if (found?.neighborhood) set.add(found.neighborhood);
    });
    return Array.from(set);
  }, [visitedPlaceIds, allPlaces]);

  // Nivel de progreso directo (sin nombres raros)
  const totalBarrios = BARRIOS_DATA.length;
  const exploredCount = visitedBarrios.length;
  const visitedPlacesCount = visitedPlaceIds.length;
  const progressPct = Math.min(100, Math.round((exploredCount / totalBarrios) * 100));

  const rankInfo = useMemo(() => {
    const placesLabel = `${visitedPlacesCount} ${visitedPlacesCount === 1 ? 'lugar visitado' : 'lugares visitados'} en ${exploredCount} de ${totalBarrios} barrios.`;
    if (exploredCount >= 9) {
      return { title: 'Nivel 4 · Experto en CABA', medal: '🏆', desc: placesLabel };
    }
    if (exploredCount >= 6) {
      return { title: 'Nivel 3 · Conocedor de Buenos Aires', medal: '🥇', desc: placesLabel };
    }
    if (exploredCount >= 3) {
      return { title: 'Nivel 2 · Explorador de Barrios', medal: '🧭', desc: placesLabel };
    }
    return {
      title: 'Nivel 1 · Primeros Recorridos',
      medal: '📍',
      desc: visitedPlacesCount > 0 ? placesLabel : 'Marcá "✓ Ya fui" en los lugares que visites para avanzar de nivel.'
    };
  }, [exploredCount, visitedPlacesCount, totalBarrios]);

  // Insignias con Modelo A: Nombres directos y Barra de Progreso (0 / 3 visitados)
  const badges = useMemo(() => {
    const categoriesDef = [
      {
        id: 'cafes',
        title: 'Cafés & Bares Clásicos',
        category: 'Cafeterías & Notables',
        icon: '☕',
        tip: 'Marcá "✓ Ya fui" en 3 cafeterías de especialidad o bares notables.',
        matcher: (p) => p?.category === 'cafe'
      },
      {
        id: 'gastronomia',
        title: 'Bodegones & Gastronomía',
        category: 'Restaurantes & Parrillas',
        icon: '🍽️',
        tip: 'Marcá "✓ Ya fui" en 3 bodegones, parrillas o restaurantes.',
        matcher: (p) => p?.category === 'dining'
      },
      {
        id: 'noche',
        title: 'Bares & Noche',
        category: 'Coctelería & Vermut',
        icon: '🍸',
        tip: 'Marcá "✓ Ya fui" en 3 bares de tragos, vermuterías o cervecerías.',
        matcher: (p) => p?.category === 'nightlife' && (!p?.play_category || p.play_category.length === 0)
      },
      {
        id: 'juegos',
        title: 'Pool, Bowling & Juegos',
        category: 'Salidas con Juegos',
        icon: '🎱',
        tip: 'Marcá "✓ Ya fui" en 3 salones de pool, fichines, bowling o juegos.',
        matcher: (p) => p?.category === 'juegos' || (Array.isArray(p?.play_category) && p.play_category.length > 0)
      },
      {
        id: 'cultura',
        title: 'Cultura, Librerías & Museos',
        category: 'Arte & Paseos Culturales',
        icon: '🏛️',
        tip: 'Marcá "✓ Ya fui" en 3 museos, centros culturales o librerías.',
        matcher: (p) => p?.category === 'culture' || p?.category === 'bookstore'
      },
      {
        id: 'parques',
        title: 'Parques & Aire Libre',
        category: 'Plazas, Reservas & Jardines',
        icon: '🌿',
        tip: 'Marcá "✓ Ya fui" en 3 parques, jardines o paseos al aire libre.',
        matcher: (p) => p?.category === 'park' || p?.indoor_outdoor === 'outdoor'
      }
    ];

    const goal = 3;
    return categoriesDef.map((def) => {
      const matchingAll = allPlaces.filter(def.matcher);
      const visitedMatching = matchingAll.filter((p) => visitedPlaceIds.includes(p.id));
      const count = visitedMatching.length;
      const pct = Math.min(100, Math.round((count / goal) * 100));
      return {
        ...def,
        goal,
        count,
        pct,
        unlocked: count >= goal,
        visitedPlaces: visitedMatching,
        suggestedPlaces: matchingAll.slice(0, 6)
      };
    });
  }, [visitedPlaceIds, allPlaces]);

  // Barrio seleccionado en el mapa
  const selectedBarrio = useMemo(() => {
    return BARRIOS_DATA.find(b => b.id === selectedBarrioId) || BARRIOS_DATA[0];
  }, [selectedBarrioId]);

  const selectedBarrioPlaces = useMemo(() => {
    return allPlaces.filter(p => p.neighborhood === selectedBarrio.id).slice(0, 3);
  }, [allPlaces, selectedBarrio.id]);

  const isSelectedExplored = visitedBarrios.includes(selectedBarrio.id);

  const selectedBarrioFavoritesCount = useMemo(() => {
    return (currentUser?.favorite_place_ids || []).filter(id => {
      const p = allPlaces.find(pl => pl.id === id);
      return p?.neighborhood === selectedBarrio.id;
    }).length;
  }, [currentUser, allPlaces, selectedBarrio.id]);

  const selectedBarrioSavedPlans = useMemo(() => {
    return (currentUser?.saved_plans || []).filter(plan => {
      const pData = plan.plan || plan;
      return pData.neighborhood === selectedBarrio.id;
    });
  }, [currentUser, selectedBarrio.id]);

  // Handler para iniciar ronda en el barrio seleccionado
  const handleStartRondaInBarrio = (barrioId, barrioLabel) => {
    if (onPlanFromHere) {
      onPlanFromHere({ neighborhood: barrioId, name: barrioLabel || barrioId });
    }
    onClose();
  };

  return (
    <aside 
      role="dialog"
      aria-modal="true"
      aria-label="Perfil y Pasaporte Porteño"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="ronda-card border rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto animate-scale-up transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ======================================================== */}
        {/* CASO 1: USUARIO NO LOGUEADO (OPCIÓN A: GOOGLE FIRST)     */}
        {/* ======================================================== */}
        {!currentUser ? (
          <div>
            {/* Barra superior con botón cerrar sin superponerse */}
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E06D28] flex items-center gap-1.5">
                <Compass className="w-4 h-4" />
                <span>Mi Cuenta en Ronda</span>
              </span>
              <button 
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full ronda-text-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--text-main)] transition cursor-pointer"
                title="Cerrar ventana"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sugerencia contextual cuando el usuario intentó tocar "Ya fui", "Favorito" o "Guardar ronda" sin sesión */}
            {authPromptMessage && (
              <div className="mb-4 p-3.5 rounded-2xl bg-[#E06D28]/12 border border-[#E06D28]/40 flex items-start gap-2.5 animate-fade-in">
                <Sparkles className="w-4 h-4 text-[#E06D28] shrink-0 mt-0.5" />
                <div className="text-xs text-[var(--text-main)] leading-relaxed">
                  <p className="font-bold text-[#E06D28] mb-0.5">Iniciá sesión o creá tu cuenta</p>
                  <p>{authPromptMessage}</p>
                </div>
              </div>
            )}

            {/* Banner Editorial de Pasaporte Porteño */}
            <div className="ronda-card-inner border rounded-2xl p-5 mb-4 shadow-xs relative overflow-hidden">
              <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] flex items-center gap-1.5 bg-[#E06D28]/10 border border-[#E06D28]/30 px-2.5 py-1 rounded-full">
                  <Compass className="w-3.5 h-3.5" /> Pasaporte de Viajero Porteño
                </span>
                <span className="text-[10px] ronda-text-muted font-mono ronda-card border px-2.5 py-0.5 rounded-full">
                  CABA · 11 Barrios
                </span>
              </div>

              <h3 className="font-editorial text-2xl font-bold text-[var(--text-main)] leading-tight mb-1">
                Conquistá los barrios de Buenos Aires
              </h3>
              <p className="text-xs ronda-text-muted max-w-lg leading-relaxed">
                Conectá tu cuenta para sellar los barrios que recorras en tu mapa interactivo y guardar tus rondas y lugares favoritos.
              </p>
            </div>

            {/* Selector compacto de barrio base antes de ingresar */}
            <div className="mb-4">
              <label className="text-[11px] font-semibold ronda-text-muted flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E06D28]" />
                  <span>Tu barrio de partida en CABA</span>
                </span>
                <span className="text-[10px] ronda-text-muted font-normal">Podés cambiarlo cuando quieras</span>
              </label>
              <select
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                className="w-full ronda-card-inner border rounded-xl px-3.5 py-2.5 text-xs font-medium text-[var(--text-main)] outline-none focus:border-[#E06D28] transition cursor-pointer"
              >
                {BARRIOS_DATA.map((b) => (
                  <option key={b.id} value={b.id} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                    {b.label} — {b.sub}
                  </option>
                ))}
              </select>
            </div>

            {/* BOTÓN ÚNICO PRINCIPAL DE GOOGLE (SIN DUPLICADOS) */}
            <div className="mb-4 space-y-2">
              <button
                type="button"
                onClick={handleOpenGooglePopup}
                disabled={isSubmitting}
                className="w-full bg-white dark:bg-[#1E2E26] hover:bg-stone-50 dark:hover:bg-[#25392F] text-[#14241F] dark:text-[#F8FAF9] border border-[#C5D2C9] dark:border-[#345243] font-semibold text-sm py-3.5 px-5 rounded-2xl transition shadow-sm hover:shadow-md flex items-center justify-center gap-3 cursor-pointer btn-latido"
              >
                <GoogleLogoSvg className="w-5 h-5 shrink-0" />
                <span>{isSubmitting ? 'Conectando...' : 'Continuar con Google'}</span>
              </button>

              {googlePopupHint && (
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-200 text-[11px] p-2.5 rounded-xl text-center">
                  {googlePopupHint}
                </div>
              )}
            </div>

            {authError && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300 text-xs p-3 rounded-xl mb-3.5 text-center">
                {authError}
              </div>
            )}

            {/* ACORDEÓN SECUNDARIO DISCRETO: ACCESO CON CORREO Y CONTRASEÑA */}
            <div className="border-t ronda-border pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowManualForm((prev) => !prev);
                  setAuthError('');
                }}
                className="w-full py-2 px-3 rounded-xl text-xs font-semibold ronda-text-muted hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/5 transition flex items-center justify-between cursor-pointer"
              >
                <span>¿Preferís ingresar con correo y contraseña?</span>
                <ChevronRight
                  className={`w-4 h-4 transition-transform duration-200 ${showManualForm ? 'rotate-90 text-[#E06D28]' : ''}`}
                />
              </button>

              {showManualForm && (
                <div className="mt-3 pt-1 animate-fade-in">
                  {/* Pestañas Iniciar sesión / Crear mi cuenta */}
                  <div className="flex ronda-card-inner p-1 rounded-2xl border mb-3.5">
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('login'); setAuthError(''); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                        authMode === 'login'
                          ? 'bg-[#14241F] dark:bg-[#243B30] text-white shadow-xs'
                          : 'ronda-text-muted hover:text-[var(--text-main)]'
                      }`}
                    >
                      Iniciar sesión
                    </button>
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('register'); setAuthError(''); }}
                      className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer ${
                        authMode === 'register'
                          ? 'bg-[#14241F] dark:bg-[#243B30] text-white shadow-xs'
                          : 'ronda-text-muted hover:text-[var(--text-main)]'
                      }`}
                    >
                      Crear mi cuenta
                    </button>
                  </div>

                  <form onSubmit={handleSubmitFormAuth} className="space-y-3 mb-3">
                    {/* Nombre solo al crear cuenta nueva (evita repetición al iniciar sesión) */}
                    {authMode === 'register' && (
                      <div>
                        <label className="text-[11px] font-semibold ronda-text-muted block mb-1">
                          ¿Cómo te llamás?
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 ronda-text-muted absolute left-3.5 top-3" />
                          <input 
                            ref={nameInputRef}
                            type="text" 
                            placeholder="Tu nombre o apodo"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="w-full ronda-card-inner border rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#E06D28]"
                          />
                        </div>
                      </div>
                    )}

                    <div>
                      <label className="text-[11px] font-semibold ronda-text-muted block mb-1">
                        Correo electrónico
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 ronda-text-muted absolute left-3.5 top-3" />
                        <input 
                          type="email" 
                          placeholder="tu@correo.com"
                          value={email}
                          onChange={(e) => handleEmailChange(e.target.value)}
                          required
                          className="w-full ronda-card-inner border rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#E06D28]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-semibold ronda-text-muted block mb-1">
                        Contraseña
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 ronda-text-muted absolute left-3.5 top-3" />
                        <input 
                          type="password" 
                          placeholder="Al menos 4 caracteres"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full ronda-card-inner border rounded-xl py-2.5 pl-10 pr-3.5 text-xs text-[var(--text-main)] placeholder:text-[var(--text-muted)] outline-none focus:border-[#E06D28]"
                        />
                      </div>
                    </div>

                    {authMode === 'register' && (
                      <div className="ronda-card-inner border p-3 rounded-2xl space-y-2">
                        <span className="text-[11px] font-bold text-[var(--text-main)] block mb-1">
                          Preferencias de salida:
                        </span>
                        <div className="flex items-center justify-between">
                          <span className="text-xs ronda-text-muted flex items-center gap-1.5">
                            <Dog className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            <span>Priorizar siempre Pet Friendly</span>
                          </span>
                          <input 
                            type="checkbox"
                            checked={petFriendly}
                            onChange={(e) => setPetFriendly(e.target.checked)}
                            className="w-4 h-4 accent-[#E06D28] cursor-pointer"
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xs ronda-text-muted flex items-center gap-1.5">
                            <Salad className="w-3.5 h-3.5 text-lime-600 dark:text-lime-400" />
                            <span>Priorizar opciones vegetarianas</span>
                          </span>
                          <input 
                            type="checkbox"
                            checked={vegetarianFriendly}
                            onChange={(e) => setVegetarianFriendly(e.target.checked)}
                            className="w-4 h-4 accent-[#E06D28] cursor-pointer"
                          />
                        </div>
                      </div>
                    )}

                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-[#E06D28] hover:bg-[#C95B1D] text-white font-semibold text-xs py-3 rounded-xl transition shadow-sm mt-1 cursor-pointer disabled:opacity-50 btn-latido"
                    >
                      {isSubmitting ? 'Procesando...' : (authMode === 'login' ? 'Ingresar con mi correo' : 'Crear mi Pasaporte Porteño')}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ======================================================== */
          /* CASO 2: USUARIO LOGUEADO (PASAPORTE & CENTRO DE COMANDO)  */
          /* ======================================================== */
          <div>
            {/* ENCABEZADO DEL PERFIL (Sin badge 'Sesión activa' y con botones Cerrar Sesión + Cerrar Ventana separados) */}
            <div className="flex items-center justify-between gap-3 pb-4 border-b ronda-border mb-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-[#14241F] dark:bg-[#1E3328] text-white flex items-center justify-center font-bold text-base shadow-xs border ronda-border shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'R'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-editorial text-xl font-bold text-[var(--text-main)] leading-tight truncate">
                    {currentUser.name || 'Viajero Porteño'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-semibold text-[var(--text-main)] ronda-card-inner px-2 py-0.5 rounded-full border flex items-center gap-1 shrink-0">
                      <MapPin className="w-3 h-3 text-[#E06D28]" />
                      <span>{currentUser.neighborhood || 'San Telmo'}</span>
                    </span>
                    {currentUser.email && (
                      <span className="text-xs ronda-text-muted truncate max-w-[140px] sm:max-w-[220px]">
                        {currentUser.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={onLogout}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold ronda-card-inner border ronda-text-muted hover:text-red-500 hover:border-red-500/40 hover:bg-red-500/10 transition cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Salir</span>
                </button>

                <button 
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl ronda-text-muted hover:bg-black/5 dark:hover:bg-white/10 hover:text-[var(--text-main)] transition cursor-pointer"
                  title="Cerrar ventana"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* PESTAÑAS PRINCIPALES DEL PERFIL */}
            <div className="flex ronda-card-inner p-1 rounded-2xl border mb-5 overflow-x-auto">
              <button 
                type="button"
                onClick={() => setActiveProfileTab('passport')}
                className={`flex-1 min-w-[110px] py-2 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeProfileTab === 'passport'
                    ? 'bg-[#14241F] dark:bg-[#243B30] text-white shadow-xs'
                    : 'ronda-text-muted hover:text-[var(--text-main)]'
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-[#E06D28]" />
                <span>Pasaporte ({exploredCount}/11)</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveProfileTab('saved_plans')}
                className={`flex-1 min-w-[95px] py-2 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeProfileTab === 'saved_plans'
                    ? 'bg-[#14241F] dark:bg-[#243B30] text-white shadow-xs'
                    : 'ronda-text-muted hover:text-[var(--text-main)]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-amber-500" />
                <span>Rondas ({currentUser.saved_plans?.length || 0})</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveProfileTab('favorites')}
                className={`flex-1 min-w-[95px] py-2 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeProfileTab === 'favorites'
                    ? 'bg-[#14241F] dark:bg-[#243B30] text-white shadow-xs'
                    : 'ronda-text-muted hover:text-[var(--text-main)]'
                }`}
              >
                <Heart className="w-3.5 h-3.5 text-rose-500" />
                <span>Favoritos ({currentUser.favorite_place_ids?.length || 0})</span>
              </button>

              <button 
                type="button"
                onClick={() => setActiveProfileTab('preferences')}
                className={`flex-1 min-w-[95px] py-2 px-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeProfileTab === 'preferences'
                    ? 'bg-[#14241F] dark:bg-[#243B30] text-white shadow-xs'
                    : 'ronda-text-muted hover:text-[var(--text-main)]'
                }`}
              >
                <span>Preferencias</span>
              </button>
            </div>

            {/* ======================================================== */}
            {/* PESTAÑA 1: PASAPORTE PORTEÑO (MAPA & MEDALLAS)           */}
            {/* ======================================================== */}
            {activeProfileTab === 'passport' && (
              <div className="space-y-4">
                {/* TARJETA TIPO PASAPORTE FÍSICO (ARMONIZADA EN CLARO Y OSCURO) */}
                <div className="ronda-card-inner rounded-3xl p-4 sm:p-5 border shadow-xs relative overflow-hidden">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b ronda-border">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] bg-[#E06D28]/12 border border-[#E06D28]/30 px-2 py-0.5 rounded-full">
                          Pasaporte de Caminante Porteño
                        </span>
                        <span className="text-[10px] ronda-text-muted font-mono">
                          N° RO-BA-{currentUser.id ? currentUser.id.slice(-4).toUpperCase() : '8429'}
                        </span>
                      </div>
                      <h4 className="font-editorial text-2xl font-bold text-[var(--text-main)] flex items-center gap-2">
                        <span>{rankInfo.medal}</span>
                        <span>{rankInfo.title}</span>
                      </h4>
                      <p className="text-xs ronda-text-muted mt-0.5">
                        {rankInfo.desc}
                      </p>
                    </div>

                    <div className="text-left sm:text-right shrink-0">
                      <div className="text-lg font-bold font-mono text-[#E06D28]">
                        {exploredCount} / {totalBarrios}
                      </div>
                      <div className="text-[10px] ronda-text-muted uppercase font-semibold">
                        Barrios Conquistados
                      </div>
                    </div>
                  </div>

                  {/* Barra de progreso de exploración */}
                  <div className="mt-3">
                    <div className="flex justify-between text-[11px] font-medium ronda-text-muted mb-1">
                      <span>Progreso en la Ciudad de Buenos Aires</span>
                      <span className="font-mono text-[#E06D28] font-bold">{progressPct}%</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-[#E06D28] to-emerald-500 rounded-full transition-all duration-700"
                        style={{ width: `${Math.max(8, progressPct)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Sub-toggle: Mapa de Barrios vs Insignias */}
                  <div className="flex gap-2 mt-4 pt-3 border-t ronda-border">
                    <button
                      type="button"
                      onClick={() => setPassportSubView('map')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        passportSubView === 'map'
                          ? 'bg-[#E06D28] text-white shadow-xs'
                          : 'ronda-card border ronda-text-muted hover:text-[var(--text-main)]'
                      }`}
                    >
                      <MapIcon className="w-3.5 h-3.5" />
                      <span>Mapa de Barrios</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPassportSubView('badges')}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer ${
                        passportSubView === 'badges'
                          ? 'bg-[#E06D28] text-white shadow-xs'
                          : 'ronda-card border ronda-text-muted hover:text-[var(--text-main)]'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>Insignias ({badges.filter(b => b.unlocked).length}/6)</span>
                    </button>
                  </div>

                  {/* Acceso a la guía explicativa del mapa e insignias */}
                  {onOpenGuide && (
                    <div className="mt-2.5 flex items-center justify-end px-1">
                      <button
                        type="button"
                        onClick={onOpenGuide}
                        className="inline-flex items-center gap-1.5 text-xs text-[#E06D28] hover:underline font-semibold cursor-pointer py-1"
                        title="Ver guía del mapa porteño y sistema de insignias"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>¿Cómo funciona el mapa y las insignias?</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* VISTA 1: MAPA DE BARRIOS DE CABA (CONTRASTE SUAVIZADO DÍA / NOCHE) */}
                {passportSubView === 'map' && (
                  <div className="space-y-3">
                    {/* Contenedor del Mapa SVG Interactivo */}
                    <div className="ronda-card-inner border rounded-3xl p-3 sm:p-4 shadow-xs relative overflow-hidden transition-colors">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                          <Compass className="w-3.5 h-3.5 text-[#E06D28]" />
                          <span>Radar Cartográfico Porteño</span>
                        </span>
                        <div className="flex items-center gap-3 text-[10px] ronda-text-muted">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500"></span> Explorado
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-500"></span> Por descubrir
                          </span>
                        </div>
                      </div>

                      {/* SVG Canvas de CABA con paleta suave según tema */}
                      <div className="w-full aspect-[4/3] sm:aspect-[16/11] relative">
                        <svg 
                          viewBox="0 0 420 360" 
                          className="w-full h-full select-none"
                        >
                          <defs>
                            {/* Gradiente del Río de la Plata adaptado a modo claro / oscuro */}
                            <linearGradient id="rioPlataGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor={isDark ? '#16272E' : '#D5E6EC'} />
                              <stop offset="100%" stopColor={isDark ? '#122026' : '#C5DBE3'} />
                            </linearGradient>

                            {/* Patrón sutil de cuadrícula de adoquines */}
                            <pattern id="gridMap" width="20" height="20" patternUnits="userSpaceOnUse">
                              <path
                                d="M 20 0 L 0 0 0 20"
                                fill="none"
                                stroke={isDark ? '#21332A' : '#D5E1DA'}
                                strokeWidth="0.6"
                                strokeOpacity="0.6"
                              />
                            </pattern>
                          </defs>

                          {/* Fondo del mapa suave (sin negro puro ni blanco encandilante) */}
                          <rect width="420" height="360" fill={isDark ? '#15221C' : '#E7EFEA'} rx="16" />
                          <rect width="420" height="360" fill="url(#gridMap)" rx="16" />

                          {/* Río de la Plata (costado noreste/este) */}
                          <path 
                            d="M 310,0 C 355,80 395,170 380,360 L 420,360 L 420,0 Z" 
                            fill="url(#rioPlataGrad)"
                            stroke={isDark ? '#233B44' : '#B0CCD6'}
                            strokeWidth="1"
                          />
                          <text 
                            x="385" 
                            y="180" 
                            fill={isDark ? '#5A808E' : '#587F8D'} 
                            fontSize="9" 
                            fontWeight="700" 
                            letterSpacing="3" 
                            transform="rotate(82, 385, 180)"
                          >
                            RÍO DE LA PLATA
                          </text>

                          {/* Polígonos interactivos de los 11 barrios */}
                          {BARRIOS_DATA.map((barrio) => {
                            const isExplored = visitedBarrios.includes(barrio.id);
                            const isSelected = selectedBarrioId === barrio.id;

                            const polyFill = isDark
                              ? (isSelected
                                  ? (isExplored ? '#254234' : '#21322A')
                                  : (isExplored ? '#1E362B' : '#192821'))
                              : (isSelected
                                  ? (isExplored ? '#CBE5D7' : '#DCE6E0')
                                  : (isExplored ? '#D9EDE2' : '#F3F7F4'));

                            const polyStroke = isDark
                              ? (isSelected
                                  ? '#D97736'
                                  : (isExplored ? '#468E6E' : '#2C4237'))
                              : (isSelected
                                  ? '#D96B27'
                                  : (isExplored ? '#4D9675' : '#BCCBC2'));

                            const labelFill = isDark
                              ? (isSelected ? '#F2AC79' : (isExplored ? '#D6E8DF' : '#8FA399'))
                              : (isSelected ? '#B54D10' : (isExplored ? '#18382A' : '#4E6358'));

                            return (
                              <g 
                                key={barrio.id}
                                onClick={() => setSelectedBarrioId(barrio.id)}
                                className="cursor-pointer transition-transform duration-200"
                              >
                                <polygon
                                  points={barrio.polygon}
                                  fill={polyFill}
                                  stroke={polyStroke}
                                  strokeWidth={isSelected ? '2' : (isExplored ? '1.3' : '1')}
                                  strokeDasharray={(!isExplored && !isSelected) ? '3 2' : 'none'}
                                  className="transition-colors"
                                />

                                {/* Icono o tilde de exploración */}
                                {isExplored ? (
                                  <circle 
                                    cx={barrio.cx} 
                                    cy={barrio.cy - 7} 
                                    r="5.5" 
                                    fill={isDark ? '#388E6C' : '#2E855E'} 
                                    stroke={isDark ? '#1B4D38' : '#1F5C41'} 
                                    strokeWidth="1" 
                                  />
                                ) : (
                                  <circle 
                                    cx={barrio.cx} 
                                    cy={barrio.cy - 7} 
                                    r="3.5" 
                                    fill={isDark ? '#344B3F' : '#A3B8AD'} 
                                  />
                                )}

                                {isExplored && (
                                  <text
                                    x={barrio.cx}
                                    y={barrio.cy - 4}
                                    textAnchor="middle"
                                    fill="#FFFFFF"
                                    fontSize="6"
                                    fontWeight="bold"
                                  >
                                    ✓
                                  </text>
                                )}

                                {/* Nombre del Barrio */}
                                <text
                                  x={barrio.cx}
                                  y={barrio.cy + 7}
                                  textAnchor="middle"
                                  fill={labelFill}
                                  fontSize={isSelected ? '9.5' : '8.5'}
                                  fontWeight={isSelected || isExplored ? 'bold' : 'normal'}
                                  className="pointer-events-none transition-all"
                                >
                                  {barrio.label}
                                </text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>

                      <p className="text-[10px] text-center ronda-text-muted mt-2">
                        Tocá cualquier barrio en el mapa para ver sus joyitas y sellar tu pasaporte.
                      </p>
                    </div>

                    {/* FICHA DINÁMICA DEL BARRIO SELECCIONADO */}
                    <div className="ronda-card-inner border rounded-2xl p-4 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-0.5">
                            <h5 className="font-editorial text-lg font-bold text-[var(--text-main)]">
                              {selectedBarrio.label}
                            </h5>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                              isSelectedExplored 
                                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30'
                                : 'ronda-card ronda-text-muted border'
                            }`}>
                              {isSelectedExplored ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                                  <span>Explorado</span>
                                </>
                              ) : (
                                <>
                                  <Compass className="w-3 h-3 ronda-text-muted" />
                                  <span>Por descubrir</span>
                                </>
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-[#E06D28] font-semibold">
                            {selectedBarrio.sub}
                          </p>
                        </div>

                        {/* Botón de acción: Armar ronda acá */}
                        <button
                          type="button"
                          onClick={() => handleStartRondaInBarrio(selectedBarrio.id, selectedBarrio.label)}
                          className="bg-[#E06D28] hover:bg-[#C95B1D] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0 btn-latido"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>Armar ronda acá</span>
                        </button>
                      </div>

                      <p className="text-xs ronda-text-muted leading-relaxed">
                        {selectedBarrio.description}
                      </p>

                      {/* Lugares emblemáticos de este barrio con botón "✓ Ya fui" */}
                      {selectedBarrioPlaces.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-main)] block mb-2">
                            Lugares en {selectedBarrio.label} (marcá los que ya visitaste):
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            {selectedBarrioPlaces.map((place) => {
                              const isVisited = visitedPlaceIds.includes(place.id);
                              return (
                                <div
                                  key={place.id}
                                  onClick={() => onOpenPlaceDetail && onOpenPlaceDetail(place)}
                                  className="ronda-card border rounded-xl p-2.5 hover:border-[#E06D28] transition cursor-pointer flex flex-col justify-between gap-2"
                                >
                                  <div className="flex sm:flex-col items-center sm:items-start gap-2.5 sm:gap-1.5">
                                    <div className="w-12 h-12 sm:w-full sm:h-20 rounded-lg overflow-hidden bg-stone-800 shrink-0">
                                      <img 
                                        src={place.image_url || `/places/${place.id}.jpg`} 
                                        alt={place.name} 
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.style.display = 'none'; }}
                                      />
                                    </div>
                                    <div className="min-w-0 w-full">
                                      <h6 className="text-xs font-bold text-[var(--text-main)] truncate">
                                        {place.name}
                                      </h6>
                                      <p className="text-[10px] ronda-text-muted truncate">
                                        {place.address}
                                      </p>
                                    </div>
                                  </div>

                                  {onToggleVisited && (
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onToggleVisited(place.id);
                                      }}
                                      className={`w-full py-1.5 px-2 rounded-lg text-[11px] font-bold border transition cursor-pointer flex items-center justify-center gap-1 ${
                                        isVisited
                                          ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                                          : 'ronda-card-inner text-[var(--text-main)] hover:border-[#E06D28]'
                                      }`}
                                    >
                                      <Check className="w-3 h-3" />
                                      <span>{isVisited ? 'Visitado' : 'Ya fui'}</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Si el usuario tiene rondas guardadas en este barrio */}
                      {selectedBarrioSavedPlans.length > 0 && (
                        <div className="pt-2 border-t ronda-border flex items-center justify-between">
                          <span className="text-xs ronda-text-muted">
                            Tenés {selectedBarrioSavedPlans.length} ronda(s) guardada(s) en este barrio
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onLoadSavedPlan(selectedBarrioSavedPlans[0]);
                              onClose();
                            }}
                            className="text-xs text-[#E06D28] font-semibold hover:underline flex items-center gap-1 cursor-pointer"
                          >
                            <span>Cargar ronda</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* SELECTOR RÁPIDO DE TODOS LOS BARRIOS (VISAS) */}
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-main)] block mb-2">
                        Visas de Barrio ({exploredCount} de 11 selladas):
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                        {BARRIOS_DATA.map((b) => {
                          const isExp = visitedBarrios.includes(b.id);
                          const isSel = selectedBarrioId === b.id;
                          return (
                            <button
                              key={b.id}
                              type="button"
                              onClick={() => setSelectedBarrioId(b.id)}
                              className={`p-2 rounded-xl text-left border text-xs transition cursor-pointer flex items-center justify-between gap-1.5 ${
                                isSel
                                  ? 'border-[#E06D28] bg-[#E06D28]/10 text-[var(--text-main)] font-bold'
                                  : (isExp 
                                      ? 'ronda-card border-emerald-500/30 text-[var(--text-main)]'
                                      : 'ronda-card-inner border-dashed ronda-text-muted hover:border-[#E06D28]/40'
                                    )
                              }`}
                            >
                              <span className="truncate">{b.label}</span>
                              <span className="shrink-0 text-xs">
                                {isExp ? '✓' : '·'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* VISTA 2: INSIGNIAS POR CATEGORÍA (MODELO A: 0 / 3 VISITADOS CON BARRA) */}
                {passportSubView === 'badges' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {badges.map((badge) => {
                        const isExpanded = expandedBadgeId === badge.id;
                        return (
                          <div
                            key={badge.id}
                            className={`rounded-2xl border p-4 transition flex flex-col justify-between relative overflow-hidden ${
                              badge.unlocked
                                ? 'ronda-card border-emerald-500/50 shadow-xs'
                                : 'ronda-card-inner ronda-border'
                            }`}
                          >
                            <div
                              onClick={() => setExpandedBadgeId(isExpanded ? null : badge.id)}
                              className="cursor-pointer"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shrink-0 border ${
                                  badge.unlocked
                                    ? 'bg-[#14241F] dark:bg-[#243B30] text-white border-emerald-500/40 shadow-xs'
                                    : 'ronda-card ronda-border'
                                }`}>
                                  {badge.icon}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center justify-between gap-1 mb-0.5">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28]">
                                      {badge.category}
                                    </span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-mono ${
                                      badge.unlocked 
                                        ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' 
                                        : 'ronda-card border ronda-text-muted'
                                    }`}>
                                      {badge.unlocked ? `✓ ${badge.count}/${badge.goal}` : `${badge.count} / ${badge.goal} visitados`}
                                    </span>
                                  </div>
                                  <h5 className="font-editorial text-base font-bold text-[var(--text-main)] leading-snug">
                                    {badge.title}
                                  </h5>
                                  <p className="text-[11px] ronda-text-muted mt-1 leading-snug">
                                    {badge.tip}
                                  </p>
                                </div>
                              </div>

                              {/* Barra de progreso 0 / 3 */}
                              <div className="mt-3">
                                <div className="w-full h-1.5 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      badge.unlocked
                                        ? 'bg-emerald-500'
                                        : 'bg-[#E06D28]'
                                    }`}
                                    style={{ width: `${badge.pct}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between mt-1.5 text-[10px] ronda-text-muted font-medium">
                                  <span>
                                    {badge.unlocked ? 'Insignia completada' : `Faltan ${Math.max(0, badge.goal - badge.count)} para completar`}
                                  </span>
                                  <span className="text-[#E06D28] font-semibold">
                                    {isExpanded ? 'Ocultar lugares ▲' : 'Elegir lugares ▼'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Desplegable de lugares de esta categoría para marcar "✓ Ya fui" */}
                            {isExpanded && badge.suggestedPlaces?.length > 0 && (
                              <div className="mt-3 pt-2.5 border-t ronda-border space-y-1.5 animate-fade-in">
                                <span className="text-[10px] font-bold uppercase tracking-wider ronda-text-muted block mb-1">
                                  Marcá los que ya conocés:
                                </span>
                                {badge.suggestedPlaces.map((pl) => {
                                  const isVis = visitedPlaceIds.includes(pl.id);
                                  return (
                                    <div
                                      key={pl.id}
                                      className="flex items-center justify-between gap-2 p-2 rounded-xl ronda-card border text-xs"
                                    >
                                      <div
                                        onClick={() => onOpenPlaceDetail && onOpenPlaceDetail(pl)}
                                        className="min-w-0 flex-1 cursor-pointer hover:text-[#E06D28] transition"
                                      >
                                        <p className="font-semibold text-[var(--text-main)] truncate">{pl.name}</p>
                                        <p className="text-[10px] ronda-text-muted truncate">{pl.neighborhood}</p>
                                      </div>
                                      {onToggleVisited && (
                                        <button
                                          type="button"
                                          onClick={() => onToggleVisited(pl.id)}
                                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition cursor-pointer shrink-0 flex items-center gap-1 ${
                                            isVis
                                              ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40'
                                              : 'ronda-card-inner text-[var(--text-main)] hover:border-[#E06D28]'
                                          }`}
                                        >
                                          <Check className="w-3 h-3" />
                                          <span>{isVis ? 'Visitado' : 'Ya fui'}</span>
                                        </button>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="ronda-card-inner border rounded-2xl p-3.5 text-center">
                      <p className="text-xs ronda-text-muted">
                        💡 <strong>¿Cómo llenás tus insignias?</strong> Tocá <strong>"✓ Ya fui"</strong> en las paradas de tus rondas, en los lugares de cada barrio o desplegando cada insignia acá arriba hasta llegar a <strong>3/3 visitados</strong>.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* PESTAÑA 2: RONDAS GUARDADAS                              */}
            {/* ======================================================== */}
            {activeProfileTab === 'saved_plans' && (
              <div className="space-y-3">
                {(!currentUser.saved_plans || currentUser.saved_plans.length === 0) ? (
                  <div className="ronda-card-inner border rounded-2xl p-8 text-center shadow-xs">
                    <Compass className="w-8 h-8 text-[#E06D28] mx-auto mb-2 opacity-80" />
                    <h4 className="font-editorial text-lg font-bold text-[var(--text-main)] mb-1">
                      Todavía no guardaste recorridos
                    </h4>
                    <p className="text-xs ronda-text-muted max-w-xs mx-auto mb-4 leading-relaxed">
                      Cuando armes una ronda que te guste, tocá <strong>"Guardar en mi perfil"</strong> para tenerla lista cada fin de semana.
                    </p>
                    <button
                      type="button"
                      onClick={onClose}
                      className="bg-[#E06D28] hover:bg-[#C95B1D] text-white text-xs font-semibold px-4 py-2 rounded-xl cursor-pointer shadow-sm btn-latido"
                    >
                      Armar mi primer recorrido
                    </button>
                  </div>
                ) : (
                  currentUser.saved_plans.map((p, idx) => {
                    const planData = p.plan || p;
                    return (
                      <article
                        key={p.id || idx}
                        className="ronda-card-inner rounded-2xl border p-4 shadow-xs hover:border-[#E06D28]/60 transition flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#E06D28] block mb-0.5">
                              {planData.neighborhood} · {planData.schedule?.length || 3} paradas {p.saved_at ? `· ${p.saved_at}` : ''}
                            </span>
                            <h4 className="font-editorial text-lg font-bold text-[var(--text-main)] leading-snug">
                              {planData.title}
                            </h4>
                          </div>
                          <button
                            type="button"
                            onClick={() => onRemoveSavedPlan(p.id || planData.id)}
                            className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition cursor-pointer shrink-0"
                            title="Eliminar de guardados"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Resumen de paradas */}
                        <div className="flex flex-wrap gap-1.5 my-2">
                          {(planData.schedule || []).map((s, i) => (
                            <span key={i} className="text-[11px] ronda-card text-[var(--text-main)] border px-2 py-0.5 rounded-lg">
                              {i+1}. {s.place_name}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center gap-2 pt-2 border-t ronda-border mt-2">
                          <button
                            type="button"
                            onClick={() => {
                              onLoadSavedPlan(p);
                              onClose();
                            }}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#14241F] dark:bg-[#1E3328] hover:bg-[#2A4B3D] text-white text-xs font-semibold py-2 px-3 rounded-xl transition cursor-pointer shadow-xs border ronda-border"
                          >
                            <Compass className="w-3.5 h-3.5 text-[#E06D28]" />
                            <span>Ver en mapa</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              const text = `🧭 Te comparto esta ronda por ${planData.neighborhood}:\n${planData.title}\n\n` +
                                (planData.schedule || []).map((s, i) => `• ${i+1}. ${s.place_name} (${s.time_slot})`).join('\n') +
                                `\n\nArmado con Ronda (Buenos Aires)`;
                              window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
                            }}
                            className="p-2 border ronda-border hover:border-[#E06D28] rounded-xl text-emerald-500 transition cursor-pointer ronda-card-inner"
                            title="Compartir por WhatsApp"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* PESTAÑA 3: FAVORITOS                                     */}
            {/* ======================================================== */}
            {activeProfileTab === 'favorites' && (
              <div className="space-y-3">
                {(!currentUser.favorite_place_ids || currentUser.favorite_place_ids.length === 0) ? (
                  <div className="ronda-card-inner border rounded-2xl p-8 text-center shadow-xs">
                    <Heart className="w-8 h-8 text-rose-500 mx-auto mb-2 opacity-80" />
                    <h4 className="font-editorial text-lg font-bold text-[var(--text-main)] mb-1">
                      Aún no tenés lugares favoritos
                    </h4>
                    <p className="text-xs ronda-text-muted max-w-xs mx-auto mb-4 leading-relaxed">
                      Explorá la sección <strong>"Recomendados"</strong> y tocá el corazón en los lugares que quieras guardar para tus próximas salidas.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentUser.favorite_place_ids.map(id => {
                      const place = allPlaces.find(p => p.id === id);
                      if (!place) return null;
                      const photoUrl = place.image_url || `/places/${place.id}.jpg`;
                      return (
                        <div 
                          key={place.id}
                          className="ronda-card-inner border rounded-2xl overflow-hidden hover:shadow-sm transition flex flex-col justify-between"
                        >
                          <div 
                            onClick={() => onOpenPlaceDetail && onOpenPlaceDetail(place)}
                            className="cursor-pointer"
                          >
                            <div className="w-full aspect-video bg-[#182A24] relative overflow-hidden">
                              <img 
                                src={photoUrl} 
                                alt={place.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                              <span className="absolute top-2 left-2 text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">
                                {place.neighborhood}
                              </span>
                            </div>
                            <div className="p-3">
                              <h5 className="font-editorial text-sm font-bold text-[var(--text-main)] truncate">
                                {place.name}
                              </h5>
                              <p className="text-[11px] ronda-text-muted truncate">
                                {place.address}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* ======================================================== */}
            {/* PESTAÑA 4: PREFERENCIAS DE SALIDA                        */}
            {/* ======================================================== */}
            {activeProfileTab === 'preferences' && (
              <div className="ronda-card-inner border rounded-2xl p-5 shadow-xs space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-main)] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E06D28]" />
                  <span>Configuración personal de tu IA</span>
                </h4>

                {/* Barrio habitual */}
                <div>
                  <label className="text-[11px] font-semibold ronda-text-muted block mb-1">
                    Tu barrio por defecto
                  </label>
                  <select
                    value={currentUser.neighborhood || 'San Telmo'}
                    onChange={(e) => onUpdatePreferences({ neighborhood: e.target.value })}
                    className="w-full ronda-card border rounded-xl px-3 py-2 text-xs text-[var(--text-main)] font-medium outline-none focus:border-[#E06D28]"
                  >
                    {BARRIOS_DATA.map((b) => (
                      <option key={b.id} value={b.id} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                        {b.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Presupuesto preferido */}
                <div>
                  <label className="text-[11px] font-semibold ronda-text-muted block mb-1">
                    Presupuesto preferido
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {['$', '$$', '$$$'].map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => onUpdatePreferences({ budget_preference: b })}
                        className={`py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
                          currentUser.budget_preference === b
                            ? 'bg-[#14241F] dark:bg-[#1E3328] text-white ring-2 ring-[#E06D28]/40 border-[#14241F] dark:border-[#385C4A]'
                            : 'ronda-card text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                      >
                        {b} {b === '$' ? 'Económico' : b === '$$' ? 'Clásico' : 'Especial'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Switches Pet Friendly & Veggie */}
                <div className="space-y-2 pt-2 border-t ronda-border">
                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <span className="text-xs font-medium text-[var(--text-main)] flex items-center gap-2">
                      <Dog className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Priorizar siempre Pet Friendly</span>
                    </span>
                    <input 
                      type="checkbox"
                      checked={Boolean(currentUser.pet_friendly)}
                      onChange={(e) => onUpdatePreferences({ pet_friendly: e.target.checked })}
                      className="w-4 h-4 accent-[#E06D28] cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition">
                    <span className="text-xs font-medium text-[var(--text-main)] flex items-center gap-2">
                      <Salad className="w-4 h-4 text-lime-600 dark:text-lime-400" />
                      <span>Priorizar opciones vegetarianas</span>
                    </span>
                    <input 
                      type="checkbox"
                      checked={Boolean(currentUser.vegetarian_friendly)}
                      onChange={(e) => onUpdatePreferences({ vegetarian_friendly: e.target.checked })}
                      className="w-4 h-4 accent-[#E06D28] cursor-pointer"
                    />
                  </div>
                </div>

                <p className="text-[11px] ronda-text-muted ronda-card p-3 rounded-xl border leading-relaxed">
                  💡 <strong>¿Cómo funciona?</strong> Al armar una ronda, el algoritmo aplicará automáticamente estos filtros sin que tengas que configurarlos cada vez.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}
