const express = require("express");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

// ✅ Custom scrypt hashing function (must be defined here!)
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString("hex");
}
// Forget Password and Reset Routes
module.exports = function passwordRoutes(usersCollection) {
  const router = express.Router();

  // 🔐 Helper function for generating token
  function generateResetToken() {
    return crypto.randomBytes(32).toString("hex");
  }

  // 📩 Forgot Password Route
  router.post("/forgot-password", async (req, res) => {
    try {
      const { email } = req.body;

      const user = await usersCollection.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "User not found with that email." });
      }

      const resetToken = generateResetToken();
      const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hour
      


      await usersCollection.updateOne(
        { _id: user._id },
        {
          $set: {
            resetToken,
            resetTokenExpires
          }
        }
      );
      res.status(200).json({ message: "Check your email for a password reset link." });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "demoprojects254@gmail.com",
          pass: "asid qlje zfly aazm"
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

      await transporter.sendMail(mailOptions);


    } catch (err) {
      console.error("❌ Error in forgot-password route:", err);
      return res.status(500).json({ message: "Something went wrong!" });
    }
  });

  // 🔄 Reset Password Route
 router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: "Invalid token or password." });
    }

    // Find user with matching token and valid expiry
    const user = await usersCollection.findOne({
      resetToken: token,
      resetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token." });
    }

    // Generate new salt
    const newSalt = crypto.randomBytes(16).toString('hex');

    // Hash new password using your custom scrypt function
    const newHashedPassword = hashPassword(newPassword, newSalt);

    // Update the user document
    await usersCollection.updateOne(
      { _id: user._id },
      {
        $set: {
          salt: newSalt,
          hash: newHashedPassword
        },
        $unset: {
          resetToken: "",
          resetTokenExpires: ""
        }
      }
    );

    res.status(200).json({ message: "Your password has been reset successfully." });

  } catch (err) {
    console.error("❌ Error in /reset-password:", err);
    res.status(500).json({ message: "Something went wrong." });
  }
});


  return router;
};
