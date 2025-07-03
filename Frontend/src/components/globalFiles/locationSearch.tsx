import { useState, useEffect, useRef } from "react";
import { FiSearch, FiMapPin, FiX, FiLoader } from "react-icons/fi";

interface LocationResult {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
  type: string;
  importance: number;
}

interface LocationSearchProps {
  onLocationSelect: (latitude: number, longitude: number, displayName: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSearch({ 
  onLocationSelect, 
  placeholder = "Search location (e.g., Kacchi Bhai, Dhanmondi)",
  className = ""
}: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.length < 3) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=5&countrycodes=bd&addressdetails=1&accept-language=en`
      );
      
      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data: LocationResult[] = await response.json();
      setResults(data);
      setIsOpen(true);
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

    debounceRef.current = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const handleLocationSelect = (result: LocationResult) => {
    const latitude = parseFloat(result.lat);
    const longitude = parseFloat(result.lon);
    
    setSelectedLocation(result.display_name);
    setQuery(result.display_name);
    setIsOpen(false);
    setResults([]);
    
    onLocationSelect(latitude, longitude, result.display_name);
  };

  const clearSelection = () => {
    setQuery("");
    setSelectedLocation("");
    setResults([]);
    setIsOpen(false);
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
          // Reverse geocoding to get address
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=en`
          );
          
          if (response.ok) {
            const data = await response.json();
            const displayName = data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
            setSelectedLocation(displayName);
            setQuery(displayName);
            onLocationSelect(latitude, longitude, displayName);
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          const displayName = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
          setSelectedLocation(displayName);
          setQuery(displayName);
          onLocationSelect(latitude, longitude, displayName);
        } finally {
          setIsLoading(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert("Unable to retrieve your location. Please search manually.");
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  };

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      <div className="relative">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
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
              className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors duration-200"
              title="Use current location"
            >
              <FiMapPin className="h-4 w-4" />
            </button>
            
            {query && (
              <button
                type="button"
                onClick={clearSelection}
                className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors duration-200"
                title="Clear selection"
              >
                <FiX className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Search Results Dropdown */}
        {isOpen && results.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
            {results.map((result) => (
              <button
                key={result.place_id}
                type="button"
                onClick={() => handleLocationSelect(result)}
                className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors duration-150 border-b border-gray-100 last:border-b-0"
              >
                <div className="flex items-start space-x-3">
                  <FiMapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {result.display_name.split(',')[0]}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {result.display_name}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      
      {selectedLocation && (
        <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <FiMapPin className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-800 font-medium">Selected Location:</span>
          </div>
          <p className="text-sm text-green-700 mt-1 truncate">{selectedLocation}</p>
        </div>
      )}
    </div>
  );
}