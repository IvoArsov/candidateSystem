const express = require('express')
const tokenSaver = require('../utilities/tokenSaver')

const router = new express.Router()

router.post('/add', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){
        let sql = `INSERT INTO notifications(user_id, assign_id, checked) VALUES (${req.body.userId}, ${req.body.assignId}, 0)`

        global.connection.query(sql, (err, result, fields) => {
            if (err){
                res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error! notification", success: false})
              } else{ 
                res.send({"status": 200, "error": null, "response": result, "message": "Notification set!", success: true})
              }
        })

        global.connection.end()
    } else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }
})

router.get('/user/:id', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){
        let userId = req.params.id

        let sql = `SELECT n.id AS notification_id, n.checked, a.id AS assign_id, a.task, a.status, a.end_date, u.id AS user_id FROM notifications AS n JOIN assigns AS a ON n.assign_id = a.id JOIN users AS u ON n.user_id = u.id WHERE u.id = ${userId} ORDER BY a.end_date ASC`
    
        global.connection.query(sql, (err, result, fields) => {
            if (err){
                res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error! notification", success: false})
              } else{ 
                res.send({"status": 200, "error": null, "response": result, "message": "Notification received!", success: true})
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
        let notificationId = req.params.id

        let sql = `DELETE FROM notifications WHERE id = ${notificationId}`
        
        global.connection.query(sql, (err, result, fields) => {
            if (err){
                res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error! notification", success: false})
              } else{ 
                res.send({"status": 200, "error": null, "response": result, "message": "Notification Delete!", success: true})
              }
        })
    
        global.connection.end()
    } else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }
})

module.exports = router