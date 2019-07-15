const express = require('express')
const tokenSaver = require('../utilities/tokenSaver')

const router = new express.Router()

router.post('/send', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){
        let sql = `INSERT INTO reports(created_date, result, failure_reason, user_id, assign_id) VALUES (NOW(), "${req.body.result}", "${req.body.failureReason}", ${req.body.userId}, ${req.body.assignId})`

        global.connection.query(sql, (err, result, fields) => {
            if (err){
                res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error!", success: false})
              } else{ 
                res.send({"status": 200, "error": null, "response": result, "message": "Report send!", success: true})
              }
        })

        global.connection.end()
    } else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }
})

router.get('/1/all', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){
        let sql = `SELECT r.id AS report_id, r.result, r.failure_reason, a.id AS assign_id, a.task, a.status, u.username FROM reports AS r JOIN assigns AS a ON r.assign_id = a.id JOIN users AS u ON a.user_id = u.id ORDER BY r.created_date ASC`

        global.connection.query(sql, (err, result, fields) => {
            if (err){
                res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error!", success: false})
              } else{ 
                res.send({"status": 200, "error": null, "response": result, "message": "Reports received!", success: true})
              }
        })

        global.connection.end()
    } else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }
})

router.delete('/delete/:id', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){
        let reportId = req.params.id
        let sql = `DELETE FROM reports WHERE id = ${reportId}`
        
        global.connection.query(sql, (err, result, fields) => {
            if (err){
                res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error!", success: false})
              } else{ 
                res.send({"status": 200, "error": null, "response": result, "message": "Report Deleted!", success: true})
              }
        })
    
        global.connection.end()
    } else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }
})

module.exports = router