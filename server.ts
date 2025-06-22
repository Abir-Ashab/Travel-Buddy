import { initialize } from './src/database';
import { config } from 'dotenv';
import express, { Request, Response } from "express";
// import globalErrorHandler from "./src/middlewares/globalErrorHandler";
// import notFound from "./src/middlewares/notFound";
import { UserRoutes } from "./src/routes/user.route";
import { AuthRoutes } from "./src/routes/auth.route";
import { createPostRoutes } from "./src/routes/post.route";
import {transportRoutes} from "./src/routes/transport.route"
import {accommodationRoutes} from "./src/routes/accomodation.route"
import {diningRoutes} from "./src/routes/dining.route"
import {attractionRoutes} from "./src/routes/attraction.route"
import {wishlistRoutes} from "./src/routes/wishlist.route"
import {locationRoutes} from "./src/routes/location.route"
import {proximityRoutes} from "./src/routes/proximity.route"

config(); // Load environment variables from .env file
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await initialize();
    console.log('Application initialized successfully');
    app.use("/api/auth", AuthRoutes);
    app.use("/api/users", UserRoutes);
    app.use("/api/posts", createPostRoutes);
    app.use("/api/transports", transportRoutes);
    app.use("/api/accomodations", accommodationRoutes);
    app.use("/api/dinings", diningRoutes);
    app.use("/api/attractions", attractionRoutes);
    app.use("/api/wishlists", wishlistRoutes);
    app.use("/api/locations", locationRoutes);
    app.use("/api/proximity", proximityRoutes);

  } catch (error) {
    console.error('Application initialization failed:', error.message);
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});
