const express = require('express')
const router = express.Router()
const db = require('../../db/connection')
const inputCheck = require('../../utils/inputCheck')

router.get('/api/candidates', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                 AS party_name
                 FROM candidates
                 LEFT JOIN parties
                 ON candidates.party_id = parties.id`;

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

router.get('/candidates/:id', (req, res) => {
    const sql = `SELECT candidates.*, parties.name
                 AS party_name
                 FROM candidates
                 LEFT JOIN parties
                 ON candidates.party_id = parties.id
                 WHERE candidates.id = ?`;
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

router.delete('/candidates/:id', (req, res) => {
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

router.post('/candidates', ({body}, res) => {
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

router.put('/candidates/:id', (req, res) => {
    const errors = inputCheck(req.body, 'party_id');

    if (errors) {
        res.status(400).json({ error: errors })
    }

    const sql = `UPDATE candidates SET party_id = ? WHERE id = ?`;
    const params = [req.body.party_id, req.params.id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(500).json({ error: err.message })
        } else if (!result.affectedRows) {
            res.json({ message: 'Candidate not found' })
        } else {
            res.status(200).json({
                message: 'success',
                data: req.body,
                changes: result.affectedRows
            })
        }
    })
})

module.exports = router 