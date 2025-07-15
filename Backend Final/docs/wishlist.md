## Wishlist Frontend Execution Process

### **Step 1: Page Load - Display Wishlist**
**What happens:** User visits wishlist page
**Backend API:** `GET /api/wishlist/` 
**Response:** Returns user's wishlist collections and destinations
**Frontend:** Shows list of destinations with basic info

### **Step 2: Add Destination**
**What happens:** User clicks "Add Destination" button
**Backend API:** `POST /api/wishlist/destinations`
**Request:** Send destination name, notes, coordinates
**Frontend:** Shows form, validates input, adds to list after success

### **Step 3: Role-Based Limits Check**
**What happens:** Before adding destination
**Logic:** If user is Explorer, check if they have < 50 destinations
**If limit reached:** Show upgrade prompt
**If under limit:** Allow addition

### **Step 4: Edit Destination**
**What happens:** User clicks edit on a destination
**Backend API:** `PUT /api/wishlist/destinations/:id`
**Request:** Updated notes, budget, priority level
**Frontend:** Show edit form, update list after success

### **Step 5: Remove Destination**
**What happens:** User clicks delete
**Backend API:** `DELETE /api/wishlist/destinations/:id`
**Frontend:** Show confirmation, remove from list after success

### **Step 6: Share Wishlist (Travelers Only)**
**What happens:** Traveler clicks "Share" button
**Backend API:** `POST /api/wishlist/share`
**Request:** Send email/user ID to share with
**Frontend:** Show share modal, send invitation

### **Step 7: View Shared Wishlist**
**What happens:** User clicks on shared wishlist notification
**Backend API:** `GET /api/wishlist/shared/:id`
**Response:** Shared wishlist data
**Frontend:** Display with "Shared by [User]" indicator

### **Execution Flow:**
1. **Load** → GET wishlist data
2. **Add** → POST new destination  
3. **Edit** → PUT updated destination
4. **Delete** → DELETE destination
5. **Share** → POST share invitation
6. **Accept Share** → PUT accept shared wishlist
