const express = require("express");
const bcrypt = require("bcrypt");
const { MongoClient } = require("mongodb");
const nodemailer = require('nodemailer');
const crypto = require("crypto");


// Hashing function
function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}
module.exports = function authRoutes(usersCollection) {
const router = express.Router();
// Signup Route
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = hashPassword(password, salt);

  const user = await usersCollection.findOne({ email });
  if (user) {
    return res.json({ message: 'User already exists, login to continue' });
  }
  const token = crypto.randomBytes(32).toString('hex');
  await usersCollection.insertOne({
  email,
  salt,
  hash,
  verified: false,
  confirmationToken: token
});
res.json({ message: 'Thanks for signing up!', 
            notice: 'Please check your email to confirm your account before logging in.'
 });

// Send confirmation email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'demoprojects254@gmail.com',
    pass: 'asid qlje zfly aazm'

  }
});

const confirmationLink = `http://localhost:3000/routes/confirm/${token}`;
await transporter.sendMail({
  from: '"Markets A-Z"',
  to: email,
  subject: 'Email Confirmation',
  html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Confirm Your Email</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f7fa;
    }

    .email-wrapper {
      max-width: 600px;
      margin: 30px auto;
      background: #ffffff;
      border-radius: 10px;
      overflow: hidden;
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
    }

    .email-header {
      background: linear-gradient(135deg, #4CAF50, #2E7D32);
      color: white;
      padding: 30px;
      text-align: center;
    }

    .email-header h1 {
      margin: 0;
      font-size: 24px;
    }

    .email-body {
      padding: 30px;
      color: #333;
      line-height: 1.6;
    }

    .email-body h2 {
      color: #4CAF50;
      margin-top: 0;
    }

    .email-body p {
      margin: 15px 0;
    }

    .email-button {
      display: inline-block;
      background-color: #4CAF50;
      color: white;
      padding: 14px 25px;
      text-decoration: none;
      border-radius: 30px;
      font-weight: bold;
      margin-top: 20px;
      box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
      transition: background 0.3s ease;
      cursor: pointer;
    }

    .email-button:hover {
      background-color: #43a047;
    }

    .email-footer {
      text-align: center;
      font-size: 13px;
      color: #999;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="email-wrapper">
    <div class="email-header">
      <h1>Welcome to Markets A-Z!</h1>
    </div>
    <div class="email-body">
      <h2>Thank you for signing up 🎉</h2>
      <p>Hi there,</p>
      <p>We’re excited to have you join our platform! Please confirm your email address to complete your registration and start accessing your account.</p>
      <p style="text-align:center;">
        <a href="${confirmationLink}" class="email-button">Confirm Email</a>
      </p>
      <p>If you didn’t sign up, you can safely ignore this email.</p>
      <p>Thanks again,<br>The Markets A-Z Team</p>
    </div>
    <div class="email-footer">
      © 2025 Markets A-Z. All rights reserved.
    </div>
  </div>
</body>
</html>
</a>`
});
  
});
// Email confirmation route
router.get('/confirm/:token', async (req, res) => {
  const { token } = req.params;

  try {
    // First try to confirm the user with the token
    const result = await usersCollection.findOneAndUpdate(
      { confirmationToken: token },
      { $set: { verified: true }, $unset: { confirmationToken: "" } },
      { returnDocument: 'after' }
    );

    // If user was just confirmed
    if (result && result.value) {
res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Email Confirmed</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #1f4037, #99f2c8);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        color: #fff;
        overflow: hidden;
      }

      .confirmation-box {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 40px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
        animation: fadeIn 1.2s ease-in-out;
        backdrop-filter: blur(10px);
        max-width: 400px;
      }

      .confirmation-box h1 {
        font-size: 2em;
        margin-bottom: 15px;
        color: #ffffff;
      }

      .confirmation-box p {
        font-size: 1.1em;
        margin-bottom: 25px;
        color: #e0f7fa;
      }

      .confirmation-box button {
        padding: 12px 30px;
        background-color: #00b894;
        color: #fff;
        font-size: 1em;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: background-color 0.3s ease, transform 0.2s ease;
      }

      .confirmation-box button:hover {
        background-color: #019875;
        transform: scale(1.05);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  </head>
  <body>
    <div class="confirmation-box">
      <h1>✅ Email Confirmed!</h1>
      <p>Your email has been successfully verified. You can now login to access your dashboard.</p>
      <a href="/">
        <button>Go to Login</button>
      </a>
    </div>
  </body>
  </html>
`);
        
    }

    // If no matching token, check if the user is already verified
    const alreadyVerified = await usersCollection.findOne({
      verified: true
    });

    if (alreadyVerified) {
      return res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Email Confirmed</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #1f4037, #99f2c8);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        color: #fff;
        overflow: hidden;
      }

      .confirmation-box {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 40px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
        animation: fadeIn 1.2s ease-in-out;
        backdrop-filter: blur(10px);
        max-width: 400px;
      }

      .confirmation-box h1 {
        font-size: 2em;
        margin-bottom: 15px;
        color: #ffffff;
      }

      .confirmation-box p {
        font-size: 1.1em;
        margin-bottom: 25px;
        color: #e0f7fa;
      }

      .confirmation-box button {
        padding: 12px 30px;
        background-color: #00b894;
        color: #fff;
        font-size: 1em;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: background-color 0.3s ease, transform 0.2s ease;
      }

      .confirmation-box button:hover {
        background-color: #019875;
        transform: scale(1.05);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    </style>
  </head>
  <body>
    <div class="confirmation-box">
      <h1>✅ Email Confirmed!</h1>
      <p>Your email has been successfully verified. You can now login to access your dashboard.</p>
      <a href="/">
        <button>Go to Login</button>
      </a>
    </div>
  </body>
  </html>
`);

    }

    // Otherwise, token is invalid
    return res.send(`
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Link Expired</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background: linear-gradient(135deg, #cb2d3e, #ef473a);
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        color: #fff;
        overflow: hidden;
      }

      .error-box {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 40px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
        text-align: center;
        animation: shake 0.6s ease-in-out;
        backdrop-filter: blur(10px);
        max-width: 420px;
      }

      .error-box h1 {
        font-size: 2em;
        margin-bottom: 15px;
        color: #ffffff;
      }

      .error-box p {
        font-size: 1.1em;
        margin-bottom: 25px;
        color: #ffd6d6;
      }

      .error-box button {
        padding: 12px 30px;
        background-color: #e74c3c;
        color: #fff;
        font-size: 1em;
        border: none;
        border-radius: 30px;
        cursor: pointer;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transition: background-color 0.3s ease, transform 0.2s ease;
      }

      .error-box button:hover {
        background-color: #c0392b;
        transform: scale(1.05);
      }

      @keyframes shake {
        0% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        50% { transform: translateX(5px); }
        75% { transform: translateX(-5px); }
        100% { transform: translateX(0); }
      }
    </style>
  </head>
  <body>
    <div class="error-box">
      <h1>⚠️ Invalid or Expired Link</h1>
      <p>This confirmation link is no longer valid or has already been used.</p>
      <a href="/">
        <button>login or register to continue</button>
      </a>
    </div>
  </body>
  </html>
`);

  } catch (error) {
    console.error('Error confirming email:', error);
    return res.status(500).send('<h2>Something went wrong. Please try again later.</h2>');
  }
});
// Login Route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await usersCollection.findOne({ email });

  if (!user) {
    return res.json({ success: false, message: 'User not found' });
  }else if(!user.verified) {
    return res.json({ success: false, message: 'Please confirm your email before logging in.' });
  }

  const inputHash = hashPassword(password, user.salt);
  if (inputHash === user.hash) {
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Incorrect email or password' });
  }
});
  return router;
}

