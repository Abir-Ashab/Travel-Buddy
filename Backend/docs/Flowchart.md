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


    https://mermaid.live/edit#pako:eNp9V1tv4jgU_itWVpqnzpQ4CQQedtVyKZUog0p3VrtuHzyJA1YhRo7pDNvpf9-THAfilG4fUJPvi3Mu37nk1UtUKryBl23Uj2TNtSEPo8ecwN8Vm_E8lfmKLPhKPJHPn38n169_FkKTq71Zi9zIhBuR_vGG_OuS8WuufpEhm6mVzC_vxUoWRuinJuFvUfwiIzZVW0FGvFh_V1ynloG_w-pVQ5_h85obqXIyUXr75BAovsZBfIQCttAqkxtBlsLsdzUaVKj1b0ibVyO88CvDHHNGeOaYjX_uNkoLslCFKchEiNpsy5iwuwOx73WRG_aXLNYbcKZwgSl70HJHFhue5xBpF7xlc2VkVkYZAlA4Ro3Rpi77JsWPyiIyEobLTU2zBMomcgMpIN8PZKbwJJcRNBjX-3QlzOVor88QQ7YUXCdr9N_F4sYhE6XSy-FeFjIXLqvfYE2VERvycNi1OLRpz5WB7CdN75F156PfM_ksWghFZMlfWsg4YiX9skQqF9zn2BLEfwYY90CGOwV10YAsoYsMv4PvvEoStd2qFPXaSkfNtZaPZJlvApISWoo8Ee-I1pEHzfOiev_5A2loX34KFfkGsTdHdR5PDKxY1sqo4vJOpJI7_kxQxT4bp9K0hGwxWkm8kX97Pyjvg6kvkNPbHLIn3lFCVsZnn5uyJA04f8SxDicRG2oBDYXMraJbeBftGv-EMqq6UoMSIaXHrtK0rfMajCuw6XaN9Cvko0jXLEhzSfu_LB-pYUX9MMk1j0Z45Ie5Ox7os8X-OzSQNep3pHnmihHMs1TKsLbmHDrsp2aJnTgRu-dVED-Re_ECqnjH6LJh2VQ-QY82J7uPMER6K3JppChaZoSWEUPdFIZDK8nfRfRI6jPbKFwzLUw7bAQuiwJyI08xOcL-h17UDFp7UYUVpJkp11xaZ6LLTlk4F7ojscfGudEHYg9-kEBd7mAavmPGH5l3ZPTZNcQIzzAKjWyTgg57kLuCZErbChPajfkNzhjbWaAQ28PGEmizwGqOSwnYtVY_CuiDpdqS9yfZeRZiLbYPsWjXNtM2jIV804NBcnq2pY2bHpJip5SPaIxovzpioeULTw7thoK_UxywPnYmiOCTc98JRom78DEQ1Xy-zV_kqQqmdnaHdYcGhutEzYhwvA_X3FyWXQNU0qZ02R3PYb-CJUvDQiV3vMHBgE0xYOfeg8GaxkDYiMS0W1-NY7iqSgYx4pRvUaC7oZdnDQktyc6GZrxqCLYxUbamBoa_t7jMWHlebaAznVlrLAsGDNfPhBdQMjx1scDZh9pZt6SwXh-a3HNje8bqYOF-i-AMMVqpD0qyJWELB-UuCDOuaM88l2YFMuTJWqRgr36Rpxkww8DNeuxaqedt6XWLYSWP5s7P19QcQcpaBUu-nfrNHGU099mNyIUuRY9nzWT-7NaM7e9fay0sD7C_18v1V8R8EFOeYk04KbQ4BdHz5BkSCNM0L9oDAnfwBftgW1gg7FeKrUEyE8B1GdS2AJEJrSG8zTllKUFFQbmTe56v3MW-MAf4QLgisOZsBr8JP4sy0URGFskCEWVRExnXz8RZJOImMqmfyeCpThO5qZFEhCJpItP6tE5GM7-J3NbP-Fks-t6FtxV6y2UK32uvJe_Rg--wrXj0BvBvKjK-35hH7zF_AyrfG7U85Ik3MHovLjyt9qu1N8j4poCr_Q4WGDGSfKX5tqZAyf-j1PESNiWj9B1-H1afiRXFG7x6P73BZ5_S7hfap34Y9Xo0jv0L7wC3I9r70oHbtEM7UScIwrcL79_q1PBLv-PH3cD3O5RG1QMalCT0sFwLvQEN4z7cW-nSwcrOt_8ADCJVCQ