import { wazeLinkForStop, wazeRouteLink, wazeStopFromTripItem, type WazeStop } from '@/lib/waze';

export interface TripItineraryItem {
  id: string;
  place_name: string;
  activity?: string;
  start_time?: string;
  end_time?: string;
  notes?: string;
  latitude?: number | null;
  longitude?: number | null;
  address?: string;
  municipality_slug?: string;
}

export function TripItineraryView({
  items,
  municipalityName,
}: {
  items: TripItineraryItem[];
  municipalityName?: string;
}) {
  if (items.length === 0) return null;

  const stops: WazeStop[] = items.map((item) => ({
    ...wazeStopFromTripItem(item),
    municipality: municipalityName || wazeStopFromTripItem(item).municipality,
  }));
  const routeLink = wazeRouteLink(stops);

  return (
    <div className="trip-itinerary">
      {routeLink && (
        <div className="trip-itinerary__route">
          <a
            href={routeLink}
            target="_blank"
            rel="noopener noreferrer"
            className="button button-primary waze-button"
          >
            Start route in Waze
          </a>
          <p className="trip-itinerary__hint">
            Opens turn-by-turn directions to your first stop. Use the Waze links below for each
            additional stop in order.
          </p>
        </div>
      )}

      <ol className="trip-itinerary__list">
        {items.map((item, index) => {
          const stop: WazeStop = {
            ...wazeStopFromTripItem(item),
            municipality: municipalityName || wazeStopFromTripItem(item).municipality,
          };
          const wazeUrl = wazeLinkForStop(stop, { navigate: true });
          const time =
            item.start_time && item.end_time
              ? `${item.start_time}–${item.end_time}`
              : item.start_time;

          return (
            <li key={item.id} className="trip-itinerary__item madia-glass">
              <div className="trip-itinerary__item-head">
                <span className="trip-itinerary__step">{String(index + 1).padStart(2, '0')}</span>
                <div>
                  {time && <p className="trip-itinerary__time">{time}</p>}
                  <p className="trip-itinerary__name">{item.place_name}</p>
                  {item.activity && <p className="trip-itinerary__activity">{item.activity}</p>}
                  {item.address && <p className="trip-itinerary__address">{item.address}</p>}
                  {item.notes && <p className="trip-itinerary__notes">{item.notes}</p>}
                </div>
              </div>
              <a
                href={wazeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="button button-secondary waze-button waze-button--compact"
              >
                Open in Waze
              </a>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
