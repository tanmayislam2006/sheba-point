import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { IndexRoutes } from "./app/routes";
import handleNotFound from "./app/shared/handleNotFound";
import globalErrorHandler from "./app/shared/globalErrorHandler";
import qs from "qs";
import path from "path";
import cors from "cors";
import { envVars } from "./app/config/env";


const app: Application = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
// to make parse nested object from query string
app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));
app.use("/api/v1", IndexRoutes);

app.use(
  cors({
    origin: [
      envVars.FRONTEND_URL,
      envVars.BETTER_AUTH_URL,
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Sheba Point API");
});
app.use(handleNotFound);
app.use(globalErrorHandler);
export default app;
