# Travel Platform API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
All endpoints (except public ones) require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## User Roles
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Administrative access
- `TRAVELER` - Can create and manage travel content
- `EXPLORER` - Basic user access

---

## Authentication Routes (`/api/auth`)

### Register User
**POST** `/api/auth/register`
- **Access**: Public
- **Body**: User registration data
- **Response**: User account creation

### Login
**POST** `/api/auth/login`
- **Access**: Public
- **Body**: Email and password
- **Response**: JWT tokens

### Refresh Token
**GET** `/api/auth/refresh-token`
- **Access**: Public
- **Response**: New access token

---

## User Management (`/api/users`)

### Create Admin
**POST** `/api/users/create-admin`
- **Access**: ADMIN, SUPER_ADMIN
- **Body**: Admin user data

### Delete User Account
**DELETE** `/api/users/account`
- **Access**: ADMIN, SUPER_ADMIN

### Upgrade to Traveler
**PUT** `/api/users/upgrade`
- **Access**: ADMIN, SUPER_ADMIN, EXPLORER

### Update User Status
**PUT** `/api/users/status`
- **Access**: ADMIN, SUPER_ADMIN

### Update User Profile
**PUT** `/api/users/profile`
- **Access**: All authenticated users
- **Body**: Profile update data

### Get User Profile
**GET** `/api/users/profile`
- **Access**: All authenticated users

### Delete User Profile
**DELETE** `/api/users/profile`
- **Access**: ADMIN, SUPER_ADMIN

### Get Reports
**GET** `/api/users/reports`
- **Access**: ADMIN, SUPER_ADMIN

### Resolve Report
**PUT** `/api/users/reports/:reportId`
- **Access**: ADMIN, SUPER_ADMIN

### Delete Reported Post
**DELETE** `/api/users/reports/:reportId`
- **Access**: ADMIN, SUPER_ADMIN

---

## Posts (`/api/posts`)

### Get All Posts
**GET** `/api/posts`
- **Access**: All authenticated users
- **Query Parameters**: Filtering options

### Get Featured Posts
**GET** `/api/posts/featured`
- **Access**: All authenticated users

### Get Post by ID
**GET** `/api/posts/:id`
- **Access**: All authenticated users

### Get Post with Details
**GET** `/api/posts/:id/details`
- **Access**: All authenticated users

### Create Post
**POST** `/api/posts`
- **Access**: ADMIN, SUPER_ADMIN, TRAVELER
- **Body**: Post creation data

### Update Post
**PUT** `/api/posts/:id`
- **Access**: ADMIN, SUPER_ADMIN, TRAVELER
- **Body**: Post update data

### Delete Post
**DELETE** `/api/posts/:id`
- **Access**: ADMIN, SUPER_ADMIN, TRAVELER

### Like Post
**POST** `/api/posts/:id/like`
- **Access**: All authenticated users

### Unlike Post
**DELETE** `/api/posts/:id/like`
- **Access**: All authenticated users

### Save Post
**POST** `/api/posts/:id/save`
- **Access**: All authenticated users

### Unsave Post
**DELETE** `/api/posts/:id/save`
- **Access**: All authenticated users

### Share Post
**POST** `/api/posts/:id/share`
- **Access**: All authenticated users

### Get User's Posts
**GET** `/api/posts/user/my-posts`
- **Access**: All authenticated users

### Get User's Liked Posts
**GET** `/api/posts/user/liked-posts`
- **Access**: All authenticated users

### Get User's Saved Posts
**GET** `/api/posts/user/saved-posts`
- **Access**: All authenticated users

### Report Post
**POST** `/api/posts/:id/report`
- **Access**: ADMIN, SUPER_ADMIN, TRAVELER
- **Body**: Report data

### Toggle Feature Post
**PATCH** `/api/posts/:id/feature`
- **Access**: ADMIN, SUPER_ADMIN, TRAVELER

---

## Accommodations (`/api/accomodations`)

### Get Accommodations by Post
**GET** `/api/accomodations/post/:postId`
- **Access**: All authenticated users

### Get Accommodation by ID
**GET** `/api/accomodations/:id`
- **Access**: All authenticated users

### Create Accommodation
**POST** `/api/accomodations/post/:postId`
- **Access**: All authenticated users
- **Body**: Accommodation data

### Update Accommodation
**PUT** `/api/accomodations/:id`
- **Access**: All authenticated users
- **Body**: Updated accommodation data

### Delete Accommodation
**DELETE** `/api/accomodations/:id`
- **Access**: All authenticated users

---

## Attractions (`/api/attractions`)

### Get Attractions by Post
**GET** `/api/attractions/post/:postId`
- **Access**: All authenticated users

### Get Attraction by ID
**GET** `/api/attractions/:id`
- **Access**: All authenticated users

### Create Attraction
**POST** `/api/attractions/post/:postId`
- **Access**: All authenticated users
- **Body**: Attraction data

### Update Attraction
**PUT** `/api/attractions/:id`
- **Access**: All authenticated users
- **Body**: Updated attraction data

### Delete Attraction
**DELETE** `/api/attractions/:id`
- **Access**: All authenticated users

---

## Dining (`/api/dinings`)

### Get Dining by Post
**GET** `/api/dinings/post/:postId`
- **Access**: All authenticated users

### Get Dining by ID
**GET** `/api/dinings/:id`
- **Access**: All authenticated users

### Create Dining
**POST** `/api/dinings/post/:postId`
- **Access**: All authenticated users
- **Body**: Dining data

### Update Dining
**PUT** `/api/dinings/:id`
- **Access**: All authenticated users
- **Body**: Updated dining data

### Delete Dining
**DELETE** `/api/dinings/:id`
- **Access**: All authenticated users

---

## Transport (`/api/transports`)

### Get Transports by Post
**GET** `/api/transports/post/:postId`
- **Access**: All authenticated users

### Get Transport by ID
**GET** `/api/transports/:id`
- **Access**: All authenticated users

### Create Transport
**POST** `/api/transports/post/:postId`
- **Access**: All authenticated users
- **Body**: Transport data

### Update Transport
**PUT** `/api/transports/:id`
- **Access**: All authenticated users
- **Body**: Updated transport data

### Delete Transport
**DELETE** `/api/transports/:id`
- **Access**: All authenticated users

---

## Locations (`/api/locations`)

### Get All Locations
**GET** `/api/locations`
- **Access**: All authenticated users

### Search Locations
**GET** `/api/locations/search`
- **Access**: All authenticated users
- **Query Parameters**: Search criteria

### Get Location by ID
**GET** `/api/locations/:id`
- **Access**: All authenticated users

### Create Location
**POST** `/api/locations`
- **Access**: All authenticated users
- **Body**: Location data

### Update Location
**PUT** `/api/locations/:id`
- **Access**: All authenticated users
- **Body**: Updated location data

### Delete Location
**DELETE** `/api/locations/:id`
- **Access**: All authenticated users

---

## Wishlists (`/api/wishlists`)

### Create Wishlist
**POST** `/api/wishlists`
- **Access**: All authenticated users
- **Body**: Wishlist data

### Get User's Wishlists
**GET** `/api/wishlists/my-wishlists`
- **Access**: All authenticated users

### Get Public Wishlists
**GET** `/api/wishlists/public`
- **Access**: Public

### Get Wishlist by ID
**GET** `/api/wishlists/:id`
- **Access**: All authenticated users

### Update Wishlist
**PUT** `/api/wishlists/:id`
- **Access**: All authenticated users
- **Body**: Updated wishlist data

### Delete Wishlist
**DELETE** `/api/wishlists/:id`
- **Access**: All authenticated users

### Share Wishlist
**POST** `/api/wishlists/:id/share`
- **Access**: All authenticated users

### Get Shared Wishlist
**GET** `/api/wishlists/shared/:id`
- **Access**: Public

### Add Wishlist Item
**POST** `/api/wishlists/:wishlistId/items`
- **Access**: All authenticated users
- **Body**: Wishlist item data

### Update Wishlist Item
**PUT** `/api/wishlists/items/:itemId`
- **Access**: All authenticated users
- **Body**: Updated item data

### Delete Wishlist Item
**DELETE** `/api/wishlists/items/:itemId`
- **Access**: All authenticated users

---

## Trips (`/api/trips`)

### Create Trip
**POST** `/api/trips`
- **Access**: All authenticated users
- **Body**: Trip data

### Get User's Trips
**GET** `/api/trips/my-trips`
- **Access**: All authenticated users

### Get User's Trip Invites
**GET** `/api/trips/invites`
- **Access**: All authenticated users

### Get Trip by ID
**GET** `/api/trips/:id`
- **Access**: All authenticated users

### Update Trip
**PUT** `/api/trips/:id`
- **Access**: All authenticated users
- **Body**: Updated trip data

### Delete Trip
**DELETE** `/api/trips/:id`
- **Access**: All authenticated users

### Invite Participants
**POST** `/api/trips/:id/invite`
- **Access**: All authenticated users
- **Body**: Participant invitation data

### Update Participant Status
**PUT** `/api/trips/:id/status`
- **Access**: All authenticated users
- **Body**: Status update data

### Leave Trip
**DELETE** `/api/trips/:id/leave`
- **Access**: All authenticated users

### Remove Participant
**DELETE** `/api/trips/:id/participants/:participantId`
- **Access**: All authenticated users

### Get Trip Participants
**GET** `/api/trips/:id/participants`
- **Access**: All authenticated users

### Send Message
**POST** `/api/trips/:id/messages`
- **Access**: All authenticated users
- **Body**: Message data

### Get Trip Messages
**GET** `/api/trips/:id/messages`
- **Access**: All authenticated users

---

## Proximity (`/api/proximity`)

### Get Proximity Settings
**GET** `/api/proximity/settings`
- **Access**: All authenticated users

### Create Proximity Settings
**POST** `/api/proximity/settings`
- **Access**: All authenticated users
- **Body**: Proximity settings data

### Update Proximity Settings
**PUT** `/api/proximity/settings`
- **Access**: All authenticated users
- **Body**: Updated settings data

### Update User Location
**PUT** `/api/proximity/location`
- **Access**: All authenticated users
- **Body**: Location data

### Get User Location
**GET** `/api/proximity/location`
- **Access**: All authenticated users

### Get Proximity Alerts
**GET** `/api/proximity/alerts`
- **Access**: All authenticated users

### Get Proximity History
**GET** `/api/proximity/alerts/history`
- **Access**: All authenticated users

### Delete Proximity Alert
**DELETE** `/api/proximity/alerts/:id`
- **Access**: All authenticated users

### Get Nearby Wishlist Locations
**GET** `/api/proximity/nearby/wishlists`
- **Access**: All authenticated users

### Get Nearby Trip Participants
**GET** `/api/proximity/nearby/participants`
- **Access**: All authenticated users

### Get Nearby Featured Posts
**GET** `/api/proximity/nearby/posts`
- **Access**: All authenticated users

### Get Nearby Attractions
**GET** `/api/proximity/nearby/attractions`
- **Access**: All authenticated users

### Get Nearby Accommodations
**GET** `/api/proximity/nearby/accommodations`
- **Access**: All authenticated users

### Get Nearby Dining
**GET** `/api/proximity/nearby/dining`
- **Access**: All authenticated users

### Process Proximity Alerts
**POST** `/api/proximity/process`
- **Access**: All authenticated users

---

## Notifications (`/api/notifications`)

### Get Notifications by User
**GET** `/api/notifications/user/:userId`
- **Access**: All authenticated users

### Get Notification by ID
**GET** `/api/notifications/:id`
- **Access**: All authenticated users

### Create Notification
**POST** `/api/notifications`
- **Access**: All authenticated users
- **Body**: Notification data

### Update Notification
**PUT** `/api/notifications/:id`
- **Access**: All authenticated users
- **Body**: Updated notification data

### Delete Notification
**DELETE** `/api/notifications/:id`
- **Access**: All authenticated users

### Mark as Read
**PATCH** `/api/notifications/:id/read`
- **Access**: All authenticated users

### Mark All as Read
**PATCH** `/api/notifications/user/:userId/read-all`
- **Access**: All authenticated users

### Get Unread Count
**GET** `/api/notifications/user/:userId/unread-count`
- **Access**: All authenticated users

### Get Notifications by Type
**GET** `/api/notifications/user/:userId/type/:type`
- **Access**: All authenticated users

### Get Recent by Type
**GET** `/api/notifications/user/:userId/recent/:type`
- **Access**: All authenticated users

### Delete Multiple Notifications
**DELETE** `/api/notifications/user/:userId/bulk`
- **Access**: All authenticated users

### Delete Old Notifications
**DELETE** `/api/notifications/user/:userId/cleanup`
- **Access**: All authenticated users

### Get Stats by Type
**GET** `/api/notifications/user/:userId/stats`
- **Access**: All authenticated users

---
