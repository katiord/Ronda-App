import json
import os
import uuid
import random
import logging
from datetime import datetime, timedelta
from pathlib import Path
from typing import List, Optional, Tuple
from dotenv import load_dotenv

from .schemas import PlanRequest, PlanResponse, PlanItem, TransitInfo, Place, SuggestedActivityInfo

load_dotenv()
logger = logging.getLogger("ronda.planner")

# Cargar catálogo de CABA
CATALOG_PATH = Path(__file__).resolve().parent.parent / "data" / "places_caba.json"

def load_catalog() -> List[Place]:
    try:
        with open(CATALOG_PATH, "r", encoding="utf-8") as f:
            raw_data = json.load(f)
            return [Place(**item) for item in raw_data]
    except Exception as e:
        logger.error(f"Error cargando catálogo desde {CATALOG_PATH}: {e}")
        return []

ALL_PLACES = load_catalog()

ADJACENT_NEIGHBORHOODS = {
    "San Telmo": ["Monserrat", "Puerto Madero", "La Boca"],
    "Palermo": ["Colegiales", "Villa Crespo", "Recoleta", "Chacarita"],
    "Recoleta": ["Palermo", "San Nicolás"],
    "Chacarita": ["Colegiales", "Villa Crespo", "Palermo"],
    "Colegiales": ["Chacarita", "Palermo", "Belgrano"],
    "Belgrano": ["Colegiales", "Núñez"],
    "San Nicolás": ["Recoleta", "Monserrat"],
    "Puerto Madero": ["San Telmo", "Monserrat"],
    "Caballito": ["Almagro"],
    "Almagro": ["Caballito", "Villa Crespo"],
    "Villa Crespo": ["Chacarita", "Palermo", "Almagro"]
}

# Actividades de Fin de Semana (Sábados / Domingos) - RULE-DOM-08
NEIGHBORHOOD_SUGGESTED_ACTIVITIES = {
    "San Telmo": SuggestedActivityInfo(
        id="feria_san_telmo",
        title="Feria de Antigüedades & Calle Defensa Peatonal",
        category="feria",
        days="Domingos de 10:00 a 18:00 hs",
        location="Plaza Dorrego & Calle Defensa",
        photo="/actividades/feria_san_telmo.jpg",
        description="El clásico de los domingos: antigüedades, tango callejero y artistas a lo largo de 10 cuadras peatonales.",
        tips="Llegá cerca del mediodía para caminar con calma y rematar con un vermut.",
        is_free=True,
        weather="outdoor",
        valid_days=["sunday"]
    ),
    "Palermo": SuggestedActivityInfo(
        id="feria_plaza_serrano",
        title="Feria de Diseño & Arte en Plaza Cortázar (Serrano)",
        category="feria",
        days="Sábados, domingos y feriados de 11:00 a 20:00 hs",
        location="Honduras y Serrano (Plaza Cortázar)",
        photo="/actividades/feria_plaza_serrano.jpg",
        description="Diseño independiente, indumentaria y arte plástico con terrazas y cafés alrededor.",
        tips="Ideal para combinar a media tarde con un café de especialidad.",
        is_free=True,
        weather="outdoor",
        valid_days=["saturday", "sunday"]
    ),
    "Recoleta": SuggestedActivityInfo(
        id="feria_plaza_francia",
        title="Feria de Artesanías de Plaza Francia & Barrancas",
        category="feria",
        days="Sábados, domingos y feriados de 11:00 a 20:00 hs",
        location="Av. del Libertador y Av. Pueyrredón",
        photo="/actividades/feria_plaza_francia.jpg",
        description="Puestos de artesanías de autor sobre las barrancas verdes frente a la Iglesia del Pilar.",
        tips="Llevate una manta para sentarte al pasto a escuchar a los músicos callejeros.",
        is_free=True,
        weather="outdoor",
        valid_days=["saturday", "sunday"]
    ),
    "Chacarita": SuggestedActivityInfo(
        id="parque_los_andes",
        title="Feria de Barrio & Parque Los Andes",
        category="paseo",
        days="Fines de semana de 10:00 a 19:00 hs",
        location="Av. Corrientes y Av. Jorge Newbery",
        photo="/places/chacarita_parque_los_andes.jpg",
        description="Feria vecinal de fin de semana con árboles centenarios y puestos de libros usados.",
        tips="Caminar por las veredas anchas de Jorge Newbery y Charlone.",
        is_free=True,
        weather="outdoor",
        valid_days=["saturday", "sunday"]
    ),
    "Colegiales": SuggestedActivityInfo(
        id="mercado_pulgas_colegiales",
        title="Caza de Tesoros en el Mercado de las Pulgas",
        category="feria",
        days="Martes a domingos de 10:00 a 19:00 hs",
        location="Av. Álvarez Thomas y Concepción Arenal",
        photo="/actividades/mercado_pulgas_colegiales.jpg",
        description="Galpón histórico techado con anticuarios, muebles de época y lámparas Art Decó.",
        tips="Salvavidas perfecto para un día de lluvia: 100% bajo techo.",
        is_free=True,
        weather="indoor",
        valid_days=["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    ),
    "Belgrano": SuggestedActivityInfo(
        id="glorieta_tango_belgrano",
        title="Milonga & Baile Libre en La Glorieta de Barrancas",
        category="cultura",
        days="Sábados y domingos: clases 17:00 hs, baile libre 19:00 a 22:00 hs",
        location="11 de Septiembre y Echeverría",
        photo="/actividades/glorieta_tango_belgrano.jpg",
        description="Tango y milonga al aire libre bajo la glorieta de hierro y árboles centenarios de Barrancas.",
        tips="Sentarse en las gradas a escuchar tango al atardecer es un planazo porteño.",
        is_free=True,
        weather="outdoor",
        valid_days=["saturday", "sunday"]
    ),
    "San Nicolás": SuggestedActivityInfo(
        id="visita_teatro_colon",
        title="Visita Guiada & Paseo por el Teatro Colón",
        category="cultura",
        days="Lunes a domingos de 10:00 a 17:00 hs",
        location="Libertad 621 (Plaza Lavalle)",
        photo="/places/sannicolas_teatro_colon.jpg",
        description="Uno de los teatros líricos más imponentes del mundo. Sala principal acústicamente perfecta y dorados del foyer.",
        tips="Reservar turno online con anticipación para la visita guiada matutina.",
        is_free=False,
        weather="indoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    ),
    "Puerto Madero": SuggestedActivityInfo(
        id="caminata_reserva_ecologica",
        title="Senderos & Naturaleza en Costanera Sur",
        category="paseo",
        days="Martes a domingos de 09:00 a 18:00 hs",
        location="Av. Tristán Achával Rodríguez 1550",
        photo="/places/puertomadero_reserva_ecologica.jpg",
        description="350 hectáreas verdes junto al Río de la Plata con lagunas, avistaje de aves y mirador ribereño.",
        tips="Alquilar una bici en la entrada o caminar hasta el mirador del Río con termo y mate.",
        is_free=True,
        weather="outdoor",
        valid_days=["tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    ),
    "Caballito": SuggestedActivityInfo(
        id="paseo_tranvia_historico",
        title="Viaje en el Tranvía Histórico de Caballito",
        category="cultura",
        days="Sábados de 16:00 a 19:30 hs, Domingos de 10:00 a 13:00 y 16:00 a 19:30 hs",
        location="Emilio Mitre y Bonifacio",
        photo="/places/caballito_tranvia_historico.jpg",
        description="Recorrido nostálgico gratuito en tranvías restaurados de época por las calles de adoquines de Caballito.",
        tips="La fila avanza rápido y el boleto retro picado a mano es un recuerdo imperdible.",
        is_free=True,
        weather="outdoor",
        valid_days=["saturday", "sunday"]
    ),
    "Almagro": SuggestedActivityInfo(
        id="milonga_boliche_roberto",
        title="Noche de Tango Íntimo en El Boliche de Roberto",
        category="cultura",
        days="Martes a sábados desde las 21:00 hs",
        location="Bulnes 331 (Plaza Almagro)",
        photo="/places/almagro_el_boliche_de_roberto.jpg",
        description="Pulpería y bar de 1893 donde guitarristas y cantores de tango cantan a capella entre mesas de madera.",
        tips="Pedir un vermut con soda y llegar temprano porque el salón es diminuto y se llena.",
        is_free=False,
        weather="indoor",
        valid_days=["tuesday", "wednesday", "thursday", "friday", "saturday"]
    ),
    "Villa Crespo": SuggestedActivityInfo(
        id="tarde_cafe_san_bernardo",
        title="Ping Pong, Pool & Tradición en Café San Bernardo",
        category="cultura",
        days="Todos los días de 08:00 a 03:00 hs",
        location="Av. Corrientes 5436",
        photo="/places/villacrespo_cafe_san_bernardo.jpg",
        description="El mítico 'San Ber': templo barrial de billar, pool y ping pong donde conviven parroquianos y juventud.",
        tips="Pedir fichas de ping-pong en el mostrador y acompañar con café con leche o cerveza con maní.",
        is_free=False,
        weather="indoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
    )
}

# Actividades de Día de Semana (Lunes a Viernes) - RULE-DOM-08
NEIGHBORHOOD_WEEKDAY_SUGGESTED_ACTIVITIES = {
    "San Telmo": SuggestedActivityInfo(
        id="paseo_san_telmo_colonial",
        title="Paseo Colonial por Pasajes & Casas Históricas",
        category="paseo",
        days="Lunes a viernes de 10:00 a 19:00 hs",
        location="Pasaje San Lorenzo & Calle Balcarce",
        photo="/places/santelmo_pasaje_san_lorenzo_casa_minima.jpg",
        description="Caminata tranquila entre adoquines, faroles históricos y la mítica Casa Mínima sin el tumulto del fin de semana.",
        tips="Entrar al Pasaje de la Defensa y mirar los patios coloniales en calma.",
        is_free=True,
        weather="outdoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    ),
    "Palermo": SuggestedActivityInfo(
        id="pasajes_palermo_soho",
        title="Circuito de Pasajes Bohemios & Arte Urbano",
        category="cultura",
        days="Lunes a viernes todo el día",
        location="Pasajes Russell, Soria y Santa Rosa",
        photo="/places/palermo_cuervo_cafe.jpg",
        description="Calles adoquinadas tranquilas con murales de artistas internacionales y cafés de autor.",
        tips="Ideal para fotos espontáneas y caminar sin prisa en veredas tranquilas.",
        is_free=True,
        weather="outdoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    ),
    "Recoleta": SuggestedActivityInfo(
        id="recorrido_recoleta_alvear",
        title="Paseo Señorial por Avenida Alvear & Librerías",
        category="paseo",
        days="Lunes a viernes todo el día",
        location="Av. Alvear y Plaza San Martín de Tours",
        photo="/places/recoleta_el_ateneo.jpg",
        description="Palacetes señoriales de estilo francés, embajadas y remate en El Ateneo Grand Splendid con su cúpula iluminada.",
        tips="Sentarse en los palcos del antiguo teatro a hojear libros de arte.",
        is_free=True,
        weather="indoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    ),
    "Chacarita": SuggestedActivityInfo(
        id="chacarita_corredor_newbery",
        title="Paseo por el Corredor Creativo de Jorge Newbery",
        category="paseo",
        days="Lunes a viernes de 11:00 a 19:00 hs",
        location="Av. Jorge Newbery e/ Guevara y Charlone",
        photo="/places/chacarita_parque_los_andes.jpg",
        description="Veredas anchas con talleres de ceramistas, librerías boutique y arquitectura fabril recuperada.",
        tips="El ritmo barrial auténtico de Chacarita se disfruta mejor en días de semana.",
        is_free=True,
        weather="outdoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    ),
    "Colegiales": SuggestedActivityInfo(
        id="colegiales_mercado_pulgas_semana",
        title="Mercado de las Pulgas & Galpón de Anticuarios",
        category="feria",
        days="Martes a viernes de 10:00 a 19:00 hs (Lunes cerrado)",
        location="Av. Álvarez Thomas y Concepción Arenal",
        photo="/actividades/mercado_pulgas_colegiales.jpg",
        description="Muebles vintage, lámparas de cristal y reliquias en calma, sin las multitudes del fin de semana.",
        tips="Charlar con los restauradores de madera en los puestos del fondo.",
        is_free=True,
        weather="indoor",
        valid_days=["tuesday", "wednesday", "thursday", "friday"]
    ),
    "Belgrano": SuggestedActivityInfo(
        id="belgrano_barrio_chino_peatonal",
        title="Caminata por el Corredor Peatonal del Barrio Chino",
        category="paseo",
        days="Lunes a viernes de 10:00 a 20:00 hs",
        location="Arribeños y Mendoza",
        photo="/places/belgrano_via_viva_barrio_chino.jpg",
        description="Supermercados exóticos, puestos de bao y té de burbujas en un entorno peatonal ágil.",
        tips="Comprar galletitas de la fortuna y pasteles de porotos dulces al paso.",
        is_free=True,
        weather="outdoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    ),
    "San Nicolás": SuggestedActivityInfo(
        id="visita_teatro_colon",
        title="Visita Guiada & Paseo por el Teatro Colón",
        category="cultura",
        days="Lunes a domingos de 10:00 a 17:00 hs",
        location="Libertad 621 (Plaza Lavalle)",
        photo="/places/sannicolas_teatro_colon.jpg",
        description="Uno de los teatros líricos más imponentes del mundo. Sala principal acústicamente perfecta y dorados del foyer.",
        tips="Reservar turno online con anticipación para la visita guiada matutina.",
        is_free=False,
        weather="indoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    ),
    "Puerto Madero": SuggestedActivityInfo(
        id="caminata_reserva_ecologica",
        title="Senderos & Naturaleza en Costanera Sur",
        category="paseo",
        days="Martes a domingos de 09:00 a 18:00 hs",
        location="Av. Tristán Achával Rodríguez 1550",
        photo="/places/puertomadero_reserva_ecologica.jpg",
        description="350 hectáreas verdes junto al Río de la Plata con lagunas, avistaje de aves y mirador ribereño.",
        tips="Alquilar una bici en la entrada o caminar hasta el mirador del Río con termo y mate.",
        is_free=True,
        weather="outdoor",
        valid_days=["tuesday", "wednesday", "thursday", "friday"]
    ),
    "Caballito": SuggestedActivityInfo(
        id="caballito_parque_rivadavia",
        title="Paseo por Parque Rivadavia & Puestos de Libros",
        category="paseo",
        days="Lunes a viernes de 09:00 a 20:00 hs",
        location="Av. Rivadavia y Doblas",
        photo="/places/caballito_tranvia_historico.jpg",
        description="Parque tradicional arbolado con su histórica feria de libros usados, revistas de colección y numismática.",
        tips="Buscar libros descatalogados en los puestos sobre la calle Beauchef.",
        is_free=True,
        weather="outdoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    ),
    "Almagro": SuggestedActivityInfo(
        id="almagro_las_violetas_visita",
        title="Arquitectura & Vitrales en Confitería Las Violetas",
        category="cultura",
        days="Lunes a viernes de 08:00 a 22:00 hs",
        location="Av. Rivadavia y Av. Medrano",
        photo="/places/almagro_el_boliche_de_roberto.jpg",
        description="Monumento histórico nacional fundado en 1884 con vitrales franceses y pisos de mármol italiano.",
        tips="Mirar los vitrales con la luz natural de media tarde.",
        is_free=True,
        weather="indoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    ),
    "Villa Crespo": SuggestedActivityInfo(
        id="tarde_cafe_san_bernardo",
        title="Ping Pong, Pool & Tradición en Café San Bernardo",
        category="cultura",
        days="Todos los días de 08:00 a 03:00 hs",
        location="Av. Corrientes 5436",
        photo="/places/villacrespo_cafe_san_bernardo.jpg",
        description="El mítico 'San Ber': templo barrial de billar, pool y ping pong donde conviven parroquianos y juventud.",
        tips="Pedir fichas de ping-pong en el mostrador y acompañar con café con leche o cerveza con maní.",
        is_free=False,
        weather="indoor",
        valid_days=["monday", "tuesday", "wednesday", "thursday", "friday"]
    )
}

NEIGHBORHOOD_NIGHT_SUGGESTED_ACTIVITIES = {
    "Palermo": SuggestedActivityInfo(
        id="noche_palermo_bares",
        title="Circuito de Coctelería de Autor & Speakeasies",
        category="cultura",
        days="Todos los días de 19:30 a 03:00 hs",
        location="Palermo Soho & Hollywood",
        photo="/places/palermo_tres_monos.jpg",
        description="Ruta nocturna de bares premiados internacionalmente, patios de vermut y terrazas.",
        tips="Excelente para estirar la sobremesa después de la cena.",
        is_free=True,
        weather="outdoor"
    ),
    "San Telmo": SuggestedActivityInfo(
        id="noche_santelmo_tango",
        title="Tango Acústico & Bares Notables",
        category="cultura",
        days="Jueves a domingos de 20:00 a 01:00 hs",
        location="Bar El Federal & Casco Histórico",
        photo="/places/santelmo_bar_el_federal.jpg",
        description="Música acústica en vivo y noche bohemia entre adoquines y faroles centenarios.",
        tips="Ambiente íntimo con historia en cada rincón.",
        is_free=True,
        weather="indoor"
    ),
    "Recoleta": SuggestedActivityInfo(
        id="noche_recoleta_terrazas",
        title="Tragos & Terrazas Belle Époque",
        category="cultura",
        days="Todos los días de 20:00 a 02:00 hs",
        location="Recoleta & Av. Alvear",
        photo="/places/recoleta_presidente_bar.jpg",
        description="Coctelería clásica y jardines señoriales iluminados para cerrar la velada.",
        tips="Ideal para una copa tranquila de cierre.",
        is_free=True,
        weather="indoor"
    ),
    "Chacarita": SuggestedActivityInfo(
        id="noche_chacarita_vermut",
        title="Ruta de Vermuterías & Platitos",
        category="cultura",
        days="Martes a domingos de 19:30 a 02:00 hs",
        location="Jorge Newbery & Charlone",
        photo="/places/chacarita_la_fuerza.jpg",
        description="El polo gastronómico joven más efervescente de la ciudad bajo guirnaldas de luces.",
        tips="Mesas en la vereda con soda de sifón.",
        is_free=True,
        weather="outdoor"
    ),
    "Colegiales": SuggestedActivityInfo(
        id="noche_colegiales_craft",
        title="Cervecerías de Culto & Tapeo Nocturno",
        category="cultura",
        days="Martes a domingos de 19:00 a 02:00 hs",
        location="Delgado & Álvarez Thomas",
        photo="/places/colegiales_strange_brewing.jpg",
        description="Cervezas lupuladas de autor y vinilos sonando en una esquina de barrio.",
        tips="Ambiente relajado para charlar sin apuro.",
        is_free=True,
        weather="indoor"
    ),
    "Belgrano": SuggestedActivityInfo(
        id="noche_belgrano_via_viva",
        title="Paseo Nocturno Vía Viva & Coctelería",
        category="cultura",
        days="Todos los días de 19:00 a 01:00 hs",
        location="Bajo Belgrano & Juramento",
        photo="/places/belgrano_via_viva_barrio_chino.jpg",
        description="Luces de neón, gastronomía asiática y bares modernos bajo el viaducto.",
        tips="Caminar por el nuevo corredor peatonal iluminado.",
        is_free=True,
        weather="outdoor"
    ),
    "San Nicolás": SuggestedActivityInfo(
        id="noche_sannicolas_corrientes",
        title="Paseo Nocturno por Avenida Corrientes & Bares 24 hs",
        category="cultura",
        days="Todos los días hasta la madrugada",
        location="Av. Corrientes e/ Callao y 9 de Julio",
        photo="/places/sannicolas_bar_la_academia.jpg",
        description="La calle que nunca duerme: marquesinas iluminadas, librerías abiertas y mesas de billar.",
        tips="Caminar de noche comiendo una porción al paso.",
        is_free=True,
        weather="outdoor"
    ),
    "Puerto Madero": SuggestedActivityInfo(
        id="noche_puertomadero_diques",
        title="Paseo de Luces por los Diques & Puente de la Mujer",
        category="cultura",
        days="Todos los días",
        location="Diques 2, 3 y 4",
        photo="/places/puertomadero_heladeria_luccianos.jpg",
        description="Caminata ribereña con vista a los rascacielos reflejados en el agua y puentes iluminados.",
        tips="Brisa fresca de río y tranquilidad absoluta.",
        is_free=True,
        weather="outdoor"
    ),
    "Caballito": SuggestedActivityInfo(
        id="noche_caballito_parques",
        title="Noche Gastronómica en Avenida Pedro Goyena",
        category="cultura",
        days="Martes a domingos de 19:00 a 02:00 hs",
        location="Av. Pedro Goyena y Valle",
        photo="/places/caballito_sobek_bowling.jpg",
        description="El polo gastronómico arbolado de Pedro Goyena con mesas al aire libre.",
        tips="Caminar bajo las tipas centenarias.",
        is_free=True,
        weather="outdoor"
    ),
    "Almagro": SuggestedActivityInfo(
        id="noche_almagro_boliche",
        title="Tango Acústico & Boliche Noctámbulo",
        category="cultura",
        days="Miércoles a domingos de 21:00 a 03:00 hs",
        location="Bulnes y Sarmiento",
        photo="/places/almagro_el_boliche_de_roberto.jpg",
        description="Guitarras criollas en vivo sin micrófonos en el bar de 1893.",
        tips="Pedir un vasito de tinto y escuchar a los cantores.",
        is_free=True,
        weather="indoor"
    ),
    "Villa Crespo": SuggestedActivityInfo(
        id="noche_villacrespo_sanber",
        title="Mística de Ping-Pong & Noche Bohemia",
        category="cultura",
        days="Todos los días hasta las 03:30 hs",
        location="Av. Corrientes 5436",
        photo="/places/villacrespo_cafe_san_bernardo.jpg",
        description="El templo porteño de la convivencia nocturna: pool, ping-pong y vermut.",
        tips="La mejor energía relajada de la noche porteña.",
        is_free=True,
        weather="indoor"
    )
}

DEFAULT_NEIGHBORHOOD_ACTIVITIES = NEIGHBORHOOD_SUGGESTED_ACTIVITIES

def parse_start_time(start_time_str: Optional[str], is_now: bool, time_of_day: str) -> datetime:
    """
    Determina la hora exacta de inicio de la ronda.
    Si el usuario sale 'ahora', agrega un margen realista de 15 minutos para salida/traslado inicial.
    """
    base_date = datetime(2026, 1, 1)

    if start_time_str and ":" in start_time_str:
        try:
            parts = start_time_str.strip().split(":")
            h = int(parts[0]) % 24
            m = int(parts[1]) % 60
            dt = base_date.replace(hour=h, minute=m)
            if is_now:
                dt += timedelta(minutes=15)
                # Redondeo amigable a múltiplo de 5 min
                rem = dt.minute % 5
                if rem != 0:
                    dt += timedelta(minutes=(5 - rem))
            return dt
        except Exception:
            pass

    default_hours = {
        "morning": (10, 0),
        "afternoon": (16, 30),
        "night": (21, 0),
        "full_day": (10, 30)
    }
    h, m = default_hours.get(time_of_day, (21, 0))
    return base_date.replace(hour=h, minute=m)

def get_activity_label_for_time(place: Place, hour: int) -> str:
    """Genera un título de actividad coherente con la hora y la categoría del lugar."""
    # Si es heladería / postres, nunca debe caritularse como 'Cena Porteña'
    if any(sub in ["heladeria_artesanal", "postres", "bakery"] for sub in place.subcategories) and place.category == "dining":
        return "Helado artesanal & Pausa dulce"

    if 0 <= hour < 5:
        if place.category == "nightlife":
            return "Coctelería de autor & Música nocturna"
        return "Trasnoche & Tapeo porteño"
    elif 5 <= hour < 12:
        if place.category == "cafe":
            return "Desayuno & Café de especialidad"
        return "Paseo matutino & Recorrido cultural"
    elif 12 <= hour < 16:
        if place.category == "dining":
            return "Almuerzo porteño de autor"
        elif place.category == "cafe":
            return "Café de sobremesa & Cortado"
        elif place.category == "bookstore":
            return "Lectura & Pausa literaria de sobremesa"
        elif place.category == "park":
            return "Caminata digestiva & Espacio verde"
        elif place.category == "culture":
            return "Paseo cultural de mediodía"
        return "Sobremesa y paseo tranquilo"
    elif 16 <= hour < 19:
        if place.category == "cafe":
            return "Café de especialidad & Merienda"
        elif place.category in ["bookstore", "culture", "park"]:
            return "Paseo cultural & Aire libre"
        return "Tapeo o Vermut al atardecer"
    elif 19 <= hour < 21:
        if place.category in ["nightlife", "cafe"] or "bar_notable" in place.subcategories:
            return "Vermut, Picada & Previa porteña"
        elif place.category == "dining":
            return "Cena temprana & Bodegón"
        return "Paseo al atardecer"
    else:
        if place.category == "dining":
            return "Cena Porteña"
        elif place.category == "nightlife":
            return "Coctelería & Sobremesa"
        return "Parada nocturna porteña"

def get_place_day_schedule(place: Place, day_req: str) -> dict:
    """Retorna el horario correspondiente al día solicitado usando schedule_by_day o fallback."""
    day_key = day_req.lower()
    if hasattr(place, "schedule_by_day") and place.schedule_by_day and day_key in place.schedule_by_day:
        return place.schedule_by_day[day_key]
    
    is_weekend = day_key in ["friday", "saturday"]
    close_h = place.close_hour_weekend if (is_weekend and hasattr(place, "close_hour_weekend") and place.close_hour_weekend) else place.close_hour
    is_closed = place.days_open and len(place.days_open) > 0 and day_key not in [d.lower() for d in place.days_open]
    return {
        "is_closed": is_closed,
        "open_hour": place.open_hour,
        "close_hour": close_h,
        "open": f"{int(place.open_hour or 0):02d}:00",
        "close": f"{int((close_h or 0) % 24):02d}:00"
    }

HEAVY_FOOD_SUBTYPES = {
    "bodegon", "bodegon_clasico", "parrilla", "parrilla_tradicional",
    "criollo", "dining", "almuerzo", "cena", "picadas"
}

def is_heavy_food(place: Place) -> bool:
    if not place:
        return False
    subs = set(place.subcategories or [])
    if any(s in ["heladeria_artesanal", "postres", "bakery"] for s in subs):
        return False
    if place.category == "dining":
        return True
    return bool(subs.intersection(HEAVY_FOOD_SUBTYPES))

def has_subtype_duplication(place_a: Place, place_b: Place) -> bool:
    """Determina si dos paradas repiten un mismo tipo/subtipo que no tiene sentido duplicar."""
    if not place_a or not place_b:
        return False
    if place_a.id == place_b.id:
        return True
    
    # 1. Comida pesada única: NUNCA dos comidas fuertes (RULE-DOM-05)
    if is_heavy_food(place_a) and is_heavy_food(place_b):
        return True

    # 2. Nunca dos 'cafe' (RULE-DOM-06)
    if place_a.category == "cafe" and place_b.category == "cafe":
        return True
    
    subs_a = set(place_a.subcategories or [])
    subs_b = set(place_b.subcategories or [])

    # 3. Nunca dos Bares Notables
    if "bar_notable" in subs_a and "bar_notable" in subs_b:
        return True
    # 4. Nunca dos Heladerías
    if "heladeria_artesanal" in subs_a and "heladeria_artesanal" in subs_b:
        return True
    # 5. Nunca dos pubs o cervecerías seguidas
    if ("cerveceria" in subs_a or "pub_britanico" in subs_a) and ("cerveceria" in subs_b or "pub_britanico" in subs_b):
        return True
    # 6. Nunca dos bodegones clásicos o parrillas
    if ("bodegon" in subs_a or "bodegon_clasico" in subs_a or "parrilla" in subs_a or "parrilla_tradicional" in subs_a) and \
       ("bodegon" in subs_b or "bodegon_clasico" in subs_b or "parrilla" in subs_b or "parrilla_tradicional" in subs_b):
        return True
    # 7. Nunca dos bares de coctelería o speakeasies seguidos (evita duplicar bares de tragos en una misma ronda)
    cocktail_subs = {"cocteleria", "cocteleria_de_autor", "speakeasy", "tragos_de_autor"}
    if bool(subs_a.intersection(cocktail_subs)) and bool(subs_b.intersection(cocktail_subs)):
        return True
    # 8. Nunca dos bares lúdicos o de juegos/pool seguidos
    game_subs = {"bar_de_juegos", "pool", "arcade", "juegos_de_mesa"}
    if bool(subs_a.intersection(game_subs)) and bool(subs_b.intersection(game_subs)):
        return True

    return False

def get_canonical_slot_target_category(slot_index: int, start_hour: int) -> List[str]:
    """
    Retorna las categorías prioritarias para cada posición (slot 0, 1, 2)
    según la matriz de RULE-DOM-07:
    - Mañana (08:00 - 11:30): 0: cafe, 1: culture/bookstore/park, 2: dining/park/bookstore
    - Mediodía (11:30 - 15:00): 0: dining (almuerzo), 1: park/culture/bookstore, 2: cafe/dining
    - Tarde (15:00 - 19:30): 0: cafe, 1: culture/bookstore/park, 2: dining/nightlife
    - Noche (19:30 - 23:59): 0: nightlife/cafe, 1: dining (cena), 2: nightlife/dining
    - Trasnoche (00:00 - 05:00): 0: nightlife/dining (refugio nocturno)
    """
    if 0 <= start_hour < 6:
        return ["nightlife", "dining"]
    elif 6 <= start_hour < 11:
        if slot_index == 0:
            return ["cafe"]
        elif slot_index == 1:
            return ["culture", "bookstore", "park"]
        else:
            return ["dining", "park", "bookstore", "culture"]
    elif 11 <= start_hour < 15:
        if slot_index == 0:
            return ["dining"]
        elif slot_index == 1:
            return ["park", "culture", "bookstore"]
        else:
            return ["cafe", "dining"]
    elif 15 <= start_hour < 19:
        if slot_index == 0:
            return ["cafe"]
        elif slot_index == 1:
            return ["culture", "bookstore", "park"]
        else:
            return ["dining", "nightlife"]
    elif 19 <= start_hour < 20:
        if slot_index == 0:
            return ["nightlife", "cafe"]  # Previa / Vermut
        elif slot_index == 1:
            return ["dining"]  # Cena
        else:
            return ["nightlife"]
    else:  # 20:00 - 23:59 (Horario de cena y noche)
        if slot_index == 0:
            return ["dining"]  # CENA PRIMERO (Bodegón / Parrilla / Comida)
        elif slot_index == 1:
            return ["nightlife"]  # TRAGOS DESPUÉS (Bar / Coctelería / Sobremesa)
        else:
            return ["nightlife", "dining"]

def calculate_distance_km(p1: Place, p2: Place) -> float:
    if p1.lat is None or p1.lng is None or p2.lat is None or p2.lng is None:
        return 0.5
    d_lat = (p1.lat - p2.lat) * 111.0
    d_lng = (p1.lng - p2.lng) * 85.0
    return (d_lat**2 + d_lng**2)**0.5

def calculate_distance(p1: Place, p2: Place) -> float:
    return calculate_distance_km(p1, p2)

def optimize_route_anti_zigzag(selected: List[Place]) -> List[Place]:
    """
    Optimiza el orden de las paradas para evitar zig-zags (RULE-DOM-07).
    Si hay 3 paradas y permutar paradas 1 y 2 reduce drásticamente la distancia
    sin romper el flujo horario de categorías compatibles, se permutan.
    """
    if len(selected) != 3:
        return selected

    p0, p1, p2 = selected[0], selected[1], selected[2]
    d_01 = calculate_distance(p0, p1)
    d_12 = calculate_distance(p1, p2)
    d_02 = calculate_distance(p0, p2)
    d_21 = calculate_distance(p2, p1)

    total_current = d_01 + d_12
    total_permuted = d_02 + d_21

    can_swap = False
    if p1.category in ["culture", "park", "bookstore"] and p2.category in ["culture", "park", "bookstore"]:
        can_swap = True
    elif p1.category in ["nightlife", "cafe"] and p2.category in ["nightlife", "cafe"]:
        can_swap = True

    if can_swap and total_permuted < (total_current * 0.75):
        return [p0, p2, p1]

    return selected

def is_place_open_and_feasible(place: Place, current_hour_continuous: float, day_req: str, min_buffer_hours: float = 0.75) -> bool:
    """
    Verifica si el lugar está abierto y dispone de al menos `min_buffer_hours` (45 min)
    antes de su hora de cierre en el día solicitado.
    """
    sched = get_place_day_schedule(place, day_req)
    if sched.get("is_closed", False):
        return False
    
    open_h = sched.get("open_hour")
    close_h = sched.get("close_hour")
    if open_h is None or close_h is None:
        return True

    # Escala continua para madrugada
    if close_h <= 7.0:
        close_h += 24.0
    if open_h <= 7.0 and close_h > 24.0:
        open_h += 24.0

    # ¿Ya abrió? (con 15 min de anticipación)
    if current_hour_continuous < (open_h - 0.25):
        return False

    # ¿Tiene suficiente tiempo antes del cierre? (buffer mínimo estricto de 45 min)
    if (current_hour_continuous + min_buffer_hours) > close_h:
        return False

    return True

def select_diverse_itinerary(
    candidates: List[Place], 
    max_stops: int = 3, 
    start_hour: int = 20, 
    day_of_week: Optional[str] = None,
    allow_neighboring_barrio: bool = False,
    anchor_place_id: Optional[str] = None,
    anchor_position: str = "end"
) -> List[Place]:
    """
    Selecciona paradas garantizando:
    - RULE-DOM-04: Ninguna parada consecutiva repite categoría principal.
    - RULE-DOM-05: MÁXIMO UNA comida fuerte/principal por salida (nunca dos comidas pesadas).
    - RULE-DOM-06: MÁXIMO UN café/tostaduría en horarios de mañana o tarde.
    - RULE-DOM-07: Plantilla canónica por momento del día y ruta peatonal continua anti-zigzag.
    - Confinamiento barrial y peatonal estricto (RULE-DOM-01): Distancia <= 1.8 km entre paradas.
    - Buffer mínimo de 45 min antes de cada cierre.
    - Monoparada en trasnoche profunda (01:00 a 05:00 AM).
    - Inclusión garantizada del lugar ancla en su posición elegida (start o end).
    """
    if not candidates:
        return []

    day_req = (day_of_week or datetime.now().strftime("%A")).lower()
    
    # Hora continua para cálculos (>24 si es trasnoche 00:00 - 06:00)
    cur_h_cont = float(start_hour) if start_hour is not None else 20.0
    if cur_h_cont < 6.0:
        cur_h_cont += 24.0

    is_trasnoche = (start_hour is not None and (1 <= start_hour < 6))
    effective_max = 1 if is_trasnoche else max_stops

    # 1. Filtrado riguroso con buffer de cierre de 45 min y horarios por día
    valid_candidates = []
    for c in candidates:
        if not is_place_open_and_feasible(c, cur_h_cont, day_req, min_buffer_hours=0.75):
            continue
        valid_candidates.append(c)

    if not valid_candidates:
        valid_candidates = candidates[:effective_max]

    # Resolver lugar ancla garantizado si fue solicitado
    anchor_place = None
    if anchor_place_id:
        anchor_place = next((p for p in valid_candidates if p.id == anchor_place_id), None) or \
                       next((p for p in candidates if p.id == anchor_place_id), None) or \
                       next((p for p in ALL_PLACES if p.id == anchor_place_id), None)

    selected: List[Place] = []
    current_time_runner = cur_h_cont
    base_hour = int(start_hour) if start_hour is not None else 20

    # Si hay lugar ancla como inicio
    if anchor_place and anchor_position == "start":
        selected.append(anchor_place)
        prev_dur = max(0.6, (anchor_place.typical_duration_minutes or 60) / 60.0)
        current_time_runner += prev_dur + 0.15

    slots_to_fill = effective_max
    if anchor_place:
        slots_to_fill = max(1, effective_max - 1)

    start_slot_idx = len(selected)
    for slot_idx in range(start_slot_idx, start_slot_idx + (slots_to_fill if not (anchor_place and anchor_position == "start") else effective_max - 1)):
        if len(selected) >= effective_max:
            break
        target_cats = get_canonical_slot_target_category(slot_idx, base_hour)
        
        best_candidate = None
        for c in valid_candidates:
            if c in selected or (anchor_place and c.id == anchor_place.id):
                continue
            if any(has_subtype_duplication(s, c) for s in selected):
                continue
            if anchor_place and has_subtype_duplication(anchor_place, c):
                continue
            if selected:
                prev_stop = selected[-1]
                if not allow_neighboring_barrio and c.neighborhood.lower() != selected[0].neighborhood.lower():
                    continue
                dist_prev = calculate_distance(prev_stop, c)
                if dist_prev > 1.8 and not allow_neighboring_barrio:
                    continue

                prev_dur = max(0.6, (prev_stop.typical_duration_minutes or 60) / 60.0)
                transit_hours = 0.15
                arrival_at_next = current_time_runner + prev_dur + transit_hours
                if not is_place_open_and_feasible(c, arrival_at_next, day_req, min_buffer_hours=0.75):
                    continue

            # Prioridad 1: Coincide con target_cats
            if c.category in target_cats:
                best_candidate = c
                break

        if not best_candidate:
            for c in valid_candidates:
                if c in selected or (anchor_place and c.id == anchor_place.id):
                    continue
                if any(has_subtype_duplication(s, c) for s in selected):
                    continue
                if anchor_place and has_subtype_duplication(anchor_place, c):
                    continue
                if selected:
                    prev_stop = selected[-1]
                    if not allow_neighboring_barrio and c.neighborhood.lower() != selected[0].neighborhood.lower():
                        continue
                    dist_prev = calculate_distance(prev_stop, c)
                    if dist_prev > 1.8 and not allow_neighboring_barrio:
                        continue

                    prev_dur = max(0.6, (prev_stop.typical_duration_minutes or 60) / 60.0)
                    transit_hours = 0.15
                    arrival_at_next = current_time_runner + prev_dur + transit_hours
                    if not is_place_open_and_feasible(c, arrival_at_next, day_req, min_buffer_hours=0.75):
                        continue
                best_candidate = c
                break

        if best_candidate:
            if selected:
                prev_stop = selected[-1]
                prev_dur = max(0.6, (prev_stop.typical_duration_minutes or 60) / 60.0)
                current_time_runner += prev_dur + 0.15
            selected.append(best_candidate)

    # Si el ancla va al final y aún no está en selected
    if anchor_place and anchor_position == "end" and anchor_place not in selected:
        if is_place_open_and_feasible(anchor_place, current_time_runner, day_req, min_buffer_hours=0.5):
            selected.append(anchor_place)
        else:
            # REPOSICIONAMIENTO AUTOMÁTICO AL INICIO:
            # Si para la hora final ya está cerrado (ej. Jobs cierra 01:00 AM), lo colocamos al inicio
            selected.insert(0, anchor_place)
            for c in valid_candidates:
                if c in selected or c.id == anchor_place.id:
                    continue
                if any(has_subtype_duplication(s, c) for s in selected):
                    continue
                if is_place_open_and_feasible(c, current_time_runner, day_req, min_buffer_hours=0.5):
                    selected.append(c)
                    break

    if anchor_place:
        return selected[:effective_max]

    optimized = optimize_route_anti_zigzag(selected)
    return optimized

def resolve_anchor_neighborhood(request: PlanRequest, places: List[Place]) -> str:
    """
    Si el usuario eligió 'Cualquiera' (aleatoria / sorpréndeme),
    selecciona un único barrio ancla que tenga al menos 2 opciones abiertas y viables para este horario.
    Garantiza que la ronda SIEMPRE sea 100% peatonal dentro del mismo barrio (RULE-DOM-01, RULE-DOM-07).
    """
    if request.neighborhood and request.neighborhood.lower() != "cualquiera":
        return request.neighborhood

    core_barrios = ["San Telmo", "Palermo", "Chacarita", "Recoleta", "Colegiales", "Belgrano"]
    
    start_hour = None
    start_min = 0
    if request.start_time and ":" in request.start_time:
        try:
            parts = request.start_time.split(":")
            start_hour = int(parts[0])
            start_min = int(parts[1])
        except Exception:
            pass
    cur_h_cont = float(start_hour or 20) + (float(start_min) / 60.0)
    if cur_h_cont < 6.0: cur_h_cont += 24.0
    day_req = (request.day_of_week or datetime.now().strftime("%A")).lower()

    viable_by_barrio = []
    for b in core_barrios:
        open_count = sum(
            1 for p in places
            if p.neighborhood.lower() == b.lower() and is_place_open_and_feasible(p, cur_h_cont, day_req, min_buffer_hours=0.75)
        )
        if open_count >= 2:
            viable_by_barrio.append(b)

    if viable_by_barrio:
        return random.choice(viable_by_barrio)
    
    return random.choice(core_barrios)

def filter_candidates(request: PlanRequest, places: Optional[List[Place]] = None) -> List[Place]:
    """
    Filtra y puntúa los lugares del catálogo según el requerimiento.
    Cumple con RULE-TOK-02: Máximo 6 a 8 candidatos para mantener el prompt ultracompacto.
    Garantiza diversidad de categorías (RULE-DOM-04) y sincronización horaria fáctica día a día.
    Garantiza confinamiento en UN SOLO barrio ancla cuando se pide 'Cualquiera' (RULE-DOM-01).
    """
    source_places = places or ALL_PLACES
    scored_places = []

    # Determinar el barrio ancla de la salida (si es 'Cualquiera', se resuelve a un único barrio con vida activa)
    target_barrio = getattr(request, "target_neighborhood", None) or resolve_anchor_neighborhood(request, source_places)
    request.target_neighborhood = target_barrio

    start_hour = None
    start_min = 0
    if request.start_time and ":" in request.start_time:
        try:
            parts = request.start_time.split(":")
            start_hour = int(parts[0])
            start_min = int(parts[1])
        except Exception:
            pass

    is_trasnoche = start_hour is not None and (1 <= start_hour < 6)
    is_late_night = start_hour is not None and (0 <= start_hour < 6)
    is_evening_transition = start_hour is not None and (start_hour > 19 or (start_hour == 19 and start_min >= 15))

    cur_h_cont = float(start_hour or 20) + (float(start_min) / 60.0)
    if cur_h_cont < 6.0:
        cur_h_cont += 24.0

    day_req = (request.day_of_week or datetime.now().strftime("%A")).lower()

    mood_category_affinities = {
        "foodie": ["dining", "cafe"],
        "cultural": ["culture", "bookstore", "park"],
        "pareja": ["dining", "nightlife", "park", "cafe"],
        "amigos": ["dining", "nightlife", "cafe"],
        "solo": ["cafe", "bookstore", "park", "culture"],
        "tranquilo": ["park", "cafe", "bookstore"]
    }

    preferred_categories = mood_category_affinities.get(request.mood, [])
    allow_adjacent = getattr(request, "allow_neighboring_barrio", False)
    adjacent_allowed = ADJACENT_NEIGHBORHOODS.get(target_barrio, []) if allow_adjacent else []

    for p in source_places:
        score = 0

        # Filtro estricto por horario, día y buffer de cierre de 45 min
        if not is_place_open_and_feasible(p, cur_h_cont, day_req, min_buffer_hours=0.75):
            continue

        # GUARDA-RAÍL INVIOLABLE: Solo admitir lugares del barrio ancla (o lindero si está habilitado)
        if p.neighborhood.lower() == target_barrio.lower():
            score += 15
        elif allow_adjacent and p.neighborhood in adjacent_allowed:
            score += 6
        else:
            continue

        # Si es trasnoche (01:00 - 05:00), solo admitir bares/refugios con noche
        if is_trasnoche:
            if "night" not in p.recommended_times or p.category not in ["nightlife", "dining", "culture"]:
                continue
            score += 15
        elif request.time_of_day == "night" or is_evening_transition or is_late_night:
            if "night" not in p.recommended_times:
                continue
            if p.category in ["dining", "nightlife"] or "bar_notable" in (p.subcategories or []):
                score += 12
        else:
            if request.time_of_day != "full_day":
                if request.time_of_day in p.recommended_times:
                    score += 10
                else:
                    continue

        # Filtro de afinidad con el mood
        if p.category in preferred_categories:
            score += 6

        # Compatibilidad de presupuesto
        if request.price_tier == "$" and p.price_tier == "$$$":
            continue
        elif request.price_tier == p.price_tier:
            score += 4

        scored_places.append((score, p))

    # Ordenar por score descendente
    scored_places.sort(key=lambda x: x[0], reverse=True)

    # Asegurar diversidad de categorías garantizando opciones para los slots canónicos (RULE-DOM-07)
    base_h = start_hour if start_hour is not None else 20
    canonical_needed = [get_canonical_slot_target_category(s_idx, base_h) for s_idx in range(3)]

    diverse_candidates = []
    # 1. Asegurar al menos una opción para cada slot canónico
    for target_group in canonical_needed:
        for _, p in scored_places:
            if p not in diverse_candidates and p.category in target_group:
                diverse_candidates.append(p)
                break

    # 2. Completar hasta 6 con los de mejor score manteniendo variedad
    category_counts = {}
    for p in diverse_candidates:
        category_counts[p.category] = category_counts.get(p.category, 0) + 1

    for _, p in scored_places:
        if len(diverse_candidates) >= 6:
            break
        if p in diverse_candidates:
            continue
        count = category_counts.get(p.category, 0)
        if count < 2:
            diverse_candidates.append(p)
            category_counts[p.category] = count + 1

    candidates = diverse_candidates if len(diverse_candidates) >= 2 else [p for _, p in scored_places[:6]]

    # Si se solicitó un lugar ancla garantizado, asegurar que esté presente entre los candidatos prioritarios
    if getattr(request, "anchor_place_id", None):
        anchor_p = next((p for p in source_places if p.id == request.anchor_place_id), None)
        if anchor_p and anchor_p not in candidates:
            candidates.insert(0, anchor_p)
            if len(candidates) > 8:
                candidates = candidates[:8]

    # Si en el barrio no hay opciones abiertas (ej. trasnoche extrema), traer refugios nocturnos de la ciudad
    if len(candidates) < 1:
        open_anywhere = [
            p for p in source_places
            if is_place_open_and_feasible(p, cur_h_cont, day_req, min_buffer_hours=0.75) and "night" in p.recommended_times
        ]
        candidates = open_anywhere[:4]

    return candidates

def resolve_suggested_activity(neighborhood_name: str, day_of_week: Optional[str] = None, is_night_plan: bool = False, is_trasnoche: bool = False) -> Optional[SuggestedActivityInfo]:
    """Retorna la actividad complementaria del barrio validando día real (RULE-DOM-08) y noche."""
    if is_trasnoche:
        return None
    if is_night_plan and neighborhood_name in NEIGHBORHOOD_NIGHT_SUGGESTED_ACTIVITIES:
        return NEIGHBORHOOD_NIGHT_SUGGESTED_ACTIVITIES[neighborhood_name]
    
    day_str = (day_of_week or datetime.now().strftime("%A")).lower()
    is_weekend = day_str in ["saturday", "sunday"]

    if is_weekend:
        act = NEIGHBORHOOD_SUGGESTED_ACTIVITIES.get(neighborhood_name)
        if act and act.valid_days and day_str in act.valid_days:
            return act
        return act or NEIGHBORHOOD_WEEKDAY_SUGGESTED_ACTIVITIES.get(neighborhood_name)
    else:
        # En días de semana, NUNCA sugerir ferias de fin de semana (RULE-DOM-08)
        return NEIGHBORHOOD_WEEKDAY_SUGGESTED_ACTIVITIES.get(neighborhood_name) or NEIGHBORHOOD_SUGGESTED_ACTIVITIES.get(neighborhood_name)

def generate_fallback_plan(request: PlanRequest, candidates: List[Place]) -> PlanResponse:
    """
    Genera un itinerario determinista y de alta calidad basado en la hora exacta
    de la consulta (Garantiza RULE-DEV-03, RULE-DOM-04 y realismo temporal dinámico).
    """
    start_dt = parse_start_time(request.start_time, request.is_now, request.time_of_day)
    current_dt = start_dt

    is_trasnoche = (1 <= start_dt.hour < 6)
    is_night_plan = (start_dt.hour >= 20 or start_dt.hour < 6 or request.time_of_day == "night")
    requested_stops = getattr(request, "stops_count", None)
    if requested_stops and requested_stops in [2, 3]:
        effective_max_stops = 1 if is_trasnoche else requested_stops
    else:
        effective_max_stops = 1 if is_trasnoche else (2 if is_night_plan else 3)

    day_val = getattr(request, "day_of_week", None) or datetime.now().strftime("%A").lower()

    if not candidates:
        cur_h_cont = float(start_dt.hour) + (float(start_dt.minute) / 60.0)
        if cur_h_cont < 6.0: cur_h_cont += 24.0
        candidates = [p for p in ALL_PLACES if is_place_open_and_feasible(p, cur_h_cont, day_val, min_buffer_hours=0.75)]
        if not candidates:
            logger.warning(f"No hay lugares abiertos factibles en CABA a las {start_dt.strftime('%H:%M')} hs.")
            return PlanResponse(
                id=f"ronda_sleeping_{uuid.uuid4().hex[:8]}",
                title=f"{request.neighborhood} está durmiendo",
                neighborhood=request.neighborhood,
                theme="Trasnoche en Buenos Aires",
                estimated_duration_minutes=0,
                estimated_total_price_ars=0,
                narrative_summary=f"A las {start_dt.strftime('%H:%M')} hs los locales del barrio ya cerraron sus cocinas. Próximamente se sumarán más opciones nocturnas a Ronda.",
                schedule=[],
                suggested_activity=None
            )

    allow_adjacent = getattr(request, "allow_neighboring_barrio", False)
    anchor_id = getattr(request, "anchor_place_id", None)
    anchor_pos = getattr(request, "anchor_position", "end") or "end"

    selected = select_diverse_itinerary(
        candidates, 
        max_stops=effective_max_stops, 
        start_hour=start_dt.hour, 
        day_of_week=day_val,
        allow_neighboring_barrio=allow_adjacent,
        anchor_place_id=anchor_id,
        anchor_position=anchor_pos
    )
    if not selected:
        selected = candidates[:effective_max_stops]

    target_barrio = getattr(request, "target_neighborhood", None) or (
        request.neighborhood if request.neighborhood != "Cualquiera" else selected[0].neighborhood
    )
    neighborhood_name = target_barrio

    schedule: List[PlanItem] = []
    for idx, place in enumerate(selected):
        # Duración mínima de ~90 min (1 h 30 min) para salidas de noche/cena/copas porteñas
        is_night_time = current_dt.hour >= 20 or current_dt.hour < 6
        default_dur = 90 if is_night_time else 75
        duration = max(default_dur if is_night_time else 35, min(place.typical_duration_minutes or default_dur, 105))
        
        # Chequeo de aviso "Cierra pronto" y Techo Duro (Hard Stop)
        day_sched = get_place_day_schedule(place, day_val)
        close_h_val = day_sched.get("close_hour")
        is_closing_soon = False
        closing_warning = None
        closes_at_str = day_sched.get("close")

        if close_h_val is not None:
            if close_h_val <= 7.0: close_h_val += 24.0
            arrival_h = current_dt.hour + (current_dt.minute / 60.0)
            if arrival_h < 6.0: arrival_h += 24.0
            diff_hours = close_h_val - arrival_h
            
            # Si el local ya está cerrado al momento de llegar, NO lo programamos
            if diff_hours <= 0:
                logger.warning(f"Lugar {place.name} ya está cerrado a las {current_dt.strftime('%H:%M')} hs (cierra {closes_at_str} hs). Saltando parada.")
                continue

            if 0.5 <= diff_hours <= 1.25:
                is_closing_soon = True
                closing_warning = f"⚠️ Cierra a las {closes_at_str} hs · Te conviene entrar ya"
            
            # Techo Duro: la permanencia no puede exceder el horario de cierre del local
            max_mins_to_close = int(diff_hours * 60)
            if duration > max_mins_to_close:
                duration = max(30, max_mins_to_close)

        end_dt = current_dt + timedelta(minutes=duration)
        slot_time = f"{current_dt.strftime('%H:%M')} - {end_dt.strftime('%H:%M')}"
        default_act = get_activity_label_for_time(place, current_dt.hour)

        is_last = idx == len(selected) - 1
        transit = None
        if not is_last:
            next_place = selected[idx + 1]
            dist_km = calculate_distance(place, next_place) or 0.5
            if dist_km <= 1.8:
                transit_mins = max(4, round(dist_km * 10))
                mode = "a pie"
                notes = f"Caminata tranquila de {transit_mins} min (~{int(dist_km * 1000)} m) por {place.neighborhood}."
            else:
                transit_mins = max(8, round(dist_km * 2.5 + 4))
                mode = "en auto / taxi"
                notes = f"Traslado en auto/taxi de ~{transit_mins} min ({dist_km:.1f} km)."

            transit = TransitInfo(
                mode=mode,
                duration_minutes=transit_mins,
                notes=notes
            )
            current_dt = end_dt + timedelta(minutes=transit_mins)
        else:
            current_dt = end_dt

        schedule.append(
            PlanItem(
                time_slot=slot_time,
                place_name=place.name,
                address=place.address,
                activity_type=default_act,
                duration_minutes=duration,
                porteño_tip=place.highlight,
                lat=place.lat,
                lng=place.lng,
                description=place.description,
                activities=place.activities,
                image_url=place.image_url,
                about=place.about,
                payment_methods=place.payment_methods,
                pet_friendly=place.pet_friendly,
                pet_friendly_details=place.pet_friendly_details,
                vegetarian_friendly=place.vegetarian_friendly,
                vegetarian_details=place.vegetarian_details,
                features=place.features,
                is_closing_soon=is_closing_soon,
                closing_soon_warning=closing_warning,
                closes_at=closes_at_str,
                transit_to_next=transit
            )
        )

    title = f"Refugio de trasnoche en {neighborhood_name}." if is_trasnoche else f"Una ronda por {neighborhood_name}."
    suggested_act = resolve_suggested_activity(neighborhood_name, day_of_week=day_val, is_night_plan=is_night_plan, is_trasnoche=is_trasnoche)

    return PlanResponse(
        id=f"ronda_{uuid.uuid4().hex[:8]}",
        title=title,
        neighborhood=neighborhood_name,
        mood=request.mood,
        estimated_cost=request.price_tier or "$$",
        narrative_summary=(
            f"Una parada de refugio nocturno en {neighborhood_name} para disfrutar la madrugada porteña a partir de las {start_dt.strftime('%H:%M')}."
            if is_trasnoche else
            f"Un plan diseñado con precisión para disfrutar la vibra de {neighborhood_name} saliendo a partir de las {start_dt.strftime('%H:%M')}. Cada parada está conectada a pie respetando los tiempos auténticos porteños."
        ),
        schedule=schedule,
        suggested_activity=suggested_act
    )

async def generate_plan(request: PlanRequest) -> PlanResponse:
    """
    Orquesta la generación del itinerario:
    1. Pre-filtra candidatos cumpliendo RULE-TOK-02 (<1200 tokens).
    2. Invoca a Gemini 2.5 Flash con salida JSON estructurada con Pydantic.
    3. Si la API no está configurada o falla, activa el fallback determinista (RULE-DEV-03).
    """
    candidates = filter_candidates(request)
    api_key = os.getenv("GEMINI_API_KEY", "").strip()

    if not api_key or api_key == "your_gemini_api_key_here":
        logger.info("GEMINI_API_KEY no detectada. Utilizando generador de fallback determinista.")
        return generate_fallback_plan(request, candidates)

    try:
        from google import genai
        from google.genai import types

        client = genai.Client(api_key=api_key)

        start_dt = parse_start_time(request.start_time, request.is_now, request.time_of_day)
        start_formatted = start_dt.strftime("%H:%M")

        candidates_summary = [
            {
                "name": p.name,
                "address": p.address,
                "neighborhood": p.neighborhood,
                "category": p.category,
                "vibe": p.vibe,
                "highlight": p.highlight,
                "closes_at": get_place_day_schedule(p, day_val).get("close", "01:00"),
                "duration_min": max(80, p.typical_duration_minutes or 90)
            }
            for p in candidates
        ]

        anchor_barrio = getattr(request, "target_neighborhood", None) or (
            request.neighborhood if request.neighborhood != "Cualquiera" else (candidates[0].neighborhood if candidates else "San Telmo")
        )

        prompt = f"""Eres el curador experto de 'Ronda', la app de salidas auténticas y espontáneas en Buenos Aires (CABA).
Crea un itinerario cronológico, coherente y fluido basado EXCLUSIVAMENTE en estos lugares candidatos:
{json.dumps(candidates_summary, ensure_ascii=False)}

Petición del usuario:
- Barrio objetivo: {anchor_barrio}
- Momento del día: {request.time_of_day}
- Hora de inicio calculada: {start_formatted} {'(SALIDA INMEDIATA / AHORA)' if request.is_now else ''}
- Ocasión/Mood: {request.mood}
- Presupuesto: {request.price_tier}
- Notas adicionales: {request.custom_notes or 'Ninguna'}

REGLAS ESTRICTAS DE CALIDAD Y CONTINUIDAD:
1. El campo 'title' DEBE ser exactamente: "Una ronda por {anchor_barrio}."
2. CONTINUIDAD Y HORARIOS REALES (CRÍTICO):
   - La PRIMERA parada DEBE iniciar exactamente en el horario de inicio solicitado ({start_formatted}). JAMÁS propongas un horario del pasado ni anterior a las {start_formatted}.
   - Si la salida es a la madrugada o trasnoche (ej: 00:00 a 05:00), los lugares y actividades DEBEN ser coctelería, bares o trasnoche porteño, NUNCA desayunos, meriendas ni museos cerrados.
   - Cada parada siguiente debe comenzar después de que concluya la anterior más el traslado a pie (ejemplo: Parada 1 de {start_formatted} a XX:XX, caminata 8-10 min, Parada 2 de XX:XX a YY:YY).
3. CONFINAMIENTO PEATONAL ESTRICTO (CRÍTICO):
   - Todas las paradas DEBEN pertenecer exclusivamente a {anchor_barrio} (o barrio vecino colindante a pie si aplica).
   - Queda TERMINANTEMENTE PROHIBIDO mezclar barrios lejanos (ej: jamás Palermo con San Telmo). La caminata entre paradas debe ser de 4 a 12 minutos a pie dentro del barrio.
3. COHERENCIA DE SALIDA SEGÚN LA HORA (REGLA DE ORO DE LA NOCHE):
   - En salidas nocturnas (horario después de las 20:00 o noche): Sugiere COMO MÁXIMO 2 paradas o a lo sumo 3 si tienen lógica estricta:
     * Si son 2 paradas: Lugar para CENAR (bodegón, restaurante o parrilla) y luego un BAR DE COPAS o HELADERÍA nocturna.
     * Si son 3 paradas: Previa/Vermut temprano -> Cena -> Coctelería/Helado nocturno.
   - NUNCA SUGIERAS CAFETERÍAS DIURNAS, TOSTADORES DE CAFÉ (como LAB o Cuervo) NI LIBRERÍAS CERRADAS de noche o de madrugada.
   - Si es noche temprana (20:00 - 22:30): Primero cena y luego coctelería o sobremesa.
   - Si es trasnoche / madrugada (00:00 - 05:00): Bares de copas, speakeasies o picoteo nocturno.
   - Si es de tarde: Primero merienda/café y luego paseo o vermut.
   - Si es matutina: Primero desayuno y luego cultura o caminata.
4. El campo 'porteño_tip' debe ser el consejo fáctico o encanto porteño del lugar.
5. Si no es la última parada, incluye 'transit_to_next' indicando modo ('a pie') y minutos (entre 5 y 12 minutos).
6. El tono del 'narrative_summary' debe ser cálido, local y entusiasta.
7. DIVERSIDAD CATEGÓRICA INQUEBRANTABLE (RULE-DOM-04):
   - Queda TERMINANTEMENTE PROHIBIDO concatenar dos paradas de la misma categoría (NUNCA café -> café, NUNCA cena -> cena).
   - El itinerario debe progresar con sentido común porteño: en la tarde (Paseo/Parque/Cultura + Merienda/Café + Helado/Vermut al atardecer), en la noche (Vermut/Previa + Cena + Coctelería/Tragos). A partir de las 19:15 hs no propongas cafeterías de día.
8. REGLA DE ORO DE COMIDA ÚNICA (RULE-DOM-05 - CRÍTICO):
   - En salidas de ALMUERZO (mediodía) o CENA (noche): Está TERMINANTEMENTE PROHIBIDO asignar dos lugares para comer en el mismo recorrido.
   - SOLO PUEDE HABER UNA comida fuerte (bodegón, restaurante o parrilla). Jamás asignes La Biela y luego Cumaná, ni Quilapán y luego La Brigada.
   - Si hay una comida fuerte, la otra parada gastronómica SOLO puede ser un café corto de sobremesa (30-40 min) o helado, NUNCA otro restaurante ni bodegón.
9. REGLA DE CAFÉ ÚNICO (RULE-DOM-06):
   - En salidas de mañana o merienda, SOLO PUEDE HABER UNA cafetería de especialidad. Jamás asignes dos cafeterías de filtro (ej: nunca LAB y luego Cuervo).
10. DURACIÓN REALISTA DE 90 MINUTOS Y RESPETO ESTRICTO DEL CIERRE:
   - En salidas de noche o cena, cada parada debe tener una duración de ~90 minutos (1 hora y media) para saborear la experiencia sin apuros.
   - Cada parada DEBE concluir estrictamente ANTES del horario de cierre del local ('closes_at'). NUNCA programes una parada cuando el local ya esté cerrado.
"""

        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_json_schema=PlanResponse.model_json_schema(),
                temperature=0.7,
            )
        )

        plan = PlanResponse.model_validate_json(response.text)

        # Asignar actividad sugerida de la zona (nocturna o diurna según horario)
        start_hour_num = None
        if request.start_time and ":" in request.start_time:
            try:
                start_hour_num = int(request.start_time.split(":")[0])
            except Exception:
                pass
        is_night_req = (request.time_of_day == "night" or (start_hour_num is not None and (start_hour_num >= 20 or start_hour_num < 6)))
        
        target_neigh = plan.neighborhood or request.neighborhood
        day_str = getattr(request, "day_of_week", None)
        plan.suggested_activity = resolve_suggested_activity(target_neigh, day_of_week=day_str, is_night_plan=is_night_req, is_trasnoche=False)

        # Enriquecer de forma determinista con coordenadas exactas, descripción y actividades del catálogo sin gastar tokens
        name_to_place = {p.name.lower(): p for p in ALL_PLACES}
        for item in plan.schedule:
            match = name_to_place.get(item.place_name.lower())
            if not match:
                for p in ALL_PLACES:
                    if p.name.lower() in item.place_name.lower() or item.place_name.lower() in p.name.lower():
                        match = p
                        break
            if match:
                if not item.lat or not item.lng:
                    item.lat = match.lat
                    item.lng = match.lng
                if not item.description:
                    item.description = match.description
                if not item.activities:
                    item.activities = match.activities
                item.image_url = match.image_url
                item.about = match.about
                item.payment_methods = match.payment_methods
                item.pet_friendly = match.pet_friendly
                item.pet_friendly_details = match.pet_friendly_details
                item.vegetarian_friendly = match.vegetarian_friendly
                item.vegetarian_details = match.vegetarian_details
                item.features = match.features

        return plan

    except Exception as exc:
        logger.warning(f"Falla o timeout en llamada a Gemini ({exc}). Aplicando fallback determinista.")
        return generate_fallback_plan(request, candidates)
