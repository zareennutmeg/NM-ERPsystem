// emailService.js
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const otpStore = {}; // In-memory store

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'zareen.hussaini@nmsolutions.co.in',
    pass: 'vsdq stlb xnga ifmz',
  },
});

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// === Public reusable function to send onboarding email ===
export async function sendOnboardingEmail(email, name, memberId, designation) {
  const mailOptions = {
    from: 'zareen.hussaini@nmsolutions.co.in',
    to: email,
    subject: 'Welcome to Nutmeg Software Solutions!',
    text: `Hello ${name},

Welcome to Nutmeg Software Solutions! Your onboarding was successful.

Here are your official details:

Employee ID: ${memberId}
Designation: ${designation}

Regards,
Team Nutmeg`,
  };

  await transporter.sendMail(mailOptions);
}

// === Send OTP ===
router.post('/send-otp', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email required' });

  const otp = generateOTP();
  otpStore[email] = otp;

  const mailOptions = {
    from: 'zareen.hussaini@nmsolutions.co.in',
    to: email,
    subject: 'Your OTP Verification Code',
    text: `Your OTP is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${email}: ${otp}`);
    res.json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
});

// === Verify OTP ===
router.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (otpStore[email] === otp) {
    delete otpStore[email];
    return res.json({ verified: true });
  }
  res.status(400).json({ verified: false, error: 'Invalid OTP' });
});

// Export router separately
export default router;
export { sendOnboardingEmail };