const express = require('express')
const router = express.Router()
const db = require('../../db/connection')
const inputCheck = require('../../utils/inputCheck')

router.post('/votes', ({body}, res) => {
    const errors = inputCheck(body, 'voter_id', 'candidate_id')
    if (errors) {
        res.status(400).json({ error: errors })
    }

    sql = `INSERT INTO votes (voter_id, candidate_id) VALUES (?,?)`;
    params = [body.voter_id, body.candidate_id];

    db.query(sql, params, (err, result) => {
        if (err) {
            res.status(400).json({ error: err.message })
            return
        }
        res.json({
            message: 'success',
            data: body,
            changes: result.affectedRows
        })
    })
})

router.get('/votes', (req, res) => {
    const sql = `SELECT candidates.*, parties.name AS party_name, count(candidate_id) AS votes 
                 FROM votes 
                 LEFT JOIN candidates ON votes.candidate_id = candidates.id 
                 LEFT JOIN parties ON candidates.party_id = parties.id 
                 GROUP BY candidate_id ORDER BY votes DESC;`;

    db.query(sql, (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message })
        }
        res.status(200).json({
            message: 'success',
            data: rows
        })
    })
})

module.exports = router