export interface WazeStop {
  place_name: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  municipality?: string;
}

function isValidCoord(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function wazeLinkForStop(stop: WazeStop, options: { navigate?: boolean } = {}): string {
  const { navigate = false } = options;

  if (isValidCoord(stop.latitude) && isValidCoord(stop.longitude)) {
    const params = new URLSearchParams({ ll: `${stop.latitude},${stop.longitude}` });
    if (navigate) params.set('navigate', 'yes');
    return `https://www.waze.com/ul?${params.toString()}`;
  }

  const query = [stop.place_name, stop.address, stop.municipality, 'Camarines Sur, Philippines']
    .filter((part) => part && String(part).trim())
    .join(', ');

  const params = new URLSearchParams({ q: query });
  if (navigate) params.set('navigate', 'yes');
  return `https://www.waze.com/ul?${params.toString()}`;
}

/** Opens Waze navigation to the first itinerary stop (best available multi-stop flow). */
export function wazeRouteLink(stops: WazeStop[]): string | null {
  if (stops.length === 0) return null;
  return wazeLinkForStop(stops[0], { navigate: true });
}

export function wazeStopFromTripItem(item: {
  place_name: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  municipality_slug?: string;
}): WazeStop {
  return {
    place_name: item.place_name,
    latitude: item.latitude,
    longitude: item.longitude,
    address: item.address,
    municipality: item.municipality_slug?.replace(/-/g, ' '),
  };
}
