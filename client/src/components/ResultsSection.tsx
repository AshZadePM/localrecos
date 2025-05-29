import React, { useState, useEffect } from "react";
import RestaurantCard from "@/components/RestaurantCard";
import { FilterChip } from "@/components/ui/filter-chip";
import EmptyState from "@/components/EmptyState";
import { Restaurant } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Select } from "@/components/ui/select";

// Google Places API fetcher
async function fetchGooglePlaceData(title: string, city: string) {
  // Always use the exact Gemini "title" (restaurant name) for the Google Places query
  const res = await fetch(`/api/google-places?query=${encodeURIComponent(title)}&city=${encodeURIComponent(city)}`);
  const data = await res.json();
  if (!data.places || !data.places.length) return null;
  // Normalize city for comparison
  const norm = (s: string) => s?.toLowerCase().replace(/[^a-z0-9]/g, "");
  const normCity = norm(city);
  // Find a place that matches the name AND is in the correct city (robust city extraction)
  const match = (data.places as any[]).find((p: any) => {
    const nameMatch = norm(p.displayName?.text || p.name) === norm(title);
    // Try to extract city from address (split by comma, take 2nd or 3rd last)
    let cityInAddress = null;
    if (p.formattedAddress) {
      const parts = p.formattedAddress.split(',').map((s: string) => s.trim());
      if (parts.length >= 3) {
        cityInAddress = norm(parts[parts.length - 3]);
      } else if (parts.length >= 2) {
        cityInAddress = norm(parts[parts.length - 2]);
      }
    }
    // Accept match if city in address matches, or fallback to substring match
    const cityMatch = cityInAddress ? cityInAddress === normCity : (p.formattedAddress?.toLowerCase().includes(city.toLowerCase()));
    return nameMatch && cityMatch;
  })
  // Fallback: match by name only if no city match
  || (data.places as any[]).find((p: any) => norm(p.displayName?.text || p.name) === norm(title))
  // Fallback: just use the first result
  || data.places[0];
  
    // Log the full Google Places API response for this restaurant for debugging
    console.log('Google Places API match for', title, city, match);

    // Use the first photo name from the Google Places response if available
    let photoUrl = null;
    if (match.photos && Array.isArray(match.photos) && match.photos.length > 0 && match.photos[0].name) {
      // Use the exact string returned by Google Places for the photoName (no encodeURIComponent)
      photoUrl = `/api/google-places-photo?photoName=${match.photos[0].name}`;
    }
    return {
      address: match.formattedAddress || match.formatted_address || null,
      website: match.websiteUri || match.website || null,
      openNow: match.currentOpeningHours?.openNow ?? match.opening_hours?.open_now,
      rating: match.rating,
      placeId: match.id || match.place_id,
      reviewsUrl: match.userRatingCount || match.user_ratings_total ? `https://www.google.com/maps/place/?q=place_id:${match.id || match.place_id}` : null,
      mapUrl: match.googleMapsUri || (match.id || match.place_id ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(match.displayName?.text || match.name)}&query_place_id=${match.id || match.place_id}` : null),
      name: match.displayName?.text || match.name || title,
      photoUrl
    };
}

interface Recommendation {
  name: string;
  summary: string;
}

// Helper to extract lat/lng from address using Google Maps Geocoding API
async function getLatLngFromAddress(address: string): Promise<{ lat: number; lng: number } | null> {
  if (!address) return null;
  try {
    const apiKey = import.meta.env.VITE_GOOGLE_PLACES_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results[0] && data.results[0].geometry && data.results[0].geometry.location) {
      return data.results[0].geometry.location;
    }
  } catch (e) {}
  return null;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  // Haversine formula
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

const ResultsSection: React.FC<{ results?: any[]; recommendations?: Recommendation[]; extraction?: { city?: string } }> = ({ results, recommendations, extraction }) => {
  const [places, setPlaces] = useState<any[]>([]);
  const [showClosed, setShowClosed] = useState(true);
  const [sortOption, setSortOption] = useState<'recommended' | 'review' | 'closest'>('recommended');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  // Use city and foodType from extraction if available
  const city = extraction?.city;
  const foodType = (extraction as any)?.foodType || "restaurants";

  // Determine heading: if the search is for 'hidden gems', use the hidden gems heading, otherwise use the generic heading
  let resultsTitle = undefined;
  if (foodType === 'hidden gems') {
    resultsTitle = city ? `Here are some hidden gems in ${city}.` : undefined;
  } else {
    resultsTitle = city ? `Here are some recommendations for ${foodType} in ${city}.` : undefined;
  }

  useEffect(() => {
    if (!recommendations || !recommendations.length) return;
    // Only fetch Google Places data if city is defined and non-empty
    if (!city || typeof city !== 'string' || !city.trim()) {
      setPlaces(recommendations.map(r => ({ ...r, error: 'No city detected in query.' })));
      return;
    }
    Promise.all(
      recommendations.map(async (r) => {
        const placeMeta = await fetchGooglePlaceData(r.name, city);
        return { ...r, ...placeMeta };
      })
    ).then(setPlaces);
  }, [recommendations, city]);

  // On mount, try to get user geolocation for 'closest' sort
  React.useEffect(() => {
    if (sortOption !== 'closest' || userLocation) return;
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null)
      );
    }
  }, [sortOption, userLocation]);

  // Filter places based on showClosed toggle
  let filteredPlaces = showClosed ? places : places.filter(place => place.openNow !== false);

  // Sort places based on sortOption
  if (sortOption === 'review') {
    filteredPlaces = [...filteredPlaces].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (sortOption === 'closest' && userLocation) {
    filteredPlaces = [...filteredPlaces].sort((a, b) => {
      if (!a.address || !b.address) return 0;
      // If lat/lng already present, use it; otherwise, fetch and cache
      if (!a._latlng) a._latlng = null;
      if (!b._latlng) b._latlng = null;
      const getOrFetchLatLng = async (place: any) => {
        if (place._latlng) return place._latlng;
        place._latlng = await getLatLngFromAddress(place.address);
        return place._latlng;
      };
      // This is async, but sort must be sync, so fallback to 0 if not present
      if (!a._latlng || !b._latlng) return 0;
      const da = getDistance(userLocation.lat, userLocation.lng, a._latlng.lat, a._latlng.lng);
      const db = getDistance(userLocation.lat, userLocation.lng, b._latlng.lat, b._latlng.lng);
      return da - db;
    });
  }

  if (!recommendations || !recommendations.length) {
    return <EmptyState query={""} city={city} />;
  }
  if (!city || typeof city !== 'string' || !city.trim()) {
    return <EmptyState query={""} city={city} />;
  }

  return (
    <section className="py-12" id="results-section">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">
          {resultsTitle}
        </h2>
        {/* Toggle for showing/hiding closed restaurants and sort options */}
        <div className="flex flex-col md:flex-row justify-center items-center gap-4 mb-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <Switch
              checked={showClosed}
              onCheckedChange={setShowClosed}
              className="data-[state=checked]:bg-primary"
            />
            <span className="text-gray-700 select-none">
              {showClosed ? "Show closed" : "Hiding closed"}
            </span>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-gray-700 select-none">Sort by:</span>
            <select
              className="border rounded px-2 py-1 text-black"
              value={sortOption}
              onChange={e => setSortOption(e.target.value as any)}
            >
              <option value="recommended">Recommended</option>
              <option value="review">Reviews</option>
              <option value="closest">Closest to me</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlaces.map((place, idx) => (
            <div key={place.name + idx} className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex flex-col">
              {place.photoUrl && place.mapUrl ? (
                <a href={place.mapUrl} target="_blank" rel="noopener noreferrer">
                  <img src={place.photoUrl} alt={place.name} className="w-full h-48 object-cover mb-3 rounded" loading="lazy" />
                </a>
              ) : place.photoUrl ? (
                <img src={place.photoUrl} alt={place.name} className="w-full h-48 object-cover mb-3 rounded" loading="lazy" />
              ) : null}
              <h3 className="text-xl font-bold mb-2">
                {place.website || place.mapUrl ? (
                  <a href={place.website || place.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">
                    {place.name}
                  </a>
                ) : (
                  place.name
                )}
              </h3>
              {place.address && place.mapUrl && (
                <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm mb-1 block">
                  {place.address}
                </a>
              )}
              <p className="mb-2 text-gray-700">{place.summary}</p>
              <div className="flex items-center gap-2 text-sm mb-1">
                {place.openNow !== undefined && (
                  place.mapUrl ? (
                    <a href={place.mapUrl} target="_blank" rel="noopener noreferrer" className={place.openNow ? "text-green-600 underline" : "text-red-600 underline"}>
                      {place.openNow ? "Open Now" : "Closed"}
                    </a>
                  ) : (
                    <span className={place.openNow ? "text-green-600" : "text-red-600"}>
                      {place.openNow ? "Open Now" : "Closed"}
                    </span>
                  )
                )}
                {place.rating && (
                  <a href={place.reviewsUrl} target="_blank" rel="noopener noreferrer" className="ml-2 text-yellow-600">
                    ⭐ {place.rating}
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ResultsSection;
