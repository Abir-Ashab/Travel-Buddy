### **Example Scenario:**
- Sarah (Traveler) creates a wishlist called "Europe Summer 2025"
- She adds destinations: Paris, Rome, Barcelona
- Sarah wants to share this with her friend Mike for trip planning
- Sarah sends Mike access to view/edit her wishlist
- Now both can add destinations to the same wishlist

### **Execution Process:**

#### **Step 1: Share Wishlist**
**What happens:** Sarah clicks "Share" on her wishlist
**Backend API:** `POST /api/wishlist/share`
**Request:** 
```json
{
  "wishlist_id": 123,
  "share_with_email": "mike@email.com",
  "permission": "edit"  // or "view"
}
```
**Result:** Mike gets notification/email about shared wishlist

#### **Step 2: Accept Share**
**What happens:** Mike clicks "Accept" in notification
**Backend API:** `PUT /api/wishlist/share/:id/accept`
**Result:** Mike can now see Sarah's wishlist in his wishlist page

#### **Step 3: View Shared Wishlist**
**What happens:** Mike opens his wishlist page
**Backend API:** `GET /api/wishlist/` 
**Response:** Returns Mike's personal wishlists AND shared wishlists
**Frontend:** Shows "My Wishlists" and "Shared with me" sections

#### **Step 4: Collaborate**
**What happens:** Mike adds Rome to Sarah's shared wishlist
**Backend API:** `POST /api/wishlist/destinations`
**Result:** Both Sarah and Mike see the updated wishlist

### **Database Flow:**
1. WISHLIST_SHARES table tracks who shared what with whom
2. When fetching wishlists, include both owned and shared ones
3. Permission field controls if user can edit or just view

**Simple analogy:** Like sharing a Google Doc - one person creates it, shares with others, and everyone can collaborate on the same document.