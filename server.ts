import { initialize } from './src/database';
import { config } from 'dotenv';
import express, { Request, Response } from "express";
// import globalErrorHandler from "./middlewares/globalErrorHandler";
// import notFound from "./middlewares/notFound";
import { UserRoutes } from "./modules/user/user.route";
import { AuthRoutes } from "./modules/auth/auth.route";
config(); // Load environment variables from .env file
const app = express();
app.use(express.json());



const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await initialize();
    console.log('Application initialized successfully');
  
    app.use("/api/users", UserRoutes);
    app.use("/api/auth", AuthRoutes);
    
    app.get("/", (req: Request, res: Response) => {
      res.send("Hello Next!");
    });
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
