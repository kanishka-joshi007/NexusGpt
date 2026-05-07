// server.js
import express from "express";
import dotenv from "dotenv/config";
import cors from "cors";
import connectDB from "./configs/db.js";

// Routers
import userRouter from "./routes/userRoutes.js";
import chatRouter from "./routes/chatRoutes.js";
import messageRouter from "./routes/messageRoutes.js";
import creditRouter from "./routes/creditRoutes.js";
import { stripeWebhook } from "./controllers/webhookControllers.js";


const app = express();

console.log("PUBLIC:", process.env.IMAGEKIT_PUBLIC_KEY);
console.log("PRIVATE:", process.env.IMAGEKIT_PRIVATE_KEY);
console.log("URL:", process.env.IMAGEKIT_URL_ENDPOINT);


// Connect to DB
await connectDB();

// ✅ Apply CORS before any routes or JSON middleware
app.use(cors());



// Stripe webhook must use raw body
app.post(
  "/api/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

// JSON parser AFTER stripe webhook
app.use(express.json());

// Optional favicon handler (to avoid 404 spam)
app.get("/favicon.ico", (req, res) => res.status(204).end());

// Health check route
app.get("/", (req, res) => {
  res.send("server is live!");
});

// Mount routers
app.use("/api/user", userRouter);
app.use("/api/chat", chatRouter);
app.use("/api/message", messageRouter);
app.use("/api/credit", creditRouter);

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=>{
  console.log(`server is running on port ${PORT}`)
})
