import { request, response } from "express";
import Stripe from "stripe";
import Transaction from "../models/Transcation.js";
import User from "../models/user.js";

export const stripeWebhook = async (req, res) => {

  console.log("🔥 WEBHOOK HIT");

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

  const sig = req.headers["stripe-signature"];

  let event;

  try {

    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_KEY
    );

  } catch (error) {

    console.log("Webhook signature error:", error.message);

    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  console.log("EVENT TYPE:", event.type);

  try {

    if (event.type === "checkout.session.completed") {

      const session = event.data.object;

      console.log("SESSION:", session);

      const metadata = session.metadata;

      console.log("METADATA:", metadata);

      if (!metadata?.transactionId) {
        return res.json({ received: true });
      }

      const transaction = await Transaction.findById(
        metadata.transactionId
      );

      if (!transaction) {
        return res.json({ received: true });
      }

      await User.updateOne(
        { _id: transaction.userId },
        { $inc: { credits: transaction.credits } }
      );

      transaction.isPaid = true;

      await transaction.save();

      console.log("✅ PAYMENT SUCCESS");
    }

    res.json({ received: true });

  } catch (error) {

    console.log("WEBHOOK PROCESS ERROR:", error);

    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};