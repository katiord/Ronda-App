// Catálogo Curado de Experiencias, Actividades y Qué Hacer por Barrio en CABA
// Fuentes: BA Cultura, Festivales BA, Turismo Ciudad de Buenos Aires

export const BARRIO_GUIDES = {
  'San Telmo': {
    name: 'San Telmo',
    tagline: 'Adoquines, anticuarios & espíritu bohemio',
    vibe: 'El corazón histórico de Buenos Aires. Calles empedradas, faroles coloniales, bares notables centenarios y la feria de antigüedades más famosa del país.',
    coverPhoto: '/places/santelmo_bar_el_federal.jpg',
    whatToDo: [
      {
        id: 'feria_san_telmo',
        isHero: true,
        title: 'Feria de Antigüedades & Calle Defensa Peatonal',
        category: 'feria',
        badge: 'Domingos Clásicos',
        days: 'Domingos de 10:00 a 18:00 hs',
        location: 'Plaza Dorrego & Calle Defensa (peatonal)',
        photo: '/actividades/feria_san_telmo.jpg',
        fallbackPhoto: '/places/santelmo_mercado.jpg',
        isFree: true,
        weather: 'outdoor', // se suspende por lluvia intensa
        description: 'El clásico indiscutido del domingo porteño. Cientos de puestos de reliquias, vajilla antigua, juguetes retro, bailarines de tango a la gorra y músicos callejeros a lo largo de 10 cuadras.',
        tips: 'Llegá cerca de las 11:30 hs para caminar con calma y rematar con un vermut en Plaza Dorrego.',
        startingPlaceId: 'santelmo_mercado'
      },
      
      {
        id: 'pasajes_san_telmo',
        isHero: false,
        title: 'Ruta de Pasajes Coloniales & Casa Mínima',
        category: 'paseo',
        badge: 'Patrimonio Oculto',
        days: 'Todos los días (ideal de día)',
        location: 'Pasaje San Lorenzo 380 & Pasaje de la Defensa',
        photo: '/actividades/ateneo_splendid.jpg',
        fallbackPhoto: '/places/santelmo_pasaje_san_lorenzo_casa_minima.jpg',
        isFree: true,
        weather: 'indoor', // patios cubiertos y veredas históricas
        description: 'Recorrido por la Casa Mínima (con solo 2,5 metros de frente, la más angosta de la ciudad) y el Pasaje de la Defensa, una antigua casona señorial de 1880 reconvertida en patio de anticuarios.',
        tips: 'Entrá al patio interno de los Ezeiza para sacar fotos con luz natural a la galería de hierro.',
        startingPlaceId: 'santelmo_pasaje_defensa'
      }
    ],
    top3PlaceIds: ['santelmo_bar_el_federal', 'santelmo_cafe_rivas', 'santelmo_mamba']
  },

  'Palermo': {
    name: 'Palermo',
    tagline: 'Diseño, gastronomía de culto & pulmones verdes',
    vibe: 'El epicentro del diseño independiente, las cafeterías de especialidad y la coctelería premiada a nivel mundial, abrazado por los lagos y parques más amplios de CABA.',
    coverPhoto: '/places/palermo_plaza_cortazar.jpg',
    whatToDo: [
      {
        id: 'feria_plaza_serrano',
        isHero: true,
        title: 'Feria de Diseño & Arte en Plaza Cortázar (Serrano)',
        category: 'feria',
        badge: 'Fines de Semana',
        days: 'Sábados, domingos y feriados de 11:00 a 20:00 hs',
        location: 'Honduras y Serrano (Plaza Cortázar)',
        photo: '/actividades/feria_plaza_serrano.jpg',
        fallbackPhoto: '/places/palermo_plaza_cortazar.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'Diseño de autor, indumentaria independiente, accesorios y arte plástico en el corazón de Palermo Soho. Los bares y cafés de alrededor abren sus terrazas y veredas.',
        tips: 'Ideal para combinar a media tarde con un café de especialidad a la vuelta.',
        startingPlaceId: 'palermo_plaza_cortazar'
      },
      {
        id: 'ecoparque_palermo',
        isHero: false,
        title: 'Paseo Patrimonial & Senderos del Ecoparque',
        category: 'paseo',
        badge: 'Cultura Abierta',
        days: 'Martes a Domingos y Feriados de 10:00 a 18:00 hs',
        location: 'Av. Sarmiento y Av. Las Heras (Plaza Italia)',
        photo: '/actividades/jardin_botanico.jpg',
        fallbackPhoto: '/places/palermo_jardin_botanico.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'El predio patrimonial recuperado con edificios victorianos restaurados, fuentes francesas, senderos arbolados y animales autóctonos libres.',
        tips: 'Ingreso gratuito directo por Plaza Italia. Ideal para caminar al sol antes de almorzar en Palermo Soho.',
        startingPlaceId: 'palermo_jardin_botanico'
      },
      {
        id: 'jardin_botanico',
        isHero: false,
        title: 'Visitas Guiadas & Mariposario en el Botánico',
        category: 'cultura',
        badge: 'Cultura Abierta',
        days: 'Sábados y domingos: visitas a las 10:30 h y 15:00 h',
        location: 'Av. Santa Fe 3951 (Plaza Italia)',
        photo: '/actividades/jardin_botanico.jpg',
        fallbackPhoto: '/places/palermo_jardin_botanico.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'Patrimonio histórico de la Ciudad con más de 5.000 especies vegetales, invernaderos franceses art nouveau de hierro forjado y un jardín de mariposas nativas a cielo abierto.',
        tips: 'Visita 100% gratuita sin reserva previa, ingresando directamente por Av. Santa Fe.',
        startingPlaceId: 'palermo_jardin_botanico'
      },
      {
        id: 'rosedal_palermo',
        isHero: false,
        title: 'Paseo en Los Lagos & Rosedal de Palermo',
        category: 'paseo',
        badge: 'Aire Libre & Relax',
        days: 'Martes a domingos de 09:00 a 19:00 hs',
        location: 'Parque 3 de Febrero (Av. Infanta Isabel)',
        photo: '/actividades/rosedal_palermo.jpg',
        fallbackPhoto: '/places/palermo_rosedal.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'Caminar entre miles de rosales florecidos, cruzar el histórico puente blanco griego y sentarse a tomar mate junto al lago. Un respiro verde perfecto antes de cenar.',
        tips: 'La caída de la tarde sobre el lago tiene la luz más linda de toda la ciudad.',
        startingPlaceId: 'palermo_rosedal'
      },
      {
        id: 'telescopios_planetario',
        isHero: false,
        title: 'Telescopios & Cielo Nocturno en el Planetario',
        category: 'cultura',
        badge: 'Cultura Abierta',
        days: 'Sábados y domingos a partir de las 20:00 hs',
        location: 'Av. Sarmiento y Belisario Roldán',
        photo: '/actividades/telescopios_planetario.jpg',
        fallbackPhoto: '/places/palermo_rosedal.jpg',
        isFree: true,
        weather: 'outdoor', // requiere cielo despejado
        description: 'Observaciones astronómicas gratuitas con telescopios de gran alcance en la explanada del domo para contemplar la Luna, planetas y estrellas.',
        tips: 'Se entregan números por orden de llegada en la explanada 15 min antes. Requiere cielo despejado.',
        startingPlaceId: 'palermo_rosedal'
      }
    ],
    top3PlaceIds: ['palermo_lab_cafe', 'palermo_tres_monos', 'palermo_nino_gordo']
  },

  'Recoleta': {
    name: 'Recoleta',
    tagline: 'Arquitectura señorial, museos & barrancas verdes',
    vibe: 'La Buenos Aires aristocrática y cultural. Palacios de estilo francés, museos de rango internacional, cafés tradicionales y la gran feria artesanal de Plaza Francia.',
    coverPhoto: '/places/recoleta_plaza_francia.jpg',
    whatToDo: [
      {
        id: 'feria_plaza_francia',
        isHero: true,
        title: 'Feria de Artesanías de Plaza Francia & Barrancas',
        category: 'feria',
        badge: 'Clásico Porteño',
        days: 'Sábados, domingos y feriados de 11:00 a 20:00 hs',
        location: 'Av. del Libertador y Av. Pueyrredón',
        photo: '/actividades/feria_plaza_francia.jpg',
        fallbackPhoto: '/places/recoleta_plaza_francia.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'La feria artesanal de mayor tradición y calidad artística de la ciudad, emplazada sobre las barrancas verdes frente a la Iglesia del Pilar y el Centro Cultural Recoleta.',
        tips: 'Llevate una manta para sentarte al pasto a escuchar a los músicos y humoristas callejeros.',
        startingPlaceId: 'recoleta_plaza_francia'
      },
      
      {
        id: 'ateneo_splendid',
        isHero: false,
        title: 'Lectura & Café en el Antiguo Teatro Grand Splendid',
        category: 'cultura',
        badge: 'Refugio de Lluvia',
        days: 'Lunes a domingos de 09:00 a 22:00 hs',
        location: 'Av. Santa Fe 1860',
        photo: '/actividades/ateneo_splendid.jpg',
        fallbackPhoto: '/places/recoleta_ateneo_splendid.jpg',
        isFree: true,
        weather: 'indoor', // 100% bajo techo
        description: 'Considerada una de las librerías más hermosas del mundo. Conserva la cúpula pintada a mano, los palcos originales y el escenario reconvertido en cafetería.',
        tips: 'Plan perfecto cuando el día está nublado o lluvioso; podés sentarte en los palcos a hojear libros.',
        startingPlaceId: 'recoleta_ateneo_splendid'
      },
      {
        id: 'terraza_cc_recoleta',
        isHero: false,
        title: 'Terrazas, Arte Urbano & Atardeceres en el CCR',
        category: 'cultura',
        badge: 'Cultura Abierta',
        days: 'Viernes a domingos de 17:00 a 21:00 hs',
        location: 'Junín 1930 (al lado de Plaza Francia)',
        photo: '/actividades/terraza_cc_recoleta.jpg',
        fallbackPhoto: '/places/recoleta_ccr.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'Los patios coloniales y terrazas del Centro Cultural Recoleta ofrecen ciclos de música acústica, muestras inmersivas y vistas panorámicas del atardecer sobre las copas de los árboles.',
        tips: 'Entrada libre y gratuita para residentes; excelente para conectar luego con una cena por la zona.',
        startingPlaceId: 'recoleta_ccr'
      }
    ],
    top3PlaceIds: ['recoleta_ateneo_splendid', 'recoleta_bellas_artes', 'recoleta_presidente_bar']
  },

  'Chacarita': {
    name: 'Chacarita',
    tagline: 'Vermut de grifo, neo-bodegones & espíritu de barrio',
    vibe: 'El barrio que redefinió las salidas porteñas. Veredas anchas, mesas comunitarias, soderías que sirven vermut artesanal y una gastronomía fresca sin pretensiones.',
    coverPhoto: '/places/chacarita_sifon_soderia.jpg',
    whatToDo: [
      {
        id: 'anfiteatro_parque_centenario',
        isHero: true,
        title: 'Conciertos al Aire Libre en Anfiteatro Centenario',
        category: 'cultura',
        badge: 'Cultura Abierta',
        days: 'Viernes, Sábados y Domingos desde las 18:30 hs',
        location: 'Leopoldo Marechal 832 (Anfiteatro Eva Perón)',
        photo: '/actividades/anfiteatro_parque_centenario.jpg',
        fallbackPhoto: '/places/chacarita_parque_los_andes.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'El auditorio a cielo abierto más vibrante de la Ciudad: orquestas sinfónicas, ensambles de tango, big bands de jazz y rock con 1.600 butacas al aire libre.',
        tips: 'Entrada libre y gratuita por orden de llegada. Plan ideal para el atardecer y conectar con cena en Chacarita.',
        startingPlaceId: 'chacarita_sifon_soderia'
      },
      {
        id: 'vermut_veredas_chacarita',
        isHero: false,
        title: 'La Hora del Vermut en Veredas de Chacarita',
        category: 'gastronomia',
        badge: 'Ritual Porteño',
        days: 'Miércoles a domingos desde las 18:30 hs',
        location: 'Eje calle Jorge Newbery & Charlone',
        photo: '/places/chacarita_sifon_soderia.jpg',
        fallbackPhoto: '/places/chacarita_la_fuerza.jpg',
        isFree: false,
        weather: 'indoor', // bajo techo o en vereda
        description: 'La tradición del aperitivo porteño revivida: sifones de soda de vidrio antiguo, vermut de autor con hierbas locales, platitos de queso brie y buñuelos de acelga al paso.',
        tips: 'Llegar antes de las 20:00 hs para conseguir mesa afuera en las noches templadas.',
        startingPlaceId: 'chacarita_sifon_soderia'
      },
      {
        id: 'parque_los_andes',
        isHero: false,
        title: 'Feria de Barrio & Parque Los Andes',
        category: 'paseo',
        badge: 'Verde & Vecinal',
        days: 'Fines de semana de 10:00 a 19:00 hs',
        location: 'Av. Corrientes y Av. Jorge Newbery',
        photo: '/places/chacarita_parque_los_andes.jpg',
        fallbackPhoto: '/places/chacarita_parque_los_andes.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'Feria vecinal de fin de semana con árboles centenarios, puestos de libros usados y artesanías, justo al lado de la estación Dorrego.',
        tips: 'Caminar por las calles silenciosas aledañas como Concepción Arenal o Charlone.',
        startingPlaceId: 'chacarita_parque_los_andes'
      }
    ],
    top3PlaceIds: ['chacarita_sifon_soderia', 'chacarita_la_fuerza', 'chacarita_donnet']
  },

  'Colegiales': {
    name: 'Colegiales',
    tagline: 'Antigüedades, pasajes arbolados & cafés de autor',
    vibe: 'La serenidad residencial combinada con pequeños tesoros gastronómicos. Casas bajas, murales cuidados y el histórico Mercado de Pulgas como corazón del barrio.',
    coverPhoto: '/places/colegiales_mercado_pulgas.jpg',
    whatToDo: [
      {
        id: 'mercado_pulgas_colegiales',
        isHero: true,
        title: 'Caza de Tesoros en el Mercado de las Pulgas',
        category: 'feria',
        badge: '100% Bajo Techo',
        days: 'Martes a domingos de 10:00 a 19:00 hs',
        location: 'Av. Álvarez Thomas y Concepción Arenal',
        photo: '/actividades/mercado_pulgas_colegiales.jpg',
        fallbackPhoto: '/places/colegiales_mercado_pulgas.jpg',
        isFree: true,
        weather: 'indoor', // 100% techado
        description: 'Un galpón gigante con decenas de locales atendidos por anticuarios y restauradores. Muebles de época, vajilla de colección, carteles de chapa, juguetes antiguos y lámparas Art Decó.',
        tips: 'El salvavidas perfecto para un día de lluvia: podés pasar dos horas recorriendo sus pasillos cubiertos.',
        startingPlaceId: 'colegiales_mercado_pulgas'
      },
      {
        id: 'pasajes_colegiales',
        isHero: false,
        title: 'Paseo por Pasajes Silenciosos & Plaza Mafalda',
        category: 'paseo',
        badge: 'Tranquilidad Barrial',
        days: 'Todos los días (ideal tardes)',
        location: 'Pasaje General Paz & Plaza Mafalda',
        photo: '/places/colegiales_plaza_mafalda_pasajes.jpg',
        fallbackPhoto: '/places/colegiales_plaza_mafalda_pasajes.jpg',
        isFree: true,
        weather: 'outdoor',
        description: 'Un circuito de calles con adoquines antiguos y casas históricas con enredaderas, alejado del bullicio céntrico, ideal para caminar con un café para llevar en mano.',
        tips: 'Conectá este paseo con una parada en Tres Tostadores o Sântal Café.',
        startingPlaceId: 'colegiales_plaza_mafalda_pasajes'
      }
    ],
    top3PlaceIds: ['colegiales_mercado_pulgas', 'colegiales_anafe', 'colegiales_tres_tostadores']
  },

  'Belgrano': {
    name: 'Belgrano',
    tagline: 'Barrancas señoriales, tango al aire libre & cultura',
    vibe: 'Elegancia clásica y espacios verdes ondulados. Barrancas diseñadas por Carlos Thays, museos con jardines andaluces y la histórica glorieta donde se baila tango.',
    coverPhoto: '/places/belgrano_barrancas_glorieta.jpg',
    whatToDo: [
      {
        id: 'glorieta_tango_belgrano',
        isHero: true,
        title: 'Milonga & Baile Libre en La Glorieta de Barrancas',
        category: 'cultura',
        badge: 'Cultura Abierta',
        days: 'Fines de semana: clases 17:00 hs, baile libre 19:00 a 22:00 hs',
        location: '11 de Septiembre y Echeverría (Barrancas de Belgrano)',
        photo: '/actividades/glorieta_tango_belgrano.jpg',
        fallbackPhoto: '/places/belgrano_barrancas_glorieta.jpg',
        isFree: true,
        weather: 'outdoor', // al aire libre bajo los árboles
        description: 'La glorieta de hierro de las Barrancas se convierte en una pista de baile al aire libre abierta a todo público. Locales y extranjeros se reúnen a bailar tango bajo los árboles centenarios.',
        tips: 'No necesitás saber bailar; simplemente sentarte en las gradas a escuchar el tango con la fresca del atardecer ya vale la salida.',
        startingPlaceId: 'belgrano_barrancas_glorieta'
      },
      {
        id: 'museo_larreta',
        isHero: false,
        title: 'Jardín Andaluz del Museo de Arte Español Larreta',
        category: 'cultura',
        badge: 'Cultura Abierta',
        days: 'Lunes a Domingos (martes cerrado) de 11 a 20 h',
        location: 'Juramento 2291 (a pasos de Cabildo)',
        photo: '/places/belgrano_museo_larreta.jpg',
        fallbackPhoto: '/places/belgrano_museo_larreta.jpg',
        isFree: false, // entrada muy accesible BA Cultura
        weather: 'indoor', // jardín + casona techada
        description: 'Una casona neocolonial con un jardín andaluz de estilo morisco escondido detrás de altos muros. Cipreses, fuentes de agua, naranjos y un silencio que parece detener el tiempo.',
        tips: 'Dentro del jardín funciona una cafetería con mesas al aire libre.',
        startingPlaceId: 'belgrano_museo_larreta'
      }
    ],
    top3PlaceIds: ['belgrano_barrancas_glorieta', 'belgrano_corte_comedor', 'belgrano_el_torreon']
  }
};

// AGENDA GENERAL DE FIN DE SEMANA (todas las actividades de CABA consolidadas)
export const WEEKEND_AGENDA_ACTIVITIES = [
  {
    "id": "feria_san_telmo",
    "title": "Feria de Antigüedades & Calle Defensa",
    "barrio": "San Telmo",
    "type": "feria",
    "daysLabel": "Todos los Domingos",
    "hours": "10:00 a 18:00 hs",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Domingos Clásicos",
    "photo": "/actividades/feria_san_telmo.jpg",
    "photos": [
      "/actividades/feria_san_telmo.jpg",
      "/actividades/feria_san_telmo_2.jpg",
      "/actividades/feria_san_telmo_3.jpg",
      "/actividades/feria_san_telmo_4.jpg"
    ],
    "fallbackPhoto": "/places/santelmo_mercado.jpg",
    "highlight": "Antigüedades, artistas callejeros y tango en Plaza Dorrego.",
    "story": "La calle Defensa se corta al tránsito los domingos y se llena de vida: diez cuadras de puestos con sifones de vidrio de colores, cámaras analógicas viejas, vinilos y mates artesanales. En Plaza Dorrego vas a cruzarte parejas bailando tango al sol y músicos tocando a la gorra mientras la gente toma vermut en las veredas.",
    "tip": "Andá entre las 11:00 y las 12:30 para caminar antes del amontonamiento fuerte y hacé una parada técnica en el Mercado por unas empanadas calientes.",
    "startingPlaceId": "santelmo_mercado"
  },
  {
    "id": "feria_plaza_francia",
    "title": "Feria de Artesanías de Plaza Francia",
    "barrio": "Recoleta",
    "type": "feria",
    "daysLabel": "Sábados, Domingos & Feriados",
    "hours": "11:00 a 20:00 hs",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Clásico Porteño",
    "photo": "/actividades/feria_plaza_francia.jpg",
    "photos": [
      "/actividades/feria_plaza_francia.jpg",
      "/actividades/feria_plaza_francia_2.jpg",
      "/actividades/feria_plaza_francia_3.jpg",
      "/actividades/feria_plaza_francia_4.jpg"
    ],
    "fallbackPhoto": "/places/recoleta_plaza_francia.jpg",
    "highlight": "Artesanías de alta calidad en las barrancas y shows al aire libre.",
    "story": "Es la feria artesanal más tradicional de la ciudad, desplegada sobre las barrancas de pasto frente a la Iglesia del Pilar. Vas a ver platería criolla de verdad, mates tallados, cuero y cerámica de autor. El plan se completa tirando una lona en el pasto a tomar mate mientras tocan músicos en vivo.",
    "tip": "Si vas un día soleado después de las 15:00 hs, llevate termo y lona para tirarte en la barranca que mira hacia Libertador.",
    "startingPlaceId": "recoleta_plaza_francia"
  },
  {
    "id": "feria_plaza_serrano",
    "title": "Feria de Diseño en Plaza Cortázar (Serrano)",
    "barrio": "Palermo",
    "type": "feria",
    "daysLabel": "Sábados, Domingos & Feriados",
    "hours": "11:00 a 20:00 hs",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Fines de Semana",
    "photo": "/actividades/feria_plaza_serrano.jpg",
    "photos": [
      "/actividades/feria_plaza_serrano.jpg",
      "/actividades/feria_plaza_serrano_2.jpg",
      "/actividades/feria_plaza_serrano_3.jpg",
      "/actividades/feria_plaza_serrano_4.jpg"
    ],
    "fallbackPhoto": "/places/palermo_plaza_cortazar.jpg",
    "highlight": "Moda independiente y diseño en el corazón de Palermo Soho.",
    "story": "El epicentro joven de Palermo Soho: percheros de ropa de autor, stickers, anteojos de diseño y accesorios que copan la plazoleta y los bares de alrededor, que de día mutan en showrooms. Se camina despacio mirando percheros con música indie y café frío al paso.",
    "tip": "Los mejores hallazgos suelen estar adentro de los bares que rodean la plaza y no solo en los puestos centrales.",
    "startingPlaceId": "palermo_plaza_cortazar"
  },
  {
    "id": "ecoparque_palermo",
    "title": "Paseo Patrimonial en el Ecoparque",
    "barrio": "Palermo",
    "type": "paseo",
    "daysLabel": "Martes a Domingos & Feriados",
    "hours": "10:00 a 18:00 hs",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Cultura Abierta",
    "photo": "/actividades/ecoparque_palermo.jpg",
    "photos": [
      "/actividades/ecoparque_palermo.jpg",
      "/actividades/ecoparque_palermo_2.jpg",
      "/actividades/ecoparque_palermo_3.jpg"
    ],
    "fallbackPhoto": "/places/palermo_jardin_botanico.jpg",
    "highlight": "Edificios victorianos restaurados, senderos botánicos y animales autóctonos libres.",
    "story": "El viejo zoológico transformado en un parque público enorme, súper cuidado y con entrada libre. No hay jaulas: caminás por senderos arbolados cruzándote maras patagónicas y pavos reales sueltos que pastan a metros tuyo entre lagunas y edificios históricos restaurados.",
    "tip": "Entrá por Plaza Italia y salí por Libertador para conectar directo con los bosques de Palermo; es un gran plan verde sin gastar un peso.",
    "startingPlaceId": "palermo_jardin_botanico"
  },
  {
    "id": "mercado_pulgas_colegiales",
    "title": "Mercado de las Pulgas (Galpón Vintage)",
    "barrio": "Colegiales",
    "type": "feria",
    "daysLabel": "Martes a Domingos",
    "hours": "10:00 a 19:00 hs",
    "isFree": true,
    "weather": "indoor",
    "badge": "100% Bajo Techo",
    "photo": "/actividades/mercado_pulgas_colegiales.jpg",
    "photos": [
      "/actividades/mercado_pulgas_colegiales.jpg",
      "/actividades/mercado_pulgas_colegiales_2.jpg",
      "/actividades/mercado_pulgas_colegiales_3.jpg",
      "/actividades/mercado_pulgas_colegiales_4.jpg"
    ],
    "fallbackPhoto": "/places/colegiales_mercado_pulgas.jpg",
    "highlight": "Muebles de colección, lámparas y carteles de chapa 100% bajo techo.",
    "story": "Un galpón techado enorme donde podés perderte horas curioseando tesoros del pasado. Hay pasillos enteros con muebles recuperados de los años 50 y 60, carteles enlozados de chapa, vajilla antigua, lámparas de araña y restauradores lijando madera o tapizando en vivo en sus talleres.",
    "tip": "Las cosas más curiosas están en los pasillos del fondo; al salir, cruzá a la vereda de enfrente a tomarte un café sobre Álvarez Thomas.",
    "startingPlaceId": "colegiales_mercado_pulgas"
  },
  {
    "id": "glorieta_tango_belgrano",
    "title": "Milonga en La Glorieta de Barrancas",
    "barrio": "Belgrano",
    "type": "cultura",
    "daysLabel": "Sábados & Domingos",
    "hours": "Clases 17:00 hs · Baile libre 19:00 a 22:00 hs",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Cultura Abierta",
    "photo": "/actividades/glorieta_tango_belgrano.jpg",
    "photos": [
      "/actividades/glorieta_tango_belgrano.jpg",
      "/actividades/glorieta_tango_belgrano_2.jpg",
      "/actividades/glorieta_tango_belgrano_3.jpg",
      "/actividades/glorieta_tango_belgrano_4.jpg"
    ],
    "fallbackPhoto": "/places/belgrano_barrancas_glorieta.jpg",
    "highlight": "Tango y milonga libre al atardecer bajo los árboles de Barrancas.",
    "story": "La glorieta de hierro de Barrancas se convierte al atardecer en una pista de baile circular a cielo abierto. Se arranca con una clase para los que recién empiezan y después se larga la milonga popular, donde conviven bailarines de ley con gente que va a mirar y tomar mate en el pasto.",
    "tip": "A las 17:00 hs está la clase abierta si querés tirar un paso; si solo querés ver el baile con la luz dorada entre los árboles, caé a partir de las 19:00 hs.",
    "startingPlaceId": "belgrano_barrancas_glorieta"
  },
  {
    "id": "anfiteatro_parque_centenario",
    "title": "Conciertos Gratuitos en Anfiteatro Centenario",
    "barrio": "Chacarita",
    "type": "cultura",
    "daysLabel": "Viernes, Sábados & Domingos",
    "hours": "18:30 a 21:30 hs (al anochecer)",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Cultura Abierta",
    "photo": "/actividades/anfiteatro_parque_centenario.jpg",
    "photos": [
      "/actividades/anfiteatro_parque_centenario.jpg",
      "/actividades/anfiteatro_parque_centenario_2.jpg",
      "/actividades/anfiteatro_parque_centenario_3.jpg"
    ],
    "fallbackPhoto": "/places/chacarita_parque_los_andes.jpg",
    "highlight": "Orquestas de tango, rock y jazz sinfónico en 1.600 butacas al aire libre.",
    "story": "Un anfiteatro circular a cielo abierto con gradas para más de mil personas en medio del Parque Centenario. Los fines de semana al atardecer tocan orquestas de tango, ensambles de jazz y bandas de rock barrial con entrada libre y el lago del parque de fondo.",
    "tip": "La entrada es gratis por orden de llegada; conviene estar 30 minutos antes del show para enganchar buena grada central.",
    "startingPlaceId": "chacarita_sifon_soderia"
  },
  {
    "id": "jardin_botanico",
    "title": "Visitas Guiadas & Mariposario en el Botánico",
    "barrio": "Palermo",
    "type": "paseo",
    "daysLabel": "Sábados, Domingos & Feriados",
    "hours": "Visitas guiadas 10:30 h y 15:00 h",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Cultura Abierta",
    "photo": "/actividades/jardin_botanico.jpg",
    "photos": [
      "/actividades/jardin_botanico.jpg",
      "/actividades/jardin_botanico_2.jpg",
      "/actividades/jardin_botanico_3.jpg"
    ],
    "fallbackPhoto": "/places/palermo_jardin_botanico.jpg",
    "highlight": "5.000 especies vegetales, invernaderos franceses y mariposario abierto.",
    "story": "Una burbuja de sombra vegetal y silencio en una de las esquinas más transitadas de Buenos Aires. Senderos de tierra con árboles centenarios de todo el mundo, fuentes de agua, esculturas y su joya: un invernadero vidriado de estilo art nouveau de 1897.",
    "tip": "Entrá al gran invernadero de hierro francés para ver las plantas tropicales y sentate unos minutos frente a la fuente central.",
    "startingPlaceId": "palermo_jardin_botanico"
  },
  {
    "id": "terraza_cc_recoleta",
    "title": "Terrazas & Música en Centro Cultural Recoleta",
    "barrio": "Recoleta",
    "type": "cultura",
    "daysLabel": "Viernes a Domingos",
    "hours": "17:00 a 21:00 hs",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Cultura Abierta",
    "photo": "/actividades/terraza_cc_recoleta.jpg",
    "photos": [
      "/actividades/terraza_cc_recoleta.jpg",
      "/actividades/terraza_cc_recoleta_2.jpg",
      "/actividades/terraza_cc_recoleta_3.jpg"
    ],
    "fallbackPhoto": "/places/recoleta_ccr.jpg",
    "highlight": "Música acústica, atardeceres y arte urbano con vista a Plaza Francia.",
    "story": "El punto de encuentro joven de Recoleta: terrazas con reposeras para tomar sol mirando los árboles de Plaza Francia, patios llenos de murales coloridos y salas con muestras de arte contemporáneo gratis. Siempre hay pibes bailando freestyle y acústicos al caer la tarde.",
    "tip": "Subí a la terraza alta cerca de las 18:30 hs para ver el atardecer antes de salir a picar algo por las calles cercanas.",
    "startingPlaceId": "recoleta_ccr"
  },
  {
    "id": "telescopios_planetario",
    "title": "Telescopios Nocturnos en el Planetario",
    "barrio": "Palermo",
    "type": "cultura",
    "daysLabel": "Sábados & Domingos",
    "hours": "Desde las 20:00 hs (anochecer)",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Cultura Abierta",
    "photo": "/actividades/telescopios_planetario.jpg",
    "photos": [
      "/actividades/telescopios_planetario.jpg",
      "/actividades/telescopios_planetario_2.jpg",
      "/actividades/telescopios_planetario_3.jpg"
    ],
    "fallbackPhoto": "/places/palermo_rosedal.jpg",
    "highlight": "Observación astronómica guiada con telescopios gigantes en la explanada.",
    "story": "Al caer la noche, el Planetario enciende su cúpula de luces de colores y en la explanada se arman filas para mirar por telescopios astronómicos gigantes. Los astrónomos te calibran la lente y te explican en dos minutos qué planeta o constelación estás viendo en vivo.",
    "tip": "Depende de que el cielo esté despejado; si hay muchas nubes se suspende, así que chequeá que la noche esté estrellada antes de ir.",
    "startingPlaceId": "palermo_rosedal"
  },
  {
    "id": "rosedal_palermo",
    "title": "Paseo en Los Lagos & Rosedal",
    "barrio": "Palermo",
    "type": "paseo",
    "daysLabel": "Martes a Domingos",
    "hours": "09:00 a 19:00 hs",
    "isFree": true,
    "weather": "outdoor",
    "badge": "Aire Libre & Relax",
    "photo": "/actividades/rosedal_palermo.jpg",
    "photos": [
      "/actividades/rosedal_palermo.jpg",
      "/actividades/rosedal_palermo_2.jpg",
      "/actividades/rosedal_palermo_3.png"
    ],
    "fallbackPhoto": "/places/palermo_rosedal.jpg",
    "highlight": "Puente griego, miles de rosales y atardeceres sobre el agua.",
    "story": "El clásico paseo al aire libre: una pérgola blanca infinita que bordea el lago, el puente griego de madera para sacarse fotos y miles de rosales perfumando el aire. Alrededor podés alquilar un bote a pedal o tirarte al pasto a ver caer la tarde sobre el agua.",
    "tip": "Cualquier fin de semana soleado el atardecer sobre el lago es imbatible; llevate algo para tomar al borde del agua.",
    "startingPlaceId": "palermo_rosedal"
  },
  {
    "id": "ateneo_splendid",
    "title": "Lectura en el Antiguo Teatro Grand Splendid",
    "barrio": "Recoleta",
    "type": "cultura",
    "daysLabel": "Todos los días",
    "hours": "09:00 a 22:00 hs",
    "isFree": true,
    "weather": "indoor",
    "badge": "Refugio de Lluvia",
    "photo": "/actividades/ateneo_splendid.jpg",
    "photos": [
      "/actividades/ateneo_splendid.jpg",
      "/actividades/ateneo_splendid_2.jpg",
      "/actividades/ateneo_splendid_3.jpg"
    ],
    "fallbackPhoto": "/places/recoleta_ateneo_splendid.jpg",
    "highlight": "Una de las librerías más bellas del mundo. 100% bajo techo para días de lluvia.",
    "story": "Entrar a un teatro majestuoso de 1919 donde la platea se transformó en pasillos de libros, la cúpula original pintada al óleo te mira desde arriba y en el antiguo escenario, detrás del telón de terciopelo, hay un café para sentarte a leer hojeando cualquier ejemplar.",
    "tip": "Subí a los balcones del primer piso para sacar la foto panorámica de la sala iluminada, y después buscate un palco libre para leer diez minutos tranquilo.",
    "startingPlaceId": "recoleta_ateneo_splendid"
  }
];
