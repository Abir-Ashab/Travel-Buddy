## Cached Services:

### **Hotel Services:**
- Hotel booking platforms (Booking.com, Expedia, Hotels.com)
- Hotel availability and pricing data
- Hotel ratings and reviews from external sources
- Room types and amenities information

### **Transport Services:**
- Flight booking APIs (Skyscanner, Kayak, airline APIs)
- Train booking services
- Bus/coach services
- Car rental platforms (Hertz, Avis, local providers)
- Ride-sharing services (Uber, Lyft local equivalents)
- Ferry/boat services

### **Restaurant Services:**
- Restaurant discovery platforms (Yelp, TripAdvisor, Zomato)
- Menu and pricing information
- Restaurant availability/reservation systems
- Food delivery platforms (for reference)
- Local dining recommendations

## Why Cache These Services?

1. **Performance** - Avoid repeated API calls to external services
2. **Cost Reduction** - Many external APIs charge per request
3. **Reliability** - Backup data when external services are down
4. **User Experience** - Faster loading times for location-based services
5. **Data Consistency** - Maintain stable pricing/availability data

The `cache_key` and `expires_at` fields suggest this is a time-based cache system where data is refreshed periodically to keep it current while reducing external API dependencies.
