const { json } = require('express');
const express = require('express')
const mysql = require('mysql2')
const inputCheck = require('./utils/inputCheck');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'max',
        password: 'maxPassword',
        database: 'election'
    },
    console.log('Connected to the election database.')
)

app.get('/api/candidates', (req, res) => {
    const sql = `SELECT * FROM candidates`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.status(200).json({
            message: 'success',
            data: rows
        })
    })
})

app.get('/api/candidates/:id', (req, res) => {
    const sql = `SELECT * FROM candidates WHERE id = ?`;
    const params = [req.params.id];

    db.query(sql, params, (err, results) => {
        if (err) {
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(200).json({
            message: 'success',
            data: results
        })
    }) 
})

app.delete('/api/candidates/:id', (req, res) => {
    const sql = `DELETE FROM candidates WHERE id = ?`;

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            res.status(500).json({ error: err.message })
            return;
        } else if (!results.affectedRows) {
            res.json({
                message: 'Candidate not found'
            })
        } else {
            res.status(200).json({
                message: 'deleted', 
                changes: results.affectedRows,
                id: req.params.id
            })
        }
    })
})


app.post('/api/candidates', ({body}, res) => {
    const errors = inputCheck(body, 'first_name', 'last_name', 'industry_connected');
    if (errors) {
        res.status(400).json({ error: errors });
        return;
    }

    const sql = `INSERT INTO candidates (first_name, last_name, industry_connected)
                Values (?,?,?)`;
    const params = [body.first_name, body.last_name, body.industry_connected];

    db.query(sql, params, (err, results) => {
        if (err) {
            res.status(400).json({ error: err.message })
            return;
        } else {
            res.status(200).json({
                message: 'success',
                data: results
            })
        }
    })
})


app.use((req, res) => {
    res.status(404).end();
})

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
})
