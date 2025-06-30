When we write the following lines:
```js
const mockWishlist = { id: 1, name: 'Wishlist' };
(WishlistService.createWishlist as jest.Mock).mockResolvedValue(mockWishlist);
```
We're telling Jest: “Hey `WishlistService.createWishlist`, if the controller calls you during this test, just return this `mockWishlist` object — don't bother doing your real logic (like DB stuff).”

So the function is:

* **Intercepted** (mocked),
* **Given a fake return value** (`mockWishlist`),
* And the controller **behaves as if it got a real result**.