import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent  } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { FiSearch, FiMapPin, FiX, FiLoader, FiNavigation, FiGlobe } from 'react-icons/fi';

// Fix for default marker icons
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  type: string;
  importance: number;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
    postcode?: string;
    country_code?: string;
  };
}

interface LocationInfo {
  name: string;
  fullAddress: string;
  country: string;
  region: string;
  coordinates: string;
}

interface LocationSearchProps {
  // Updated to match the parent component's expectation
  onLocationSelect: (latitude: number, longitude: number, displayName: string) => void;
  placeholder?: string;
  className?: string;
}

// Component to handle map updates
function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    if (center && center[0] !== 0 && center[1] !== 0) {
      map.flyTo(center, zoom, {
        animate: true,
        duration: 1.5
      });
    }
  }, [center, zoom, map]);
  
  return null;
}

// Component to handle map clicks
function LocationMarker({ 
  position, 
  onLocationSelect, 
  locationInfo 
}: { 
  position: [number, number] | null;
  onLocationSelect: (lat: number, lng: number, info: LocationInfo) => void;
  locationInfo: LocationInfo | null;
}) {
  const map = useMap();
  
  useMapEvent('click', async (e) => {
    const { lat, lng } = e.latlng;
    
    // Reverse geocode to get address info
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&accept-language=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        const info: LocationInfo = {
          name: data.display_name.split(',')[0] || 'Unknown Location',
          fullAddress: data.display_name,
          country: data.address?.country || 'Unknown Country',
          region: data.address?.state || data.address?.city || 'Unknown Region',
          coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
        onLocationSelect(lat, lng, info);
      } else {
        const info: LocationInfo = {
          name: 'Custom Location',
          fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          country: 'Unknown Country',
          region: 'Unknown Region',
          coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        };
        onLocationSelect(lat, lng, info);
      }
    } catch (error) {
      const info: LocationInfo = {
        name: 'Custom Location',
        fullAddress: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        country: 'Unknown Country',
        region: 'Unknown Region',
        coordinates: `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      };
      onLocationSelect(lat, lng, info);
    }
  });
  
  return position ? (
    <Marker position={position}>
      <Popup>
        <div className="text-sm max-w-xs">
          <p className="font-medium">{locationInfo?.name || 'Selected Location'}</p>
          <p className="text-xs text-gray-500 mt-1">{locationInfo?.fullAddress}</p>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <p className="text-xs"><strong>Country:</strong> {locationInfo?.country}</p>
            <p className="text-xs"><strong>Region:</strong> {locationInfo?.region}</p>
            <p className="text-xs"><strong>Coordinates:</strong> {locationInfo?.coordinates}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Helper function to extract location info from result
function extractLocationInfo(result: LocationResult): LocationInfo {
  const address = result.address || {};
  return {
    name: result.display_name.split(',')[0],
    fullAddress: result.display_name,
    country: address.country || 'Unknown Country',
    region: address.state || address.city || address.suburb || 'Unknown Region',
    coordinates: `${parseFloat(result.lat).toFixed(6)}, ${parseFloat(result.lon).toFixed(6)}`
  };
}

// Helper function to calculate search score for better matching
function calculateSearchScore(result: LocationResult, query: string): number {
  const queryLower = query.toLowerCase();
  const displayLower = result.display_name.toLowerCase();
  const address = result.address || {};
  
  let score = result.importance || 0;
  
  // Boost score if query matches specific parts of the address
  const queryParts = queryLower.split(/[\s,]+/).filter(part => part.length > 0);
  
  queryParts.forEach(part => {
    // Exact match bonuses
    if (displayLower.includes(part)) {
      score += 0.5;
    }
    
    // Specific address component matches
    if (address.road && address.road.toLowerCase().includes(part)) {
      score += 0.8;
    }
    if (address.suburb && address.suburb.toLowerCase().includes(part)) {
      score += 0.7;
    }
    if (address.city && address.city.toLowerCase().includes(part)) {
      score += 0.6;
    }
    
    // Check if the first part of display name matches
    if (displayLower.split(',')[0].includes(part)) {
      score += 0.9;
    }
  });
  
  // Penalty for results that don't contain all query parts
  const matchedParts = queryParts.filter(part => displayLower.includes(part));
  if (matchedParts.length < queryParts.length) {
    score -= (queryParts.length - matchedParts.length) * 0.3;
  }
  
  return score;
}

export default function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Search location (e.g., Kacchi Bhai, Dhanmondi, Dhaka)",
  className = ""
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocationInfo, setSelectedLocationInfo] = useState<LocationInfo | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.8103, 90.4125]);
  const [mapZoom, setMapZoom] = useState(13);
  const [markerPosition, setMarkerPosition] = useState<[number, number] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      // Enhanced search with multiple strategies and better parameters
      const searches = [
        // First: Detailed search in Bangladesh with address details
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=15&countrycodes=bd&addressdetails=1&accept-language=en&extratags=1&namedetails=1`),
        // Second: Global search with address details
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=10&addressdetails=1&accept-language=en&extratags=1&namedetails=1`)
      ];

      const responses = await Promise.allSettled(searches);
      let allResults: LocationResult[] = [];

      for (const response of responses) {
        if (response.status === 'fulfilled' && response.value.ok) {
          const data = await response.value.json();
          allResults = [...allResults, ...data];
        }
      }

      // Remove duplicates and sort by custom scoring
      const uniqueResults = allResults
        .filter((result, index, self) => 
          index === self.findIndex(r => r.place_id === result.place_id)
        )
        .map(result => ({
          ...result,
          searchScore: calculateSearchScore(result, searchQuery)
        }))
        .sort((a, b) => b.searchScore - a.searchScore)
        .slice(0, 8);

      setResults(uniqueResults);
      setIsOpen(uniqueResults.length > 0);
      setSelectedIndex(-1);

      // Auto-navigate to the best match
      if (uniqueResults.length > 0) {
        const bestMatch = uniqueResults[0];
        const lat = parseFloat(bestMatch.lat);
        const lng = parseFloat(bestMatch.lon);
        
        setMapCenter([lat, lng]);
        setMapZoom(15);
        setMarkerPosition([lat, lng]);
        setSelectedLocationInfo(extractLocationInfo(bestMatch));
      }

    } catch (error) {
      console.error('Location search error:', error);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (value.trim()) {
      debounceRef.current = setTimeout(() => {
        searchLocations(value.trim());
      }, 500);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  };

  const handleLocationSelect = (result: LocationResult) => {
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    const locationInfo = extractLocationInfo(result);
    
    setSelectedLocationInfo(locationInfo);
    setQuery(locationInfo.fullAddress);
    setIsOpen(false);
    setResults([]);
    setSelectedIndex(-1);
    setMapCenter([latitude, longitude]);
    setMapZoom(16);
    setMarkerPosition([latitude, longitude]);
    
    // Create a formatted display name that includes country and region info
    const formattedDisplayName = `${locationInfo.name}, ${locationInfo.region}, ${locationInfo.country}`;
    
    // Call parent's onLocationSelect with the expected parameters
    onLocationSelect(latitude, longitude, formattedDisplayName);
  };

  const handleMapClick = (lat: number, lng: number, info: LocationInfo) => {
    setMarkerPosition([lat, lng]);
    setSelectedLocationInfo(info);
    setQuery(info.fullAddress);
    
    // Create a formatted display name for map clicks
    const formattedDisplayName = `${info.name}, ${info.region}, ${info.country}`;
    
    // Call parent's onLocationSelect with the expected parameters
    onLocationSelect(lat, lng, formattedDisplayName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleLocationSelect(results[selectedIndex]);
      } else if (results.length > 0) {
        handleLocationSelect(results[0]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < results.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : results.length - 1
      );
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  const clearSelection = () => {
    setQuery("");
    setSelectedLocationInfo(null);
    setResults([]);
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by this browser.");
      return;
    }

    setIsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1&accept-language=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const locationInfo: LocationInfo = {
              name: data.display_name.split(',')[0] || 'Current Location',
              fullAddress: data.display_name,
              country: data.address?.country || 'Unknown Country',
              region: data.address?.state || data.address?.city || 'Unknown Region',
              coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
            };
            
            setSelectedLocationInfo(locationInfo);
            setQuery(locationInfo.fullAddress);
            setMapCenter([latitude, longitude]);
            setMapZoom(16);
            setMarkerPosition([latitude, longitude]);
            
            // Create formatted display name for current location
            const formattedDisplayName = `${locationInfo.name}, ${locationInfo.region}, ${locationInfo.country}`;
            onLocationSelect(latitude, longitude, formattedDisplayName);
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          const locationInfo: LocationInfo = {
            name: 'Current Location',
            fullAddress: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            country: 'Unknown Country',
            region: 'Unknown Region',
            coordinates: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
          };
          
          setSelectedLocationInfo(locationInfo);
          setQuery(locationInfo.fullAddress);
          setMapCenter([latitude, longitude]);
          setMapZoom(16);
          setMarkerPosition([latitude, longitude]);
          
          const formattedDisplayName = `${locationInfo.name}, ${locationInfo.region}, ${locationInfo.country}`;
          onLocationSelect(latitude, longitude, formattedDisplayName);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert("Unable to retrieve your location. Please search manually.");
        setIsLoading(false);
      }
    );
  };

  return (
    <div className='w-full'>
      <div className="relative mb-4" ref={searchRef}>
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (results.length > 0) setIsOpen(true);
            }}
            placeholder={placeholder}
            className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white shadow-sm"
          />
          
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {isLoading && (
              <FiLoader className="h-4 w-4 text-blue-500 animate-spin" />
            )}
            
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={isLoading}
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
              title="Use current location"
            >
              <FiNavigation className="h-4 w-4" />
            </button>
            
            {query && (
              <button
                type="button"
                onClick={clearSelection}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                title="Clear"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {results.map((result, index) => {
              const locationInfo = extractLocationInfo(result);
              return (
                <button
                  key={result.place_id}
                  type="button"
                  onClick={() => handleLocationSelect(result)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 focus:outline-none transition-colors border-b border-gray-100 last:border-b-0 ${
                    index === selectedIndex ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <FiMapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {locationInfo.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {locationInfo.fullAddress}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          <FiGlobe className="h-3 w-3 mr-1" />
                          {locationInfo.country}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <span className="text-xs text-gray-600">{locationInfo.region}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      <div className="w-full h-[500px] border border-gray-200 rounded-lg overflow-hidden shadow-sm">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          scrollWheelZoom={true}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          <MapController center={mapCenter} zoom={mapZoom} />
          
          <LocationMarker
            position={markerPosition}
            onLocationSelect={handleMapClick}
            locationInfo={selectedLocationInfo}
          />
        </MapContainer>
      </div>
      
      {selectedLocationInfo && (
        <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2 mb-3">
            <FiMapPin className="h-5 w-5 text-green-600" />
            <span className="text-sm text-green-800 font-semibold">Selected Location</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-900">{selectedLocationInfo.name}</p>
              <p className="text-xs text-gray-600 mt-1">{selectedLocationInfo.fullAddress}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <FiGlobe className="h-4 w-4 text-blue-600" />
                <span className="text-sm">
                  <strong>Country:</strong> {selectedLocationInfo.country}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <FiMapPin className="h-4 w-4 text-purple-600" />
                <span className="text-sm">
                  <strong>Region:</strong> {selectedLocationInfo.region}
                </span>
              </div>
              
              <div className="text-xs text-gray-500">
                <strong>Coordinates:</strong> {selectedLocationInfo.coordinates}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500 bg-gray-50 rounded-lg p-3">
        <p><strong>How to use:</strong></p>
        <ul className="mt-1 space-y-1">
          <li>• Type specific location details (e.g., "Kacchi Bhai, Dhanmondi") for precise results</li>
          <li>• Results are ranked by relevance to your search terms</li>
          <li>• Click on any search result to select it</li>
          <li>• Click anywhere on the map to set a precise location</li>
          <li>• Use the navigation button to get your current location</li>
        </ul>
      </div>
    </div>
  );
}