const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { MongoClient } = require("mongodb");



// Hashing function
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
//forget passwored route
module.exports = function passwordRoutes(usersCollection) {
    const router = express.Router();
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found with that email." });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save token and expiry to user document
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          resetToken,
          resetTokenExpires
        }
      }
    );

    // Email setup
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "demoprojects254@gmail.com", // replace with your sender email
        pass: "asid qlje zfly aazm"     // replace with an App Password or SMTP password
      }
    });

    const resetLink = `http://localhost:3000/reset.html?token=${resetToken}`;

    const mailOptions = {
      from: '"Markets A-Z"',
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>Hello ${user.name || "user"},</p>
        <p>You requested a password reset. Click the link below to reset your password:</p>
        <a href="${resetLink}">Reset Password</a>
        <p>This link will expire in 1 hour.</p>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    // Respond with success
    res.status(200).json({ message: "Check your email for a password reset link." });

  } catch (err) {
    console.error("❌ Error in forgot-password route:", err);
    res.status(500).json({ message: "Something went wrong!" });
  }
});
// Reset Password Route
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Invalid token or password." });
    }


    // Find user with matching token and expiry
    const user = await usersCollection.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password and clear token fields
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: { password: hashedPassword },
        $unset: { resetToken: "", resetTokenExpires: "" }
      }
    );

    res.status(200).json({ message: "Your password has been reset successfully." });

  } catch (err) {
    console.error("❌ Error in /reset-password:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});
return router;
}

