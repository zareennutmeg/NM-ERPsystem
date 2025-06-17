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
  password: 'postgres',
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

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
