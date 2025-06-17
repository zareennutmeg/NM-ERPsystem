import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

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
  password: 'your_new_password',
  port: 5432,
  ssl: {
    rejectUnauthorized: false,
  },
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
app.get('/api/users/role/:firebase_uid', async (req, res) => {
  try {
    const { firebase_uid } = req.params;
    console.log('Looking up internal ID for Firebase UID:', firebase_uid);

    // First: lookup internal_user_id
    const mappingResult = await pool2.query(
      'SELECT internal_user_id FROM user_mapping WHERE firebase_uid = $1',
      [firebase_uid]
    );

    if (mappingResult.rows.length === 0) {
      return res.status(404).json({ error: 'User mapping not found' });
    }

    const internal_user_id = mappingResult.rows[0].internal_user_id;

    // Second: lookup role
    const roleResult = await pool2.query(
      'SELECT role_type FROM role_table WHERE user_id = $1',
      [internal_user_id]
    );

    if (roleResult.rows.length === 0) {
      return res.status(404).json({ error: 'User role not found' });
    }

    res.json({ role: roleResult.rows[0].role_type });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
