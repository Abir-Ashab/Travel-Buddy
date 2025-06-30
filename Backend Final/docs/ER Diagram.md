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

    https://mermaid.live/edit#pako:eNq1WVtz2joQ_isev5wX95IETojfOIS2TJOQCZyemTOZ8Qh7ARVb8kgyCU3z37uSbfBFNDS0vICltbSXb3c_iSc35BG4vgvikpKFIMk9c_Dz72R4N3Ge8gf9oUw5NHJuP--GpBKULRxGEtgNAssSR_AYnHsXHtOYCxCeowRZQ6x_kSihzHNkloIIzMO921oSEkLj1mhKpHzgIqorFXKmSKgC3HcGoqGIVERlElVBCboGz5nFPFxBVN1TwaNyZpTvRr5KzgqVg1TAHASwEGRbIcHnNIYgpaHKRMUJiiaAWyepEwogCqKAKNtslka12ed7lv-4Gg_609H45lUhKAZDnjElNq1xAQvK2W44gpAmJHZioqjKIrDMcLZoTBVraVO-cXaQ6VvjbseT6UuG6aFMIkRw_ENjHEOIqnLWnNvqpGJohDcCGQqaKqvhiisSByGXqr5PlIl8n4hsZH0K5nMuVBADQmQ3M-OIe8IcKoM52o6QiPbhMRJkrjwnzWYxlcs6II2NdAUyMCGsT0hEpX1iSUR75mgkXg8vR_0DgpWi-_YEBJ28gCATcWPp6V3_ZnI7vpsetzwmKpOpDofapGBL0jWNqpWhjHs94gYnjKsyz7dq9geD8fX1-NIk5HGqkjDkScKjHFZaXYTCEveMPWeJr-lvQsWMzTxnkWFolhyTwFIg6wlfNSjQdZXRxVK15zWc8eV7V2fWX7J8PnnTbdVDAWsKDxVR8_wOKzoIqqth642K67Y1FLVkVFHQiH-gc4qAxxTBKoxYXM2JxAwAFVaX0ih0wiWEq4DqxFNgneOZqkxuQ3U5uhndfDwuRkJnBGY-w5ZiLasZlZRBA2wmuxPAOlJEtWJinLFw6TkRZUx3QMlIuKrZbMXjnw6aCVCki48M0DKIdJcUgmwcPjfjBmTypTiboKzRJdaA9KeY5INDOtlLmaMwzUOTNha-UZkt3J-gC7LEcxKO88B0qSVihcgDomOhIEljpAMJDgJOaj-lnGo5Eq1RXrdzS4hAd9TgtwdqF6F3-VSzHehCHcgUtw-wJAjZsH-GmA2MjOKBCYZ2ARcMFUCL5goE4xxpF_arfCyvEG67dwnQJQpYVO1dRmlFU1monP_GFuhwtdSPBb17HVoOpA3_jSafrkavpw7W0rmfHRjHLgTPUnyrhFXOnRA_S0g0m8yihYaPBILZZHMnUgHT48Pf2JJLRwSj6fD6EG88YDYjzVC_Qqas0SuzQKKWRrfcAY0sFpQLqjZNdmRin9NpJEYBGimUrcLvRBCFB8PkQN9hOfoyvApur_qHtHKzCX8VCUU8NSqVMW6v1W1b6_TU5umcTdq0S8hjgAVP0ZCm2MnkH_Bg_246Goxu-zcHJaTxRxoTZtPWlq3Vc2QRBlPDS5OqyVan1pStKWruOV-xoOtvdGSsf9WK09bQXGqPF_YWo-vhZNL_ODzadKkrrbAmH-ogkTg3KZXC0-5StzT5Swrjef7LaDAMBv3Bp-EBWr-Ab4zYmobQ4LBbKu5VaJRXac-yxUBCtAYM9InVnnzaHh1sm1SfeaqzJUvT7wUr2FStiuARTX0MtrZp7bUQWlCx16tZ51XWchtO1bckQenZf8bjz9f9u89H9qdybyv5tLu96uttCFonyj0BNVEo141AERrrLMrZi1dQFc-Q0xZbL69rHjXBwCJVLkMjayc0jd8QTSUycOjc-MFZEokMBpjuqnXadQCub8bT0YfRYbclL3jednHQSkJTawr360O6Z07kXp7leenRtFKFy2COR3EE07b7mhN6KwESdHkd_RWPodXRL7njbqgP1Ic4QoBGif2GxUbE84JsiA6aLlOC7JoykuL5Gjs-0WbPSSwx-GzOWzxwP8Xa1m1kt1EBOcnj9b56vdf0alJOnO_f37zhT8Vdk1-8JS0SO1rpO_yB2USqpOFnS9lao28ajE1620J80wVsInvqi68hstJnF9tL9YzwNaMHurYqXKLFd_Q9pmzfPja8aGpIxfctwQY19fPb2a39Lfm6Z5EbIcfZJ1vvYL6pWbBPeK_nqiZUryO3QdHXXU29ayK7aysfEyCMswhsYvVro5-K7sJQJCWqZ12ycpr-6YLFPUhV5gh0HePcXXYdhpAqINp5Usq6npuASAiNXN81pQ5bij6S3bu-vlyFOcli0wGfUZRkik82LHR93XY8F890i6Xrm2rluTnRLf78KEWQYf7P-fYRIor88zr_p8T8YWJEXP_JfXT9k_fdt73OWafTPeme9PCp57kb1784f9s77_X-7p51uucnJ73TZ8_9ZhZ9_7bXvTjpXVx0Tk87Z-9752eolCGCA3176_rdTufUcxdC22fUfP4BRgH6uw