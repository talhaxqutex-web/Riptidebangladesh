import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // API Route to send order confirmation email
  app.post("/api/send-order-email", async (req, res) => {
    try {
      const { email, firstName, lastName, orderId, totalAmount } = req.body;

      if (!email || !orderId) {
        return res.status(400).json({ error: "Email and Order ID are required" });
      }

      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.error("Missing EMAIL_USER or EMAIL_PASS environment variables");
        return res.status(500).json({ error: "Server is not configured to send emails." });
      }

      const mailOptions = {
        from: '"Riptide" <' + process.env.EMAIL_USER + '>',
        to: email,
        subject: `Order Confirmation - Order #${orderId}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #593A1B; text-align: center;">Thank you for your order!</h2>
            <p>Hi ${firstName} ${lastName},</p>
            <p>We've successfully received your order <strong>#${orderId}</strong>.</p>
            <p><strong>Total Amount:</strong> ৳${totalAmount}</p>
            <p>We're processing your order right away and will notify you once it's on the way.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Riptide Team</strong></p>
          </div>
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log(`Confirmation email sent to ${email} for order ${orderId}`);
      res.json({ success: true, message: "Email sent successfully" });
    } catch (error) {
      console.error("Error sending confirmation email:", error);
      res.status(500).json({ error: "Failed to send email" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
