const express = require("express");
const Stripe = require("stripe");
require("dotenv").config(); // Load environment variables from .env (local only)

const app = express();
const port = process.env.PORT || 10000;
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

app.use(express.json());
app.use(express.static("public")); // Serve frontend files

const priceId = process.env.STRIPE_PRICE_ID;
const frontendUrl = process.env.FRONTEND_URL;

app.post("/api/signup", (req, res) => {
  const { email, username } = req.body;
  console.log(`Signup received: ${email}, ${username}`);
  res.status(200).json({ message: "Signup successful", email, username });
});

app.post("/api/checkout", async (req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "subscription", // or "payment"
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      success_url: `${frontendUrl}/success.html`,
      cancel_url: `${frontendUrl}/cancel.html`
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout error:", err);
    res.status(500).json({ error: "Checkout failed" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
