// controllers/authController.js

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

exports.signup = (req, res) => {
    const { name, email, password } = req.body;

    // First, check if the email already exists
    const checkEmailSql = 'SELECT email FROM users WHERE email = ?';
    db.query(checkEmailSql, [email], (err, results) => {
        if (err) {
            console.error('Database query error:', err); // Log the actual error
            return res.status(500).json({ message: 'Error checking email existence' });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // If the email doesn't exist, proceed to hash the password
        bcrypt.hash(password, 10, (err, hashedPassword) => {
            if (err) {
                console.error('Error hashing password:', err); // Log the actual error
                return res.status(500).json({ message: 'Error hashing password' });
            }

            const sql = 'INSERT INTO users (name, email, password) VALUES (?, ?, ?)';
            db.query(sql, [name, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error('Error registering user:', err); // Log the actual error
                    return res.status(500).json({ message: 'Error registering user' });
                }
                res.status(201).json({ message: 'User registered successfully' });
            });
        });
    });
};



exports.login = (req, res) => {
    const { email, password } = req.body;

    const sql = 'SELECT * FROM users WHERE email = ?';
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ message: 'Error fetching user' });
        if (results.length === 0) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const user = results[0];

        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) return res.status(500).json({ message: 'Error comparing passwords' });

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid email or password' });
            }

            const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
                expiresIn: '1h',
            });

            res.json({ token });
        });
    });
};
