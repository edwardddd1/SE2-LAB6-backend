const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Connection using Public Variables
const db = mysql.createConnection({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to Railway MySQL');
    }
});

// 2. Simple Route to test the user
app.get('/', (req, res) => {
    res.send('Mood Tracker API is running!');
});

// 3. Get Mood Logs
app.get('/moods', (req, res) => {
    db.query('SELECT * FROM mood_logs ORDER BY logged_at DESC', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// 4. POST a new mood (Mood Check-in)
app.post('/moods', (req, res) => {
    const { user_id, mood_label, mood_level, note } = req.body;
    const sql = 'INSERT INTO mood_logs (user_id, mood_label, mood_level, note) VALUES (?, ?, ?, ?)';
    db.query(sql, [user_id, mood_label, mood_level, note], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ message: 'Mood logged successfully!', id: result.insertId });
    });
});

// CRITICAL: Use process.env.PORT for Render
// ... (your existing routes and db connection above)

// CRITICAL: Updated for Render Deployment
const PORT = process.env.PORT || 3000; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is actually running on port ${PORT}`);
});