const express = require('express')
const tokenSaver = require('../utilities/tokenSaver')

const router = new express.Router()

router.post('/search', (req, res, result) => {
    let authToken = tokenSaver.getToken()
    if(req.headers.authorization === authToken){
        let searchParam = req.body.searchParam
        let searchType = req.body.type
        
        let sql = ``;
        if(searchType === 'byFirm' || searchType === undefined){
            sql = `SELECT f.id, f.firm, f.contact_person, f.email FROM firms AS f WHERE f.firm LIKE "%${searchParam}%"`
        } else if(searchType === 'byEmployee'){
            sql = `SELECT u.id, CONCAT(u.first_name, " ", u.last_name) AS full_name, u.role, u.email FROM users AS u WHERE u.first_name LIKE "%${searchParam}%"`
        } else if(searchType === 'byAssign'){
            sql = `SELECT a.id, a.task, a.end_date, a.status FROM assigns AS a WHERE a.task LIKE "%${searchParam}%" ORDER BY a.end_date ASC`
        }
    
        global.connection.query(sql, (err, result, fields) => {
            if (err){
                res.send({"status": 200, "error": err.sqlMessage, "response": null, "message": "Error!", success: false})
              } else{ 
                res.send({"status": 200, "error": null, "response": result, "message": "Search result received!", success: true})
              }
        })
    
        global.connection.end()
    } else{
        res.send({"status": 200, "error": "Not authorized!", "response": null, "message": "Not authorized!", success: false})
    }
})

module.exports = router
