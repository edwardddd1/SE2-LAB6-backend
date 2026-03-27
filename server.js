const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connection Pool with the specific Railway proxy settings
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 20000,
    ssl: {
        rejectUnauthorized: false
    }
});

// 2. Test the connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to Railway MySQL (Gondola Proxy)');
        connection.release();
    }
});

// 3. Routes
app.get('/', (req, res) => res.send('Mood Tracker API is running!'));

app.get('/moods', (req, res) => {
    db.query('SELECT * FROM mood_logs ORDER BY logged_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/moods', (req, res) => {
    const { user_id, mood_label, mood_level, note } = req.body;
    const sql = 'INSERT INTO mood_logs (user_id, mood_label, mood_level, note) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, mood_label, mood_level, note], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: 'Success!', id: result.insertId });
    });
});

// 4. Render Port Logic
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});