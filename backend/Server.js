import express from 'express';
import cors from 'cors';
import pg from 'pg';
import emailServiceRouter from './emailService.js';
import uploadCertificateRouter from './uploadCertificate.js';
const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
// Mount email service routes at /api/email
app.use('/api/email', emailServiceRouter);
app.use('/api', uploadCertificateRouter);

// Pool1: For `myapp` database (static_message)
const pool1 = new pg.Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'myapp',
  password: 'postgres',
  port: 5432,
});

// Pool2: For `tppl` database (role_table)
const pool2 = new pg.Pool({
  user: 'postgres',
  host: '13.48.244.216',
  database: 'tppl',
  password: 'postgres',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
});
// Pool3: For member onboarding database
const pool3 = new pg.Pool({
  user: 'postgres',
  host: '127.0.0.1',  // or your DB host
  database: 'memberonboard',
  password: 'postgres',
  port: 5432,
});


// Route: Get static message from myapp DB
app.get('/api/message', async (req, res) => {
  try {
    const result = await pool1.query('SELECT message FROM static_message LIMIT 1');
    res.json({ message: result.rows[0].message });
  } catch (err) {
    console.error('Error fetching message:', err);
    res.status(500).json({ message: 'Error fetching message' });
  }
});

// Get user role using Firebase UID

app.get('/api/users/role/:uid', async (req, res) => {
  try {
    const { uid } = req.params;
    console.log('Looking up role for Firebase UID:', uid);

    const result = await pool2.query(
      'SELECT role_type FROM role_table WHERE firebase_uid = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ role: result.rows[0].role_type });
  } catch (error) {
    console.error('DB query error:', error.stack || error);
    res.status(500).json({ error: 'Database error' });
  }
});
// ============ Member Onboarding Module ===============

// Generate next member_id
const getNextMemberId = async () => {
  const result = await pool3.query(`SELECT member_id FROM "TPPL"."TPPL_members" ORDER BY member_id DESC LIMIT 1`);
  if (result.rows.length === 0) return "NM001";
  const num = parseInt(result.rows[0].member_id.substring(2), 10) + 1;
  return `NM${num.toString().padStart(3, '0')}`;
};

// Add new member
app.post('/api/members', async (req, res) => {
  try {
    const {
      name, age, gender, aadhar_number, pan_number, bank_name, bank_account,
      bank_branch, ifsc_code, date_of_birth, date_of_joining, email
    } = req.body;

    if (!name || !age || !gender || !aadhar_number || !pan_number || !bank_name || !bank_account || !bank_branch || !ifsc_code || !date_of_birth || !date_of_joining || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMemberId = await getNextMemberId();

    const result = await pool3.query(
      `INSERT INTO "TPPL"."TPPL_members" 
      (member_id, name, age, gender, aadhar_number, pan_number, bank_name, 
       bank_account, bank_branch, ifsc_code, date_of_birth, date_of_joining, email) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [newMemberId, name, age, gender, aadhar_number, pan_number, bank_name,
       bank_account, bank_branch, ifsc_code, date_of_birth, date_of_joining, email]
    );

    // Send onboarding email
    try {
      await emailServiceRouter.sendOnboardingEmail(email, name);
    } catch (emailErr) {
      console.error('Email sending failed:', emailErr.message);
    }

    res.status(201).json({
      message: 'Member created successfully',
      member: result.rows[0],
    });
  } catch (err) {
    console.error('Error in POST /api/members:', err.stack);
    res.status(500).json({ error: 'Internal server error.' });
  }
});

// Get all members
app.get('/api/members', async (_req, res) => {
  try {
    const result = await pool3.query(`SELECT * FROM "TPPL"."TPPL_members" ORDER BY member_id ASC`);
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific member
app.get('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool3.query(`SELECT * FROM "TPPL"."TPPL_members" WHERE member_id = $1`, [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update member
app.put('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name, age, gender, aadhar_number, pan_number, bank_name, bank_account,
    bank_branch, ifsc_code, date_of_birth, date_of_joining, email
  } = req.body;

  try {
    const result = await pool3.query(
      `UPDATE "TPPL"."TPPL_members"
       SET name=$1, age=$2, gender=$3, aadhar_number=$4, pan_number=$5, bank_name=$6,
           bank_account=$7, bank_branch=$8, ifsc_code=$9, date_of_birth=$10,
           date_of_joining=$11, email=$12
       WHERE member_id=$13
       RETURNING *`,
      [name, age, gender, aadhar_number, pan_number, bank_name, bank_account,
       bank_branch, ifsc_code, date_of_birth, date_of_joining, email, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Member not found' });

    res.json({ message: 'Member updated successfully', member: result.rows[0] });
  } catch (error) {
    console.error('Error updating member:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Delete member (with related certificates)
app.delete('/api/members/:id', async (req, res) => {
  const { id } = req.params;
  const client = await pool3.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      'DELETE FROM "TPPL"."TPPL_member_certificates" WHERE member_id = $1',
      [id]
    );

    const result = await client.query(
      'DELETE FROM "TPPL"."TPPL_members" WHERE member_id = $1',
      [id]
    );

    await client.query('COMMIT');

    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ message: 'Member and related certificates deleted' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error("Delete failed:", error.message);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
