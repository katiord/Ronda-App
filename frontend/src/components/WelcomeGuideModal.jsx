import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  MapPin,
  Award,
  Sparkles,
  Footprints,
  Coffee,
  Utensils,
  GlassWater,
  Landmark,
  Trees,
  Gamepad2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Map as MapIcon,
  ChevronRight,
  Heart,
  ShieldCheck,
  User
} from 'lucide-react';

export default function WelcomeGuideModal({
  isOpen,
  onClose,
  currentUser = null,
  onOpenProfile = null,
  onStartRonda = null
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollContainerRef = useRef(null);

  // Scroll automático hacia arriba cada vez que cambia el paso
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && currentStep < 3) setCurrentStep(prev => prev + 1);
      if (e.key === 'ArrowLeft' && currentStep > 0) setCurrentStep(prev => prev - 1);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, onClose]);

  // Si no está abierto no renderiza
  if (!isOpen) return null;

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      onClose();
      if (onStartRonda) onStartRonda();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md transition-opacity duration-300 animate-backdrop-smooth"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-guide-title"
    >
      <div 
        ref={scrollContainerRef}
        className="ronda-card border border-[var(--border-main)] rounded-3xl w-full max-w-2xl lg:max-w-3xl max-h-[92vh] overflow-y-auto shadow-2xl flex flex-col relative transition-all duration-300 animate-modal-spring"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera del modal con botón de cierre */}
        <div className="flex items-center justify-between p-5 sm:p-6 border-b ronda-border sticky top-0 bg-[var(--bg-card)]/95 backdrop-blur-md z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#182A24] dark:bg-[#243B30] text-white flex items-center justify-center font-editorial font-bold text-sm shadow-2xs">
              r<span className="text-[#E06D28]">.</span>
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#E06D28] block">
                Guía de Ronda
              </span>
              <span className="text-xs font-medium text-[var(--text-muted)]">
                Paso {currentStep + 1} de {totalSteps}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 transition cursor-pointer"
              title="Cerrar guía"
              aria-label="Cerrar guía"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Indicador de progreso superior (barrita) */}
        <div className="w-full bg-black/5 dark:bg-white/5 h-1.5 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-[#182A24] to-[#E06D28] transition-all duration-300 ease-out"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Contenido dinámico según el paso */}
        <div className="p-6 sm:p-8 flex-1">
          {/* ================= PASO 1: ¿QUÉ ES UNA RONDA? ================= */}
          {currentStep === 0 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#E06D28]/15 text-[#E06D28] mb-3">
                  <Compass className="w-3.5 h-3.5" />
                  <span>El concepto de Ronda</span>
                </span>
                <h2 id="welcome-guide-title" className="font-editorial text-3xl sm:text-4xl font-bold text-[var(--text-main)] leading-tight mb-2">
                  Buenos Aires no se camina al azar<span className="text-[#E06D28]">.</span>
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  Ronda no es una lista de restaurantes sueltos. Es una experiencia curada que conecta 
                  <strong> 2 a 3 paradas a pie</strong> con sentido, ritmo y logística real por la ciudad.
                </p>
              </div>

              {/* Esquema visual interactivo de una Ronda */}
              <div className="ronda-card-inner border rounded-2xl p-5 shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-3 text-center sm:text-left">
                  Así funciona un circuito típico
                </span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 items-stretch">
                  {/* Parada 1 */}
                  <div className="ronda-card border rounded-2xl p-3 flex items-center gap-2.5 relative">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                      <Coffee className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-[#E06D28]">PARADA 1</span>
                        <span className="text-[9px] font-semibold text-[var(--text-muted)] flex items-center gap-0.5">
                          <Footprints className="w-3 h-3 text-[#E06D28]" /> ~6 min
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[var(--text-main)] truncate">Café de culto</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">Especialidad & mesas</p>
                    </div>
                  </div>

                  {/* Parada 2 */}
                  <div className="ronda-card border rounded-2xl p-3 flex items-center gap-2.5 relative">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                      <Landmark className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-bold text-[#E06D28]">PARADA 2</span>
                        <span className="text-[9px] font-semibold text-[var(--text-muted)] flex items-center gap-0.5">
                          <Footprints className="w-3 h-3 text-[#E06D28]" /> ~8 min
                        </span>
                      </div>
                      <p className="text-xs font-bold text-[var(--text-main)] truncate">Pasaje o Cultura</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">Rincón histórico</p>
                    </div>
                  </div>

                  {/* Parada 3 */}
                  <div className="ronda-card border rounded-2xl p-3 flex items-center gap-2.5 relative">
                    <div className="w-8 h-8 rounded-xl bg-purple-500/15 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                      <Utensils className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-[10px] font-bold text-[#E06D28] block">PARADA 3</span>
                      <p className="text-xs font-bold text-[var(--text-main)] truncate">Bodegón o Vermut</p>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">Platitos & sobremesa</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Beneficios clave */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                  <CheckCircle2 className="w-4 h-4 text-[#2A4B3D] dark:text-[#68B692] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-main)] block mb-0.5">Adaptado al clima y la hora</strong>
                    <span className="text-[var(--text-muted)]">Si llueve, te sugiere lugares bajo techo; si hay sol, terrazas y parques.</span>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-black/5 dark:bg-white/5">
                  <CheckCircle2 className="w-4 h-4 text-[#2A4B3D] dark:text-[#68B692] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-[var(--text-main)] block mb-0.5">Consejos de qué pedir</strong>
                    <span className="text-[var(--text-muted)]">Cada lugar incluye el imperdible de la carta y detalles de su historia.</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PASO 2: EL MAPA PORTEÑO ================= */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#2A4B3D]/15 text-[#2A4B3D] dark:text-[#68B692] mb-3">
                  <MapIcon className="w-3.5 h-3.5" />
                  <span>Tu Pasaporte de Barrios</span>
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[var(--text-main)] leading-tight mb-2">
                  El Mapa Porteño<span className="text-[#E06D28]">.</span>
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  Buenos Aires se compone de barrios con identidad única. En tu perfil tenés un 
                  <strong> mapa interactivo de CABA</strong> que vas iluminando a medida que salís.
                </p>
              </div>

              {/* Representación visual de los barrios */}
              <div className="ronda-card-inner border rounded-2xl p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b ronda-border mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#E06D28]" />
                    <span className="text-xs font-bold text-[var(--text-main)]">11 Barrios Clave de CABA</span>
                  </div>
                  <span className="text-[11px] font-semibold text-[#E06D28] px-2.5 py-0.5 rounded-full bg-[#E06D28]/10">
                    Se ilumina con cada salida
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {[
                    { name: 'San Telmo', desc: 'Bares notables & tango', highlight: true },
                    { name: 'Palermo', desc: 'Diseño & gastronomía', highlight: true },
                    { name: 'Recoleta', desc: 'Palacios & museos', highlight: false },
                    { name: 'Chacarita', desc: 'Vermut & platitos', highlight: true },
                    { name: 'Colegiales', desc: 'Cafés & pulgas', highlight: false },
                    { name: 'Belgrano', desc: 'Vía Viva & casonas', highlight: false },
                    { name: 'Villa Crespo', desc: 'El San Ber & pool', highlight: false },
                    { name: 'Almagro', desc: 'Confiterías históricas', highlight: false },
                    { name: 'Caballito', desc: 'Tranvía & parques', highlight: false },
                    { name: 'San Nicolás', desc: 'Teatro Colón & Corrientes', highlight: false },
                    { name: 'Puerto Madero', desc: 'Diques & reserva', highlight: false },
                  ].map((barrio, i) => (
                    <div 
                      key={i}
                      className={`p-2.5 rounded-xl border transition-all ${
                        barrio.highlight
                          ? 'bg-[#182A24]/10 dark:bg-[#2A4B3D]/30 border-[#2A4B3D]/40 text-[var(--text-main)] shadow-2xs font-semibold'
                          : 'bg-black/5 dark:bg-white/5 border-transparent text-[var(--text-muted)]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold truncate text-[var(--text-main)]">{barrio.name}</span>
                        {barrio.highlight && (
                          <span className="w-2 h-2 rounded-full bg-[#E06D28] shrink-0" title="Activo"></span>
                        )}
                      </div>
                      <span className="text-[10px] block opacity-75 font-normal truncate">{barrio.desc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-[#E06D28] shrink-0 mt-0.5" />
                <div>
                  <strong>¿Cómo iluminar un barrio?</strong>
                  <p className="mt-0.5 text-xs text-[var(--text-muted)]">
                    Cada vez que guardás una ronda en ese barrio o tocás el botón <strong>"✓ Ya fui"</strong> en la ficha de un lugar, tu mapa sumará ese rincón automáticamente.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= PASO 3: INSIGNIAS Y NIVELES ================= */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="text-center sm:text-left">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 mb-3">
                  <Award className="w-3.5 h-3.5" />
                  <span>Reconocimiento</span>
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[var(--text-main)] leading-tight mb-2">
                  Insignias de Culto y Niveles<span className="text-[#E06D28]">.</span>
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  No es solo salir: es tener calle. Sumás logros reales según el tipo de planes que hacés y avanzás de nivel.
                </p>
              </div>

              {/* Grid con las 6 insignias */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: '☕', name: 'Cafés & Bares Clásicos', req: 'Cafeterías de culto y notables' },
                  { icon: '🍽️', name: 'Bodegones Porteños', req: 'Pastas, milanesas y parrillas' },
                  { icon: '🍸', name: 'Bares & Noche', req: 'Tragos de autor y vermuterías' },
                  { icon: '🎱', name: 'Juegos & Pool', req: 'El San Ber, bowling y fichines' },
                  { icon: '🏛️', name: 'Cultura & Libros', req: 'Museos, teatros y librerías' },
                  { icon: '🌳', name: 'Parques & Plazas', req: 'Espacios verdes y sol' }
                ].map((insignia, i) => (
                  <div key={i} className="ronda-card border rounded-2xl p-3.5 flex flex-col justify-between shadow-2xs">
                    <div>
                      <span className="text-2xl mb-1.5 block">{insignia.icon}</span>
                      <h4 className="text-xs font-bold text-[var(--text-main)] leading-tight">{insignia.name}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] mt-1">{insignia.req}</p>
                    </div>
                    <div className="mt-3 pt-2 border-t ronda-border flex items-center justify-between text-[10px] font-semibold text-[#E06D28]">
                      <span>Barra: 0/3</span>
                      <span>Desbloqueable</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Escala de niveles */}
              <div className="ronda-card-inner border rounded-2xl p-4">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block mb-2">
                  Los 4 Niveles de Calle Porteña
                </span>
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <span>🧭</span>
                    <span className="font-semibold">Nivel 1: Primeros Recorridos</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <span>🗺️</span>
                    <span className="font-semibold">Nivel 2: Explorador</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-[var(--text-muted)]">
                    <span>🥇</span>
                    <span className="font-semibold">Nivel 3: Conocedor</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" />
                  <div className="flex items-center gap-1.5 text-[#E06D28]">
                    <span>🏆</span>
                    <span className="font-bold">Nivel 4: Experto CABA</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= PASO 4: EMPEZAR SALIDA ================= */}
          {currentStep === 3 && (
            <div className="space-y-6 text-center sm:text-left animate-in fade-in duration-200">
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#182A24]/10 dark:bg-[#2A4B3D]/30 text-[#2A4B3D] dark:text-[#68B692] mb-3">
                  <Sparkles className="w-3.5 h-3.5 text-[#E06D28]" />
                  <span>Tu pasaporte está listo</span>
                </span>
                <h2 className="font-editorial text-3xl sm:text-4xl font-bold text-[var(--text-main)] leading-tight mb-2">
                  ¡Todo listo para salir a rodar<span className="text-[#E06D28]">!</span>
                </h2>
                <p className="text-sm sm:text-base text-[var(--text-muted)] leading-relaxed">
                  Ya sabés cómo funciona. Podés generar una salida espontánea en 1 clic o personalizar 
                  barrio, presupuesto y horarios exactos.
                </p>
              </div>

              {/* Tarjeta de estado del usuario */}
              <div className="ronda-card border rounded-2xl p-5 shadow-xs text-left">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#182A24] dark:bg-[#243B30] text-white flex items-center justify-center font-bold text-base shadow-xs shrink-0">
                    {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : <User className="w-6 h-6 text-white" />}
                  </div>
                  <div className="min-w-0">
                    <span className="text-[11px] font-bold text-[#E06D28] block">
                      {currentUser ? 'SESIÓN CONECTADA' : 'MODO EXPLORADOR'}
                    </span>
                    <h3 className="text-base font-bold text-[var(--text-main)] truncate">
                      {currentUser?.name || 'Viajero Porteño'}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)]">
                      Barrio base: <strong>{currentUser?.neighborhood || 'Buenos Aires'}</strong>
                    </p>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t ronda-border flex items-center justify-between text-xs text-[var(--text-muted)]">
                  <span>🗺️ Mapa: 0 / 11 barrios</span>
                  <span>🏅 Insignias: 0 / 6</span>
                  <span>Nivel 1</span>
                </div>
              </div>

              {/* Tips rápidos */}
              <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 text-xs text-left space-y-1.5 text-[var(--text-muted)]">
                <p>💡 <strong>Tip:</strong> Si tocás <em>"Armar ya"</em> en la pantalla principal, Ronda genera un plan adaptado a la hora y clima exactos de ahora mismo.</p>
                <p>💡 Podés volver a abrir esta guía en cualquier momento desde el menú lateral o desde tu perfil.</p>
              </div>
            </div>
          )}
        </div>

        {/* Barra de navegación inferior del modal */}
        <div className="p-5 sm:p-6 border-t ronda-border flex items-center justify-between gap-3 bg-[var(--bg-card)]/90 backdrop-blur-md rounded-b-3xl">
          {/* Bolitas indicadoras de paso */}
          <div className="flex items-center gap-1.5">
            {[0, 1, 2, 3].map((stepIdx) => (
              <button
                key={stepIdx}
                type="button"
                onClick={() => setCurrentStep(stepIdx)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === stepIdx
                    ? 'w-6 bg-[#E06D28]'
                    : 'w-2 bg-black/20 dark:bg-white/20 hover:bg-black/40 dark:hover:bg-white/40'
                }`}
                title={`Ir al paso ${stepIdx + 1}`}
                aria-label={`Ir al paso ${stepIdx + 1}`}
              />
            ))}
          </div>

          <div className="flex items-center gap-2.5">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2.5 rounded-xl border ronda-border text-[var(--text-main)] hover:bg-black/5 dark:hover:bg-white/10 font-semibold text-xs sm:text-sm transition flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="bg-[#182A24] dark:bg-[#243B30] hover:bg-[#223931] text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm shadow-md transition flex items-center gap-2 cursor-pointer glow-dore"
            >
              <span>{currentStep === totalSteps - 1 ? '¡Comenzar a rodar!' : 'Siguiente'}</span>
              <ArrowRight className="w-4 h-4 text-[#E06D28]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
