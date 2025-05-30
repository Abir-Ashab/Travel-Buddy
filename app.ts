import express, { Request, Response } from "express";
// import globalErrorHandler from "./middlewares/globalErrorHandler";
// import notFound from "./middlewares/notFound";
import { UserRoutes } from "./modules/user/user.route";
import { AuthRoutes } from "./modules/auth/auth.route";
const app = express();

app.use(express.json());

app.use("/api/users", UserRoutes);
app.use("/api/auth", AuthRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello Next!");
});

// app.use(globalErrorHandler);

// //Not Found
// app.use(notFound);

export default app;
