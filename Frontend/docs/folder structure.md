# Travel App Frontend Structure

```
src/
├── components/
│   ├── globalFiles/
│   ├── auth/
│   ├── posts/
│   ├── profile/
│   ├── wishlists/
│   ├── trips/
│   └── notifications/
├── hooks/
│   ├── useAuth.ts
├── services/
│   ├── api.ts
│   ├── auth.ts
├── utils/
├── types/
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

### 2. **Hooks Directory**
- Custom hooks for data fetching and state management
- Reusable logic for different features
 
### 3. **Services Directory**
- API integration layer
- Separate files for different API endpoints
- Centralized HTTP client configuration

### 4. **Utils Directory**
- Helper functions, constants, validators
- Utility functions used across the app

### 5. **Types Directory**
- TypeScript type definitions
- Organized by feature for better maintainability
