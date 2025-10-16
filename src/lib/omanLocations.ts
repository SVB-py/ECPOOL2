interface Coordinates {
  lat: number;
  lng: number;
}

const BASE_COORDINATES: Coordinates = { lat: 23.588, lng: 58.3829 };

const FALLBACK_COORDINATES: Coordinates[] = [
  { lat: 23.5975, lng: 58.403 }, // Muttrah corniche area
  { lat: 23.5832, lng: 58.3891 }, // Ruwi downtown
  { lat: 23.5739, lng: 58.4074 }, // Bawshar interior
  { lat: 23.6121, lng: 58.3379 }, // Al Mawaleh south
  { lat: 23.5664, lng: 58.3258 }, // Al Ghubra inland
  { lat: 23.5542, lng: 58.4146 }, // Al Khuwair residential
  { lat: 23.6027, lng: 58.4562 }, // Qurum heights
  { lat: 23.5452, lng: 58.3914 }, // Bausher Heights
  { lat: 23.5798, lng: 58.3682 }, // Al Azaiba township
  { lat: 23.6148, lng: 58.3285 }, // Al Mouj inland side
  { lat: 23.6282, lng: 58.5151 }, // Muttrah souq access
  { lat: 23.5603, lng: 58.4234 }, // Ghala industrial
  { lat: 23.6009, lng: 58.3721 }, // Sultan Qaboos Grand Mosque
  { lat: 23.5859, lng: 58.4099 }, // Ministries area inland
  { lat: 23.5482, lng: 58.4456 }, // Bawshar heights plateau
  { lat: 23.6214, lng: 58.3012 }, // The Wave community centre
  { lat: 23.5393, lng: 58.3831 }, // Madinat Qaboos hinterland
  { lat: 23.5725, lng: 58.3298 }, // Al Khoudh plateau
  { lat: 23.5931, lng: 58.2844 }, // Airport inland access
];

const SCHOOL_HUB: Coordinates = { lat: 23.5887, lng: 58.4002 };

const KNOWN_LOCATIONS: Record<string, Coordinates> = {
  "al khuwair": { lat: 23.5861, lng: 58.409 },
  "al khuwair plaza": { lat: 23.5867, lng: 58.4118 },
  "khuwair": { lat: 23.5861, lng: 58.409 },
  "ruwi": { lat: 23.5921, lng: 58.5637 },
  "ruwi center": { lat: 23.5943, lng: 58.5498 },
  "muttrah": { lat: 23.6176, lng: 58.5933 },
  "mutrah": { lat: 23.6176, lng: 58.5933 },
  "qurum": { lat: 23.6151, lng: 58.4884 },
  "qurm": { lat: 23.6151, lng: 58.4884 },
  "al ghubra": { lat: 23.586, lng: 58.3844 },
  "ghubra": { lat: 23.586, lng: 58.3844 },
  "maidan al touba": { lat: 23.5534, lng: 58.6241 },
  "madinat qaboos": { lat: 23.5982, lng: 58.4438 },
  "almouj": { lat: 23.6203, lng: 58.2977 },
  "al mouj": { lat: 23.6203, lng: 58.2977 },
  "seeb": { lat: 23.6741, lng: 58.1896 },
  "mawilah": { lat: 23.5993, lng: 58.1527 },
  "mawilah south": { lat: 23.5791, lng: 58.1873 },
  "muscat international airport": { lat: 23.5931, lng: 58.2844 },
  "airport": { lat: 23.5931, lng: 58.2844 },
  "oman avenues mall": { lat: 23.5909, lng: 58.4155 },
  "boulevard": { lat: 23.5875, lng: 58.4211 },
  "sultan qaboos university": { lat: 23.5875, lng: 58.168 },
  "squ": { lat: 23.5875, lng: 58.168 },
  "ismar": { lat: 23.5844, lng: 58.3979 },
  "indian school": { lat: 23.5888, lng: 58.3996 },
  "indian school seeb": { lat: 23.6694, lng: 58.1841 },
  "indian school muscat": SCHOOL_HUB,
  "indian school al seeb": { lat: 23.6694, lng: 58.1841 },
  "ism": SCHOOL_HUB,
  "school": SCHOOL_HUB,
  "school campus": SCHOOL_HUB,
  "eco school": SCHOOL_HUB,
  "eco campus": SCHOOL_HUB,
  "central school": SCHOOL_HUB,
  "student drop": SCHOOL_HUB,
  "grand mall": { lat: 23.5854, lng: 58.4125 },
  "bawshar": { lat: 23.5611, lng: 58.4413 },
  "bausher": { lat: 23.5611, lng: 58.4413 },
  "gala": { lat: 23.5466, lng: 58.4231 },
  "al amerat": { lat: 23.5349, lng: 58.5506 },
  "amerat": { lat: 23.5349, lng: 58.5506 },
  "wattayah": { lat: 23.6042, lng: 58.5543 },
  "ras al hamra": { lat: 23.6249, lng: 58.4872 },
  "ministry district": { lat: 23.5893, lng: 58.3961 },
  "alkhuwair": { lat: 23.5861, lng: 58.409 },
  "alkhoud": { lat: 23.6036, lng: 58.1682 },
  "al khoud": { lat: 23.6036, lng: 58.1682 },
  "al hail": { lat: 23.6987, lng: 58.1834 },
  "al hail north": { lat: 23.7041, lng: 58.1925 },
  "al hail south": { lat: 23.6888, lng: 58.1756 },
  "mabela": { lat: 23.6138, lng: 58.0851 },
  "mabellah": { lat: 23.6138, lng: 58.0851 },
  "mabella": { lat: 23.6138, lng: 58.0851 },
  "rusayl": { lat: 23.5851, lng: 58.1604 },
  "rusayl industrial estate": { lat: 23.5898, lng: 58.1477 },
  "ghala": { lat: 23.5466, lng: 58.4231 },
  "aziba": { lat: 23.6049, lng: 58.3714 },
  "al azaiba": { lat: 23.6049, lng: 58.3714 },
  "al azaiba south": { lat: 23.5986, lng: 58.3731 },
  "al azaiba north": { lat: 23.6112, lng: 58.3694 },
  "ansaab": { lat: 23.5238, lng: 58.4296 },
  "al ansab": { lat: 23.5238, lng: 58.4296 },
  "bedia": { lat: 23.5949, lng: 58.445 },
  "al khoudh": { lat: 23.6036, lng: 58.1682 },
  "muscat": { lat: 23.588, lng: 58.3829 },
};

function normaliseKey(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\bmuscat\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function createFallbackCoordinate(index: number, base: Coordinates = BASE_COORDINATES): Coordinates {
  if (FALLBACK_COORDINATES.length > 0) {
    return FALLBACK_COORDINATES[index % FALLBACK_COORDINATES.length];
  }

  const offset = index * 0.003;
  const lat = base.lat + Math.sin(index * 1.3) * offset;
  const lng = base.lng + Math.cos(index * 1.3) * offset * 1.4;

  return {
    lat: Math.min(Math.max(lat, 23.54), 23.64),
    lng: Math.min(Math.max(lng, 58.30), 58.46),
  };
}

export function getCoordinatesForLocation(rawName: string | null | undefined, indexFallback?: number): Coordinates | null {
  if (!rawName) {
    return indexFallback !== undefined ? createFallbackCoordinate(indexFallback) : null;
  }

  const normalised = normaliseKey(rawName);
  if (KNOWN_LOCATIONS[normalised]) {
    return KNOWN_LOCATIONS[normalised];
  }

  const approximateMatch = Object.entries(KNOWN_LOCATIONS).find(([key]) => normalised.includes(key) || key.includes(normalised));
  if (approximateMatch) {
    return approximateMatch[1];
  }

  return indexFallback !== undefined ? createFallbackCoordinate(indexFallback) : null;
}

export function geocodeLocationList(locations: Array<string | null | undefined>, base?: Coordinates): Coordinates[] {
  return locations
    .map((location, index) => getCoordinatesForLocation(location, index) || createFallbackCoordinate(index, base))
    .filter(Boolean) as Coordinates[];
}

export function toLatLngTuples(coords: Coordinates[]): [number, number][] {
  return coords.map((coord) => [coord.lat, coord.lng]);
}

export function getDisplayName(rawName: string | null | undefined): string {
  if (!rawName) {
    return "Unknown";
  }
  return rawName;
}

export type { Coordinates };
