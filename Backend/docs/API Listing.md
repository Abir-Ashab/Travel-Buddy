# Travel Platform REST API Documentation

## 1. Authentication & User Management

### POST /auth/register
Register a new user
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "contact_number": "integer",
  "role": "explorer|traveler", // optional, defaults to explorer
  "bio": "string", // optional
  "travel_preferences": {} // optional JSON object
}
```

### POST /auth/login
Login user
```json
{
  "email": "string",
  "password": "string"
}
```

### POST /auth/refresh
Refresh JWT token

### POST /auth/logout
Logout user

---

## 2. User Profile Management

### GET /users/profile
Get current user's profile

### PUT /users/profile
Update current user's profile
```json
{
  "name": "string",
  "bio": "string",
  "travel_preferences": {},
  "profile_picture": "string"
}
```

### PATCH /users/profile/status
Update user status (admin only)
```json
{
  "status": "active|blocked"
}
```

---

## 3. Posts Management

### GET /posts
Get posts with filtering and pagination

```
Query Parameters:
- page: integer (default: 1)
- limit: integer (default: 20, max: 100)
- location_id: integer
- country: string
- region: string
- min_cost: decimal
- max_cost: decimal
- min_duration: integer
- max_duration: integer
- effort_level: integer
- cuisine_type: string
- accommodation_type: string
- attraction_type: string
- is_featured: boolean
- status: "published" (default)
- search: string (searches in title, description)
```

### POST /posts
Create a new post
```json
{
  "location_id": "integer",
  "title": "string",
  "description": "string",
  "total_cost": "decimal",
  "duration_days": "integer",
  "effort_level": "integer",
  "status": "draft|published",
  "media": [
    {
      "image_url": "string"
    }
  ],
  "transport": [
    {
      "transport_type": "string",
      "provider": "string",
      "cost": "decimal",
      "notes": "string"
    }
  ],
  "accommodation": [
    {
      "accommodation_type": "hotel|hostel|airbnb|guesthouse",
      "name": "string",
      "cost_per_night": "decimal",
      "rating": "decimal",
      "review": "string",
      "notes": "string",
      "amenities": {},
      "check_in_date": "date",
      "check_out_date": "date"
    }
  ],
  "dining": [
    {
      "restaurant_name": "string",
      "cuisine_type": "string",
      "meal_type": "breakfast|lunch|dinner|snack",
      "cost": "decimal",
      "rating": "decimal",
      "review": "string",
      "dishes_tried": [],
      "notes": "string",
      "visit_date": "date"
    }
  ],
  "attractions": [
    {
      "attraction_name": "string",
      "attraction_type": "museum|monument|park|beach|temple|market|viewpoint|adventure",
      "entry_cost": "decimal",
      "rating": "decimal",
      "review": "string",
      "time_spent_hours": "integer",
      "best_time_to_visit": "morning|afternoon|evening|night",
      "recommended": "boolean",
      "tips": "string",
      "notes": "string",
      "visit_date": "date"
    }
  ]
}
```

### GET /posts/{id}
Get specific post details

### PUT /posts/{id}
Update entire post (owner only)

### PATCH /posts/{id}
Partial update of post (owner only)
```json
{
  "title": "string", // optional
  "description": "string", // optional
  "status": "draft|published" // optional
  // ... other fields
}
```

### DELETE /posts/{id}
Delete post (owner only)

### POST /posts/{id}/like
Like/unlike a post

### POST /posts/{id}/save
Save/unsave a post

### POST /posts/{id}/share
Share a post (increments share count)

### GET /posts/{id}/likes
Get users who liked the post

### GET /posts/{id}/saves
Get users who saved the post

---

## 4. Locations Management

### GET /locations
Get locations with search
```
Query Parameters:
- search: string (name, country, region)
- country: string
- region: string
- page: integer
- limit: integer
```

### POST /locations
Create new location (admin only)
```json
{
  "name": "string",
  "country": "string",
  "region": "string",
  "latitude": "decimal",
  "longitude": "decimal",
  "timezone": "string"
}
```

### GET /locations/{id}
Get specific location details

### GET /locations/{id}/posts
Get posts for specific location

### GET /locations/{id}/services
Get cached services for location
```
Query Parameters:
- service_type: "hotel|transport|restaurant|attractions"
```

---

## 5. Wishlists Management

### GET /wishlists
Get user's wishlists
```
Query Parameters:
- is_public: boolean
- grouping_type: "region|theme|budget|season"
```

### POST /wishlists
Create new wishlist
```json
{
  "name": "string",
  "description": "string",
  "grouping_type": "region|theme|budget|season",
  "is_public": "boolean"
}
```

### GET /wishlists/{id}
Get specific wishlist details

### PUT /wishlists/{id}
Update wishlist (owner only)

### DELETE /wishlists/{id}
Delete wishlist (owner only)

### POST /wishlists/{id}/items
Add item to wishlist
```json
{
  "location_id": "integer",
  "notes": "string",
  "estimated_budget": "decimal",
  "priority_level": "integer",
  "preferred_start_date": "date",
  "preferred_end_date": "date"
}
```

### PUT /wishlists/{id}/items/{item_id}
Update wishlist item

### DELETE /wishlists/{id}/items/{item_id}
Remove item from wishlist

### GET /wishlists/public
Get public wishlists from all users
```
Query Parameters:
- search: string
- grouping_type: string
- page: integer
- limit: integer
```

---

## 6. Trip Planning Management

### GET /trips
Get user's trips
```
Query Parameters:
- role: "creator|participant"
- status: string
```

### POST /trips
Create new trip
```json
{
  "location_id": "integer",
  "trip_name": "string",
  "start_date": "date",
  "end_date": "date",
  "total_budget": "decimal",
  "max_participants": "integer"
}
```

### GET /trips/{id}
Get specific trip details

### PUT /trips/{id}
Update trip (creator only)

### DELETE /trips/{id}
Delete trip (creator only)

### POST /trips/{id}/participants
Invite participants
```json
{
  "user_ids": ["integer"]
}
```

### PATCH /trips/{id}/participants/{user_id}
Update participant status
```json
{
  "status": "joined|declined"
}
```

### DELETE /trips/{id}/participants/{user_id}
Remove participant (creator only)

### GET /trips/{id}/messages
Get trip messages
```
Query Parameters:
- page: integer
- limit: integer
```

### POST /trips/{id}/messages
Send message to trip
```json
{
  "message": "string",
  "attachments": {} // optional JSON
}
```

---

## 7. User Services & Bookmarks

### GET /bookmarks
Get user's service bookmarks
```
Query Parameters:
- service_type: "hotel|restaurant|transport"
- location_id: integer
- is_visited: boolean
```

### POST /bookmarks
Bookmark a service
```json
{
  "service_name": "string",
  "service_type": "hotel|restaurant|transport",
  "location_id": "integer",
  "service_details": {},
  "external_service_id": "string",
  "is_visited": "boolean"
}
```

### PUT /bookmarks/{id}
Update bookmark

### DELETE /bookmarks/{id}
Remove bookmark

---

## 8. Notifications Management

### GET /notifications
Get user notifications
```
Query Parameters:
- type: "like|save|trip_invite|match_found|wishlist_share"
- is_read: boolean
- page: integer
- limit: integer
```

### PATCH /notifications/{id}
Mark notification as read
```json
{
  "is_read": true
}
```

### PATCH /notifications/mark-all-read
Mark all notifications as read

---

## 9. Reports Management

### POST /reports
Report a post
```json
{
  "post_id": "integer",
  "reason": "spam|inappropriate|false_info",
  "description": "string"
}
```

### GET /reports
Get reports (admin only)
```
Query Parameters:
- status: "pending|resolved"
- page: integer
- limit: integer
```

### PATCH /reports/{id}
Update report status (admin only)
```json
{
  "status": "resolved"
}
```

---

## Standard Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "string", // optional
  "pagination": { // for paginated responses
    "page": 1,
    "limit": 20,
    "total": 100,
    "total_pages": 5
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "string",
    "message": "string",
    "details": {} // optional
  }
}
```

## HTTP Status Codes
- `200` - OK
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `500` - Internal Server Error

## Rate Limiting
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users
- Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`