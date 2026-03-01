import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { IndexRoutes } from "./app/routes";
import handleNotFound from "./app/shared/handleNotFound";
import globalErrorHandler from "./app/shared/globalErrorHandler";
const app: Application = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1", IndexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Sheba Point API");
});
app.use(handleNotFound);
app.use(globalErrorHandler);
export default app;
