import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import pkg from 'pg';
const { Pool } = pkg;

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// PostgreSQL connection (hardcoded)
const pool3 = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'memberonboard',
  password: 'postgres',
  port: 5432,
});

// Create upload directory if not exists
const uploadDir = path.resolve(__dirname, 'uploads', 'certificates');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed'), false);
    }
    cb(null, true);
  },
});

// === Upload certificates ===
router.post('/members/:memberId/certificates', upload.array('certificates', 5), async (req, res) => {
  const { memberId } = req.params;

  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: 'No files uploaded' });
  }

  try {
    const insertPromises = req.files.map(file => {
      const relativePath = `uploads/certificates/${file.filename}`;
      return pool3.query(
        `INSERT INTO "TPPL"."TPPL_member_certificates" 
         (member_id, certificate_name, file_path, uploaded_at) 
         VALUES ($1, $2, $3, NOW())`,
        [memberId, file.originalname, relativePath]
      );
    });

    await Promise.all(insertPromises);
    res.status(200).json({ message: 'Certificates uploaded successfully' });
  } catch (error) {
    console.error('Error uploading certificates:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === Get certificates for a member ===
router.get('/members/:memberId/certificates', async (req, res) => {
  const { memberId } = req.params;

  try {
    const result = await pool3.query(
      `SELECT certificate_id, certificate_name, file_path, uploaded_at 
       FROM "TPPL"."TPPL_member_certificates" 
       WHERE member_id = $1 
       ORDER BY uploaded_at DESC`,
      [memberId]
    );

    res.status(200).json(result.rows);
  } catch (err) {
    console.error('Error fetching certificates:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === Download certificate by ID ===
router.get('/certificates/:certificateId/download', async (req, res) => {
  const { certificateId } = req.params;

  try {
    const result = await pool3.query(
      `SELECT certificate_name, file_path 
       FROM "TPPL"."TPPL_member_certificates" 
       WHERE certificate_id = $1`,
      [certificateId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const { certificate_name, file_path } = result.rows[0];
    const fullPath = path.resolve(__dirname, file_path);

    if (!fs.existsSync(fullPath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(fullPath, certificate_name);
  } catch (err) {
    console.error('Error downloading certificate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// === Delete certificate by ID ===
router.delete('/certificates/:certificateId', async (req, res) => {
  const { certificateId } = req.params;

  try {
    const fileResult = await pool3.query(
      `SELECT file_path FROM "TPPL"."TPPL_member_certificates" WHERE certificate_id = $1`,
      [certificateId]
    );

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: 'Certificate not found' });
    }

    const { file_path } = fileResult.rows[0];
    const fullPath = path.resolve(__dirname, file_path);

    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    await pool3.query(
      `DELETE FROM "TPPL"."TPPL_member_certificates" WHERE certificate_id = $1`,
      [certificateId]
    );

    res.status(200).json({ message: 'Certificate deleted successfully' });
  } catch (err) {
    console.error('Error deleting certificate:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
