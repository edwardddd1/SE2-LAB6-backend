const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
});

db.connect(err => {
    if (err) {
        console.error('❌ Database connection failed: ' + err.stack);
        return;
    }
    console.log('✅ Connected to Cloud MySQL Database.');
});

// 2. The "AI" Logic (Simple Rule-Based for the Lab)
const getAIResponse = (mood) => {
    const responses = {
        'Happy 😊': "That's wonderful! Keep that positive energy flowing today.",
        'Anxious 😟': "It's okay to feel this way. Try taking three deep breaths. You've got this.",
        'Productive 🚀': "You're in the zone! Remember to take short breaks to stay sharp.",
        'Tired 😴': "Rest is productive too. Make sure to get some quality sleep tonight.",
        'Excited ✨': "Channel that excitement into something creative today!"
    };
    return responses[mood] || "Thank you for sharing your mood with me.";
};

// 3. The API Route
app.post('/api/mood', (req, res) => {
    const { name, mood } = req.body;
    const aiMessage = getAIResponse(mood);

    // Insert into Database (Matches your Lab 3 schema)
    const sql = "INSERT INTO mood_entries (username, mood, ai_response) VALUES (?, ?, ?)";
    db.query(sql, [name, mood, aiMessage], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database insertion failed" });
        }
        // Send response back to Vue frontend
        res.json({ 
            message: "Mood saved successfully!", 
            aiMessage: aiMessage 
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});