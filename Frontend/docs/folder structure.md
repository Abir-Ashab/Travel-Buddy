# Travel App Frontend Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Loading.tsx
│   │   ├── Modal.tsx
│   │   └── Button.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── ProfileSetup.tsx
│   │   └── ProtectedRoute.tsx
│   ├── posts/
│   │   ├── PostCard.tsx
│   │   ├── PostDetails.tsx
│   │   ├── PostForm.tsx
│   │   ├── PostFilters.tsx
│   │   └── PostList.tsx
│   ├── profile/
│   │   ├── ProfileView.tsx
│   │   ├── ProfileEdit.tsx
│   │   └── MyPosts.tsx
│   ├── wishlists/
│   │   ├── WishlistCard.tsx
│   │   ├── WishlistForm.tsx
│   │   └── WishlistList.tsx
│   ├── trips/
│   │   ├── TripCard.tsx
│   │   ├── TripForm.tsx
│   │   ├── TripDetails.tsx
│   │   └── TripChat.tsx
│   └── notifications/
│       ├── NotificationList.tsx
│       └── NotificationItem.tsx
├── pages/
│   ├── LandingPage.tsx
│   ├── HomePage.tsx
│   ├── auth/
│   │   ├── LoginPage.tsx
│   │   └── RegisterPage.tsx
│   ├── posts/
│   │   ├── ExplorePage.tsx
│   │   ├── PostDetailsPage.tsx
│   │   └── CreatePostPage.tsx
│   ├── profile/
│   │   ├── ProfilePage.tsx
│   │   └── EditProfilePage.tsx
│   ├── wishlists/
│   │   ├── WishlistsPage.tsx
│   │   └── CreateWishlistPage.tsx
│   ├── trips/
│   │   ├── TripsPage.tsx
│   │   ├── CreateTripPage.tsx
│   │   └── TripDetailsPage.tsx
│   └── NotificationsPage.tsx
├── hooks/
│   ├── useAuth.ts
│   ├── usePosts.ts
│   ├── useWishlists.ts
│   ├── useTrips.ts
│   └── useNotifications.ts
├── context/
│   ├── AuthContext.tsx
│   ├── PostContext.tsx
│   └── NotificationContext.tsx
├── services/
│   ├── api.ts
│   ├── auth.ts
│   ├── posts.ts
│   ├── wishlists.ts
│   ├── trips.ts
│   └── notifications.ts
├── utils/
│   ├── constants.ts
│   ├── helpers.ts
│   ├── validators.ts
│   └── storage.ts
├── types/
│   ├── auth.ts
│   ├── post.ts
│   ├── wishlist.ts
│   ├── trip.ts
│   └── common.ts
├── App.tsx
├── main.tsx
└── index.css
```

## Key Features of This Structure:

### 1. **Components Directory**
- **common/**: Reusable UI components (Header, Footer, Navbar, etc.)
- **auth/**: Authentication-related components
- **posts/**: Post-related components (cards, forms, filters)
- **profile/**: User profile components
- **wishlists/**: Wishlist management components
- **trips/**: Trip planning components
- **notifications/**: Notification components

### 2. **Pages Directory**
- Each major feature has its own subdirectory
- Clear separation between different app sections
- Follows the flowchart structure you provided

### 3. **Hooks Directory**
- Custom hooks for data fetching and state management
- Reusable logic for different features

### 4. **Context Directory**
- Global state management using React Context
- Authentication state, posts, notifications

### 5. **Services Directory**
- API integration layer
- Separate files for different API endpoints
- Centralized HTTP client configuration

### 6. **Utils Directory**
- Helper functions, constants, validators
- Utility functions used across the app

### 7. **Types Directory**
- TypeScript type definitions
- Organized by feature for better maintainability

This structure provides:
- **Scalability**: Easy to add new features
- **Maintainability**: Clear separation of concerns
- **Reusability**: Components can be easily shared
- **Type Safety**: Comprehensive TypeScript support
- **Organization**: Logical grouping of related files