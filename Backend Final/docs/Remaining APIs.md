## 4. **WISHLIST ROUTES** (`/api/wishlist`) - 8 APIs

### Personal Wishlist (4 APIs)
- `GET /` - Get user's wishlist
- `POST /destinations` - Add destination to wishlist
- `PUT /destinations/:id` - Update wishlist item
- `DELETE /destinations/:id` - Remove from wishlist

### Group Wishlist (4 APIs)
- `POST /groups` - Create group wishlist (Traveler only)
- `GET /groups/:id` - Get group wishlist
- `POST /groups/:id/invite` - Invite users to group wishlist
- `PUT /groups/:id/destinations/:destId` - Update group wishlist item

---

## 5. **GROUP ROUTES** (`/api/groups`) - 8 APIs

### Group Management (4 APIs)
- `POST /` - Create travel group (Traveler only)
- `GET /` - Get user's groups
- `GET /:id` - Get group details
- `PUT /:id` - Update group details

### Group Operations (4 APIs)
- `POST /:id/join` - Join group
- `POST /:id/invite` - Invite member
- `DELETE /:id/members/:userId` - Remove member
- `POST /:id/itinerary` - Add to group itinerary

---

## 6. **SEARCH ROUTES** (`/api/search`) - 3 APIs
- `GET /posts` - Search travel posts
- `GET /destinations` - Search destinations
- `GET /travelers` - Search travelers

---