import express from 'express';
import cors from 'cors';
import pg from 'pg';
import emailServiceRouter, { sendOnboardingEmail } from './emailService.js';
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
  host: '13.48.244.216',
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
  host: '13.48.244.216',  // or your DB host
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
  
  const lastId = result.rows[0].member_id;
  const numPart = parseInt(lastId.replace(/[^\d]/g, ''), 10);
  const nextNum = (isNaN(numPart) ? 0 : numPart) + 1;
  
  return `NM${nextNum.toString().padStart(3, '0')}`;
};

// Add new member
app.post('/api/members', async (req, res) => {
  try {
    const {
      name, age, gender, aadhar_number, pan_number, bank_name, bank_account,
      bank_branch, ifsc_code, date_of_birth, date_of_joining, email, designation
    } = req.body;

    if (!name || !age || !gender || !aadhar_number || !pan_number || !bank_name || !bank_account || !bank_branch || !ifsc_code || !date_of_birth || !date_of_joining || !email || !designation) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMemberId = await getNextMemberId();

    const result = await pool3.query(
      `INSERT INTO "TPPL"."TPPL_members" 
      (member_id, name, age, gender, aadhar_number, pan_number, bank_name, 
       bank_account, bank_branch, ifsc_code, date_of_birth, date_of_joining, email, designation) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [newMemberId, name, age, gender, aadhar_number, pan_number, bank_name,
       bank_account, bank_branch, ifsc_code, date_of_birth, date_of_joining, email, designation]
    );

    // Send onboarding email
    try {
      await sendOnboardingEmail(email, name, newMemberId, designation);
    } catch (emailErr) {
     console.error('Email sending failed:', emailErr);

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
    bank_branch, ifsc_code, date_of_birth, date_of_joining, email, designation
  } = req.body;

  try {
    const result = await pool3.query(
      `UPDATE "TPPL"."TPPL_members"
       SET name=$1, age=$2, gender=$3, aadhar_number=$4, pan_number=$5, bank_name=$6,
           bank_account=$7, bank_branch=$8, ifsc_code=$9, date_of_birth=$10,
           date_of_joining=$11, email=$12, designation=$13
       WHERE member_id=$14
       RETURNING *`,
      [name, age, gender, aadhar_number, pan_number, bank_name, bank_account,
       bank_branch, ifsc_code, date_of_birth, date_of_joining, email, designation, id]
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
/* -- Timesheet Modules -- */

app.get("/api/timesheet/:id/:start_date", async (req, res) => {
  const user_id = req.params.id;
  const start_date = req.params.start_date;
  let last_date = new Date(start_date);
  last_date.setDate(last_date.getDate() + 6);
  last_date = last_date.toISOString().split("T")[0];
  try {
    const result = await pool2.query(
      "SELECT u.user_name, t.* FROM user_table u INNER JOIN timesheets t ON u.user_id = t.user_id WHERE u.user_id = $1 AND t.date BETWEEN $2 and $3 ORDER BY t.date, t.start_time",
      [user_id, start_date, last_date]
    );
    res.status(200).json({ message: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({ message: "failed" });
  }
});

app.post("/api/addsheet", async (req, res) => {
  const {
    user_id,
    business_unit_code,
    global_business_unit_code,
    project_code,
    activity_code,
    shift_code,
    hours,
    date,
    leave,
    comp_off,
    status,
    start_time,
    end_time,
  } = req.body;

  console.log("addsheet", req.body);
  try {
    const result = await pool2.query(
      `INSERT INTO timesheets (
        user_id, business_unit_code, global_business_unit_code,
        project_code, activity_code, shift_code, hours, date, leave, comp_off, status,
        start_time, end_time
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`,
      [
        user_id,
        business_unit_code,
        global_business_unit_code,
        project_code,
        activity_code,
        shift_code,
        hours,
        date,
        leave,
        comp_off,
        status,
        start_time,
        end_time,
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Failed to add entry" });
  }
});

app.patch("/api/timesheet/update/:id/:status", async (req, res) => {
  const id = req.params.id;
  const status = req.params.status;
  const response = await pool2.query(
    "UPDATE timesheets SET status = $2 WHERE id = $1",
    [id, status]
  );
  return res.status(200).json({ message: "Updated Successfully" });
});

app.put("/api/timesheet/revise/:id", async (req, res) => {
  const id = req.params.id;
  const { hours, date, activity_code, shift_code, start_time, end_time } =
    req.body;
  console.log(req.body);
  try {
    const response = await pool2.query(
      "UPDATE timesheets SET hours = $1, date = $2, activity_code = $3, shift_code = $4, status = 'Pending', start_time = $5, end_time = $6 WHERE id = $7",
      [hours, date, activity_code, shift_code, start_time, end_time, id]
    );
    return res
      .status(200)
      .json({ message: "Timesheet has been revised successfully" });
  } catch (error) {
    console.error("Error while updating revised timesheet:", error);
    return res
      .status(500)
      .json({ message: "Error while updating revised timesheet" });
  }
});

app.patch("/api/timesheet/update_week/:user_id/:start_date", async (req, res) => {
  try {
    const start_date = req.params.start_date;
    const user_id = req.params.user_id;
    let last_date = new Date(start_date);
    last_date.setDate(last_date.getDate() + 6);
    last_date = last_date.toISOString().split("T")[0];
    console.log("Start Date", start_date);
    const response = await pool2.query(
      `UPDATE timesheets
       SET status = $3 
       WHERE user_id = $4 AND date BETWEEN $1 AND $2`,
      [start_date, last_date, "Pending", user_id]
    );

    return res
      .status(200)
      .json({ message: "Submitted Weekly Report Successfully" });
  } catch (err) {
    console.error("Error updating timesheets:", err);
    return res.status(500).json({ error: "Error Submitting Weekly Records" });
  }
});

app.delete("/api/timesheet/delete/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const response = await pool2.query("DELETE FROM timesheets WHERE id = $1", [
      id,
    ]);
    return res.status(200).json({ message: "Successfully deleted the record" });
  } catch (error) {
    console.error("Error while deleting the record");
    return res.status(500).json({ error: "Error Deleting Record" });
  }
});

app.patch(
  "/api/timesheet/approve/:selectedUserId/:start_date",
  async (req, res) => {
    try {
      const user_id = req.params.selectedUserId;
      const start_date = req.params.start_date;
      let last_date = new Date(start_date);
      last_date.setDate(last_date.getDate() + 6);
      last_date = last_date.toISOString().split("T")[0];
      console.log("Start Date", start_date);
      console.log("User Id", user_id);
      console.log("End Date", last_date);
      const response = await pool2.query(
        `UPDATE timesheets 
       SET status = $3
       WHERE status = 'Pending' AND user_id = $4 AND date BETWEEN $1 AND $2`,
        [start_date, last_date, "Approved", user_id]
      );
      return res
        .status(200)
        .json({ message: "Approved Weekly Report Successfully" });
    } catch (error) {
      console.log("Error while approving timesheets");
      res.status(500).json({ error: "Error Approving Timesheets" });
    }
  }
);
/* -- Timesheet Modules Admin -- */
app.get("/api/users/timesheet/:id/:start_date", async (req, res) => {
  const user_id = req.params.id;
  const start_date = req.params.start_date;
  let last_date = new Date(start_date);
  last_date.setDate(last_date.getDate() + 6);
  last_date = last_date.toISOString().split("T")[0];
  console.log(user_id, start_date, last_date);
  try {
    const result = await pool2.query(
      "SELECT u.user_name, t.* FROM user_table u INNER JOIN timesheets t ON u.user_id = t.user_id WHERE u.user_id = $1 AND t.status = $4 AND t.date BETWEEN $2 and $3 ORDER BY t.date, t.start_time",
      [user_id, start_date, last_date, "Pending"]
    );
    res.status(200).json({ message: "success", data: result.rows });
  } catch (error) {
    console.error("Error fetching leave records:", error);
    res.status(500).json({ message: "failed" });
  }
});});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
