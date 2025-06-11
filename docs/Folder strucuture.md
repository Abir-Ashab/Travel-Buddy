# Travel App Backend API Structure 

```
travel-backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── cloudinary.js (for image uploads)
│   │   ├── email.js
│   │   └── index.js
│   ├── controllers/
│   │   ├── auth.controller.js 
│   │   ├── user.controller.js 
│   │   ├── post.controller.js 
│   │   ├── wishlist.controller.js 
│   │   ├── group.controller.js 
│   │   ├── admin.controller.js 
│   │   ├── search.controller.js 
│   │   └── analytics.controller.js 
|   ├── database/
│   ├── middleware/
│   │   ├── auth.middleware.js 
│   │   ├── role.middleware.js 
│   │   ├── upload.middleware.js 
│   │   ├── rateLimiter.middleware.js 
│   │   └── error.middleware.js 
│   ├── models/
│   │   ├── user.model.js 
│   │   ├── post.model.js 
│   │   ├── wishlist.model.js 
│   │   ├── group.model.js 
│   │   ├── like.model.js
│   │   ├── savedpost.model.js 
│   │   └── report.model.js 
│   ├── routes/
│   │   ├── auth.routes.js 
│   │   ├── user.routes.js 
│   │   ├── post.routes.js 
│   │   ├── wishlist.routes.js 
│   │   ├── group.routes.js 
│   │   ├── admin.routes.js 
│   │   ├── search.routes.js 
│   ├── services/
│   │   ├── auth.service.js 
│   │   ├── user.service.js 
│   │   ├── upload.service.js 
│   │   ├── email.service.js 
│   │   └── ai.service.js  (for content moderation)
│   ├── utils/
│   │   ├── helpers.js 
│   │   ├── constants.js 
│   │   └── apiResponse.js 
│   └── validations/
│       ├── auth.validation.js 
│       ├── user.validation.js 
│       ├── post.validation.js 
│       ├── wishlist.validation.js 
│       ├── group.validation.js 
│       ├── admin.validation.js 
│       └── common.validation.js 
```

## API Requirements Breakdown

### **Total APIs Needed: 47 APIs**

---

## 1. **AUTH ROUTES** (`/api/auth`) - 4 APIs  DONE
- `POST /register` - User registration
- `POST /login` - User login
- `POST /logout` - User logout
- `POST /refresh` - Refresh token

---

## 2. **USER ROUTES** (`/api/users`) - 8 APIs

### Profile Management (5 APIs)
- `GET /profile` - Get current user profile
- `PUT /profile` - Update user profile
- `POST /profile/avatar` - Upload profile picture
- `PUT /upgrade-to-traveler` - Upgrade from Explorer to Traveler
- `DELETE /account` - Delete user account

### User Discovery (3 APIs)
- `GET /travelers` - Get list of travelers for matchmaking
- `GET /travelers/:id` - Get specific traveler profile
- `POST /travelers/:id/connect` - Send connection request

---

## 3. **POST ROUTES** (`/api/posts`) - 12 APIs

### CRUD Operations (4 APIs)
- `POST /` - Create new travel post (Traveler only)
- `GET /` - Get all public posts (with pagination & filters)
- `GET /:id` - Get specific post details
- `PUT /:id` - Update post (author only)

### Post Interactions (4 APIs)
- `POST /:id/like` - Like/unlike a post
- `GET /:id/likes` - Get post likes
- `POST /:id/save` - Save/unsave post to collection
- `GET /saved` - Get user's saved posts

### Content Management (4 APIs)
- `POST /:id/report` - Report inappropriate content
- `GET /featured` - Get featured posts
- `GET /trending` - Get trending posts
- `POST /:id/share` - Share post (analytics tracking)

---

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

## 7. **ADMIN ROUTES** (`/api/admin`) - 4 APIs

### Content Moderation
- `GET /reports` - Get reported content
- `PUT /reports/:id` - Handle report (approve/reject)
- `GET /posts/pending` - Get posts pending approval
- `PUT /posts/:id/moderate` - Approve/reject post

---

## API Responsibilities by Feature

### **Explorer Features (Limited Access)**
- Browse posts: `GET /api/posts`
- View post details: `GET /api/posts/:id` (limited without account)
- Search: `GET /api/search/*`
- Basic wishlist: `POST /api/wishlist/destinations` (max 50)

### **Traveler Features (Full Access)**
- All Explorer features +
- Create posts: `POST /api/posts`
- Group planning: `POST /api/groups`
- Advanced wishlist: Unlimited wishlist operations
- Networking: `GET /api/users/travelers`

### **Admin Features**
- Content moderation: `GET /api/admin/reports`
- User management: Admin-specific endpoints
- Analytics: Platform statistics

## Implementation Priority

### **Phase 1 (Core Features)**
1. Post management (12 APIs)
2. Basic wishlist (4 APIs)
3. Search functionality (3 APIs)

### **Phase 2 (Social Features)**
1. Group functionality (8 APIs)
2. User discovery (3 APIs)
3. Advanced wishlist (4 APIs)

### **Phase 3 (Admin & Analytics)**
1. Admin moderation (4 APIs)
2. Analytics tracking
3. Performance optimization

## Key Middleware Needed
- **Role-based access**: Check Explorer vs Traveler permissions
- **Upload handling**: For images in posts and profiles
- **Rate limiting**: Prevent spam and abuse
- **Content validation**: Ensure data quality

## Database Models Required
- **Post**: Travel experiences with rich content
- **Wishlist**: Destination collections
- **Group**: Collaborative trip planning
- **Like/SavedPost**: User interactions
- **Report**: Content moderation
