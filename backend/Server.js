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
  host: '127.0.0.1',
  database: 'tppl',
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

// Route: Get user role from tppl DB
app.get('/api/users/role/:uid', async (req, res) => {
  const { uid } = req.params;

  try {
    const result = await pool2.query(
      'SELECT role_type FROM role_table WHERE user_id = $1',
      [uid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found in role_table' });
    }

    res.json({ role: result.rows[0].role_type });
  } catch (err) {
    console.error('Error fetching role:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
