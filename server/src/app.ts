import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
const app: Application = express();
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", IndexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Sheba Point API");
});
export default app;