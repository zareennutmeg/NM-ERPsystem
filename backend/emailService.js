// emailService.js
import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

const otpStore = {};  // In-memory OTP store (replace with Redis/DB in prod)

// Nodemailer transporter with Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: "zareen.hussaini@nmsolutions.co.in",
    pass: "vsdq stlb xnga ifmz"
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
    from: "zareen.hussaini@nmsolutions.co.in",
    to: email,
    subject: 'Your OTP Verification Code',
    text: `Your OTP is: ${otp}`
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
// === Onboard Member and Send Welcome Email ===
router.post('/onboard-member', async (req, res) => {
  const { name, email, designation, memberId } = req.body;

  if (!name || !email || !designation || !memberId) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Insert into database
    await pool.query(
      `INSERT INTO "TPPL"."TPPL_members" (member_id, name, email, designation)
       VALUES ($1, $2, $3, $4)`,
      [memberId, name, email, designation]
    );

    // Send onboarding email
    const mailOptions = {
      from: "zareen.hussaini@nmsolutions.co.in",
      to: email,
      subject: 'Welcome to Nutmeg Software Solutions!',
      text: `Hello ${name},

Welcome to Nutmeg Software Solutions! Your onboarding was successful.

Here are your official details:

Employee ID: ${memberId}
Designation: ${designation}

Regards,
Team Nutmeg`
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Member onboarded and email sent successfully' });
  } catch (error) {
    console.error('Error onboarding member:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
