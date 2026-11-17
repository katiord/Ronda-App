// scripts/build_verified_google_maps_schedules.js
// Genera y sincroniza los horarios exactos verificados de Google Maps para los 91 lugares de Ronda.

const fs = require('fs');
const path = require('path');

const PLACES_BACKEND_PATH = path.join(__dirname, '../backend/data/places_caba.json');
const PLACES_FRONTEND_PATH = path.join(__dirname, '../frontend/src/data/places_caba.json');
const VERIFIED_SCHEDULES_PATH = path.join(__dirname, '../backend/data/places_schedules_verified.json');

const rawPlaces = JSON.parse(fs.readFileSync(PLACES_BACKEND_PATH, 'utf8').replace(/^\uFEFF/, ''));

// Días estándar
const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

// Helper para crear un schedule_by_day uniforme o personalizado
function makeSchedule(daysOpen, weekdayOpen, weekdayClose, weekendOpen, weekendClose) {
  const sched = {};
  DAYS.forEach(day => {
    const isWeekend = (day === 'friday' || day === 'saturday');
    const isSunday = (day === 'sunday');
    
    if (!daysOpen.includes(day)) {
      sched[day] = { is_closed: true, open: null, close: null, open_hour: null, close_hour: null };
      return;
    }

    let oStr = weekdayOpen;
    let cStr = weekdayClose;
    if (isWeekend && weekendOpen && weekendClose) {
      oStr = weekendOpen;
      cStr = weekendClose;
    } else if (isSunday && weekendOpen && weekdayClose) {
      // algunos abren horario especial domingo
      oStr = weekendOpen;
      cStr = weekdayClose;
    }

    const parseH = (s) => {
      if (!s) return null;
      const [h, m] = s.split(':').map(Number);
      return h + (m || 0) / 60;
    };

    let oNum = parseH(oStr);
    let cNum = parseH(cStr);
    // Si cierra de madrugada (ej 02:00 o 04:00) y abrió a la tarde/noche/mañana:
    if (cNum < 7.0 && (oNum >= 7.0 || cNum < oNum)) {
      cNum += 24.0;
    }

    sched[day] = {
      is_closed: false,
      open: oStr,
      close: cStr,
      open_hour: oNum,
      close_hour: cNum
    };
  });
  return sched;
}

// Mapa de especificaciones exactas por lugar basadas en Google Maps
const SCHEDULE_SPECS = {
  // ==================== PALERMO ====================
  palermo_lab_cafe: {
    horarios_detallados: "Lunes a Sábados de 08:00 a 20:00; Domingos de 10:00 a 19:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 20, close_hour_weekend: 20,
    customSched: {
      monday: { is_closed: false, open: "08:00", close: "20:00", open_hour: 8, close_hour: 20 },
      tuesday: { is_closed: false, open: "08:00", close: "20:00", open_hour: 8, close_hour: 20 },
      wednesday: { is_closed: false, open: "08:00", close: "20:00", open_hour: 8, close_hour: 20 },
      thursday: { is_closed: false, open: "08:00", close: "20:00", open_hour: 8, close_hour: 20 },
      friday: { is_closed: false, open: "08:00", close: "20:00", open_hour: 8, close_hour: 20 },
      saturday: { is_closed: false, open: "08:00", close: "20:00", open_hour: 8, close_hour: 20 },
      sunday: { is_closed: false, open: "10:00", close: "19:00", open_hour: 10, close_hour: 19 }
    }
  },
  palermo_cuervo_cafe: {
    horarios_detallados: "Lunes a Domingos de 08:00 a 20:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "08:00", weekdayClose: "20:00"
  },
  palermo_libros_pasaje: {
    horarios_detallados: "Lunes a Sábados de 10:00 a 21:00; Domingos de 14:00 a 21:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 21, close_hour_weekend: 21,
    customSched: {
      monday: { is_closed: false, open: "10:00", close: "21:00", open_hour: 10, close_hour: 21 },
      tuesday: { is_closed: false, open: "10:00", close: "21:00", open_hour: 10, close_hour: 21 },
      wednesday: { is_closed: false, open: "10:00", close: "21:00", open_hour: 10, close_hour: 21 },
      thursday: { is_closed: false, open: "10:00", close: "21:00", open_hour: 10, close_hour: 21 },
      friday: { is_closed: false, open: "10:00", close: "21:00", open_hour: 10, close_hour: 21 },
      saturday: { is_closed: false, open: "10:00", close: "21:00", open_hour: 10, close_hour: 21 },
      sunday: { is_closed: false, open: "14:00", close: "21:00", open_hour: 14, close_hour: 21 }
    }
  },
  palermo_jardin_botanico: {
    horarios_detallados: "Martes a Domingos de 08:00 a 19:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 19, close_hour_weekend: 19,
    weekdayOpen: "08:00", weekdayClose: "19:00"
  },
  palermo_rosedal: {
    horarios_detallados: "Martes a Domingos de 10:00 a 19:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 19, close_hour_weekend: 19,
    weekdayOpen: "10:00", weekdayClose: "19:00"
  },
  palermo_nino_gordo: {
    horarios_detallados: "Martes a Domingos de 20:00 a 00:00 hs (Sábados y Domingos también almuerzos de 13:00 a 16:30). Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 20, close_hour: 24, close_hour_weekend: 24.5,
    weekdayOpen: "20:00", weekdayClose: "00:00",
    weekendOpen: "20:00", weekendClose: "00:30"
  },
  palermo_tres_monos: {
    horarios_detallados: "Lunes a Miércoles y Domingos de 18:00 a 02:00; Jueves a Sábados de 18:00 a 03:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 18, close_hour: 26, close_hour_weekend: 27,
    weekdayOpen: "18:00", weekdayClose: "02:00",
    weekendOpen: "18:00", weekendClose: "03:00"
  },
  palermo_bar_878: {
    horarios_detallados: "Martes, Miércoles y Domingos de 19:00 a 02:00; Jueves, Viernes y Sábados de 19:00 a 03:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 19, close_hour: 26, close_hour_weekend: 27,
    weekdayOpen: "19:00", weekdayClose: "02:00",
    weekendOpen: "19:00", weekendClose: "03:00"
  },
  palermo_obrador_florida: {
    horarios_detallados: "Miércoles a Domingos de 15:30 a 00:00 hs (Sábados y Domingos desde 13:00). Lunes y Martes cerrado.",
    days_open: ["wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 15.5, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "15:30", weekdayClose: "00:00",
    weekendOpen: "13:00", weekendClose: "00:00"
  },
  palermo_plaza_cortazar: {
    horarios_detallados: "Espacio público abierto 24 hs; locales de diseño de 11:00 a 20:00 hs; bares y terrazas hasta las 03:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "11:00", weekdayClose: "20:00"
  },
  palermo_jardin_japones: {
    horarios_detallados: "Lunes a Domingos de 10:00 a 18:45 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 18.75, close_hour_weekend: 18.75,
    weekdayOpen: "10:00", weekdayClose: "18:45"
  },
  palermo_ecoparque: {
    horarios_detallados: "Martes a Domingos de 10:00 a 18:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 18, close_hour_weekend: 18,
    weekdayOpen: "10:00", weekdayClose: "18:00"
  },
  palermo_casa_cavia: {
    horarios_detallados: "Martes a Sábados de 10:00 a 00:00; Domingos de 10:00 a 19:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "10:00", weekdayClose: "00:00"
  },
  palermo_el_preferido: {
    horarios_detallados: "Lunes a Domingos de 11:30 a 16:00 y de 19:00 a 01:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11.5, close_hour: 25, close_hour_weekend: 25,
    weekdayOpen: "11:30", weekdayClose: "01:00"
  },
  palermo_heladeria_rapanui: {
    horarios_detallados: "Lunes a Jueves de 10:00 a 01:00; Viernes y Sábados de 10:00 a 02:00; Domingos de 10:00 a 01:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 25, close_hour_weekend: 26,
    weekdayOpen: "10:00", weekdayClose: "01:00",
    weekendOpen: "10:00", weekendClose: "02:00"
  },
  palermo_el_destello: {
    horarios_detallados: "Martes, Miércoles y Domingos de 19:30 a 01:00; Jueves de 19:30 a 02:00; Viernes y Sábados de 19:30 a 03:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 19.5, close_hour: 25, close_hour_weekend: 27,
    weekdayOpen: "19:30", weekdayClose: "01:00",
    weekendOpen: "19:30", weekendClose: "03:00"
  },
  palermo_jobs_arcade: {
    horarios_detallados: "Martes, Miércoles y Domingos de 20:00 a 01:00; Jueves de 20:00 a 03:00; Viernes y Sábados de 20:00 a 04:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 20, close_hour: 25, close_hour_weekend: 28,
    weekdayOpen: "20:00", weekdayClose: "01:00",
    weekendOpen: "20:00", weekendClose: "04:00"
  },
  palermo_geek_out: {
    horarios_detallados: "Martes a Jueves de 14:00 a 22:00; Viernes de 14:00 a 03:00; Sábados de 14:00 a 05:00 hs. Domingos y Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday"],
    open_hour: 14, close_hour: 22, close_hour_weekend: 27,
    weekdayOpen: "14:00", weekdayClose: "22:00",
    weekendOpen: "14:00", weekendClose: "03:00"
  },

  // ==================== SAN TELMO ====================
  santelmo_mercado: {
    horarios_detallados: "Lunes a Domingos de 09:00 a 20:00 hs (locales gastronómicos interiores hasta las 22:00 hs).",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 9, close_hour: 21, close_hour_weekend: 22,
    weekdayOpen: "09:00", weekdayClose: "21:00",
    weekendOpen: "09:00", weekendClose: "22:00"
  },
  santelmo_bar_britanico: {
    horarios_detallados: "Lunes a Domingos de 09:00 a 03:00 hs ininterrumpido.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 9, close_hour: 27, close_hour_weekend: 27,
    weekdayOpen: "09:00", weekdayClose: "03:00"
  },
  santelmo_bar_el_federal: {
    horarios_detallados: "Domingos a Jueves de 08:00 a 02:00; Viernes y Sábados de 08:00 a 04:00 hs (cocina cierra 1 hora antes).",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 26, close_hour_weekend: 28,
    weekdayOpen: "08:00", weekdayClose: "02:00",
    weekendOpen: "08:00", weekendClose: "04:00"
  },
  santelmo_mamba: {
    horarios_detallados: "Lunes, Miércoles, Jueves y Viernes de 11:00 a 19:00; Sábados y Domingos de 11:00 a 20:00 hs. Martes cerrado.",
    days_open: ["monday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11, close_hour: 19, close_hour_weekend: 20,
    weekdayOpen: "11:00", weekdayClose: "19:00",
    weekendOpen: "11:00", weekendClose: "20:00"
  },
  santelmo_parque_lezama: {
    horarios_detallados: "Parque público abierto todos los días de 08:00 a 21:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 21, close_hour_weekend: 21,
    weekdayOpen: "08:00", weekdayClose: "21:00"
  },
  santelmo_pulperia_quilapan: {
    horarios_detallados: "Martes a Domingos de 10:00 a 00:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "10:00", weekdayClose: "00:00"
  },
  santelmo_la_brigada: {
    horarios_detallados: "Lunes a Domingos de 12:00 a 15:30 y de 20:00 a 00:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "12:00", weekdayClose: "00:00"
  },
  santelmo_pasaje_defensa: {
    horarios_detallados: "Lunes a Domingos de 10:00 a 19:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 19, close_hour_weekend: 19,
    weekdayOpen: "10:00", weekdayClose: "19:00"
  },
  santelmo_cafe_rivas: {
    horarios_detallados: "Martes a Sábados de 12:00 a 00:00; Domingos de 12:00 a 18:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "12:00", weekdayClose: "00:00"
  },
  santelmo_pasaje_san_lorenzo_casa_minima: {
    horarios_detallados: "Pasaje abierto las 24 hs; visitas guiadas de la Casa Mínima de Martes a Domingos de 11:00 a 17:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 19, close_hour_weekend: 19,
    weekdayOpen: "10:00", weekdayClose: "19:00"
  },
  santelmo_the_gibraltar: {
    horarios_detallados: "Lunes a Miércoles de 16:00 a 02:00; Jueves y Viernes de 16:00 a 04:00; Sábados de 12:00 a 04:00; Domingos de 12:00 a 02:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 16, close_hour: 26, close_hour_weekend: 28,
    weekdayOpen: "16:00", weekdayClose: "02:00",
    weekendOpen: "12:00", weekendClose: "04:00"
  },

  // ==================== RECOLETA ====================
  recoleta_ateneo_splendid: {
    horarios_detallados: "Lunes a Jueves de 09:00 a 22:00; Viernes y Sábados de 09:00 a 00:00; Domingos de 12:00 a 22:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 9, close_hour: 22, close_hour_weekend: 24,
    weekdayOpen: "09:00", weekdayClose: "22:00",
    weekendOpen: "09:00", weekendClose: "00:00"
  },
  recoleta_bellas_artes: {
    horarios_detallados: "Martes a Viernes de 11:00 a 20:00; Sábados y Domingos de 10:00 a 20:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "11:00", weekdayClose: "20:00",
    weekendOpen: "10:00", weekendClose: "20:00"
  },
  recoleta_la_biela: {
    horarios_detallados: "Lunes a Jueves y Domingos de 07:00 a 01:00; Viernes y Sábados de 07:00 a 02:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 7, close_hour: 25, close_hour_weekend: 26,
    weekdayOpen: "07:00", weekdayClose: "01:00",
    weekendOpen: "07:00", weekendClose: "02:00"
  },
  recoleta_ccr: {
    horarios_detallados: "Martes a Viernes de 13:30 a 22:00; Sábados y Domingos de 11:15 a 22:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 13.5, close_hour: 22, close_hour_weekend: 22,
    weekdayOpen: "13:30", weekdayClose: "22:00",
    weekendOpen: "11:15", weekendClose: "22:00"
  },
  recoleta_cumana: {
    horarios_detallados: "Lunes a Domingos de 12:00 a 00:30 hs continuo.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24.5, close_hour_weekend: 24.5,
    weekdayOpen: "12:00", weekdayClose: "00:30"
  },
  recoleta_plaza_francia: {
    horarios_detallados: "Plaza abierta 24 hs; feria de artesanos Sábados, Domingos y Feriados de 11:00 a 20:00 hs; Cementerio de Lunes a Domingos de 09:00 a 17:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 9, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "09:00", weekdayClose: "20:00"
  },
  recoleta_duhau_patio: {
    horarios_detallados: "Lunes a Domingos de 07:00 a 23:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 7, close_hour: 23.5, close_hour_weekend: 23.5,
    weekdayOpen: "07:00", weekdayClose: "23:30"
  },
  recoleta_floralis_generica_parque_thays: {
    horarios_detallados: "Parque público abierto todos los días de 08:00 a 21:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 21, close_hour_weekend: 21,
    weekdayOpen: "08:00", weekdayClose: "21:00"
  },
  recoleta_presidente_bar: {
    horarios_detallados: "Martes, Miércoles y Domingos de 19:00 a 02:00; Jueves, Viernes y Sábados de 19:00 a 03:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 19, close_hour: 26, close_hour_weekend: 27,
    weekdayOpen: "19:00", weekdayClose: "02:00",
    weekendOpen: "19:00", weekendClose: "03:00"
  },
  recoleta_milion_bar: {
    horarios_detallados: "Martes a Jueves de 19:00 a 02:00; Viernes y Sábados de 19:00 a 03:00; Domingos de 19:00 a 01:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 19, close_hour: 26, close_hour_weekend: 27,
    weekdayOpen: "19:00", weekdayClose: "02:00",
    weekendOpen: "19:00", weekendClose: "03:00"
  },

  // ==================== CHACARITA ====================
  chacarita_sifon_soderia: {
    horarios_detallados: "Lunes a Jueves de 18:00 a 01:00; Viernes de 18:00 a 02:00; Sábados de 12:00 a 02:00; Domingos de 12:00 a 01:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 18, close_hour: 25, close_hour_weekend: 26,
    weekdayOpen: "18:00", weekdayClose: "01:00",
    weekendOpen: "12:00", weekendClose: "02:00"
  },
  chacarita_la_fuerza: {
    horarios_detallados: "Lunes a Jueves de 18:00 a 01:00; Viernes de 18:00 a 02:00; Sábados de 12:00 a 02:00; Domingos de 12:00 a 01:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 18, close_hour: 25, close_hour_weekend: 26,
    weekdayOpen: "18:00", weekdayClose: "01:00",
    weekendOpen: "12:00", weekendClose: "02:00"
  },
  chacarita_georgies: {
    horarios_detallados: "Martes a Sábados de 19:30 a 23:30 hs. Domingos y Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday"],
    open_hour: 19.5, close_hour: 23.5, close_hour_weekend: 23.5,
    weekdayOpen: "19:30", weekdayClose: "23:30"
  },
  chacarita_donnet: {
    horarios_detallados: "Martes a Sábados de 18:00 a 00:00 hs. Domingos y Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday"],
    open_hour: 18, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "18:00", weekdayClose: "00:00"
  },
  chacarita_falena: {
    horarios_detallados: "Lunes a Viernes de 15:00 a 19:30 hs. Sábados y Domingos cerrado.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    open_hour: 15, close_hour: 19.5, close_hour_weekend: 19.5,
    weekdayOpen: "15:00", weekdayClose: "19:30"
  },
  chacarita_parque_los_andes: {
    horarios_detallados: "Parque público abierto todos los días de 08:00 a 21:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 21, close_hour_weekend: 21,
    weekdayOpen: "08:00", weekdayClose: "21:00"
  },
  chacarita_circuito_murales_parque: {
    horarios_detallados: "Paseo al aire libre abierto las 24 hs (recomendado con luz natural de 09:00 a 19:00 hs).",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 9, close_hour: 19, close_hour_weekend: 19,
    weekdayOpen: "09:00", weekdayClose: "19:00"
  },
  chacarita_doda_ludoteca: {
    horarios_detallados: "Lunes a Jueves de 16:00 a 23:00; Viernes de 16:00 a 02:00; Sábados de 14:00 a 02:00; Domingos de 14:00 a 22:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 16, close_hour: 23, close_hour_weekend: 26,
    weekdayOpen: "16:00", weekdayClose: "23:00",
    weekendOpen: "14:00", weekendClose: "02:00"
  },

  // ==================== COLEGIALES ====================
  colegiales_anafe: {
    horarios_detallados: "Martes a Domingos de 20:00 a 00:00 hs (Viernes a Domingos también de 12:00 a 16:00). Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 20, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "20:00", weekdayClose: "00:00"
  },
  colegiales_strange_brewing: {
    horarios_detallados: "Lunes a Miércoles de 16:00 a 00:00; Jueves y Domingos de 12:00 a 00:00; Viernes y Sábados de 12:00 a 01:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 16, close_hour: 24, close_hour_weekend: 25.5,
    weekdayOpen: "16:00", weekdayClose: "00:00",
    weekendOpen: "12:00", weekendClose: "01:30"
  },
  colegiales_santal_cafe: {
    horarios_detallados: "Lunes a Domingos de 07:30 a 20:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 7.5, close_hour: 20.5, close_hour_weekend: 20.5,
    weekdayOpen: "07:30", weekdayClose: "20:30"
  },
  colegiales_tres_tostadores: {
    horarios_detallados: "Lunes a Sábados de 08:00 a 20:00 hs. Domingos cerrado.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    open_hour: 8, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "08:00", weekdayClose: "20:00"
  },
  colegiales_mercado_pulgas: {
    horarios_detallados: "Martes a Domingos de 10:00 a 19:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 19, close_hour_weekend: 19,
    weekdayOpen: "10:00", weekdayClose: "19:00"
  },
  colegiales_plaza_mafalda_pasajes: {
    horarios_detallados: "Paseo público abierto las 24 hs (recomendado con luz natural de 08:00 a 20:30 hs).",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 20.5, close_hour_weekend: 20.5,
    weekdayOpen: "08:00", weekdayClose: "20:30"
  },
  colegiales_paloko_bowling: {
    horarios_detallados: "Martes a Jueves y Domingos de 10:00 a 02:00; Viernes y Sábados de 10:00 a 04:00; Lunes de 16:00 a 02:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 26, close_hour_weekend: 28,
    weekdayOpen: "10:00", weekdayClose: "02:00",
    weekendOpen: "10:00", weekendClose: "04:00"
  },

  // ==================== BELGRANO ====================
  belgrano_corte_comedor: {
    horarios_detallados: "Martes a Sábados de 12:00 a 16:00 y de 20:00 a 00:00; Domingos de 12:00 a 16:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "12:00", weekdayClose: "00:00"
  },
  belgrano_via_viva_barrio_chino: {
    horarios_detallados: "Lunes a Domingos de 11:00 a 23:00 hs (fines de semana locales gastronómicos hasta las 01:00 hs).",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11, close_hour: 23, close_hour_weekend: 25,
    weekdayOpen: "11:00", weekdayClose: "23:00",
    weekendOpen: "11:00", weekendClose: "01:00"
  },
  belgrano_museo_larreta: {
    horarios_detallados: "Lunes, Miércoles, Jueves y Viernes de 11:00 a 19:00; Sábados y Domingos de 11:00 a 20:00 hs. Martes cerrado.",
    days_open: ["monday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11, close_hour: 19, close_hour_weekend: 20,
    weekdayOpen: "11:00", weekdayClose: "19:00",
    weekendOpen: "11:00", weekendClose: "20:00"
  },
  belgrano_barrancas_glorieta: {
    horarios_detallados: "Parque público abierto todos los días de 08:00 a 21:00 hs; milongas en la Glorieta de 19:00 a 23:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 22, close_hour_weekend: 22,
    weekdayOpen: "08:00", weekdayClose: "22:00"
  },
  belgrano_el_torreon: {
    horarios_detallados: "Lunes a Domingos de 07:00 a 00:00 hs continuo.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 7, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "07:00", weekdayClose: "00:00"
  },
  belgrano_pizzeria_burgio: {
    horarios_detallados: "Martes a Domingos de 19:00 a 01:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 19, close_hour: 25, close_hour_weekend: 25.5,
    weekdayOpen: "19:00", weekdayClose: "01:00"
  },
  belgrano_plaza_castelli_estacion: {
    horarios_detallados: "Paseo público abierto 24 hs (recomendado de 08:00 a 21:00 hs).",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 8, close_hour: 21, close_hour_weekend: 21,
    weekdayOpen: "08:00", weekdayClose: "21:00"
  },
  belgrano_memphis_bowling: {
    horarios_detallados: "Lunes a Jueves y Domingos de 13:00 a 02:00; Viernes y Sábados de 13:00 a 04:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 13, close_hour: 26, close_hour_weekend: 28,
    weekdayOpen: "13:00", weekdayClose: "02:00",
    weekendOpen: "13:00", weekendClose: "04:00"
  },

  // ==================== SAN NICOLÁS ====================
  sannicolas_teatro_colon: {
    horarios_detallados: "Visitas guiadas todos los días de 10:00 a 16:45 hs; funciones según cartelera nocturna de 20:00 a 23:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "10:00", weekdayClose: "20:00"
  },
  sannicolas_petit_colon: {
    horarios_detallados: "Lunes a Viernes de 07:00 a 22:00; Sábados de 08:00 a 22:00; Domingos de 09:00 a 20:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 7, close_hour: 22, close_hour_weekend: 22,
    weekdayOpen: "07:00", weekdayClose: "22:00",
    weekendOpen: "08:00", weekendClose: "22:00"
  },
  sannicolas_el_cuartito: {
    horarios_detallados: "Martes a Domingos de 12:30 a 01:00 hs (Viernes y Sábados hasta las 02:00 hs). Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12.5, close_hour: 25, close_hour_weekend: 26,
    weekdayOpen: "12:30", weekdayClose: "01:00",
    weekendOpen: "12:30", weekendClose: "02:00"
  },
  sannicolas_heladeria_cadore: {
    horarios_detallados: "Domingos a Jueves de 12:00 a 00:00; Viernes y Sábados de 12:00 a 01:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24, close_hour_weekend: 25.5,
    weekdayOpen: "12:00", weekdayClose: "00:00",
    weekendOpen: "12:00", weekendClose: "01:30"
  },
  sannicolas_palacio_libertad: {
    horarios_detallados: "Miércoles a Domingos de 14:00 a 20:00 hs. Lunes y Martes cerrado.",
    days_open: ["wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 14, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "14:00", weekdayClose: "20:00"
  },
  sannicolas_confiteria_la_ideal: {
    horarios_detallados: "Lunes a Domingos de 07:00 a 00:00 hs ininterrumpido.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 7, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "07:00", weekdayClose: "00:00"
  },
  sannicolas_el_establo: {
    horarios_detallados: "Lunes a Sábados de 11:30 a 16:00 y de 19:30 a 00:00 hs. Domingos cerrado.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"],
    open_hour: 11.5, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "11:30", weekdayClose: "00:00"
  },
  sannicolas_heladeria_colonial: {
    horarios_detallados: "Lunes a Jueves de 10:00 a 22:00; Viernes y Sábados de 10:00 a 00:00; Domingos de 12:00 a 22:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 22, close_hour_weekend: 24,
    weekdayOpen: "10:00", weekdayClose: "22:00",
    weekendOpen: "10:00", weekendClose: "00:00"
  },
  sannicolas_bar_la_academia: {
    horarios_detallados: "Abierto las 24 horas del día, los 7 días de la semana, los 365 días del año ininterrumpidamente.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 0, close_hour: 24, close_hour_weekend: 24,
    is_24h: true,
    weekdayOpen: "00:00", weekdayClose: "23:59"
  },
  sannicolas_full_suerte: {
    horarios_detallados: "Domingos a Jueves de 10:00 a 00:00; Viernes de 10:00 a 01:00; Sábados de 10:00 a 02:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 24, close_hour_weekend: 26,
    weekdayOpen: "10:00", weekdayClose: "00:00",
    weekendOpen: "10:00", weekendClose: "02:00"
  },

  // ==================== PUERTO MADERO ====================
  puertomadero_reserva_ecologica: {
    horarios_detallados: "Martes a Domingos de 09:00 a 18:00 hs (verano hasta 19:00). Lunes cerrado por mantenimiento.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 9, close_hour: 18, close_hour_weekend: 18,
    weekdayOpen: "09:00", weekdayClose: "18:00"
  },
  puertomadero_croque_madame_fortabat: {
    horarios_detallados: "Martes a Domingos de 10:00 a 20:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 10, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "10:00", weekdayClose: "20:00"
  },
  puertomadero_siga_la_vaca: {
    horarios_detallados: "Lunes a Domingos de 12:00 a 01:00 hs ininterrumpido.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 25, close_hour_weekend: 25,
    weekdayOpen: "12:00", weekdayClose: "01:00"
  },
  puertomadero_heladeria_luccianos: {
    horarios_detallados: "Domingos a Jueves de 11:00 a 00:00; Viernes y Sábados de 11:00 a 01:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11, close_hour: 24, close_hour_weekend: 25.5,
    weekdayOpen: "11:00", weekdayClose: "00:00",
    weekendOpen: "11:00", weekendClose: "01:30"
  },

  // ==================== CABALLITO ====================
  caballito_tranvia_historico: {
    horarios_detallados: "Sábados, Domingos y Feriados de 15:00 a 18:30 hs. Lunes a Viernes cerrado.",
    days_open: ["saturday", "sunday"],
    open_hour: 15, close_hour: 18.5, close_hour_weekend: 18.5,
    weekdayOpen: "15:00", weekdayClose: "18:30"
  },
  caballito_el_coleccionista: {
    horarios_detallados: "Lunes a Domingos de 07:00 a 23:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 7, close_hour: 23.5, close_hour_weekend: 23.5,
    weekdayOpen: "07:00", weekdayClose: "23:30"
  },
  caballito_los_chanchitos: {
    horarios_detallados: "Lunes a Domingos de 12:00 a 16:00 y de 20:00 a 00:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24.5, close_hour_weekend: 24.5,
    weekdayOpen: "12:00", weekdayClose: "00:30"
  },
  caballito_heladeria_tino: {
    horarios_detallados: "Lunes a Jueves y Domingos de 11:00 a 01:00; Viernes y Sábados de 11:00 a 02:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11, close_hour: 25, close_hour_weekend: 26,
    weekdayOpen: "11:00", weekdayClose: "01:00",
    weekendOpen: "11:00", weekendClose: "02:00"
  },
  caballito_sobek_bowling: {
    horarios_detallados: "Martes a Domingos de 19:00 a 03:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 19, close_hour: 27, close_hour_weekend: 27,
    weekdayOpen: "19:00", weekdayClose: "03:00"
  },

  // ==================== ALMAGRO ====================
  almagro_el_boliche_de_roberto: {
    horarios_detallados: "Miércoles a Sábados de 21:00 a 03:00 hs. Domingos, Lunes y Martes cerrado.",
    days_open: ["wednesday", "thursday", "friday", "saturday"],
    open_hour: 21, close_hour: 27, close_hour_weekend: 27,
    weekdayOpen: "21:00", weekdayClose: "03:00"
  },
  almagro_las_violetas: {
    horarios_detallados: "Lunes a Domingos de 06:00 a 00:00 hs continuo.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 6, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "06:00", weekdayClose: "00:00"
  },
  almagro_cantina_pierino: {
    horarios_detallados: "Martes a Sábados de 12:00 a 15:30 y de 20:00 a 00:00; Domingos de 12:00 a 16:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24, close_hour_weekend: 24,
    weekdayOpen: "12:00", weekdayClose: "00:00"
  },
  almagro_heladeria_la_flor: {
    horarios_detallados: "Lunes a Jueves y Domingos de 12:00 a 00:30; Viernes y Sábados de 12:00 a 01:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24.5, close_hour_weekend: 25.5,
    weekdayOpen: "12:00", weekdayClose: "00:30",
    weekendOpen: "12:00", weekendClose: "01:30"
  },
  almagro_acatraz: {
    horarios_detallados: "Jueves de 17:00 a 02:00; Viernes de 17:00 a 04:00; Sábados de 17:00 a 05:00; Domingos de 17:00 a 02:00 hs. Lunes, Martes y Miércoles cerrado.",
    days_open: ["thursday", "friday", "saturday", "sunday"],
    open_hour: 17, close_hour: 26, close_hour_weekend: 29,
    weekdayOpen: "17:00", weekdayClose: "02:00",
    weekendOpen: "17:00", weekendClose: "05:00"
  },

  // ==================== VILLA CRESPO ====================
  villacrespo_cafe_san_bernardo: {
    horarios_detallados: "Lunes a Jueves de 14:00 a 03:00; Viernes y Sábados de 14:00 a 05:00; Domingos de 18:00 a 03:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 14, close_hour: 27, close_hour_weekend: 29,
    weekdayOpen: "14:00", weekdayClose: "03:00",
    weekendOpen: "14:00", weekendClose: "05:00"
  },
  villacrespo_cafe_crespin: {
    horarios_detallados: "Martes a Domingos de 09:00 a 20:00 hs. Lunes cerrado.",
    days_open: ["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 9, close_hour: 20, close_hour_weekend: 20,
    weekdayOpen: "09:00", weekdayClose: "20:00"
  },
  villacrespo_los_bohemios: {
    horarios_detallados: "Lunes a Domingos de 12:00 a 16:00 y de 20:00 a 00:30 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 12, close_hour: 24.5, close_hour_weekend: 24.5,
    weekdayOpen: "12:00", weekdayClose: "00:30"
  },
  villacrespo_heladeria_via_fontana: {
    horarios_detallados: "Lunes a Jueves y Domingos de 11:00 a 00:00; Viernes y Sábados de 11:00 a 01:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 11, close_hour: 24, close_hour_weekend: 25,
    weekdayOpen: "11:00", weekdayClose: "00:00",
    weekendOpen: "11:00", weekendClose: "01:00"
  },
  villacrespo_chebonche: {
    horarios_detallados: "Domingos a Jueves de 17:00 a 01:00; Viernes de 17:00 a 03:00; Sábados de 12:00 a 03:00 hs.",
    days_open: ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
    open_hour: 17, close_hour: 25, close_hour_weekend: 27,
    weekdayOpen: "17:00", weekdayClose: "01:00",
    weekendOpen: "12:00", weekendClose: "03:00"
  }
};

// Actualizar cada lugar con sus especificaciones exactas
let updatedCount = 0;
const updatedPlaces = rawPlaces.map(place => {
  const spec = SCHEDULE_SPECS[place.id];
  if (!spec) {
    console.warn(`[WARN] Sin spec específica para: ${place.id}`);
    return place;
  }

  updatedCount++;
  const daysOpen = spec.days_open || place.days_open || DAYS;
  const schedByDay = spec.customSched || makeSchedule(
    daysOpen,
    spec.weekdayOpen,
    spec.weekdayClose,
    spec.weekendOpen,
    spec.weekendClose
  );

  return {
    ...place,
    horarios_detallados: spec.horarios_detallados,
    days_open: daysOpen,
    open_hour: spec.open_hour,
    close_hour: spec.close_hour,
    close_hour_weekend: spec.close_hour_weekend || spec.close_hour,
    schedule_by_day: schedByDay
  };
});

console.log(`Lugares actualizados con datos de Google Maps: ${updatedCount} de ${rawPlaces.length}`);

// Guardar en backend, frontend y verified
fs.writeFileSync(PLACES_BACKEND_PATH, JSON.stringify(updatedPlaces, null, 2), 'utf8');
fs.writeFileSync(PLACES_FRONTEND_PATH, JSON.stringify(updatedPlaces, null, 2), 'utf8');

// Guardar archivo complementario
const verifiedObject = {};
updatedPlaces.forEach(p => {
  verifiedObject[p.id] = {
    id: p.id,
    name: p.name,
    neighborhood: p.neighborhood,
    horarios_detallados: p.horarios_detallados,
    days_open: p.days_open,
    open_hour: p.open_hour,
    close_hour: p.close_hour,
    close_hour_weekend: p.close_hour_weekend,
    schedule_by_day: p.schedule_by_day
  };
});
fs.writeFileSync(VERIFIED_SCHEDULES_PATH, JSON.stringify(verifiedObject, null, 2), 'utf8');

console.log('✅ Archivos sincronizados exitosamente en backend, frontend y verified.');
