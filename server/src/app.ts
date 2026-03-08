import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { IndexRoutes } from "./app/routes";
import handleNotFound from "./app/shared/handleNotFound";
import globalErrorHandler from "./app/shared/globalErrorHandler";
import qs from "qs";
import path from "path";
import cors from "cors";
import cron from "node-cron";
import { envVars } from "./app/config/env";
import { appointmentService } from "./app/module/appointment/appointment.service";
import { paymentController } from "./app/module/payment/payment.controller";

const app: Application = express();

// Stripe needs the exact raw body for signature verification.
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  paymentController.handleStripeWebhookEvent,
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: ["http://localhost:3000", envVars.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// to make parse nested object from query string
app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("Running cron job to cancel unpaid appointments...");
    await appointmentService.cancelUnpaidAppointments();
  } catch (error: any) {
    console.error(
      "Error occurred while canceling unpaid appointments:",
      error.message,
    );
  }
});
app.use("/api/v1", IndexRoutes);
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to Sheba Point API");
});
app.use(handleNotFound);
app.use(globalErrorHandler);
export default app;
