```json
flowchart TD
    A[Landing Page] --> B{User Authenticated?}
    B -->|No| C[Login/Register]
    B -->|Yes| D[Home Dashboard]
    
    C --> C1[Registration Form]
    C --> C2[Login Form]
    C1 --> C3[Profile Setup]
    C3 --> D
    C2 --> D
    D --> D1[Home]
    
    D1 --> E[Explore Posts Feed]
    D1 --> F[My Profile]
    D1 --> G[Wishlists]
    D1 --> H[Trip Planning]
    D1 --> I[Notifications]
    
    E --> E6[View Post Details]
    E --> E2[Filter by Location]
    E --> E3[Filter by Budget/Duration]
    E --> E4[Search Posts]
    E --> E8[Filter by Food/Cuisine]
    E --> E9[Filter by Hotel Type]
    E --> E23[Filter by Attractions]
    E --> M1[View Likes]
    E --> M2[View Saves]
    E --> E5[Like/Save Post]
    E --> M[Share Post]
    E --> E7[Report Post]
    
    E6 --> E10[View Accommodation Details]
    E6 --> E11[View Dining Experiences]
    E6 --> E12[View Transport Details]
    E6 --> E24[View Attractions Visited]
    E6 --> E13[View Photos/Media]
    
    F --> F1[Edit Profile]
    F --> F2[My Posts]
    F --> F3[My Travel Interests]
    F --> F4[Account Settings]
    F2 --> F5[Create New Post]
    F2 --> F6[Edit Existing Post]
    F5 --> F7[Add Location]
    F5 --> F8[Add Media]
    F5 --> F9[Add Transport Details]
    F5 --> F10[Add Accommodation Details]
    F5 --> F14[Add Dining Experiences]
    F5 --> F25[Add Attractions Visited]
    F5 --> F11[Publish/Save Draft]
    
    F10 --> F12[Hotel Name & Type]
    F10 --> F15[Rating & Review]
    F10 --> F16[Cost & Dates]
    F10 --> F17[Amenities]
    
    F14 --> F18[Restaurant Details]
    F14 --> F19[Cuisine Type]
    F14 --> F20[Dishes Tried]
    F14 --> F21[Rating & Review]
    F14 --> F22[Cost & Visit Info]
    
    F25 --> F26[Attraction Name & Type]
    F25 --> F27[Entry Cost & Time Spent]
    F25 --> F28[Rating & Review]
    F25 --> F29[Best Time to Visit]
    F25 --> F30[Tips for Travelers]
    
    G --> G1[View My Wishlists]
    G --> G2[Create New Wishlist]
    G --> G3[Browse Public Wishlists]
    G1 --> G4[Edit Wishlist]
    G1 --> G6[Share Wishlist]
    G2 --> G7[Set Wishlist Details]
    G7 --> G8[Add Locations]
    G8 --> G9[Set Privacy Settings]
    
    H --> H1[My Trips]
    H --> H2[Create New Trip]
    H --> H3[Browse Trip Invites]
    H1 --> H4[View Trip Details]
    H1 --> H5[Trip Chat/comments]
    H1 --> H6[Manage Participants]
    H2 --> H7[Set Trip Details]
    H7 --> H8[Select Location]
    H7 --> H9[Set Dates & Budget]
    H7 --> H10[Invite Participants]
    H4 --> H11[Edit Trip]
    H4 --> H12[Leave Trip]
    
    I --> I1[View All Notifications]
    I --> I2[Mark as Read]
    I --> I3[Notification Settings]
    I --> I4[Filter Notification]
    
    E6 --> L[Location Page]
    L --> L2[Add to Wishlist]
    L --> L3[Express Travel Interest]
    L --> L4[View Cached Services]
    L4 --> L7[Bookmark Services]
    
    G6 --> N[Share Wishlist]
    N --> N2[Public Wishlist View]
    N2 --> N1[Generate Share Link]
    
    H10 --> O[Invite System]
    O --> O1[Send Invitations]
    O --> O2[Track Responses]
    
    F3 --> P[Travel Interests]
    P --> P1[Set Interest Level]
    P --> P2[Set Preferred Dates]
    P --> P3[Set Budget Range]
    
    style A fill:#e1f5fe
    style D fill:#f3e5f5
    style E fill:#e8f5e8
    style F fill:#fff3e0
    style G fill:#fce4ec
    style H fill:#e0f2f1
    style I fill:#f1f8e9
    ```