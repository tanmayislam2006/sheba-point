import status from "http-status";
import { envVars } from "../../config/env";
import catchAsync from "../../shared/asyncHandler";
import { stripe } from "../../config/stripe.config";
import { paymentService } from "./payment.service";
import sendResponse from "../../shared/sendResponse";

const handleStripeWebhookEvent = catchAsync(async (req, res) => {
  const signature = req.headers["stripe-signature"] as string;
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res
      .status(status.BAD_REQUEST)
      .json({ message: "Missing Stripe signature or webhook secret" });
  }
  let event;
  try {
    if (!Buffer.isBuffer(req.body)) {
      console.error("Stripe webhook body is not raw Buffer");
      return res.status(status.BAD_REQUEST).json({
        message: "Invalid webhook payload. Expected raw body buffer.",
      });
    }

    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error) {
    console.error("Error processing Stripe webhook:", error);
    return res
      .status(status.BAD_REQUEST)
      .json({ message: "Error processing Stripe webhook" });
  }
  try {
    const result = await paymentService.handlerStripeWebhookEvent(event);
    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result,
    });
  } catch (error) {
    sendResponse(res, {
      statusCode: status.INTERNAL_SERVER_ERROR,
      success: false,
      message: "Error handling stripe webhook event",
    });
  }
});

export const paymentController = {
  handleStripeWebhookEvent,
};
