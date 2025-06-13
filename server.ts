import { initialize } from './src/database';
import { config } from 'dotenv';
import express, { Request, Response } from "express";
// import globalErrorHandler from "./src/middlewares/globalErrorHandler";
// import notFound from "./src/middlewares/notFound";
import { UserRoutes } from "./src/routes/user.route";
import { AuthRoutes } from "./src/routes/auth.route";
<<<<<<< HEAD
import { createPostRoutes } from "./src/routes/post.route";

=======
>>>>>>> b19da4c5f0fa77853257d8697e886f75cbf191af
config(); // Load environment variables from .env file
const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const startServer = async () => {
  try {
    await initialize();
    console.log('Application initialized successfully');
<<<<<<< HEAD
    app.use("/api/auth", AuthRoutes);
    app.use("/api/users", UserRoutes);
    app.use("/api/posts", createPostRoutes);

=======
  
    app.use("/api/users", UserRoutes);
    app.use("/api/auth", AuthRoutes);
    
    app.get("/", (req: Request, res: Response) => {
      res.send("Hello Next!");
    });
>>>>>>> b19da4c5f0fa77853257d8697e886f75cbf191af
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
