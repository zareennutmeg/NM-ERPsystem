// emailService.js
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const otpStore = {};  // In-memory OTP store (replace with Redis/DB in prod)

// Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;

  if (!email) return res.status(400).json({ error: 'Email required' });

  const otp = generateOTP();
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: email,
    subject: 'Your OTP Verification Code',
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`); // Debug console log
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Verify OTP endpoint
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;

  if (otpStore[email] === otp) {
    delete otpStore[email];
    res.json({ verified: true });
  } else {
    res.status(400).json({ verified: false, error: 'Invalid OTP' });
  }
});

export default router;
