### Step 1: Install Dependencies

In your project root, run:

```bash
npm install --save-dev jest ts-jest @types/jest typescript
```

Then initialize Jest config:

```bash
npx ts-jest config:init
```

This creates a `jest.config.js` file.

---

### Step 2: Update `jest.config.js`

Make sure it looks something like this:

```js
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts", "**/__tests__/**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/src", "<rootDir>/tests"],
};
```

> You can customize `testMatch` or use `testRegex` as preferred.

---

### Step 3: Update `tsconfig.json`

Add this in your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["jest", "node"]
  },
  "exclude": ["node_modules", "dist"]
}
```

---

### Step 4: Create Your Test Structure

Follow a standard structure inside your `src` folder:

```
src/
  └── controllers/
       └── user.controller.ts
tests/
  └── controllers/
       └── user.controller.test.ts
```

---

### Step 5: Add Test Script in `package.json`

```json
"scripts": {
  "test": "jest",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage"
}
```
---

### Step 6: Run the Tests

```bash
npm test # run each time after making modification
npm run test:watch # watch mode
```

---

