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

  // Helper to get a fresh Nodemailer transporter using current environment variables
  const getTransporter = () => {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  };

  // API Route to test email configuration and credentials
  app.post("/api/test-email", async (req, res) => {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        return res.status(400).json({
          success: false,
          error: "Missing EMAIL_USER or EMAIL_PASS environment variables in Secrets. Please add them in AI Studio's Secrets manager."
        });
      }

      console.log(`Testing SMTP connection for user: ${process.env.EMAIL_USER}`);
      const transporter = getTransporter();
      
      // Verify connection configuration
      await transporter.verify();

      // Send a test email to the configured sender address itself to verify fully
      const testMailOptions = {
        from: `"Riptide System" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_USER,
        subject: "Riptide Email System - Connection Test",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; padding: 20px; border: 1px solid #eaeaea; border-radius: 8px;">
            <h2 style="color: #059669; text-align: center; margin-bottom: 20px;">🎉 Connection Successful!</h2>
            <p>Hello,</p>
            <p>Your email notification system is working perfectly. Riptide can now send email notifications automatically when orders are placed.</p>
            <div style="background-color: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0; border: 1px solid #eee;">
              <p style="margin: 0; font-size: 14px;"><strong>Configured Sender Email:</strong> ${process.env.EMAIL_USER}</p>
              <p style="margin: 5px 0 0 0; font-size: 14px;"><strong>SMTP Service Provider:</strong> Gmail</p>
            </div>
            <p>If you need any more changes, feel free to ask!</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>The Riptide Development Team</strong></p>
          </div>
        `,
      };

      await transporter.sendMail(testMailOptions);

      return res.json({
        success: true,
        message: `SMTP Connection successful! A test email has been sent to ${process.env.EMAIL_USER}. Please check your inbox and spam folder.`
      });
    } catch (error: any) {
      console.error("Test email connection failed:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Unknown SMTP connection error",
        code: error.code,
        command: error.command,
        hint: "Please double check your EMAIL_USER and EMAIL_PASS secrets in AI Studio. Ensure you are using a 16-character Gmail App Password (without spaces) and 2-Step Verification is enabled on your Google Account."
      });
    }
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

      const transporter = getTransporter();
      const mailOptions = {
        from: `"Riptide" <${process.env.EMAIL_USER}>`,
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
    } catch (error: any) {
      console.error("Error sending confirmation email:", error);
      res.status(500).json({ error: "Failed to send email", details: error.message });
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
