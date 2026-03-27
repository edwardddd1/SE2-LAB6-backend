const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

// 1. Initialize 'app' FIRST
const app = express();

// 2. Now you can use middleware
app.use(cors()); 
app.use(express.json()); 

// 3. Database Connection Pool
const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    port: process.env.MYSQLPORT || 54745,
    waitForConnections: true,
    connectionLimit: 5,
    queueLimit: 0,
    connectTimeout: 20000,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test Connection
db.getConnection((err, connection) => {
    if (err) {
        console.error('❌ Database connection failed:', err.message);
    } else {
        console.log('✅ Connected to Railway MySQL');
        connection.release();
    }
});

// 4. Routes
app.get('/', (req, res) => res.send('Mood Tracker API is running!'));

app.get('/api/moods', (req, res) => {
    db.query('SELECT * FROM mood_logs ORDER BY logged_at DESC', (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

app.post('/api/moods', (req, res) => {
    const { user_id, mood_label, mood_level, note } = req.body;
    const sql = 'INSERT INTO mood_logs (user_id, mood_label, mood_level, note) VALUES (?, ?, ?, ?)';
    
    db.query(sql, [user_id, mood_label, mood_level, note], (err, result) => {
        if (err) {
            console.error('❌ Insert Error:', err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Success!', id: result.insertId });
    });
});

// 5. Server Start
const PORT = process.env.PORT || 10000; 

app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is LIVE on port ${PORT}`);
});