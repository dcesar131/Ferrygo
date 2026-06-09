import { useState, useEffect, useRef, useCallback } from "react";
import mapboxgl from "https://esm.sh/mapbox-gl@3.4.0";

// ─── MAPBOX TOKEN (free tier — user replaces with their own) ───────────────
const MAPBOX_TOKEN = "pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB4io1Q";

// ─── PAYPAL CONFIG ────────────────────────────────────────────────────────
const PAYPAL_CONFIG = {
  CLIENT_ID: BAAhniyKVcnXkk_jqFLbOE0ag4rjYi1CGllwbcQ1D8S1YBSFF4A1wcryN2yxYdOeDm2DFVuaDzEXqkQaMc,
  PLATFORM_MERCHANT_ID: 8AB5BGXY3ZCDQ,
  PLATFORM_FEE_PERCENT: 8,
  CURRENCY: "USD",
  ENVIRONMENT: production,
};

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────
const T = {
  en: {
    appName: "FerryGo",
    tagline: "Haiti & DR Ferry Booking",
    selectRoute: "Select Route",
    from: "From",
    to: "To",
    date: "Travel Date",
    travelers: "Travelers",
    adult: "Adult",
    child: "Child",
    infant: "Infant",
    bookNow: "Book Now",
    selectDate: "Select date",
    departure: "Departure",
    arrival: "Arrival",
    duration: "Duration",
    price: "Price",
    total: "Total",
    confirm: "Confirm Booking",
    international: "International Routes",
    domestic: "Domestic Routes",
    search: "Search routes...",
    passengers: "Passengers",
    hrs: "hrs",
    perPerson: "/ person",
    bookingConfirmed: "Booking Confirmed!",
    myBookings: "My Bookings",
    back: "Back",
    noRoutes: "No routes found",
    routeMap: "Route Map",
    portInfo: "Port Information",
    live: "LIVE",
    portCapacity: "Port Capacity",
    nextDeparture: "Next Departure",
    selectTrip: "Select a route to see details",
  },
  fr: {
    appName: "FerryGo",
    tagline: "Réservation Ferry Haïti & RD",
    selectRoute: "Sélectionner Itinéraire",
    from: "De",
    to: "À",
    date: "Date de Voyage",
    travelers: "Voyageurs",
    adult: "Adulte",
    child: "Enfant",
    infant: "Bébé",
    bookNow: "Réserver",
    selectDate: "Sélectionner date",
    departure: "Départ",
    arrival: "Arrivée",
    duration: "Durée",
    price: "Prix",
    total: "Total",
    confirm: "Confirmer",
    international: "Routes Internationales",
    domestic: "Routes Domestiques",
    search: "Rechercher...",
    passengers: "Passagers",
    hrs: "h",
    perPerson: "/ pers.",
    bookingConfirmed: "Réservation Confirmée!",
    myBookings: "Mes Réservations",
    back: "Retour",
    noRoutes: "Aucun itinéraire trouvé",
    routeMap: "Carte des Routes",
    portInfo: "Info Port",
    live: "EN DIRECT",
    portCapacity: "Capacité du Port",
    nextDeparture: "Prochain Départ",
    selectTrip: "Sélectionnez un itinéraire",
  },
  ht: {
    appName: "FerryGo",
    tagline: "Rezèvasyon Feri Ayiti & RD",
    selectRoute: "Chwazi Wout",
    from: "Kote",
    to: "Ale",
    date: "Dat Vwayaj",
    travelers: "Vwayajè",
    adult: "Granmoun",
    child: "Timoun",
    infant: "Bebe",
    bookNow: "Rezève",
    selectDate: "Chwazi dat",
    departure: "Depa",
    arrival: "Rive",
    duration: "Dire",
    price: "Pri",
    total: "Total",
    confirm: "Konfime",
    international: "Wout Entènasyonal",
    domestic: "Wout Domestik",
    search: "Chèche wout...",
    passengers: "Pasajè",
    hrs: "è",
    perPerson: "/ moun",
    bookingConfirmed: "Rezèvasyon Konfime!",
    myBookings: "Rezèvasyon Mwen",
    back: "Retounen",
    noRoutes: "Pa gen wout",
    routeMap: "Kat Wout",
    portInfo: "Enfòmasyon Pò",
    live: "DIRÈK",
    portCapacity: "Kapasite Pò",
    nextDeparture: "Pwochen Depa",
    selectTrip: "Chwazi yon wout pou wè detay",
  },
  es: {
    appName: "FerryGo",
    tagline: "Reserva de Ferry Haití y RD",
    selectRoute: "Seleccionar Ruta",
    from: "Desde",
    to: "Hacia",
    date: "Fecha de Viaje",
    travelers: "Viajeros",
    adult: "Adulto",
    child: "Niño",
    infant: "Bebé",
    bookNow: "Reservar",
    selectDate: "Seleccionar fecha",
    departure: "Salida",
    arrival: "Llegada",
    duration: "Duración",
    price: "Precio",
    total: "Total",
    confirm: "Confirmar Reserva",
    international: "Rutas Internacionales",
    domestic: "Rutas Domésticas",
    search: "Buscar rutas...",
    passengers: "Pasajeros",
    hrs: "h",
    perPerson: "/ persona",
    bookingConfirmed: "¡Reserva Confirmada!",
    myBookings: "Mis Reservas",
    back: "Volver",
    noRoutes: "No se encontraron rutas",
    routeMap: "Mapa de Rutas",
    portInfo: "Información del Puerto",
    live: "EN VIVO",
    portCapacity: "Capacidad del Puerto",
    nextDeparture: "Próxima Salida",
    selectTrip: "Selecciona una ruta para ver detalles",
  },
};

// ─── PORTS (coordinates for Mapbox) ───────────────────────────────────────
const PORTS = {
  "Port-au-Prince": { coords: [-72.3388, 18.5944], country: "HT", color: "#00C6FF" },
  "Cap-Haïtien": { coords: [-72.2000, 19.7600], country: "HT", color: "#00C6FF" },
  "Les Cayes": { coords: [-73.7494, 18.1997], country: "HT", color: "#00C6FF" },
  "Jérémie": { coords: [-74.1194, 18.6469], country: "HT", color: "#00C6FF" },
  "Gonaïves": { coords: [-72.6888, 19.4483], country: "HT", color: "#00C6FF" },
  "Saint-Marc": { coords: [-72.7036, 19.1044], country: "HT", color: "#00C6FF" },
  "Jacmel": { coords: [-72.5369, 18.2344], country: "HT", color: "#00C6FF" },
  "La Gonâve": { coords: [-73.0500, 18.8300], country: "HT", color: "#00C6FF" },
  "Île-à-Vache": { coords: [-73.6700, 18.0800], country: "HT", color: "#00C6FF" },
  "Santo Domingo": { coords: [-69.9312, 18.4861], country: "DO", color: "#FF6B6B" },
  "Puerto Plata": { coords: [-70.6897, 19.7984], country: "DO", color: "#FF6B6B" },
  "Samaná": { coords: [-69.3317, 19.2060], country: "DO", color: "#FF6B6B" },
};

// ─── ROUTES ───────────────────────────────────────────────────────────────
const ROUTES = [
  // International
  { id: 1, type: "international", from: "Port-au-Prince", to: "Santo Domingo", duration: 8, price: { adult: 85, child: 50, infant: 15 }, departs: "08:00", arrives: "16:00" },
  { id: 2, type: "international", from: "Cap-Haïtien", to: "Puerto Plata", duration: 3, price: { adult: 55, child: 30, infant: 10 }, departs: "09:00", arrives: "12:00" },
  { id: 3, type: "international", from: "Cap-Haïtien", to: "Samaná", duration: 4.5, price: { adult: 65, child: 38, infant: 12 }, departs: "07:30", arrives: "12:00" },
  { id: 4, type: "international", from: "Port-au-Prince", to: "Puerto Plata", duration: 9, price: { adult: 90, child: 55, infant: 18 }, departs: "06:00", arrives: "15:00" },
  // Domestic Haiti
  { id: 5, type: "domestic", from: "Port-au-Prince", to: "Cap-Haïtien", duration: 6, price: { adult: 45, child: 25, infant: 8 }, departs: "07:00", arrives: "13:00" },
  { id: 6, type: "domestic", from: "Port-au-Prince", to: "Les Cayes", duration: 3.5, price: { adult: 30, child: 18, infant: 6 }, departs: "08:00", arrives: "11:30" },
  { id: 7, type: "domestic", from: "Port-au-Prince", to: "Jérémie", duration: 5, price: { adult: 40, child: 22, infant: 7 }, departs: "06:30", arrives: "11:30" },
  { id: 8, type: "domestic", from: "Port-au-Prince", to: "Gonaïves", duration: 4, price: { adult: 35, child: 20, infant: 7 }, departs: "07:00", arrives: "11:00" },
  { id: 9, type: "domestic", from: "Port-au-Prince", to: "Saint-Marc", duration: 2.5, price: { adult: 25, child: 15, infant: 5 }, departs: "08:00", arrives: "10:30" },
  { id: 10, type: "domestic", from: "Port-au-Prince", to: "Jacmel", duration: 2, price: { adult: 20, child: 12, infant: 4 }, departs: "09:00", arrives: "11:00" },
  { id: 11, type: "domestic", from: "Port-au-Prince", to: "La Gonâve", duration: 1.5, price: { adult: 18, child: 10, infant: 4 }, departs: "07:30", arrives: "09:00" },
  { id: 12, type: "domestic", from: "Les Cayes", to: "Île-à-Vache", duration: 0.5, price: { adult: 8, child: 5, infant: 2 }, departs: "08:00", arrives: "08:30" },
  { id: 13, type: "domestic", from: "Cap-Haïtien", to: "Gonaïves", duration: 3, price: { adult: 28, child: 16, infant: 5 }, departs: "07:00", arrives: "10:00" },
];

// ─── MAIN APP ─────────────────────────────────────────────────────────────
export default function App() {
  const [lang, setLang] = useState("en");
  const [view, setView] = useState("home"); // home | booking | confirm | bookings
  const [routeType, setRouteType] = useState("international");
  const [search, setSearch] = useState("");
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [travelDate, setTravelDate] = useState("");
  const [travelers, setTravelers] = useState({ adult: 1, child: 0, infant: 0 });
  const [bookings, setBookings] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  const t = T[lang];

  const filteredRoutes = ROUTES.filter(r =>
    r.type === routeType &&
    (r.from.toLowerCase().includes(search.toLowerCase()) ||
     r.to.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPrice = selectedRoute
    ? travelers.adult * selectedRoute.price.adult +
      travelers.child * selectedRoute.price.child +
      travelers.infant * selectedRoute.price.infant
    : 0;

  const totalPassengers = travelers.adult + travelers.child + travelers.infant;

  // ── MAP INIT ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    mapboxgl.accessToken = MAPBOX_TOKEN;
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-71.5, 19.0],
      zoom: 5.5,
      attributionControl: false,
    });
    mapInstanceRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    map.on("load", () => {
      // Add all port markers
      Object.entries(PORTS).forEach(([name, data]) => {
        const el = document.createElement("div");
        el.className = "port-marker";
        el.style.cssText = `
          width:14px;height:14px;border-radius:50%;
          background:${data.color};border:2px solid white;
          box-shadow:0 0 12px ${data.color};cursor:pointer;
          transition:transform 0.2s;
        `;
        el.addEventListener("mouseenter", () => el.style.transform = "scale(1.5)");
        el.addEventListener("mouseleave", () => el.style.transform = "scale(1)");

        const popup = new mapboxgl.Popup({ offset: 12, closeButton: false })
          .setHTML(`<div style="font-family:sans-serif;font-size:12px;font-weight:bold;color:#111;">${name}</div>`);

        const marker = new mapboxgl.Marker(el)
          .setLngLat(data.coords)
          .setPopup(popup)
          .addTo(map);
        markersRef.current.push(marker);
      });

      // Draw all route lines faintly
      ROUTES.forEach(route => {
        const from = PORTS[route.from];
        const to = PORTS[route.to];
        if (!from || !to) return;
        const sourceId = `route-${route.id}-base`;
        map.addSource(sourceId, {
          type: "geojson",
          data: { type: "Feature", geometry: { type: "LineString", coordinates: [from.coords, to.coords] } }
        });
        map.addLayer({
          id: sourceId,
          type: "line",
          source: sourceId,
          paint: {
            "line-color": route.type === "international" ? "#FF6B6B" : "#00C6FF",
            "line-width": 1,
            "line-opacity": 0.2,
            "line-dasharray": [3, 3],
          }
        });
      });
    });

    return () => map.remove();
  }, []);

  // ── HIGHLIGHT SELECTED ROUTE ON MAP ──────────────────────────────────────
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    // Remove old highlight
    if (map.getLayer("active-route")) map.removeLayer("active-route");
    if (map.getSource("active-route")) map.removeSource("active-route");

    if (!selectedRoute) return;
    const from = PORTS[selectedRoute.from];
    const to = PORTS[selectedRoute.to];
    if (!from || !to) return;

    map.addSource("active-route", {
      type: "geojson",
      data: { type: "Feature", geometry: { type: "LineString", coordinates: [from.coords, to.coords] } }
    });
    map.addLayer({
      id: "active-route",
      type: "line",
      source: "active-route",
      paint: {
        "line-color": "#FFD700",
        "line-width": 3,
        "line-opacity": 0.95,
        "line-dasharray": [1, 0],
      }
    });

    // Fly to fit both ports
    const bounds = new mapboxgl.LngLatBounds();
    bounds.extend(from.coords);
    bounds.extend(to.coords);
    map.fitBounds(bounds, { padding: 80, duration: 1000 });
  }, [selectedRoute]);

  const handleBook = (route) => {
    setSelectedRoute(route);
    setView("booking");
  };

  const handleConfirm = () => {
    const booking = {
      id: Date.now(),
      route: selectedRoute,
      date: travelDate,
      travelers: { ...travelers },
      total: totalPrice,
      ref: `FG${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    };
    setBookings(prev => [booking, ...prev]);
    setView("confirmed");
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #080C14; color: #E8EDF5; font-family: 'DM Sans', sans-serif; height: 100dvh; overflow: hidden; }
        :root {
          --teal: #00C6FF; --coral: #FF6B6B; --gold: #FFD700;
          --bg: #080C14; --surface: #0F1520; --surface2: #161E2E;
          --border: rgba(255,255,255,0.08); --text: #E8EDF5; --muted: #7A8499;
        }
        .app { display:flex; flex-direction:column; height:100dvh; }
        /* NAV */
        .nav { display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:rgba(8,12,20,0.95); border-bottom:1px solid var(--border); backdrop-filter:blur(12px); z-index:100; flex-shrink:0; }
        .nav-brand { font-family:'Syne',sans-serif; font-weight:800; font-size:22px; background:linear-gradient(135deg,var(--teal),var(--coral)); -webkit-background-clip:text; -webkit-text-fill-color:transparent; }
        .nav-actions { display:flex; align-items:center; gap:8px; }
        .lang-btn { padding:4px 10px; border-radius:20px; border:1px solid var(--border); background:transparent; color:var(--muted); font-size:11px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
        .lang-btn.active { background:var(--teal); color:#000; border-color:var(--teal); font-weight:600; }
        .icon-btn { width:36px; height:36px; border-radius:50%; border:1px solid var(--border); background:var(--surface); color:var(--text); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; transition:all 0.2s; position:relative; }
        .icon-btn:hover { border-color:var(--teal); }
        .badge { position:absolute; top:-2px; right:-2px; background:var(--coral); color:#fff; font-size:9px; font-weight:700; width:16px; height:16px; border-radius:50%; display:flex; align-items:center; justify-content:center; }
        /* BODY */
        .body { display:flex; flex:1; overflow:hidden; }
        /* MAP */
        .map-panel { flex:1; position:relative; }
        .map-container { width:100%; height:100%; }
        .map-overlay { position:absolute; bottom:16px; left:16px; background:rgba(8,12,20,0.85); border:1px solid var(--border); border-radius:12px; padding:12px 14px; backdrop-filter:blur(8px); min-width:200px; }
        .map-overlay-title { font-size:10px; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin-bottom:8px; }
        .legend-item { display:flex; align-items:center; gap:8px; font-size:12px; color:var(--text); margin-bottom:4px; }
        .legend-dot { width:10px; height:10px; border-radius:50%; flex-shrink:0; }
        /* SIDE PANEL */
        .side-panel { width:360px; background:var(--surface); border-left:1px solid var(--border); display:flex; flex-direction:column; flex-shrink:0; overflow:hidden; }
        /* TABS */
        .tabs { display:flex; border-bottom:1px solid var(--border); flex-shrink:0; }
        .tab { flex:1; padding:14px 8px; text-align:center; font-size:12px; font-weight:500; color:var(--muted); cursor:pointer; border-bottom:2px solid transparent; transition:all 0.2s; }
        .tab.active { color:var(--teal); border-bottom-color:var(--teal); }
        /* SEARCH */
        .search-wrap { padding:12px; border-bottom:1px solid var(--border); flex-shrink:0; }
        .search-input { width:100%; padding:10px 14px 10px 36px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
        .search-input:focus { border-color:var(--teal); }
        .search-wrap { position:relative; }
        .search-icon { position:absolute; left:24px; top:50%; transform:translateY(-50%); color:var(--muted); font-size:14px; pointer-events:none; }
        /* ROUTE LIST */
        .route-list { flex:1; overflow-y:auto; padding:8px; }
        .route-list::-webkit-scrollbar { width:4px; }
        .route-list::-webkit-scrollbar-track { background:transparent; }
        .route-list::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
        .route-card { background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:8px; cursor:pointer; transition:all 0.2s; }
        .route-card:hover { border-color:var(--teal); transform:translateY(-1px); }
        .route-card.selected { border-color:var(--gold); background:rgba(255,215,0,0.05); }
        .route-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px; }
        .route-cities { font-family:'Syne',sans-serif; font-weight:700; font-size:14px; }
        .route-arrow { color:var(--teal); margin:0 6px; }
        .route-price { font-family:'Syne',sans-serif; font-weight:800; font-size:16px; color:var(--gold); }
        .route-price-sub { font-size:10px; color:var(--muted); font-weight:400; }
        .route-meta { display:flex; gap:12px; }
        .route-meta-item { display:flex; align-items:center; gap:4px; font-size:11px; color:var(--muted); }
        .route-type-badge { display:inline-flex; align-items:center; gap:4px; padding:2px 8px; border-radius:20px; font-size:10px; font-weight:600; margin-bottom:8px; }
        .badge-int { background:rgba(255,107,107,0.15); color:var(--coral); }
        .badge-dom { background:rgba(0,198,255,0.15); color:var(--teal); }
        .book-btn { width:100%; margin-top:10px; padding:9px; background:var(--teal); color:#000; border:none; border-radius:8px; font-weight:700; font-size:12px; font-family:'DM Sans',sans-serif; cursor:pointer; transition:all 0.2s; }
        .book-btn:hover { background:#00AEDD; }
        /* BOOKING PANEL */
        .booking-panel { display:flex; flex-direction:column; height:100%; overflow:hidden; }
        .panel-header { display:flex; align-items:center; gap:12px; padding:16px; border-bottom:1px solid var(--border); flex-shrink:0; }
        .back-btn { width:32px; height:32px; border-radius:8px; border:1px solid var(--border); background:transparent; color:var(--text); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:16px; }
        .panel-title { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; }
        .panel-body { flex:1; overflow-y:auto; padding:16px; }
        .panel-body::-webkit-scrollbar { width:4px; }
        .panel-body::-webkit-scrollbar-thumb { background:var(--border); border-radius:4px; }
        .section-label { font-size:11px; text-transform:uppercase; letter-spacing:0.1em; color:var(--muted); margin-bottom:10px; font-weight:600; }
        .route-summary { background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:20px; }
        .route-summary-cities { font-family:'Syne',sans-serif; font-weight:800; font-size:18px; margin-bottom:8px; }
        .route-summary-meta { display:flex; gap:16px; flex-wrap:wrap; }
        .meta-chip { background:rgba(255,255,255,0.05); padding:4px 10px; border-radius:20px; font-size:12px; color:var(--muted); }
        .form-group { margin-bottom:16px; }
        .form-label { font-size:12px; color:var(--muted); margin-bottom:6px; display:block; }
        .form-input { width:100%; padding:10px 14px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-size:13px; font-family:'DM Sans',sans-serif; outline:none; transition:border-color 0.2s; }
        .form-input:focus { border-color:var(--teal); }
        .traveler-row { display:flex; align-items:center; justify-content:space-between; padding:10px 0; border-bottom:1px solid var(--border); }
        .traveler-info { font-size:13px; font-weight:500; }
        .traveler-price { font-size:11px; color:var(--muted); }
        .traveler-controls { display:flex; align-items:center; gap:10px; }
        .count-btn { width:28px; height:28px; border-radius:8px; border:1px solid var(--border); background:var(--surface2); color:var(--text); cursor:pointer; font-size:16px; display:flex; align-items:center; justify-content:center; transition:all 0.2s; }
        .count-btn:hover { border-color:var(--teal); color:var(--teal); }
        .count-val { font-family:'Syne',sans-serif; font-weight:700; font-size:16px; min-width:20px; text-align:center; }
        .price-breakdown { background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:14px; margin-top:20px; }
        .price-row { display:flex; justify-content:space-between; font-size:13px; padding:4px 0; color:var(--muted); }
        .price-total { display:flex; justify-content:space-between; font-family:'Syne',sans-serif; font-weight:800; font-size:18px; padding-top:12px; margin-top:8px; border-top:1px solid var(--border); color:var(--gold); }
        .confirm-btn { width:100%; padding:14px; background:linear-gradient(135deg,var(--teal),#0099CC); color:#000; border:none; border-radius:12px; font-weight:700; font-size:15px; font-family:'Syne',sans-serif; cursor:pointer; margin-top:20px; transition:all 0.2s; }
        .confirm-btn:hover { transform:translateY(-1px); box-shadow:0 8px 24px rgba(0,198,255,0.3); }
        .confirm-btn:disabled { opacity:0.5; cursor:not-allowed; transform:none; }
        /* CONFIRMED */
        .confirmed-panel { display:flex; flex-direction:column; align-items:center; justify-content:center; padding:32px 20px; text-align:center; height:100%; }
        .confirmed-icon { font-size:56px; margin-bottom:20px; animation: pop 0.4s ease; }
        @keyframes pop { from{transform:scale(0)} to{transform:scale(1)} }
        .confirmed-title { font-family:'Syne',sans-serif; font-weight:800; font-size:22px; color:var(--teal); margin-bottom:8px; }
        .confirmed-ref { font-size:13px; color:var(--muted); margin-bottom:24px; }
        .ref-code { font-family:'Syne',sans-serif; font-weight:700; font-size:20px; color:var(--gold); letter-spacing:0.1em; }
        .home-btn { padding:12px 28px; background:var(--surface2); border:1px solid var(--border); border-radius:10px; color:var(--text); font-family:'DM Sans',sans-serif; font-size:13px; cursor:pointer; }
        /* BOOKINGS VIEW */
        .bookings-list { flex:1; overflow-y:auto; padding:12px; }
        .booking-item { background:var(--surface2); border:1px solid var(--border); border-radius:12px; padding:14px; margin-bottom:10px; }
        .booking-route { font-family:'Syne',sans-serif; font-weight:700; font-size:15px; margin-bottom:6px; }
        .booking-meta { display:flex; gap:12px; flex-wrap:wrap; }
        .booking-meta-item { font-size:11px; color:var(--muted); }
        .booking-total { font-family:'Syne',sans-serif; font-weight:700; color:var(--gold); font-size:14px; margin-top:8px; }
        .empty-state { text-align:center; padding:48px 20px; color:var(--muted); font-size:13px; }
        /* MAPBOX overrides */
        .mapboxgl-popup-content { background:#111827 !important; border:1px solid rgba(255,255,255,0.1) !important; border-radius:8px !important; padding:8px 12px !important; }
        .mapboxgl-ctrl-group { background:rgba(15,21,32,0.9) !important; border:1px solid rgba(255,255,255,0.1) !important; }
        .mapboxgl-ctrl-group button { background:transparent !important; color:#E8EDF5 !important; }
        .mapboxgl-ctrl-attrib { display:none !important; }
        @media(max-width:768px) {
          .body { flex-direction:column; }
          .map-panel { height:40%; }
          .side-panel { width:100%; flex:1; border-left:none; border-top:1px solid var(--border); }
        }
      `}</style>

      <div className="app">
        {/* ── NAV ── */}
        <nav className="nav">
          <div className="nav-brand">{t.appName}</div>
          <div className="nav-actions">
            {["en","fr","ht","es"].map(l => (
              <button key={l} className={`lang-btn ${lang===l?"active":""}`} onClick={() => setLang(l)}>
                {l.toUpperCase()}
              </button>
            ))}
            <button className="icon-btn" onClick={() => setView(view==="bookings"?"home":"bookings")}>
              🎫
              {bookings.length > 0 && <span className="badge">{bookings.length}</span>}
            </button>
          </div>
        </nav>

        {/* ── BODY ── */}
        <div className="body">
          {/* MAP */}
          <div className="map-panel">
            <div ref={mapRef} className="map-container" />
            <div className="map-overlay">
              <div className="map-overlay-title">{t.routeMap}</div>
              <div className="legend-item"><div className="legend-dot" style={{background:"#FF6B6B",boxShadow:"0 0 8px #FF6B6B"}} />{t.international}</div>
              <div className="legend-item"><div className="legend-dot" style={{background:"#00C6FF",boxShadow:"0 0 8px #00C6FF"}} />{t.domestic}</div>
              {selectedRoute && <div className="legend-item"><div className="legend-dot" style={{background:"#FFD700",boxShadow:"0 0 8px #FFD700"}} />Active Route</div>}
            </div>
          </div>

          {/* SIDE PANEL */}
          <div className="side-panel">
            {view === "home" && (
              <>
                <div className="tabs">
                  <div className={`tab ${routeType==="international"?"active":""}`} onClick={() => setRouteType("international")}>{t.international}</div>
                  <div className={`tab ${routeType==="domestic"?"active":""}`} onClick={() => setRouteType("domestic")}>{t.domestic}</div>
                </div>
                <div className="search-wrap">
                  <span className="search-icon">🔍</span>
                  <input className="search-input" placeholder={t.search} value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <div className="route-list">
                  {filteredRoutes.length === 0 && <div className="empty-state">{t.noRoutes}</div>}
                  {filteredRoutes.map(route => (
                    <div key={route.id} className={`route-card ${selectedRoute?.id===route.id?"selected":""}`} onClick={() => setSelectedRoute(route)}>
                      <div className={`route-type-badge ${route.type==="international"?"badge-int":"badge-dom"}`}>
                        {route.type === "international" ? "✈️" : "⚓"} {route.type === "international" ? t.international : t.domestic}
                      </div>
                      <div className="route-header">
                        <div className="route-cities">
                          {route.from}<span className="route-arrow"> → </span>{route.to}
                        </div>
                        <div>
                          <div className="route-price">${route.price.adult}<span className="route-price-sub">{t.perPerson}</span></div>
                        </div>
                      </div>
                      <div className="route-meta">
                        <div className="route-meta-item">🕐 {route.duration}{t.hrs}</div>
                        <div className="route-meta-item">🚢 {route.departs}</div>
                        <div className="route-meta-item">📍 {route.arrives}</div>
                      </div>
                      <button className="book-btn" onClick={e => { e.stopPropagation(); handleBook(route); }}>{t.bookNow}</button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {view === "booking" && selectedRoute && (
              <div className="booking-panel">
                <div className="panel-header">
                  <button className="back-btn" onClick={() => setView("home")}>←</button>
                  <div className="panel-title">{t.bookNow}</div>
                </div>
                <div className="panel-body">
                  <div className="section-label">{t.selectRoute}</div>
                  <div className="route-summary">
                    <div className="route-summary-cities">{selectedRoute.from} → {selectedRoute.to}</div>
                    <div className="route-summary-meta">
                      <span className="meta-chip">🕐 {selectedRoute.duration}{t.hrs}</span>
                      <span className="meta-chip">🚢 {selectedRoute.departs}</span>
                      <span className="meta-chip">📍 {selectedRoute.arrives}</span>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">{t.date}</label>
                    <input type="date" className="form-input" value={travelDate} onChange={e => setTravelDate(e.target.value)} min={new Date().toISOString().split("T")[0]} />
                  </div>

                  <div className="section-label">{t.travelers}</div>
                  {[["adult", t.adult], ["child", t.child], ["infant", t.infant]].map(([type, label]) => (
                    <div key={type} className="traveler-row">
                      <div>
                        <div className="traveler-info">{label}</div>
                        <div className="traveler-price">${selectedRoute.price[type]} {t.perPerson}</div>
                      </div>
                      <div className="traveler-controls">
                        <button className="count-btn" onClick={() => setTravelers(p => ({ ...p, [type]: Math.max(type==="adult"?1:0, p[type]-1) }))}>−</button>
                        <span className="count-val">{travelers[type]}</span>
                        <button className="count-btn" onClick={() => setTravelers(p => ({ ...p, [type]: p[type]+1 }))}>+</button>
                      </div>
                    </div>
                  ))}

                  <div className="price-breakdown">
                    <div className="section-label" style={{marginBottom:"10px"}}>{t.price}</div>
                    {travelers.adult > 0 && <div className="price-row"><span>{travelers.adult}x {t.adult}</span><span>${travelers.adult * selectedRoute.price.adult}</span></div>}
                    {travelers.child > 0 && <div className="price-row"><span>{travelers.child}x {t.child}</span><span>${travelers.child * selectedRoute.price.child}</span></div>}
                    {travelers.infant > 0 && <div className="price-row"><span>{travelers.infant}x {t.infant}</span><span>${travelers.infant * selectedRoute.price.infant}</span></div>}
                    <div className="price-total"><span>{t.total}</span><span>${totalPrice}</span></div>
                  </div>

                  <button className="confirm-btn" disabled={!travelDate || totalPassengers === 0} onClick={handleConfirm}>
                    {t.confirm} — ${totalPrice}
                  </button>
                </div>
              </div>
            )}

            {view === "confirmed" && (
              <div className="confirmed-panel">
                <div className="confirmed-icon">✅</div>
                <div className="confirmed-title">{t.bookingConfirmed}</div>
                <div className="confirmed-ref">
                  {bookings[0]?.route.from} → {bookings[0]?.route.to} · {bookings[0]?.date}
                  <div className="ref-code" style={{marginTop:"8px"}}>{bookings[0]?.ref}</div>
                </div>
                <button className="home-btn" onClick={() => setView("home")}>{t.back}</button>
              </div>
            )}

            {view === "bookings" && (
              <div className="booking-panel">
                <div className="panel-header">
                  <button className="back-btn" onClick={() => setView("home")}>←</button>
                  <div className="panel-title">{t.myBookings}</div>
                </div>
                <div className="bookings-list">
                  {bookings.length === 0 && <div className="empty-state">No bookings yet</div>}
                  {bookings.map(b => (
                    <div key={b.id} className="booking-item">
                      <div className="booking-route">{b.route.from} → {b.route.to}</div>
                      <div className="booking-meta">
                        <span className="booking-meta-item">📅 {b.date}</span>
                        <span className="booking-meta-item">👥 {b.travelers.adult + b.travelers.child + b.travelers.infant} pax</span>
                        <span className="booking-meta-item">🎫 {b.ref}</span>
                      </div>
                      <div className="booking-total">${b.total}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
