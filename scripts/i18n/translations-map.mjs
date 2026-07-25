/** @type {Record<string, { nl: string; fr: string; es: string; de: string }>} */
export const TRANSLATIONS = {
  "({count, plural, one {# review} other {# reviews}})": {
    nl: "({count, plural, one {# review} other {# reviews}})",
    fr: "({count, plural, one {# avis} other {# avis}})",
    es: "({count, plural, one {# reseña} other {# reseñas}})",
    de: "({count, plural, one {# Bewertung} other {# Bewertungen}})"
  },
  "{available} available · {reserved} reserved · {total} total": {
    nl: "{available} beschikbaar · {reserved} gereserveerd · {total} totaal",
    fr: "{available} disponibles · {reserved} réservées · {total} au total",
    es: "{available} disponibles · {reserved} reservadas · {total} en total",
    de: "{available} verfügbar · {reserved} reserviert · {total} gesamt"
  },
  "{count, plural, =0 {No experiences} one {# experience} other {# experiences}}":
    {
      nl: "{count, plural, =0 {Geen experiences} one {# experience} other {# experiences}}",
      fr: "{count, plural, =0 {Aucune expérience} one {# expérience} other {# expériences}}",
      es: "{count, plural, =0 {Ninguna experiencia} one {# experiencia} other {# experiencias}}",
      de: "{count, plural, =0 {Keine Erlebnisse} one {# Erlebnis} other {# Erlebnisse}}"
    },
  "{count, plural, one {# guest} other {# guests}}": {
    nl: "{count, plural, one {# gast} other {# gasten}}",
    fr: "{count, plural, one {# invité} other {# invités}}",
    es: "{count, plural, one {# huésped} other {# huéspedes}}",
    de: "{count, plural, one {# Gast} other {# Gäste}}"
  },
  "{count, plural, one {# open slot} other {# open slots}}": {
    nl: "{count, plural, one {# vrij slot} other {# vrije slots}}",
    fr: "{count, plural, one {# créneau libre} other {# créneaux libres}}",
    es: "{count, plural, one {# plaza libre} other {# plazas libres}}",
    de: "{count, plural, one {# freier Slot} other {# freie Slots}}"
  },
  "{count, plural, one {# spot left} other {# spots left}}": {
    nl: "{count, plural, one {# plek over} other {# plekken over}}",
    fr: "{count, plural, one {# place restante} other {# places restantes}}",
    es: "{count, plural, one {# plaza restante} other {# plazas restantes}}",
    de: "{count, plural, one {# Platz übrig} other {# Plätze übrig}}"
  },
  "{count} left": {
    nl: "{count} over",
    fr: "{count} restantes",
    es: "{count} restantes",
    de: "{count} übrig"
  },
  "{count} spots": {
    nl: "{count} plekken",
    fr: "{count} places",
    es: "{count} plazas",
    de: "{count} Plätze"
  },
  "{hours} hour": {
    nl: "{hours} uur",
    fr: "{hours} heure",
    es: "{hours} hora",
    de: "{hours} Stunde"
  },
  "{hours} hours": {
    nl: "{hours} uur",
    fr: "{hours} heures",
    es: "{hours} horas",
    de: "{hours} Stunden"
  },
  "{hours}h {minutes}m": {
    nl: "{hours}u {minutes}m",
    fr: "{hours}h {minutes}m",
    es: "{hours}h {minutes}m",
    de: "{hours}h {minutes}m"
  },
  "{minutes} minutes": {
    nl: "{minutes} minuten",
    fr: "{minutes} minutes",
    es: "{minutes} minutos",
    de: "{minutes} Minuten"
  },
  "{title} at {location}": {
    nl: "{title} in {location}",
    fr: "{title} à {location}",
    es: "{title} en {location}",
    de: "{title} in {location}"
  },
  "{title} map preview": {
    nl: "Kaartvoorbeeld {title}",
    fr: "Aperçu carte {title}",
    es: "Vista previa del mapa {title}",
    de: "Kartenvorschau {title}"
  },
  "© {year} CostaPulse": {
    nl: "© {year} CostaPulse",
    fr: "© {year} CostaPulse",
    es: "© {year} CostaPulse",
    de: "© {year} CostaPulse"
  },
  "A different view of hidden coves, clear water and dramatic coastline.": {
    nl: "Een andere kijk op verborgen baaien, helder water en een dramatische kustlijn.",
    fr: "Une autre vue sur des criques cachées, une eau claire et un littoral spectaculaire.",
    es: "Otra mirada a calas escondidas, aguas claras y un litoral espectacular.",
    de: "Ein anderer Blick auf verborgene Buchten, klares Wasser und dramatische Küste."
  },
  About: {
    nl: "Over ons",
    fr: "À propos",
    es: "Sobre nosotros",
    de: "Über uns"
  },
  "About CostaPulse": {
    nl: "Over CostaPulse",
    fr: "À propos de CostaPulse",
    es: "Sobre CostaPulse",
    de: "Über CostaPulse"
  },
  "Accept analytics": {
    nl: "Analytics accepteren",
    fr: "Accepter les analyses",
    es: "Aceptar analítica",
    de: "Analyse akzeptieren"
  },
  Account: {
    nl: "Account",
    fr: "Compte",
    es: "Cuenta",
    de: "Konto"
  },
  "Account overview": {
    nl: "Accountoverzicht",
    fr: "Aperçu du compte",
    es: "Resumen de la cuenta",
    de: "Kontoübersicht"
  },
  "Add a message (optional)": {
    nl: "Bericht toevoegen (optioneel)",
    fr: "Ajouter un message (facultatif)",
    es: "Añadir un mensaje (opcional)",
    de: "Nachricht hinzufügen (optional)"
  },
  "Adjust the date range or create a new availability slot.": {
    nl: "Pas het datumbereik aan of maak een nieuw beschikbaarheidsvak.",
    fr: "Ajustez la plage de dates ou créez un nouveau créneau.",
    es: "Ajusta el rango de fechas o crea una nueva franja de disponibilidad.",
    de: "Zeitraum anpassen oder neuen Verfügbarkeitsslot erstellen."
  },
  Admin: {
    nl: "Admin",
    fr: "Admin",
    es: "Admin",
    de: "Admin"
  },
  "Admin access now requires authenticated Supabase roles instead of public placeholder pages.":
    {
      nl: "Admin-toegang vereist nu geauthenticeerde Supabase-rollen in plaats van openbare placeholderpagina’s.",
      fr: "L’accès admin exige désormais des rôles Supabase authentifiés plutôt que des pages publiques fictives.",
      es: "El acceso de admin ahora requiere roles autenticados de Supabase en lugar de páginas públicas de marcador.",
      de: "Admin-Zugang erfordert jetzt authentifizierte Supabase-Rollen statt öffentlicher Platzhalterseiten."
    },
  "Admin data could not be loaded": {
    nl: "Admingegevens konden niet worden geladen",
    fr: "Les données admin n’ont pas pu être chargées",
    es: "No se pudieron cargar los datos de administración",
    de: "Admindaten konnten nicht geladen werden"
  },
  Administration: {
    nl: "Beheer",
    fr: "Administration",
    es: "Administración",
    de: "Administration"
  },
  "All experiences": {
    nl: "Alle experiences",
    fr: "Toutes les expériences",
    es: "Todas las experiencias",
    de: "Alle Erlebnisse"
  },
  "All hosts": {
    nl: "Alle hosts",
    fr: "Tous les hôtes",
    es: "Todos los anfitriones",
    de: "Alle Gastgeber"
  },
  "All locations": {
    nl: "Alle locaties",
    fr: "Tous les lieux",
    es: "Todas las ubicaciones",
    de: "Alle Orte"
  },
  "All times are local ({timezone}).": {
    nl: "Alle tijden zijn lokaal ({timezone}).",
    fr: "Toutes les heures sont locales ({timezone}).",
    es: "Todas las horas son locales ({timezone}).",
    de: "Alle Zeiten sind lokal ({timezone})."
  },
  "All types": {
    nl: "Alle types",
    fr: "Tous les types",
    es: "Todos los tipos",
    de: "Alle Typen"
  },
  Always: {
    nl: "Altijd",
    fr: "Toujours",
    es: "Siempre",
    de: "Immer"
  },
  "Analytics cookies": {
    nl: "Analysecookies",
    fr: "Cookies d’analyse",
    es: "Cookies de analítica",
    de: "Analyse-Cookies"
  },
  "And more": {
    nl: "En meer",
    fr: "Et plus encore",
    es: "Y más",
    de: "Und mehr"
  },
  "Any special wishes or requests?": {
    nl: "Speciale wensen of verzoeken?",
    fr: "Souhaits ou demandes particulières ?",
    es: "¿Algún deseo o petición especial?",
    de: "Besondere Wünsche oder Anfragen?"
  },
  "Apply filters": {
    nl: "Filters toepassen",
    fr: "Appliquer les filtres",
    es: "Aplicar filtros",
    de: "Filter anwenden"
  },
  "Assigned team": {
    nl: "Toegewezen team",
    fr: "Équipe assignée",
    es: "Equipo asignado",
    de: "Zugewiesenes Team"
  },
  "Availability calendar": {
    nl: "Beschikbaarheidskalender",
    fr: "Calendrier de disponibilité",
    es: "Calendario de disponibilidad",
    de: "Verfügbarkeitskalender"
  },
  "Availability could not be checked. Please try again.": {
    nl: "Beschikbaarheid kon niet worden gecontroleerd. Probeer opnieuw.",
    fr: "La disponibilité n’a pas pu être vérifiée. Veuillez réessayer.",
    es: "No se pudo comprobar la disponibilidad. Inténtalo de nuevo.",
    de: "Verfügbarkeit konnte nicht geprüft werden. Bitte erneut versuchen."
  },
  "Availability could not be loaded. Please try again.": {
    nl: "Beschikbaarheid kon niet worden geladen. Probeer opnieuw.",
    fr: "La disponibilité n’a pas pu être chargée. Veuillez réessayer.",
    es: "No se pudo cargar la disponibilidad. Inténtalo de nuevo.",
    de: "Verfügbarkeit konnte nicht geladen werden. Bitte erneut versuchen."
  },
  "Availability slots, capacity, and assigned hosts.": {
    nl: "Beschikbaarheidsslots, capaciteit en toegewezen hosts.",
    fr: "Créneaux, capacité et hôtes assignés.",
    es: "Franjas de disponibilidad, capacidad y anfitriones asignados.",
    de: "Verfügbarkeitsslots, Kapazität und zugewiesene Gastgeber."
  },
  "Available times": {
    nl: "Beschikbare tijden",
    fr: "Horaires disponibles",
    es: "Horarios disponibles",
    de: "Verfügbare Zeiten"
  },
  Back: {
    nl: "Terug",
    fr: "Retour",
    es: "Atrás",
    de: "Zurück"
  },
  "Back home": {
    nl: "Terug naar home",
    fr: "Retour à l’accueil",
    es: "Volver al inicio",
    de: "Zurück zur Startseite"
  },
  "Back to bookings": {
    nl: "Terug naar boekingen",
    fr: "Retour aux réservations",
    es: "Volver a reservas",
    de: "Zurück zu Buchungen"
  },
  "Back to customers": {
    nl: "Terug naar klanten",
    fr: "Retour aux clients",
    es: "Volver a clientes",
    de: "Zurück zu Kunden"
  },
  "Back to experience": {
    nl: "Terug naar experience",
    fr: "Retour à l’expérience",
    es: "Volver a la experiencia",
    de: "Zurück zum Erlebnis"
  },
  "Back to home": {
    nl: "Terug naar home",
    fr: "Retour à l’accueil",
    es: "Volver al inicio",
    de: "Zurück zur Startseite"
  },
  "Book your experience": {
    nl: "Boek je experience",
    fr: "Réservez votre expérience",
    es: "Reserva tu experiencia",
    de: "Erlebnis buchen"
  },
  "Booking confirmed": {
    nl: "Boeking bevestigd",
    fr: "Réservation confirmée",
    es: "Reserva confirmada",
    de: "Buchung bestätigt"
  },
  "Booking could not be loaded": {
    nl: "Boeking kon niet worden geladen",
    fr: "La réservation n’a pas pu être chargée",
    es: "No se pudo cargar la reserva",
    de: "Buchung konnte nicht geladen werden"
  },
  "Booking progress": {
    nl: "Boekingsvoortgang",
    fr: "Progression de la réservation",
    es: "Progreso de la reserva",
    de: "Buchungsfortschritt"
  },
  "Booking reference": {
    nl: "Boekingsreferentie",
    fr: "Référence de réservation",
    es: "Referencia de reserva",
    de: "Buchungsreferenz"
  },
  Bookings: {
    nl: "Boekingen",
    fr: "Réservations",
    es: "Reservas",
    de: "Buchungen"
  },
  "Bookings this period": {
    nl: "Boekingen deze periode",
    fr: "Réservations sur la période",
    es: "Reservas en este periodo",
    de: "Buchungen in diesem Zeitraum"
  },
  "Browse experiences": {
    nl: "Bekijk experiences",
    fr: "Parcourir les expériences",
    es: "Explorar experiencias",
    de: "Erlebnisse entdecken"
  },
  Calendar: {
    nl: "Kalender",
    fr: "Calendrier",
    es: "Calendario",
    de: "Kalender"
  },
  Capacity: {
    nl: "Capaciteit",
    fr: "Capacité",
    es: "Capacidad",
    de: "Kapazität"
  },
  "Check Availability": {
    nl: "Beschikbaarheid checken",
    fr: "Vérifier la disponibilité",
    es: "Comprobar disponibilidad",
    de: "Verfügbarkeit prüfen"
  },
  "Checking…": {
    nl: "Bezig met controleren…",
    fr: "Vérification…",
    es: "Comprobando…",
    de: "Wird geprüft…"
  },
  "Choose a duration option to continue.": {
    nl: "Kies een duur om verder te gaan.",
    fr: "Choisissez une durée pour continuer.",
    es: "Elige una duración para continuar.",
    de: "Wähle eine Dauer, um fortzufahren."
  },
  "Choose an available date for your experience.": {
    nl: "Kies een beschikbare datum voor je experience.",
    fr: "Choisissez une date disponible pour votre expérience.",
    es: "Elige una fecha disponible para tu experiencia.",
    de: "Wähle ein verfügbares Datum für dein Erlebnis."
  },
  "Choose from yacht experiences, paddle adventures and sunset hospitality with trusted local hosts.":
    {
      nl: "Kies uit yacht experiences, paddle-avonturen en sunset hospitality met betrouwbare lokale hosts.",
      fr: "Choisissez parmi des sorties yacht, des aventures paddle et une hospitalité au coucher du soleil avec des hôtes locaux de confiance.",
      es: "Elige entre experiencias en yate, aventuras de paddle y hospitalidad al atardecer con anfitriones locales de confianza.",
      de: "Wähle aus Yacht-Erlebnissen, Paddle-Abenteuern und Sunset-Hospitality mit vertrauenswürdigen lokalen Gastgebern."
    },
  "Choose your perfect day.": {
    nl: "Kies jouw perfecte dag.",
    fr: "Choisissez votre journée idéale.",
    es: "Elige tu día perfecto.",
    de: "Wähle deinen perfekten Tag."
  },
  "Chosen with care": {
    nl: "Met zorg gekozen",
    fr: "Choisis avec soin",
    es: "Elegidos con cuidado",
    de: "Sorgfältig ausgewählt"
  },
  "Clear filters": {
    nl: "Filters wissen",
    fr: "Effacer les filtres",
    es: "Borrar filtros",
    de: "Filter zurücksetzen"
  },
  "Clear guidance and thoughtful service, from first inspiration to your day on the coast.":
    {
      nl: "Duidelijke begeleiding en doordachte service, van eerste inspiratie tot jouw dag aan de kust.",
      fr: "Des conseils clairs et un service attentionné, de la première inspiration à votre journée sur la côte.",
      es: "Orientación clara y un servicio atento, desde la primera inspiración hasta tu día en la costa.",
      de: "Klare Orientierung und durchdachter Service – von der ersten Inspiration bis zu deinem Tag an der Küste."
    },
  "Clear selection": {
    nl: "Selectie wissen",
    fr: "Effacer la sélection",
    es: "Borrar selección",
    de: "Auswahl löschen"
  },
  Close: {
    nl: "Sluiten",
    fr: "Fermer",
    es: "Cerrar",
    de: "Schließen"
  },
  "Close filters": {
    nl: "Filters sluiten",
    fr: "Fermer les filtres",
    es: "Cerrar filtros",
    de: "Filter schließen"
  },
  "Close navigation menu": {
    nl: "Navigatiemenu sluiten",
    fr: "Fermer le menu de navigation",
    es: "Cerrar el menú de navegación",
    de: "Navigationsmenü schließen"
  },
  "Coastal adventures": {
    nl: "Kustavonturen",
    fr: "Aventures côtières",
    es: "Aventuras costeras",
    de: "Küstenabenteuer"
  },
  "Complete all required booking details before paying.": {
    nl: "Vul alle verplichte boekingsgegevens in vóór betaling.",
    fr: "Complétez tous les détails obligatoires avant de payer.",
    es: "Completa todos los datos obligatorios de la reserva antes de pagar.",
    de: "Vervollständige alle Pflichtangaben vor der Zahlung."
  },
  "Concierge and hosted service offerings will appear here as they are published.":
    {
      nl: "Concierge- en hosted services verschijnen hier zodra ze gepubliceerd zijn.",
      fr: "Les offres conciergerie et services hébergés apparaîtront ici dès leur publication.",
      es: "Las ofertas de conserjería y servicios con anfitrión aparecerán aquí cuando se publiquen.",
      de: "Concierge- und Hosted-Services erscheinen hier, sobald sie veröffentlicht sind."
    },
  "Confirm your details, then continue to secure payment.": {
    nl: "Bevestig je gegevens en ga door naar veilige betaling.",
    fr: "Confirmez vos informations, puis continuez vers le paiement sécurisé.",
    es: "Confirma tus datos y continúa al pago seguro.",
    de: "Bestätige deine Angaben und fahre mit der sicheren Zahlung fort."
  },
  "Confirmed bookings": {
    nl: "Bevestigde boekingen",
    fr: "Réservations confirmées",
    es: "Reservas confirmadas",
    de: "Bestätigte Buchungen"
  },
  "Connected to Supabase": {
    nl: "Verbonden met Supabase",
    fr: "Connecté à Supabase",
    es: "Conectado a Supabase",
    de: "Mit Supabase verbunden"
  },
  Contact: {
    nl: "Contact",
    fr: "Contact",
    es: "Contacto",
    de: "Kontakt"
  },
  "Contact CostaPulse": {
    nl: "Contact CostaPulse",
    fr: "Contacter CostaPulse",
    es: "Contactar con CostaPulse",
    de: "CostaPulse kontaktieren"
  },
  "Contact options will appear here when they are published.": {
    nl: "Contactopties verschijnen hier zodra ze gepubliceerd zijn.",
    fr: "Les options de contact apparaîtront ici dès leur publication.",
    es: "Las opciones de contacto aparecerán aquí cuando se publiquen.",
    de: "Kontaktoptionen erscheinen hier, sobald sie veröffentlicht sind."
  },
  "Contact us and we will create a private Costa Blanca day around your group.":
    {
      nl: "Neem contact op en we creëren een privé Costa Blanca-dag rond jouw groep.",
      fr: "Contactez-nous et nous créerons une journée privée Costa Blanca autour de votre groupe.",
      es: "Contáctanos y crearemos un día privado en Costa Blanca para tu grupo.",
      de: "Kontaktiere uns – wir gestalten einen privaten Costa-Blanca-Tag für deine Gruppe."
    },
  "Continue to booking": {
    nl: "Doorgaan naar boeking",
    fr: "Continuer vers la réservation",
    es: "Continuar a la reserva",
    de: "Weiter zur Buchung"
  },
  "Continue to date & time": {
    nl: "Doorgaan naar datum & tijd",
    fr: "Continuer vers date et heure",
    es: "Continuar a fecha y hora",
    de: "Weiter zu Datum & Uhrzeit"
  },
  "Continue to details": {
    nl: "Doorgaan naar gegevens",
    fr: "Continuer vers les détails",
    es: "Continuar a los datos",
    de: "Weiter zu den Angaben"
  },
  "Continue to extras": {
    nl: "Doorgaan naar extras",
    fr: "Continuer vers les extras",
    es: "Continuar a extras",
    de: "Weiter zu Extras"
  },
  "Continue to review": {
    nl: "Doorgaan naar overzicht",
    fr: "Continuer vers la vérification",
    es: "Continuar a la revisión",
    de: "Weiter zur Prüfung"
  },
  "Costa Blanca · Spain": {
    nl: "Costa Blanca · Spanje",
    fr: "Costa Blanca · Espagne",
    es: "Costa Blanca · España",
    de: "Costa Blanca · Spanien"
  },
  "Costa Blanca destinations": {
    nl: "Costa Blanca-bestemmingen",
    fr: "Destinations Costa Blanca",
    es: "Destinos de Costa Blanca",
    de: "Costa-Blanca-Destinationen"
  },
  "Costa Blanca experiences": {
    nl: "Costa Blanca experiences",
    fr: "Expériences Costa Blanca",
    es: "Experiencias en Costa Blanca",
    de: "Costa-Blanca-Erlebnisse"
  },
  "Costa Blanca location coming soon": {
    nl: "Costa Blanca-locatie volgt binnenkort",
    fr: "Lieu Costa Blanca bientôt disponible",
    es: "Ubicación en Costa Blanca próximamente",
    de: "Costa-Blanca-Standort folgt in Kürze"
  },
  "Costa Blanca map": {
    nl: "Costa Blanca-kaart",
    fr: "Carte Costa Blanca",
    es: "Mapa de Costa Blanca",
    de: "Costa-Blanca-Karte"
  },
  "CostaPulse operations": {
    nl: "CostaPulse-operaties",
    fr: "Opérations CostaPulse",
    es: "Operaciones CostaPulse",
    de: "CostaPulse-Betrieb"
  },
  "CostaPulse pick": {
    nl: "CostaPulse-selectie",
    fr: "Sélection CostaPulse",
    es: "Selección CostaPulse",
    de: "CostaPulse-Tipp"
  },
  "CostaPulse services": {
    nl: "CostaPulse-diensten",
    fr: "Services CostaPulse",
    es: "Servicios CostaPulse",
    de: "CostaPulse-Services"
  },
  "CostaPulse trust signals": {
    nl: "CostaPulse-vertrouwenssignalen",
    fr: "Signaux de confiance CostaPulse",
    es: "Señales de confianza CostaPulse",
    de: "CostaPulse-Vertrauenssignale"
  },
  Created: {
    nl: "Aangemaakt",
    fr: "Créé",
    es: "Creado",
    de: "Erstellt"
  },
  "Curated on the Costa Blanca.": {
    nl: "Geselecteerd op de Costa Blanca.",
    fr: "Sélectionné sur la Costa Blanca.",
    es: "Seleccionado en la Costa Blanca.",
    de: "Kuratiert an der Costa Blanca."
  },
  "Current status: {status}": {
    nl: "Huidige status: {status}",
    fr: "Statut actuel : {status}",
    es: "Estado actual: {status}",
    de: "Aktueller Status: {status}"
  },
  Customer: {
    nl: "Klant",
    fr: "Client",
    es: "Cliente",
    de: "Kunde"
  },
  "Customer records linked to bookings and vouchers.": {
    nl: "Klantrecords gekoppeld aan boekingen en vouchers.",
    fr: "Fiches clients liées aux réservations et bons.",
    es: "Registros de clientes vinculados a reservas y vales.",
    de: "Kundendatensätze verknüpft mit Buchungen und Gutscheinen."
  },
  Customers: {
    nl: "Klanten",
    fr: "Clients",
    es: "Clientes",
    de: "Kunden"
  },
  "Dashboard navigation": {
    nl: "Dashboardnavigatie",
    fr: "Navigation du tableau de bord",
    es: "Navegación del panel",
    de: "Dashboard-Navigation"
  },
  Date: {
    nl: "Datum",
    fr: "Date",
    es: "Fecha",
    de: "Datum"
  },
  "Date & time": {
    nl: "Datum & tijd",
    fr: "Date et heure",
    es: "Fecha y hora",
    de: "Datum & Uhrzeit"
  },
  "Date & Time": {
    nl: "Datum & tijd",
    fr: "Date et heure",
    es: "Fecha y hora",
    de: "Datum & Uhrzeit"
  },
  "Date to be selected": {
    nl: "Datum nog te kiezen",
    fr: "Date à sélectionner",
    es: "Fecha por seleccionar",
    de: "Datum noch zu wählen"
  },
  Decline: {
    nl: "Weigeren",
    fr: "Refuser",
    es: "Rechazar",
    de: "Ablehnen"
  },
  Destinations: {
    nl: "Bestemmingen",
    fr: "Destinations",
    es: "Destinos",
    de: "Destinationen"
  },
  Details: {
    nl: "Gegevens",
    fr: "Détails",
    es: "Detalles",
    de: "Angaben"
  },
  "Discover Costa Blanca experiences by location, date, type and host on the interactive CostaPulse map.":
    {
      nl: "Ontdek Costa Blanca experiences op locatie, datum, type en host op de interactieve CostaPulse-kaart.",
      fr: "Découvrez les expériences Costa Blanca par lieu, date, type et hôte sur la carte interactive CostaPulse.",
      es: "Descubre experiencias de Costa Blanca por ubicación, fecha, tipo y anfitrión en el mapa interactivo de CostaPulse.",
      de: "Entdecke Costa-Blanca-Erlebnisse nach Ort, Datum, Typ und Gastgeber auf der interaktiven CostaPulse-Karte."
    },
  "Dismiss navigation menu": {
    nl: "Navigatiemenu sluiten",
    fr: "Fermer le menu de navigation",
    es: "Cerrar el menú de navegación",
    de: "Navigationsmenü schließen"
  },
  Duration: {
    nl: "Duur",
    fr: "Durée",
    es: "Duración",
    de: "Dauer"
  },
  "Effortlessly personal": {
    nl: "Moeiteloos persoonlijk",
    fr: "Personnel sans effort",
    es: "Personal sin esfuerzo",
    de: "Mühelos persönlich"
  },
  Email: {
    nl: "E-mail",
    fr: "E-mail",
    es: "Correo electrónico",
    de: "E-Mail"
  },
  "Enter a valid email address.": {
    nl: "Voer een geldig e-mailadres in.",
    fr: "Saisissez une adresse e-mail valide.",
    es: "Introduce una dirección de correo válida.",
    de: "Gib eine gültige E-Mail-Adresse ein."
  },
  "Estimated price": {
    nl: "Geschatte prijs",
    fr: "Prix estimé",
    es: "Precio estimado",
    de: "Geschätzter Preis"
  },
  "Every experience is hosted in small groups with personal attention, local knowledge and clear pricing.":
    {
      nl: "Elke experience wordt in kleine groepen gehost met persoonlijke aandacht, lokale kennis en duidelijke prijzen.",
      fr: "Chaque expérience se déroule en petit groupe avec une attention personnelle, un savoir local et des tarifs clairs.",
      es: "Cada experiencia se organiza en grupos pequeños con atención personal, conocimiento local y precios claros.",
      de: "Jedes Erlebnis findet in kleinen Gruppen statt – mit persönlicher Aufmerksamkeit, lokalem Wissen und klaren Preisen."
    },
  "Every host and experience is selected for quality, character and genuine local knowledge.":
    {
      nl: "Elke host en experience wordt gekozen op kwaliteit, karakter en echte lokale kennis.",
      fr: "Chaque hôte et expérience est choisi pour sa qualité, son caractère et une connaissance locale authentique.",
      es: "Cada anfitrión y experiencia se selecciona por calidad, carácter y conocimiento local genuino.",
      de: "Jeder Gastgeber und jedes Erlebnis wird nach Qualität, Charakter und echtem Lokalwissen ausgewählt."
    },
  Experience: {
    nl: "Experience",
    fr: "Expérience",
    es: "Experiencia",
    de: "Erlebnis"
  },
  "Experience highlights": {
    nl: "Highlights van de experience",
    fr: "Points forts de l’expérience",
    es: "Aspectos destacados de la experiencia",
    de: "Highlights des Erlebnisses"
  },
  "Experience results": {
    nl: "Resultaten experiences",
    fr: "Résultats des expériences",
    es: "Resultados de experiencias",
    de: "Erlebnis-Ergebnisse"
  },
  "Experience type": {
    nl: "Type experience",
    fr: "Type d’expérience",
    es: "Tipo de experiencia",
    de: "Erlebnistyp"
  },
  Experiences: {
    nl: "Experiences",
    fr: "Expériences",
    es: "Experiencias",
    de: "Erlebnisse"
  },
  "Experiences could not be loaded": {
    nl: "Experiences konden niet worden geladen",
    fr: "Les expériences n’ont pas pu être chargées",
    es: "No se pudieron cargar las experiencias",
    de: "Erlebnisse konnten nicht geladen werden"
  },
  "Explore experiences on the map": {
    nl: "Verken experiences op de kaart",
    fr: "Explorer les expériences sur la carte",
    es: "Explorar experiencias en el mapa",
    de: "Erlebnisse auf der Karte entdecken"
  },
  "Explore experiences on the map | CostaPulse": {
    nl: "Verken experiences op de kaart | CostaPulse",
    fr: "Explorer les expériences sur la carte | CostaPulse",
    es: "Explorar experiencias en el mapa | CostaPulse",
    de: "Erlebnisse auf der Karte entdecken | CostaPulse"
  },
  "Explore map": {
    nl: "Kaart verkennen",
    fr: "Explorer la carte",
    es: "Explorar mapa",
    de: "Karte erkunden"
  },
  "Explore the coast": {
    nl: "Verken de kust",
    fr: "Explorer la côte",
    es: "Explora la costa",
    de: "Die Küste erkunden"
  },
  Extras: {
    nl: "Extras",
    fr: "Extras",
    es: "Extras",
    de: "Extras"
  },
  "Failed payments": {
    nl: "Mislukte betalingen",
    fr: "Paiements échoués",
    es: "Pagos fallidos",
    de: "Fehlgeschlagene Zahlungen"
  },
  "Filter experiences": {
    nl: "Experiences filteren",
    fr: "Filtrer les expériences",
    es: "Filtrar experiencias",
    de: "Erlebnisse filtern"
  },
  Filters: {
    nl: "Filters",
    fr: "Filtres",
    es: "Filtros",
    de: "Filter"
  },
  "Find yacht days, paddle sessions and hosted moments across Costa Blanca meeting points.":
    {
      nl: "Vind yachtdagen, paddle-sessies en hosted momenten bij Costa Blanca-ontmoetingspunten.",
      fr: "Trouvez des journées yacht, sessions paddle et moments hébergés sur les points de rendez-vous Costa Blanca.",
      es: "Encuentra días en yate, sesiones de paddle y momentos con anfitrión en puntos de encuentro de Costa Blanca.",
      de: "Finde Yacht-Tage, Paddle-Sessions und Hosted Moments an Costa-Blanca-Treffpunkten."
    },
  "First name": {
    nl: "Voornaam",
    fr: "Prénom",
    es: "Nombre",
    de: "Vorname"
  },
  "For Groups": {
    nl: "Voor groepen",
    fr: "Pour les groupes",
    es: "Para grupos",
    de: "Für Gruppen"
  },
  Fri: { nl: "vr", fr: "ven.", es: "vie", de: "Fr" },
  From: { nl: "Vanaf", fr: "À partir de", es: "Desde", de: "Ab" },
  Full: { nl: "Vol", fr: "Complet", es: "Completo", de: "Voll" },
  "Fully booked": {
    nl: "Volgeboekt",
    fr: "Complet",
    es: "Completo",
    de: "Ausgebucht"
  },
  "Good availability": {
    nl: "Goede beschikbaarheid",
    fr: "Bonne disponibilité",
    es: "Buena disponibilidad",
    de: "Gute Verfügbarkeit"
  },
  "Good days begin with a little curiosity.": {
    nl: "Goede dagen beginnen met een beetje nieuwsgierigheid.",
    fr: "Les belles journées commencent par un peu de curiosité.",
    es: "Los buenos días empiezan con un poco de curiosidad.",
    de: "Gute Tage beginnen mit ein wenig Neugier."
  },
  "Guest {number}": {
    nl: "Gast {number}",
    fr: "Invité {number}",
    es: "Huésped {number}",
    de: "Gast {number}"
  },
  "Guest rating {rating} from {count} reviews": {
    nl: "Gastbeoordeling {rating} uit {count} reviews",
    fr: "Note des voyageurs {rating} sur {count} avis",
    es: "Valoración de huéspedes {rating} de {count} reseñas",
    de: "Gäste Bewertung {rating} aus {count} Bewertungen"
  },
  Guests: {
    nl: "Gasten",
    fr: "Invités",
    es: "Huéspedes",
    de: "Gäste"
  },
  "Handpicked days on and around the Costa Blanca.": {
    nl: "Met de hand gekozen dagen op en rond de Costa Blanca.",
    fr: "Des journées sélectionnées sur et autour de la Costa Blanca.",
    es: "Días seleccionados en y alrededor de la Costa Blanca.",
    de: "Handverlesene Tage an und um die Costa Blanca."
  },
  Host: { nl: "Host", fr: "Hôte", es: "Anfitrión", de: "Gastgeber" },
  "Hosted by {name}": {
    nl: "Gehost door {name}",
    fr: "Animé par {name}",
    es: "Con anfitrión {name}",
    de: "Gastgeber: {name}"
  },
  "Hosted by {names}": {
    nl: "Gehost door {names}",
    fr: "Animé par {names}",
    es: "Con anfitrión {names}",
    de: "Gastgeber: {names}"
  },
  "Hosted days at sea with local Costa Blanca crews.": {
    nl: "Gehoste dagen op zee met lokale Costa Blanca-crews.",
    fr: "Des journées en mer animées avec des équipages locaux de Costa Blanca.",
    es: "Días en el mar con tripulaciones locales de Costa Blanca.",
    de: "Hosted Days auf See mit lokalen Costa-Blanca-Crews."
  },
  "I accept the booking terms and cancellation policy.": {
    nl: "Ik accepteer de boekingsvoorwaarden en annuleringsregeling.",
    fr: "J’accepte les conditions de réservation et la politique d’annulation.",
    es: "Acepto las condiciones de reserva y la política de cancelación.",
    de: "Ich akzeptiere die Buchungsbedingungen und Stornierungsrichtlinie."
  },
  "Instant confirmation": {
    nl: "Directe bevestiging",
    fr: "Confirmation instantanée",
    es: "Confirmación instantánea",
    de: "Sofortige Bestätigung"
  },
  "Interactive experience map": {
    nl: "Interactieve experiencekaart",
    fr: "Carte interactive des expériences",
    es: "Mapa interactivo de experiencias",
    de: "Interaktive Erlebniskarte"
  },
  Language: {
    nl: "Taal",
    fr: "Langue",
    es: "Idioma",
    de: "Sprache"
  },
  "Last booking": {
    nl: "Laatste boeking",
    fr: "Dernière réservation",
    es: "Última reserva",
    de: "Letzte Buchung"
  },
  "Last name": {
    nl: "Achternaam",
    fr: "Nom",
    es: "Apellidos",
    de: "Nachname"
  },
  Licensed: {
    nl: "Vergund",
    fr: "Licencié",
    es: "Con licencia",
    de: "Lizenziert"
  },
  "Limited availability": {
    nl: "Beperkte beschikbaarheid",
    fr: "Disponibilité limitée",
    es: "Disponibilidad limitada",
    de: "Begrenzte Verfügbarkeit"
  },
  List: { nl: "Lijst", fr: "Liste", es: "Lista", de: "Liste" },
  "Live operational signals from bookings, customers, and upcoming capacity.": {
    nl: "Live operationele signalen van boekingen, klanten en aankomende capaciteit.",
    fr: "Signaux opérationnels en direct sur les réservations, clients et capacité à venir.",
    es: "Señales operativas en vivo de reservas, clientes y capacidad próxima.",
    de: "Live-Betriebssignale zu Buchungen, Kunden und kommender Kapazität."
  },
  "Loading availability…": {
    nl: "Beschikbaarheid laden…",
    fr: "Chargement des disponibilités…",
    es: "Cargando disponibilidad…",
    de: "Verfügbarkeit wird geladen…"
  },
  "Loading booking": {
    nl: "Boeking laden",
    fr: "Chargement de la réservation",
    es: "Cargando reserva",
    de: "Buchung wird geladen"
  },
  "Loading experience": {
    nl: "Experience laden",
    fr: "Chargement de l’expérience",
    es: "Cargando experiencia",
    de: "Erlebnis wird geladen"
  },
  "Loading experiences": {
    nl: "Experiences laden",
    fr: "Chargement des expériences",
    es: "Cargando experiencias",
    de: "Erlebnisse werden geladen"
  },
  "Loading map experiences": {
    nl: "Kaartexperiences laden",
    fr: "Chargement des expériences de la carte",
    es: "Cargando experiencias del mapa",
    de: "Kartenerlebnisse werden geladen"
  },
  "Local hospitality": {
    nl: "Lokale hospitality",
    fr: "Hospitalité locale",
    es: "Hospitalidad local",
    de: "Lokale Gastfreundschaft"
  },
  "Local host": {
    nl: "Lokale host",
    fr: "Hôte local",
    es: "Anfitrión local",
    de: "Lokaler Gastgeber"
  },
  Location: {
    nl: "Locatie",
    fr: "Lieu",
    es: "Ubicación",
    de: "Ort"
  },
  Locations: {
    nl: "Locaties",
    fr: "Lieux",
    es: "Ubicaciones",
    de: "Orte"
  },
  "Log in": {
    nl: "Inloggen",
    fr: "Connexion",
    es: "Iniciar sesión",
    de: "Anmelden"
  },
  "Manage your CostaPulse customer account.": {
    nl: "Beheer je CostaPulse-klantaccount.",
    fr: "Gérez votre compte client CostaPulse.",
    es: "Gestiona tu cuenta de cliente CostaPulse.",
    de: "Verwalte dein CostaPulse-Kundenkonto."
  },
  Map: { nl: "Kaart", fr: "Carte", es: "Mapa", de: "Karte" },
  "Map or list view": {
    nl: "Kaart- of lijstweergave",
    fr: "Vue carte ou liste",
    es: "Vista de mapa o lista",
    de: "Karten- oder Listenansicht"
  },
  "Map unavailable": {
    nl: "Kaart niet beschikbaar",
    fr: "Carte indisponible",
    es: "Mapa no disponible",
    de: "Karte nicht verfügbar"
  },
  "Maximum {count} guests per booking": {
    nl: "Maximaal {count} gasten per boeking",
    fr: "Maximum {count} invités par réservation",
    es: "Máximo {count} huéspedes por reserva",
    de: "Maximal {count} Gäste pro Buchung"
  },
  "Mediterranean days, beautifully considered.": {
    nl: "Mediterrane dagen, zorgvuldig samengesteld.",
    fr: "Des journées méditerranéennes, pensées avec soin.",
    es: "Días mediterráneos, cuidadosamente pensados.",
    de: "Mediterrane Tage, sorgfältig gestaltet."
  },
  "Meeting point confirmed after booking": {
    nl: "Ontmoetingspunt bevestigd na boeking",
    fr: "Point de rendez-vous confirmé après réservation",
    es: "Punto de encuentro confirmado tras la reserva",
    de: "Treffpunkt nach Buchung bestätigt"
  },
  "Meeting points and coastal bases will appear here as they are published.": {
    nl: "Ontmoetingspunten en kustbases verschijnen hier zodra ze gepubliceerd zijn.",
    fr: "Les points de rendez-vous et bases côtières apparaîtront ici dès leur publication.",
    es: "Los puntos de encuentro y bases costeras aparecerán aquí cuando se publiquen.",
    de: "Treffpunkte und Küstenbasen erscheinen hier, sobald sie veröffentlicht sind."
  },
  "Memorable tables, trusted hosts and the flavours of the Costa Blanca.": {
    nl: "Memorabele tafels, betrouwbare hosts en de smaken van de Costa Blanca.",
    fr: "Des tables mémorables, des hôtes de confiance et les saveurs de la Costa Blanca.",
    es: "Mesas memorables, anfitriones de confianza y los sabores de la Costa Blanca.",
    de: "Erinnerungswürdige Tische, vertrauenswürdige Gastgeber und die Aromen der Costa Blanca."
  },
  Mon: { nl: "ma", fr: "lun.", es: "lun", de: "Mo" },
  "New experiences are coming soon.": {
    nl: "Nieuwe experiences komen eraan.",
    fr: "De nouvelles expériences arrivent bientôt.",
    es: "Pronto llegarán nuevas experiencias.",
    de: "Neue Erlebnisse folgen in Kürze."
  },
  Next: { nl: "Volgende", fr: "Suivant", es: "Siguiente", de: "Weiter" },
  "Next available {date}": {
    nl: "Volgende beschikbaar {date}",
    fr: "Prochaine disponibilité {date}",
    es: "Próxima disponibilidad {date}",
    de: "Nächste Verfügbarkeit {date}"
  },
  "No available departures on this date for your group size.": {
    nl: "Geen beschikbare vertrekken op deze datum voor jouw groepsgrootte.",
    fr: "Aucun départ disponible à cette date pour la taille de votre groupe.",
    es: "No hay salidas disponibles en esta fecha para el tamaño de tu grupo.",
    de: "Keine verfügbaren Abfahrten an diesem Datum für deine Gruppengröße."
  },
  "No bookings match these filters": {
    nl: "Geen boekingen matchen deze filters",
    fr: "Aucune réservation ne correspond à ces filtres",
    es: "Ninguna reserva coincide con estos filtros",
    de: "Keine Buchungen passen zu diesen Filtern"
  },
  "No bookings yet": {
    nl: "Nog geen boekingen",
    fr: "Pas encore de réservations",
    es: "Aún no hay reservas",
    de: "Noch keine Buchungen"
  },
  "No charge was made. You can resume checkout while your hold is still active.":
    {
      nl: "Er is niets in rekening gebracht. Je kunt checkout hervatten zolang je hold actief is.",
      fr: "Aucun débit n’a été effectué. Vous pouvez reprendre le paiement tant que votre option est active.",
      es: "No se realizó ningún cargo. Puedes reanudar el pago mientras tu reserva temporal siga activa.",
      de: "Es wurde nichts berechnet. Du kannst den Checkout fortsetzen, solange deine Reservierung aktiv ist."
    },
  "No customers found": {
    nl: "Geen klanten gevonden",
    fr: "Aucun client trouvé",
    es: "No se encontraron clientes",
    de: "Keine Kunden gefunden"
  },
  "No experiences match these filters": {
    nl: "Geen experiences matchen deze filters",
    fr: "Aucune expérience ne correspond à ces filtres",
    es: "Ninguna experiencia coincide con estos filtros",
    de: "Keine Erlebnisse passen zu diesen Filtern"
  },
  "No extras are available for this experience yet. You can continue to review.":
    {
      nl: "Er zijn nog geen extras voor deze experience. Je kunt doorgaan naar het overzicht.",
      fr: "Aucun extra n’est encore disponible pour cette expérience. Vous pouvez continuer vers la vérification.",
      es: "Aún no hay extras para esta experiencia. Puedes continuar a la revisión.",
      de: "Für dieses Erlebnis sind noch keine Extras verfügbar. Du kannst zur Prüfung weitergehen."
    },
  "No published experiences are available to book right now.": {
    nl: "Er zijn momenteel geen gepubliceerde experiences om te boeken.",
    fr: "Aucune expérience publiée n’est disponible à la réservation pour le moment.",
    es: "Ahora mismo no hay experiencias publicadas disponibles para reservar.",
    de: "Derzeit sind keine veröffentlichten Erlebnisse buchbar."
  },
  "No slots in this range": {
    nl: "Geen slots in dit bereik",
    fr: "Aucun créneau sur cette plage",
    es: "No hay franjas en este rango",
    de: "Keine Slots in diesem Zeitraum"
  },
  "No status changes recorded yet.": {
    nl: "Nog geen statuswijzigingen vastgelegd.",
    fr: "Aucun changement de statut enregistré pour le moment.",
    es: "Aún no se han registrado cambios de estado.",
    de: "Noch keine Statusänderungen erfasst."
  },
  "No team members assigned yet.": {
    nl: "Nog geen teamleden toegewezen.",
    fr: "Aucun membre d’équipe assigné pour le moment.",
    es: "Aún no hay miembros del equipo asignados.",
    de: "Noch keine Teammitglieder zugewiesen."
  },
  "No upcoming availability in this window": {
    nl: "Geen aankomende beschikbaarheid in dit venster",
    fr: "Aucune disponibilité à venir sur cette période",
    es: "No hay disponibilidad próxima en esta ventana",
    de: "Keine bevorstehende Verfügbarkeit in diesem Fenster"
  },
  Notes: { nl: "Notities", fr: "Notes", es: "Notas", de: "Notizen" },
  "Open navigation menu": {
    nl: "Navigatiemenu openen",
    fr: "Ouvrir le menu de navigation",
    es: "Abrir el menú de navegación",
    de: "Navigationsmenü öffnen"
  },
  Option: { nl: "Optie", fr: "Option", es: "Opción", de: "Option" },
  "Optional add-ons for your day.": {
    nl: "Optionele add-ons voor jouw dag.",
    fr: "Options supplémentaires pour votre journée.",
    es: "Extras opcionales para tu día.",
    de: "Optionale Extras für deinen Tag."
  },
  "Our experiences": {
    nl: "Onze experiences",
    fr: "Nos expériences",
    es: "Nuestras experiencias",
    de: "Unsere Erlebnisse"
  },
  "Our story and approach will appear here as editorial content is published.":
    {
      nl: "Ons verhaal en aanpak verschijnen hier zodra redactionele content wordt gepubliceerd.",
      fr: "Notre histoire et notre approche apparaîtront ici dès la publication du contenu éditorial.",
      es: "Nuestra historia y enfoque aparecerán aquí cuando se publique el contenido editorial.",
      de: "Unsere Geschichte und unser Ansatz erscheinen hier, sobald redaktionelle Inhalte veröffentlicht werden."
    },
  Overview: {
    nl: "Overzicht",
    fr: "Aperçu",
    es: "Resumen",
    de: "Übersicht"
  },
  "Page {page} of {pageCount} · {total} total": {
    nl: "Pagina {page} van {pageCount} · {total} totaal",
    fr: "Page {page} sur {pageCount} · {total} au total",
    es: "Página {page} de {pageCount} · {total} en total",
    de: "Seite {page} von {pageCount} · {total} gesamt"
  },
  Pagination: {
    nl: "Paginering",
    fr: "Pagination",
    es: "Paginación",
    de: "Paginierung"
  },
  "Paid revenue": {
    nl: "Betaalde omzet",
    fr: "Revenu encaissé",
    es: "Ingresos cobrados",
    de: "Bezahlter Umsatz"
  },
  "Partner dashboard": {
    nl: "Partnerdashboard",
    fr: "Tableau de bord partenaire",
    es: "Panel de partner",
    de: "Partner-Dashboard"
  },
  "Partner opportunities will appear here as they are published.": {
    nl: "Partnermogelijkheden verschijnen hier zodra ze gepubliceerd zijn.",
    fr: "Les opportunités partenaires apparaîtront ici dès leur publication.",
    es: "Las oportunidades de partners aparecerán aquí cuando se publiquen.",
    de: "Partnerangebote erscheinen hier, sobald sie veröffentlicht sind."
  },
  "Partner overview": {
    nl: "Partneroverzicht",
    fr: "Aperçu partenaire",
    es: "Resumen de partner",
    de: "Partner-Übersicht"
  },
  "Partner with CostaPulse": {
    nl: "Partner van CostaPulse worden",
    fr: "Devenir partenaire CostaPulse",
    es: "Colabora con CostaPulse",
    de: "Partner von CostaPulse werden"
  },
  Partners: {
    nl: "Partners",
    fr: "Partenaires",
    es: "Partners",
    de: "Partner"
  },
  "Party size": {
    nl: "Groepsgrootte",
    fr: "Taille du groupe",
    es: "Tamaño del grupo",
    de: "Gruppengröße"
  },
  Password: {
    nl: "Wachtwoord",
    fr: "Mot de passe",
    es: "Contraseña",
    de: "Passwort"
  },
  "Pay securely": {
    nl: "Veilig betalen",
    fr: "Payer en toute sécurité",
    es: "Pagar de forma segura",
    de: "Sicher bezahlen"
  },
  Payment: {
    nl: "Betaling",
    fr: "Paiement",
    es: "Pago",
    de: "Zahlung"
  },
  "Payment cancelled": {
    nl: "Betaling geannuleerd",
    fr: "Paiement annulé",
    es: "Pago cancelado",
    de: "Zahlung abgebrochen"
  },
  "Payment could not be started. Please try again.": {
    nl: "Betaling kon niet worden gestart. Probeer opnieuw.",
    fr: "Le paiement n’a pas pu démarrer. Veuillez réessayer.",
    es: "No se pudo iniciar el pago. Inténtalo de nuevo.",
    de: "Zahlung konnte nicht gestartet werden. Bitte erneut versuchen."
  },
  "Payment was not completed": {
    nl: "Betaling is niet voltooid",
    fr: "Le paiement n’a pas été finalisé",
    es: "El pago no se completó",
    de: "Zahlung wurde nicht abgeschlossen"
  },
  "Pending manual confirmation": {
    nl: "Wacht op handmatige bevestiging",
    fr: "En attente de confirmation manuelle",
    es: "Pendiente de confirmación manual",
    de: "Manuelle Bestätigung ausstehend"
  },
  "per boat": {
    nl: "per boot",
    fr: "par bateau",
    es: "por barco",
    de: "pro Boot"
  },
  "per experience": {
    nl: "per experience",
    fr: "par expérience",
    es: "por experiencia",
    de: "pro Erlebnis"
  },
  "per person": {
    nl: "per persoon",
    fr: "par personne",
    es: "por persona",
    de: "pro Person"
  },
  "Personal service": {
    nl: "Persoonlijke service",
    fr: "Service personnel",
    es: "Servicio personal",
    de: "Persönlicher Service"
  },
  Phone: { nl: "Telefoon", fr: "Téléphone", es: "Teléfono", de: "Telefon" },
  "Plan a private day": {
    nl: "Plan een privé-dag",
    fr: "Planifier une journée privée",
    es: "Planificar un día privado",
    de: "Privaten Tag planen"
  },
  "Platform readiness": {
    nl: "Platformgereedheid",
    fr: "Préparation de la plateforme",
    es: "Preparación de la plataforma",
    de: "Plattform-Bereitschaft"
  },
  "Please try again or browse other experiences.": {
    nl: "Probeer opnieuw of bekijk andere experiences.",
    fr: "Veuillez réessayer ou parcourir d’autres expériences.",
    es: "Inténtalo de nuevo o explora otras experiencias.",
    de: "Bitte erneut versuchen oder andere Erlebnisse ansehen."
  },
  "Please try again. If the problem continues, browse the experience list instead.":
    {
      nl: "Probeer opnieuw. Blijft het probleem, bekijk dan de experiencelijst.",
      fr: "Veuillez réessayer. Si le problème continue, consultez la liste des expériences.",
      es: "Inténtalo de nuevo. Si el problema continúa, consulta la lista de experiencias.",
      de: "Bitte erneut versuchen. Bleibt das Problem, nutze die Erlebnis-Liste."
    },
  "Please try again. If the problem continues, contact us.": {
    nl: "Probeer opnieuw. Blijft het probleem, neem dan contact op.",
    fr: "Veuillez réessayer. Si le problème continue, contactez-nous.",
    es: "Inténtalo de nuevo. Si el problema continúa, contáctanos.",
    de: "Bitte erneut versuchen. Bleibt das Problem, kontaktiere uns."
  },
  "Please try again. Your previous selections may still be available.": {
    nl: "Probeer opnieuw. Je eerdere keuzes zijn mogelijk nog beschikbaar.",
    fr: "Veuillez réessayer. Vos sélections précédentes peuvent encore être disponibles.",
    es: "Inténtalo de nuevo. Tus selecciones anteriores pueden seguir disponibles.",
    de: "Bitte erneut versuchen. Deine vorherigen Auswahlen sind möglicherweise noch verfügbar."
  },
  "Preferred language": {
    nl: "Voorkeurstaal",
    fr: "Langue préférée",
    es: "Idioma preferido",
    de: "Bevorzugte Sprache"
  },
  Previous: {
    nl: "Vorige",
    fr: "Précédent",
    es: "Anterior",
    de: "Zurück"
  },
  "Price pending": {
    nl: "Prijs volgt",
    fr: "Prix en attente",
    es: "Precio pendiente",
    de: "Preis ausstehend"
  },
  "Primary navigation": {
    nl: "Hoofdnavigatie",
    fr: "Navigation principale",
    es: "Navegación principal",
    de: "Hauptnavigation"
  },
  "Private charters": {
    nl: "Private charters",
    fr: "Affrètements privés",
    es: "Charters privados",
    de: "Private Charters"
  },
  "Private yacht trips, paddle adventures and personally hosted moments along the Mediterranean coast.":
    {
      nl: "Privé-yachttrips, paddle-avonturen en persoonlijk gehoste momenten langs de Mediterrane kust.",
      fr: "Sorties yacht privées, aventures paddle et moments personnellement animés le long de la Méditerranée.",
      es: "Viajes privados en yate, aventuras de paddle y momentos con anfitrión personal en la costa mediterránea.",
      de: "Private Yachttrips, Paddle-Abenteuer und persönlich gehostete Momente an der Mittelmeerküste."
    },
  "Private yacht trips, paddle adventures, sunset BBQs and personally hosted Mediterranean experiences.":
    {
      nl: "Privé-yachttrips, paddle-avonturen, sunset BBQ’s en persoonlijk gehoste Mediterrane experiences.",
      fr: "Sorties yacht privées, aventures paddle, BBQ au coucher du soleil et expériences méditerranéennes personnellement animées.",
      es: "Viajes privados en yate, aventuras de paddle, BBQ al atardecer y experiencias mediterráneas con anfitrión personal.",
      de: "Private Yachttrips, Paddle-Abenteuer, Sunset-BBQs und persönlich gehostete mediterrane Erlebnisse."
    },
  "Protected admin area": {
    nl: "Beveiligd admin-gebied",
    fr: "Espace admin protégé",
    es: "Área de administración protegida",
    de: "Geschützter Admin-Bereich"
  },
  "Published experience details will appear here as inventory is added to CostaPulse.":
    {
      nl: "Gepubliceerde experiencedetails verschijnen hier zodra inventory aan CostaPulse wordt toegevoegd.",
      fr: "Les détails des expériences publiées apparaîtront ici à mesure que l’inventaire est ajouté à CostaPulse.",
      es: "Los detalles de experiencias publicadas aparecerán aquí a medida que se añada inventario a CostaPulse.",
      de: "Veröffentlichte Erlebnisdetails erscheinen hier, sobald Inventar zu CostaPulse hinzugefügt wird."
    },
  "Published experiences will flow into the homepage automatically as inventory is added.":
    {
      nl: "Gepubliceerde experiences verschijnen automatisch op de homepage zodra inventory wordt toegevoegd.",
      fr: "Les expériences publiées apparaîtront automatiquement sur la page d’accueil dès l’ajout d’inventaire.",
      es: "Las experiencias publicadas fluirán automáticamente a la página de inicio al añadir inventario.",
      de: "Veröffentlichte Erlebnisse erscheinen automatisch auf der Startseite, sobald Inventar hinzugefügt wird."
    },
  "Read only": {
    nl: "Alleen-lezen",
    fr: "Lecture seule",
    es: "Solo lectura",
    de: "Nur lesen"
  },
  "Ready for real experiences": {
    nl: "Klaar voor echte experiences",
    fr: "Prêt pour de vraies expériences",
    es: "Listo para experiencias reales",
    de: "Bereit für echte Erlebnisse"
  },
  "Redirecting to payment…": {
    nl: "Doorsturen naar betaling…",
    fr: "Redirection vers le paiement…",
    es: "Redirigiendo al pago…",
    de: "Weiterleitung zur Zahlung…"
  },
  Reference: {
    nl: "Referentie",
    fr: "Référence",
    es: "Referencia",
    de: "Referenz"
  },
  Refunds: {
    nl: "Terugbetalingen",
    fr: "Remboursements",
    es: "Reembolsos",
    de: "Erstattungen"
  },
  "Resume booking": {
    nl: "Boeking hervatten",
    fr: "Reprendre la réservation",
    es: "Reanudar la reserva",
    de: "Buchung fortsetzen"
  },
  "Review & book": {
    nl: "Controleren & boeken",
    fr: "Vérifier et réserver",
    es: "Revisar y reservar",
    de: "Prüfen & buchen"
  },
  "Review & Book": {
    nl: "Controleren & boeken",
    fr: "Vérifier et réserver",
    es: "Revisar y reservar",
    de: "Prüfen & buchen"
  },
  "Reviews pending": {
    nl: "Reviews in behandeling",
    fr: "Avis en attente",
    es: "Reseñas pendientes",
    de: "Bewertungen ausstehend"
  },
  "Safe & reliable": {
    nl: "Veilig & betrouwbaar",
    fr: "Sûr et fiable",
    es: "Seguro y fiable",
    de: "Sicher & zuverlässig"
  },
  Sat: { nl: "za", fr: "sam.", es: "sáb", de: "Sa" },
  "Save this experience": {
    nl: "Bewaar deze experience",
    fr: "Enregistrer cette expérience",
    es: "Guardar esta experiencia",
    de: "Dieses Erlebnis speichern"
  },
  "Search and manage CostaPulse reservations.": {
    nl: "Zoek en beheer CostaPulse-reserveringen.",
    fr: "Recherchez et gérez les réservations CostaPulse.",
    es: "Busca y gestiona reservas de CostaPulse.",
    de: "CostaPulse-Reservierungen suchen und verwalten."
  },
  "Secure your spot. Your hold lasts 20 minutes while you complete payment.": {
    nl: "Zeker je plek. Je hold blijft 20 minuten actief terwijl je de betaling afrondt.",
    fr: "Sécurisez votre place. Votre option dure 20 minutes le temps de finaliser le paiement.",
    es: "Asegura tu plaza. Tu reserva temporal dura 20 minutos mientras completas el pago.",
    de: "Sichere dir deinen Platz. Deine Reservierung bleibt 20 Minuten aktiv, während du die Zahlung abschließt."
  },
  "Select {title} at {location}": {
    nl: "Selecteer {title} in {location}",
    fr: "Sélectionner {title} à {location}",
    es: "Seleccionar {title} en {location}",
    de: "{title} in {location} auswählen"
  },
  "Select a start time": {
    nl: "Selecteer een starttijd",
    fr: "Sélectionnez une heure de début",
    es: "Selecciona una hora de inicio",
    de: "Startzeit wählen"
  },
  "Select a time to continue.": {
    nl: "Selecteer een tijd om verder te gaan.",
    fr: "Sélectionnez une heure pour continuer.",
    es: "Selecciona una hora para continuar.",
    de: "Wähle eine Uhrzeit, um fortzufahren."
  },
  "Select an experience": {
    nl: "Selecteer een experience",
    fr: "Sélectionnez une expérience",
    es: "Selecciona una experiencia",
    de: "Erlebnis auswählen"
  },
  "Select your date": {
    nl: "Selecteer je datum",
    fr: "Sélectionnez votre date",
    es: "Selecciona tu fecha",
    de: "Datum wählen"
  },
  "Select your preferences and we’ll create the perfect day for you.": {
    nl: "Selecteer je voorkeuren en wij creëren de perfecte dag voor jou.",
    fr: "Sélectionnez vos préférences et nous créerons la journée idéale pour vous.",
    es: "Selecciona tus preferencias y crearemos el día perfecto para ti.",
    de: "Wähle deine Präferenzen – wir gestalten den perfekten Tag für dich."
  },
  "Selected host": {
    nl: "Geselecteerde host",
    fr: "Hôte sélectionné",
    es: "Anfitrión seleccionado",
    de: "Ausgewählter Gastgeber"
  },
  Services: {
    nl: "Diensten",
    fr: "Services",
    es: "Servicios",
    de: "Services"
  },
  "Show availability on this day": {
    nl: "Toon beschikbaarheid op deze dag",
    fr: "Afficher la disponibilité ce jour-là",
    es: "Mostrar disponibilidad en este día",
    de: "Verfügbarkeit an diesem Tag anzeigen"
  },
  "Sign in with your CostaPulse email and password.": {
    nl: "Log in met je CostaPulse e-mail en wachtwoord.",
    fr: "Connectez-vous avec votre e-mail et mot de passe CostaPulse.",
    es: "Inicia sesión con tu correo y contraseña de CostaPulse.",
    de: "Melde dich mit deiner CostaPulse-E-Mail und deinem Passwort an."
  },
  "Sign out": {
    nl: "Uitloggen",
    fr: "Déconnexion",
    es: "Cerrar sesión",
    de: "Abmelden"
  },
  "Sign-in failed": {
    nl: "Inloggen mislukt",
    fr: "Échec de la connexion",
    es: "Error al iniciar sesión",
    de: "Anmeldung fehlgeschlagen"
  },
  "Skipper-led": {
    nl: "Met skipper",
    fr: "Avec skipper",
    es: "Con patrón",
    de: "Mit Skipper"
  },
  "Special requests": {
    nl: "Speciale verzoeken",
    fr: "Demandes spéciales",
    es: "Peticiones especiales",
    de: "Sonderwünsche"
  },
  Spent: { nl: "Besteed", fr: "Dépensé", es: "Gastado", de: "Ausgegeben" },
  "Start a conversation": {
    nl: "Start een gesprek",
    fr: "Lancer une conversation",
    es: "Empezar una conversación",
    de: "Gespräch starten"
  },
  Status: { nl: "Status", fr: "Statut", es: "Estado", de: "Status" },
  "Status history": {
    nl: "Statusgeschiedenis",
    fr: "Historique des statuts",
    es: "Historial de estados",
    de: "Statusverlauf"
  },
  "Step {step} of {total}": {
    nl: "Stap {step} van {total}",
    fr: "Étape {step} sur {total}",
    es: "Paso {step} de {total}",
    de: "Schritt {step} von {total}"
  },
  Sun: { nl: "zo", fr: "dim.", es: "dom", de: "So" },
  "Sunset-ready": {
    nl: "Sunset-klaar",
    fr: "Prêt pour le coucher du soleil",
    es: "Listo para el atardecer",
    de: "Sunset-ready"
  },
  "Supabase-backed booking, webhook, and readiness endpoints are now initialized.":
    {
      nl: "Supabase-gestuurde booking-, webhook- en readiness-endpoints zijn nu geïnitialiseerd.",
      fr: "Les endpoints de réservation, webhook et readiness basés sur Supabase sont maintenant initialisés.",
      es: "Los endpoints de reserva, webhook y readiness respaldados por Supabase ya están inicializados.",
      de: "Supabase-gestützte Booking-, Webhook- und Readiness-Endpoints sind jetzt initialisiert."
    },
  "Thank you — you’re booked.": {
    nl: "Bedankt — je bent geboekt.",
    fr: "Merci — votre réservation est confirmée.",
    es: "Gracias — tu reserva está hecha.",
    de: "Danke — du bist gebucht."
  },
  "The booking could not be created. Please try again.": {
    nl: "De boeking kon niet worden aangemaakt. Probeer opnieuw.",
    fr: "La réservation n’a pas pu être créée. Veuillez réessayer.",
    es: "No se pudo crear la reserva. Inténtalo de nuevo.",
    de: "Die Buchung konnte nicht erstellt werden. Bitte erneut versuchen."
  },
  "The CostaPulse edit": {
    nl: "De CostaPulse-edit",
    fr: "L’édition CostaPulse",
    es: "La edición CostaPulse",
    de: "Das CostaPulse-Edit"
  },
  "The map could not be loaded": {
    nl: "De kaart kon niet worden geladen",
    fr: "La carte n’a pas pu être chargée",
    es: "No se pudo cargar el mapa",
    de: "Die Karte konnte nicht geladen werden"
  },
  "This customer has no bookings yet.": {
    nl: "Deze klant heeft nog geen boekingen.",
    fr: "Ce client n’a pas encore de réservations.",
    es: "Este cliente aún no tiene reservas.",
    de: "Dieser Kunde hat noch keine Buchungen."
  },
  "This experience could not be loaded": {
    nl: "Deze experience kon niet worden geladen",
    fr: "Cette expérience n’a pas pu être chargée",
    es: "No se pudo cargar esta experiencia",
    de: "Dieses Erlebnis konnte nicht geladen werden"
  },
  "This field is required.": {
    nl: "Dit veld is verplicht.",
    fr: "Ce champ est obligatoire.",
    es: "Este campo es obligatorio.",
    de: "Dieses Feld ist erforderlich."
  },
  "This record was not found.": {
    nl: "Dit record is niet gevonden.",
    fr: "Cet enregistrement est introuvable.",
    es: "No se encontró este registro.",
    de: "Dieser Datensatz wurde nicht gefunden."
  },
  Thu: { nl: "do", fr: "jeu.", es: "jue", de: "Do" },
  "Time to be selected": {
    nl: "Tijd nog te kiezen",
    fr: "Heure à sélectionner",
    es: "Hora por seleccionar",
    de: "Uhrzeit noch zu wählen"
  },
  Total: { nl: "Totaal", fr: "Total", es: "Total", de: "Gesamt" },
  "Try a different date, type, host or location — or clear filters to see everything on the map.":
    {
      nl: "Probeer een andere datum, type, host of locatie — of wis filters om alles op de kaart te zien.",
      fr: "Essayez une autre date, type, hôte ou lieu — ou effacez les filtres pour tout voir sur la carte.",
      es: "Prueba otra fecha, tipo, anfitrión o ubicación — o borra los filtros para verlo todo en el mapa.",
      de: "Probiere ein anderes Datum, einen anderen Typ, Gastgeber oder Ort — oder setze Filter zurück, um alles auf der Karte zu sehen."
    },
  "Try a different search, or wait until bookings create customer profiles.": {
    nl: "Probeer een andere zoekopdracht, of wacht tot boekingen klantprofielen aanmaken.",
    fr: "Essayez une autre recherche, ou attendez que les réservations créent des profils clients.",
    es: "Prueba otra búsqueda, o espera a que las reservas creen perfiles de cliente.",
    de: "Probiere eine andere Suche, oder warte, bis Buchungen Kundenprofile anlegen."
  },
  "Try again": {
    nl: "Opnieuw proberen",
    fr: "Réessayer",
    es: "Reintentar",
    de: "Erneut versuchen"
  },
  "Try clearing filters or widening the search.": {
    nl: "Probeer filters te wissen of de zoekopdracht te verbreden.",
    fr: "Essayez d’effacer les filtres ou d’élargir la recherche.",
    es: "Prueba a borrar filtros o ampliar la búsqueda.",
    de: "Filter zurücksetzen oder Suche erweitern."
  },
  Tue: { nl: "di", fr: "mar.", es: "mar", de: "Di" },
  "Typed backend contracts": {
    nl: "Getypeerde backend-contracten",
    fr: "Contrats backend typés",
    es: "Contratos de backend tipados",
    de: "Typisierte Backend-Verträge"
  },
  "Unable to load live metrics": {
    nl: "Live metrics konden niet worden geladen",
    fr: "Impossible de charger les métriques en direct",
    es: "No se pudieron cargar las métricas en vivo",
    de: "Live-Metriken konnten nicht geladen werden"
  },
  "Unhurried days at sea, shaped around you and your guests.": {
    nl: "Ongehaaste dagen op zee, vormgegeven rond jou en je gasten.",
    fr: "Des journées sans précipitation en mer, pensées pour vous et vos invités.",
    es: "Días sin prisas en el mar, pensados para ti y tus invitados.",
    de: "Ungehetzte Tage auf See – gestaltet um dich und deine Gäste."
  },
  "Untitled experience": {
    nl: "Experience zonder titel",
    fr: "Expérience sans titre",
    es: "Experiencia sin título",
    de: "Erlebnis ohne Titel"
  },
  "Up to {count} guests": {
    nl: "Tot {count} gasten",
    fr: "Jusqu’à {count} invités",
    es: "Hasta {count} huéspedes",
    de: "Bis zu {count} Gäste"
  },
  "Upcoming slots (30 days)": {
    nl: "Aankomende slots (30 dagen)",
    fr: "Créneaux à venir (30 jours)",
    es: "Franjas próximas (30 días)",
    de: "Kommende Slots (30 Tage)"
  },
  "View all experiences": {
    nl: "Alle experiences bekijken",
    fr: "Voir toutes les expériences",
    es: "Ver todas las experiencias",
    de: "Alle Erlebnisse ansehen"
  },
  "View customer": {
    nl: "Klant bekijken",
    fr: "Voir le client",
    es: "Ver cliente",
    de: "Kunde ansehen"
  },
  "View details": {
    nl: "Details bekijken",
    fr: "Voir les détails",
    es: "Ver detalles",
    de: "Details ansehen"
  },
  "View on Map": {
    nl: "Bekijk op kaart",
    fr: "Voir sur la carte",
    es: "Ver en el mapa",
    de: "Auf der Karte ansehen"
  },
  "We bring together remarkable local people and places, so every experience feels effortless, personal and unmistakably Costa Blanca.":
    {
      nl: "We brengen bijzondere lokale mensen en plekken samen, zodat elke experience moeiteloos, persoonlijk en onmiskenbaar Costa Blanca voelt.",
      fr: "Nous réunissons des personnes et des lieux locaux remarquables, pour que chaque expérience soit fluide, personnelle et indéniablement Costa Blanca.",
      es: "Reunimos a personas y lugares locales excepcionales, para que cada experiencia se sienta fácil, personal e inconfundiblemente Costa Blanca.",
      de: "Wir bringen bemerkenswerte lokale Menschen und Orte zusammen, damit jedes Erlebnis mühelos, persönlich und unverkennbar Costa Blanca wirkt."
    },
  "We use privacy-conscious analytics to understand how CostaPulse is used. You can accept or decline analytics cookies. Essential site cookies are always active.":
    {
      nl: "We gebruiken privacybewuste analytics om te begrijpen hoe CostaPulse wordt gebruikt. Je kunt analysecookies accepteren of weigeren. Essentiële sitecookies blijven altijd actief.",
      fr: "Nous utilisons des analyses respectueuses de la vie privée pour comprendre comment CostaPulse est utilisé. Vous pouvez accepter ou refuser les cookies d’analyse. Les cookies essentiels restent toujours actifs.",
      es: "Usamos analítica respetuosa con la privacidad para entender cómo se usa CostaPulse. Puedes aceptar o rechazar las cookies de analítica. Las cookies esenciales del sitio siempre están activas.",
      de: "Wir nutzen datenschutzbewusste Analysen, um zu verstehen, wie CostaPulse genutzt wird. Du kannst Analyse-Cookies akzeptieren oder ablehnen. Essenzielle Website-Cookies sind immer aktiv."
    },
  "We’ll use these details for confirmation and boarding.": {
    nl: "We gebruiken deze gegevens voor bevestiging en boarding.",
    fr: "Nous utiliserons ces informations pour la confirmation et l’embarquement.",
    es: "Usaremos estos datos para la confirmación y el embarque.",
    de: "Wir nutzen diese Angaben für Bestätigung und Boarding."
  },
  "We’ve received your payment. A confirmation email will follow shortly.": {
    nl: "We hebben je betaling ontvangen. Je ontvangt zo een bevestigingsmail.",
    fr: "Nous avons reçu votre paiement. Un e-mail de confirmation suivra sous peu.",
    es: "Hemos recibido tu pago. En breve recibirás un correo de confirmación.",
    de: "Wir haben deine Zahlung erhalten. Eine Bestätigungs-E-Mail folgt in Kürze."
  },
  Wed: { nl: "wo", fr: "mer.", es: "mié", de: "Mi" },
  When: { nl: "Wanneer", fr: "Quand", es: "Cuándo", de: "Wann" },
  "Why CostaPulse": {
    nl: "Waarom CostaPulse",
    fr: "Pourquoi CostaPulse",
    es: "Por qué CostaPulse",
    de: "Warum CostaPulse"
  },
  "You can still browse experiences in the list.": {
    nl: "Je kunt experiences nog steeds in de lijst bekijken.",
    fr: "Vous pouvez toujours parcourir les expériences dans la liste.",
    es: "Aún puedes explorar experiencias en la lista.",
    de: "Du kannst Erlebnisse weiterhin in der Liste durchsuchen."
  },
  "Your account": {
    nl: "Jouw account",
    fr: "Votre compte",
    es: "Tu cuenta",
    de: "Dein Konto"
  },
  "Your authorized CostaPulse partner workspace.": {
    nl: "Jouw geautoriseerde CostaPulse-partnerworkspace.",
    fr: "Votre espace partenaire CostaPulse autorisé.",
    es: "Tu espacio de partner autorizado de CostaPulse.",
    de: "Dein autorisierter CostaPulse-Partner-Arbeitsbereich."
  },
  "Your booking hold has expired. Please choose a new date and time.": {
    nl: "Je boekingshold is verlopen. Kies een nieuwe datum en tijd.",
    fr: "Votre option de réservation a expiré. Veuillez choisir une nouvelle date et heure.",
    es: "Tu reserva temporal ha caducado. Elige una nueva fecha y hora.",
    de: "Deine Buchungsreservierung ist abgelaufen. Bitte wähle ein neues Datum und eine neue Uhrzeit."
  },
  "Your bookings": {
    nl: "Jouw boekingen",
    fr: "Vos réservations",
    es: "Tus reservas",
    de: "Deine Buchungen"
  },
  "Your bookings will appear here after you make a reservation.": {
    nl: "Jouw boekingen verschijnen hier nadat je een reservering maakt.",
    fr: "Vos réservations apparaîtront ici après une réservation.",
    es: "Tus reservas aparecerán aquí después de hacer una reserva.",
    de: "Deine Buchungen erscheinen hier, nachdem du eine Reservierung gemacht hast."
  },
  "Your Costa Blanca. From the water.": {
    nl: "Jouw Costa Blanca. Vanaf het water.",
    fr: "Votre Costa Blanca. Depuis l’eau.",
    es: "Tu Costa Blanca. Desde el agua.",
    de: "Deine Costa Blanca. Vom Wasser aus."
  },
  "Your details": {
    nl: "Jouw gegevens",
    fr: "Vos informations",
    es: "Tus datos",
    de: "Deine Angaben"
  },
  "Your experience": {
    nl: "Jouw experience",
    fr: "Votre expérience",
    es: "Tu experiencia",
    de: "Dein Erlebnis"
  },
  "Your hold is reserved until {time}.": {
    nl: "Je hold is gereserveerd tot {time}.",
    fr: "Votre option est réservée jusqu’à {time}.",
    es: "Tu reserva temporal está guardada hasta las {time}.",
    de: "Deine Reservierung gilt bis {time}."
  },
  "Your Mediterranean story": {
    nl: "Jouw Mediterrane verhaal",
    fr: "Votre histoire méditerranéenne",
    es: "Tu historia mediterránea",
    de: "Deine mediterrane Geschichte"
  },
  "Your role can view bookings but cannot change status.": {
    nl: "Jouw rol kan boekingen bekijken maar geen status wijzigen.",
    fr: "Votre rôle peut consulter les réservations mais pas modifier le statut.",
    es: "Tu rol puede ver reservas pero no cambiar el estado.",
    de: "Deine Rolle kann Buchungen einsehen, aber den Status nicht ändern."
  }
};
