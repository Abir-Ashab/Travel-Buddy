``` json
erDiagram
    USERS {
        int id PK
        string name
        enum role "explorer, traveler, admin, super_admin"
        string email
        string contact_number
        string password
        enum status "active, blocked"
        text bio
        json travel_preferences
        string profile_picture
        timestamp created_at
        timestamp updated_at
    }

    LOCATIONS {
        int id PK
        string name
        string country
        string region
        decimal latitude
        decimal longitude
        string timezone
        timestamp created_at
    }

    POSTS {
        int id PK
        int user_id FK
        int location_id FK
        string title
        text description
        decimal total_cost
        int duration_days
        int effort_level
        boolean is_featured
        enum status "draft, published"
        int likes_count
        int saves_count
        int shares_count
        timestamp created_at
        timestamp updated_at
    }

    MEDIA {
        int id PK
        int post_id FK
        string image_url
    }

    TRANSPORT {
        int id PK
        int post_id FK
        string transport_type
        string provider
        decimal cost
        text notes
    }

    ACCOMMODATION {
        int id PK
        int post_id FK
        string accommodation_type "hotel, hostel, airbnb, guesthouse"
        string name
        decimal cost_per_night
        decimal rating "user's rating 1-5"
        text review "user's review/experience"
        text notes
        json amenities "wifi, pool, breakfast, etc"
        date check_in_date
        date check_out_date
    }

    DINING {
        int id PK
        int post_id FK
        string restaurant_name
        string cuisine_type
        enum meal_type "breakfast, lunch, dinner, snack"
        decimal cost
        decimal rating "user's rating 1-5"
        text review "user's review/experience"
        json dishes_tried "array of dish names"
        text notes
        date visit_date
    }

    ATTRACTIONS {
        int id PK
        int post_id FK
        string attraction_name
        enum attraction_type "museum, monument, park, beach, temple, market, viewpoint, adventure"
        decimal entry_cost
        decimal rating "user's rating 1-5"
        text review "user's experience/review"
        int time_spent_hours
        enum best_time_to_visit "morning, afternoon, evening, night"
        boolean recommended
        text tips "user tips for other travelers"
        text notes
        date visit_date
        timestamp created_at
    }

    WISHLISTS {
        int id PK
        int user_id FK
        string name
        text description
        enum grouping_type "region, theme, budget, season"
        boolean is_public
        timestamp created_at
        timestamp updated_at
    }

    WISHLIST_ITEMS {
        int id PK
        int wishlist_id FK
        int location_id FK
        text notes
        decimal estimated_budget
        int priority_level
        date preferred_start_date
        date preferred_end_date
        timestamp created_at
        timestamp updated_at
    }

    TRAVEL_PLAN {
        int id PK
        int creator_id FK
        int location_id FK
        string trip_name
        date start_date
        date end_date
        decimal total_budget
        int status_id FK
        int max_participants
        timestamp created_at
        timestamp updated_at
    }

    TRAVEL_PARTICIPANTS {
        int id PK
        int trip_plan_id FK
        int user_id FK
        enum role "creator, participant"
        enum status "invited, joined, declined"
        timestamp joined_at
        timestamp created_at
    }

    MESSAGES {
        int id PK
        int trip_plan_id FK
        int sender_id FK
        text message
        json attachments
        timestamp created_at
    }

    SERVICE_CACHE {
        int id PK
        int location_id FK
        string service_type "hotel, transport, restaurant, attractions"
        json cached_data
        timestamp cached_at
        timestamp expires_at
        string cache_key
        index idx_location_type_key "location_id, service_type, cache_key"
    }

    USER_SERVICE_BOOKMARKS {
        int id PK
        int user_id FK
        string service_name
        string service_type "hotel, restaurant, transport"
        int location_id FK
        json service_details "rating, review, cost, etc"
        string external_service_id
        boolean is_visited "true if user has been there"
        timestamp created_at
    }

    NOTIFICATIONS {
        int id PK
        int user_id FK
        string title
        text message
        enum type "like, save, trip_invite, match_found, wishlist_share"
        json metadata
        boolean is_read
        timestamp created_at
    }

    REPORTS {
        int id PK
        int reporter_id FK
        int post_id FK
        enum reason "spam, inappropriate, false_info"
        text description
        enum status "pending, resolved"
        timestamp created_at
    }

    

    USERS ||--o{ POSTS : creates
    USERS ||--o{ WISHLISTS : owns
    USERS ||--o{ TRAVEL_PLAN : creates
    USERS ||--o{ TRAVEL_PARTICIPANTS : joins
    USERS ||--o{ MESSAGES : sends
    USERS ||--o{ USER_SERVICE_BOOKMARKS : bookmarks
    USERS ||--o{ NOTIFICATIONS : receives
    USERS ||--o{ REPORTS : files

    LOCATIONS ||--o{ POSTS : located_at
    LOCATIONS ||--o{ WISHLIST_ITEMS : contains
    LOCATIONS ||--o{ TRAVEL_PLAN : targets
    LOCATIONS ||--o{ SERVICE_CACHE : serves
    LOCATIONS ||--o{ USER_SERVICE_BOOKMARKS : located_at

    POSTS ||--o{ MEDIA : contains
    POSTS ||--o{ TRANSPORT : includes
    POSTS ||--o{ ACCOMMODATION : includes
    POSTS ||--o{ REPORTS : reported_as
    POSTS ||--o{ ATTRACTIONS : includes
    POSTS ||--o{ DINING : includes

    USERS ||--o{ USER_SERVICE_BOOKMARKS : bookmarks
    LOCATIONS ||--o{ USER_SERVICE_BOOKMARKS : located_at

    WISHLISTS ||--o{ WISHLIST_ITEMS : contains
    TRAVEL_PLAN ||--o{ MESSAGES : contains
    ```