import express from 'express';
import cors from 'cors';
import pg from 'pg';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'myapp',
  password: 'postgres',
  port: 5432,
});

app.get('/api/message', async (req, res) => {
  try {
    const result = await pool.query('SELECT message FROM static_message LIMIT 1');
    res.json({ message: result.rows[0].message });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching message' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
